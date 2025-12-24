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
 * Search for similar paragraphs in Supabase using vector similarity
 * Uses the new match_paragraphs RPC function
 * @param embedding - The query embedding vector
 * @param options - Search options (threshold and count)
 * @returns Array of matching paragraphs with similarity scores
 */
export async function searchSimilarDocuments(
  embedding: number[],
  options: SearchOptions = {}
): Promise<DocumentMatch[]> {
  const { matchThreshold = 0.3, matchCount = 5 } = options;

  try {
    const { data, error } = await supabase.rpc("match_paragraphs", {
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
 * Build a context string from matched paragraphs for the AI prompt
 * @param documents - Array of matched paragraphs
 * @returns Formatted context string
 */
export function buildContext(documents: DocumentMatch[]): string {
  if (documents.length === 0) {
    return "";
  }

  return documents
    .map((doc, index) => {
      const source = `${doc.book_title} - ${doc.chapter_title}`;
      return `[Source ${index + 1} - ${source}]\n${doc.content}`;
    })
    .join("\n\n---\n\n");
}

/**
 * Extract unique source strings from matched paragraphs
 * @param documents - Array of matched paragraphs
 * @returns Array of unique source strings in "Book - Chapter" format
 */
export function extractSources(documents: DocumentMatch[]): string[] {
  const sources = documents
    .map((doc) => `${doc.book_title} - ${doc.chapter_title}`)
    .filter((source): source is string => !!source);

  return [...new Set(sources)];
}
