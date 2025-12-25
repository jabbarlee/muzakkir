import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  generateEmbedding,
  searchSimilarDocuments,
  findChapterByNumber,
  findChapterByTitle,
  buildEnhancedContext,
  extractEnhancedSources,
} from "@/lib/services/vector-store";
import { analyzeQuery } from "@/lib/services/query-understanding";
import {
  ChatRequest,
  ChatResponse,
  ChapterWithContent,
} from "@/lib/types/chat";

// Lazy-initialized OpenAI client to avoid build-time errors
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// System prompt templates by language and response format
const SYSTEM_PROMPTS = {
  en: {
    friendly: `You are a friendly and approachable AI assistant for the Risale-i Nur collection by Bediüzzaman Said Nursi.

INSTRUCTIONS:
1. Base your answers PRIMARILY on the Context provided below.
2. When a PRIMARY SOURCE is provided, that is the main chapter the user is asking about - focus your answer on that content.
3. Be CONCISE and DIRECT. Keep responses short and focused (2-4 paragraphs maximum).
4. Get to the main point quickly without lengthy introductions.
5. Use a warm, conversational tone. Be encouraging and supportive.
6. Feel free to use gentle expressions and relatable examples.
7. If the Context doesn't contain relevant information, kindly acknowledge this.
8. IMPORTANT: Respond in English only.

Provide a brief, helpful response grounded in the Context with a friendly touch.`,

    professional: `You are a knowledgeable and scholarly AI assistant for the Risale-i Nur collection by Bediüzzaman Said Nursi.

INSTRUCTIONS:
1. Base your answers PRIMARILY on the Context provided below.
2. When a PRIMARY SOURCE is provided, that is the main chapter the user is asking about - focus your answer on that content.
3. Be CONCISE and DIRECT. Keep responses short and focused (2-4 paragraphs maximum).
4. Get to the main point quickly without lengthy introductions.
5. Maintain a formal, academic tone. Use precise theological and philosophical terminology.
6. Structure your response clearly with well-organized points.
7. If the Context doesn't contain relevant information, clearly acknowledge this.
8. IMPORTANT: Respond in English only.

Provide a brief, scholarly response grounded in the Context.`,
  },

  tr: {
    friendly: `Bediüzzaman Said Nursi'nin Risale-i Nur Külliyatı için samimi ve yaklaşılabilir bir yapay zeka asistanısın.

TALİMATLAR:
1. Cevaplarını ÖNCELİKLE aşağıda sağlanan Bağlam'a dayandır.
2. BİRİNCİL KAYNAK sağlandığında, bu kullanıcının sorduğu ana bölümdür - cevabını bu içeriğe odakla.
3. KISA ve DOĞRUDAN ol. Yanıtları kısa ve odaklı tut (maksimum 2-4 paragraf).
4. Uzun girişler olmadan ana noktaya hızlıca geç.
5. Sıcak ve samimi bir üslup kullan. Cesaretlendirici ve destekleyici ol.
6. Nazik ifadeler ve anlaşılır örnekler kullanmaktan çekinme.
7. Bağlam ilgili bilgi içermiyorsa, bunu nazikçe belirt.
8. ÖNEMLİ: Sadece Türkçe yanıt ver.

Bağlam'a dayalı, samimi bir dokunuşla kısa ve yardımcı bir yanıt ver.`,

    professional: `Bediüzzaman Said Nursi'nin Risale-i Nur Külliyatı için bilgili ve akademik bir yapay zeka asistanısın.

TALİMATLAR:
1. Cevaplarını ÖNCELİKLE aşağıda sağlanan Bağlam'a dayandır.
2. BİRİNCİL KAYNAK sağlandığında, bu kullanıcının sorduğu ana bölümdür - cevabını bu içeriğe odakla.
3. KISA ve DOĞRUDAN ol. Yanıtları kısa ve odaklı tut (maksimum 2-4 paragraf).
4. Uzun girişler olmadan ana noktaya hızlıca geç.
5. Resmi ve akademik bir üslup kullan. Kesin teolojik ve felsefi terminoloji kullan.
6. Yanıtını iyi organize edilmiş noktalarla net bir şekilde yapılandır.
7. Bağlam ilgili bilgi içermiyorsa, bunu açıkça belirt.
8. ÖNEMLİ: Sadece Türkçe yanıt ver.

Bağlam'a dayalı kısa ve akademik bir yanıt ver.`,
  },
};

/**
 * POST /api/chat
 * Handles RAG-based chat requests with chapter-aware context
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const {
      question,
      currentChapter,
      language = "tr",
      responseFormat = "friendly",
      referenceText,
    } = body as ChatRequest;

    if (!question || typeof question !== "string" || question.trim() === "") {
      return NextResponse.json(
        { error: "Question is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 500 }
      );
    }

    // Step 1: Analyze the query to understand intent
    const queryAnalysis = await analyzeQuery(question, currentChapter);
    console.log("Query analysis:", queryAnalysis);

    // Step 2: Fetch primary chapter content if a specific chapter is referenced
    let primaryChapter: ChapterWithContent | null = null;

    if (
      queryAnalysis.referencesSpecificChapter &&
      queryAnalysis.chapterNumber
    ) {
      // User is asking about a specific chapter
      primaryChapter = await findChapterByNumber(
        queryAnalysis.chapterNumber,
        queryAnalysis.chapterType
      );
      console.log("Found primary chapter:", primaryChapter?.title);
    } else if (queryAnalysis.relatedToCurrentContext && currentChapter) {
      // User is asking about what they're currently reading
      // Try to find the chapter by its title
      primaryChapter = await findChapterByTitle(currentChapter);
      console.log("Found current chapter:", primaryChapter?.title);
    }

    // Step 3: Generate embedding for semantic search
    // Use the cleaned search query from analysis, or the original question
    const searchQuery = referenceText
      ? `${queryAnalysis.searchQuery} ${referenceText.substring(0, 200)}`
      : queryAnalysis.searchQuery;

    const queryEmbedding = await generateEmbedding(searchQuery);

    // Step 4: Search for related documents
    const matchedDocuments = await searchSimilarDocuments(queryEmbedding, {
      matchThreshold: 0.25,
      matchCount: primaryChapter ? 3 : 5, // Fewer if we have primary content
    });

    // Step 5: Build enhanced context with proper prioritization
    const context = buildEnhancedContext(primaryChapter, matchedDocuments);
    const sources = extractEnhancedSources(primaryChapter, matchedDocuments);

    // Step 6: Prepare messages for OpenAI
    let userMessageContent = "";

    // If there's reference text (selected passage from the book), include it prominently
    if (referenceText) {
      userMessageContent = `Selected Passage from the Book:\n"${referenceText}"\n\n`;
      if (context) {
        userMessageContent += `Additional Context:\n${context}\n\n---\n\n`;
      }
      userMessageContent += `User Question about the passage: ${question}`;
    } else {
      userMessageContent = context
        ? `Context:\n${context}\n\n---\n\nUser Question: ${question}`
        : `No relevant context was found in the database for this question.\n\nUser Question: ${question}`;
    }

    // Include current chapter context if provided and not already included
    const enhancedUserMessage =
      currentChapter && !primaryChapter
        ? `${userMessageContent}\n\n(The user is currently reading: ${currentChapter})`
        : userMessageContent;

    // Step 7: Call OpenAI for chat completion
    const openai = getOpenAIClient();
    const langPrompts = SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.tr;
    const systemPrompt = langPrompts[responseFormat] || langPrompts.friendly;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: enhancedUserMessage },
      ],
      temperature: 0.3, // Lower temperature for more focused, accurate responses
      max_tokens: 700, // Slightly higher to allow for comprehensive chapter explanations
    });

    const assistantResponse =
      completion.choices[0]?.message?.content ||
      "I apologize, but I was unable to generate a response. Please try again.";

    // Step 8: Return response with sources
    const response: ChatResponse = {
      response: assistantResponse,
      sources: sources,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("embedding")) {
        return NextResponse.json(
          { error: "Failed to process your question. Please try again." },
          { status: 500 }
        );
      }
      if (error.message.includes("similar documents")) {
        return NextResponse.json(
          { error: "Failed to search the knowledge base. Please try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
