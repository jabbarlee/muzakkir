import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  generateEmbedding,
  searchSimilarDocuments,
  buildContext,
  extractSources,
} from "@/lib/services/vector-store";
import { ChatRequest, ChatResponse } from "@/lib/types/chat";

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

// System prompt templates by language
const SYSTEM_PROMPTS = {
  en: `You are a knowledgeable AI assistant for the Risale-i Nur collection by Bediüzzaman Said Nursi.

INSTRUCTIONS:
1. Base your answers on the Context provided below.
2. Be CONCISE and DIRECT. Keep responses short and focused (2-4 paragraphs maximum).
3. Get to the main point quickly without lengthy introductions.
4. Use simple, clear language. Avoid unnecessary elaboration.
5. If the Context doesn't contain relevant information, briefly acknowledge this.
6. IMPORTANT: Respond in English only.

Provide a brief, helpful response grounded in the Context.`,

  tr: `Bediüzzaman Said Nursi'nin Risale-i Nur Külliyatı için bilgili bir yapay zeka asistanısın.

TALİMATLAR:
1. Cevaplarını aşağıda sağlanan Bağlam'a dayandır.
2. KISA ve DOĞRUDAN ol. Yanıtları kısa ve odaklı tut (maksimum 2-4 paragraf).
3. Uzun girişler olmadan ana noktaya hızlıca geç.
4. Basit ve açık bir dil kullan. Gereksiz ayrıntılardan kaçın.
5. Bağlam ilgili bilgi içermiyorsa, bunu kısaca belirt.
6. ÖNEMLİ: Sadece Türkçe yanıt ver.

Bağlam'a dayalı kısa ve yardımcı bir yanıt ver.`,
};

/**
 * POST /api/chat
 * Handles RAG-based chat requests
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { question, currentChapter, language = "tr", referenceText } = body as ChatRequest;

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

    // Step 1: Generate embedding for the user's question
    // If there's reference text, include it for better semantic matching
    const queryForEmbedding = referenceText 
      ? `${question} ${referenceText.substring(0, 200)}`
      : question.trim();
    const queryEmbedding = await generateEmbedding(queryForEmbedding);

    // Step 2: Search for similar documents
    const matchedDocuments = await searchSimilarDocuments(queryEmbedding, {
      matchThreshold: 0.25,
      matchCount: 5,
    });

    // Step 3: Build context from matched documents
    const context = buildContext(matchedDocuments);
    const sources = extractSources(matchedDocuments);

    // Step 4: Prepare messages for OpenAI
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

    // Include current chapter context if provided
    const enhancedUserMessage = currentChapter
      ? `${userMessageContent}\n\n(The user is currently reading: ${currentChapter})`
      : userMessageContent;

    // Step 5: Call OpenAI for chat completion
    const openai = getOpenAIClient();
    const systemPrompt = SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.tr;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: enhancedUserMessage },
      ],
      temperature: 0.3, // Lower temperature for more focused, accurate responses
      max_tokens: 512, // Limit response length for concise answers
    });

    const assistantResponse =
      completion.choices[0]?.message?.content ||
      "I apologize, but I was unable to generate a response. Please try again.";

    // Step 6: Return response with sources
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

