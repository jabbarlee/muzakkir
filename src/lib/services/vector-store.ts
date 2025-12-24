import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { DocumentMatch, SearchOptions } from "@/lib/types/chat";

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

/**
 * Generate an embedding vector for the given text using OpenAI's text-embedding-3-small model
 * @param text - The text to generate an embedding for
 * @returns The embedding vector as an array of numbers
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const openai = getOpenAIClient();
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.trim(),
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding for the query");
  }
}

/**
 * Search for similar documents in Supabase using vector similarity
 * @param embedding - The query embedding vector
 * @param options - Search options (threshold and count)
 * @returns Array of matching documents with similarity scores
 */
export async function searchSimilarDocuments(
  embedding: number[],
  options: SearchOptions = {}
): Promise<DocumentMatch[]> {
  const { matchThreshold = 0.3, matchCount = 5 } = options;

  try {
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      throw new Error("Failed to search for similar documents");
    }

    return (data as DocumentMatch[]) || [];
  } catch (error) {
    console.error("Error searching documents:", error);
    throw new Error("Failed to search for similar documents");
  }
}

/**
 * Build a context string from matched documents for the AI prompt
 * @param documents - Array of matched documents
 * @returns Formatted context string
 */
export function buildContext(documents: DocumentMatch[]): string {
  if (documents.length === 0) {
    return "";
  }

  return documents
    .map((doc, index) => {
      const chapter = doc.metadata?.chapter || "Unknown Chapter";
      return `[Source ${index + 1} - ${chapter}]\n${doc.content}`;
    })
    .join("\n\n---\n\n");
}

/**
 * Extract unique chapter names from matched documents
 * @param documents - Array of matched documents
 * @returns Array of unique chapter names
 */
export function extractSources(documents: DocumentMatch[]): string[] {
  const chapters = documents
    .map((doc) => doc.metadata?.chapter)
    .filter((chapter): chapter is string => !!chapter);

  return [...new Set(chapters)];
}

