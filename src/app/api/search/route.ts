import { NextRequest, NextResponse } from "next/server";
import {
  generateEmbedding,
  searchSimilarDocuments,
} from "@/lib/services/vector-store";
import { DocumentMatch } from "@/lib/types/chat";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/search
 * Handles semantic search requests using vector similarity
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { query, limit = 10, threshold = 0.25 } = body;

    if (!query || typeof query !== "string" || query.trim() === "") {
      return NextResponse.json(
        { error: "Query is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return NextResponse.json(
        { error: "Search service is not configured" },
        { status: 500 }
      );
    }

    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query.trim());

    // Search for similar documents
    const matchedDocuments = await searchSimilarDocuments(queryEmbedding, {
      matchThreshold: threshold,
      matchCount: limit,
    });

    // Enrich results with book slugs for navigation
    const enrichedResults = await Promise.all(
      matchedDocuments.map(async (doc) => {
        // Get book slug from chapter_id
        const { data: chapterData, error: chapterError } = await supabase
          .from("chapters")
          .select(`
            id,
            books!inner(id, title, slug)
          `)
          .eq("id", doc.chapter_id)
          .single();

        let bookSlug: string | null = null;
        if (chapterData && !chapterError) {
          const book = chapterData.books as unknown as { slug: string };
          bookSlug = book?.slug || null;
        }

        return {
          ...doc,
          book_slug: bookSlug,
        };
      })
    );

    return NextResponse.json({
      results: enrichedResults,
      query: query.trim(),
    });
  } catch (error) {
    console.error("Search API error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("embedding")) {
        return NextResponse.json(
          { error: "Failed to process your search query. Please try again." },
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

