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

// System prompt for the AI assistant with grounding rules
const SYSTEM_PROMPT = `You are Muzakir, a knowledgeable and helpful AI assistant specialized in the Risale-i Nur collection by Bediüzzaman Said Nursi.

Your role is to help users understand and explore the profound spiritual and philosophical teachings contained in these works.

INSTRUCTIONS:
1. Base your answers on the Context provided below. The Context contains relevant excerpts from the Risale-i Nur.
2. Synthesize and explain the information from the Context in a clear, helpful manner.
3. You may explain concepts in simpler terms and provide additional context to help understanding.
4. If the Context contains relevant passages, use them to construct a comprehensive answer.
5. Maintain a respectful, scholarly tone appropriate for religious and philosophical discussion.
6. If the Context truly does not contain any relevant information to the question, acknowledge this and suggest the user try a different question.

The Context below contains excerpts that were semantically matched to the user's question. Use this information to provide a helpful, grounded response.`;

/**
 * POST /api/chat
 * Handles RAG-based chat requests
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { question, currentChapter } = body as ChatRequest;

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
    const queryEmbedding = await generateEmbedding(question.trim());

    // Step 2: Search for similar documents
    const matchedDocuments = await searchSimilarDocuments(queryEmbedding, {
      matchThreshold: 0.25,
      matchCount: 8,
    });

    // Step 3: Build context from matched documents
    const context = buildContext(matchedDocuments);
    const sources = extractSources(matchedDocuments);

    // Step 4: Prepare messages for OpenAI
    const userMessageContent = context
      ? `Context:\n${context}\n\n---\n\nUser Question: ${question}`
      : `No relevant context was found in the database for this question.\n\nUser Question: ${question}`;

    // Include current chapter context if provided
    const enhancedUserMessage = currentChapter
      ? `${userMessageContent}\n\n(The user is currently reading: ${currentChapter})`
      : userMessageContent;

    // Step 5: Call OpenAI for chat completion
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: enhancedUserMessage },
      ],
      temperature: 0.3, // Lower temperature for more focused, accurate responses
      max_tokens: 1024,
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

