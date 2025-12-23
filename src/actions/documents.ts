"use server";

import { supabase } from "@/lib/supabase";

export interface DocumentChunk {
  id: number;
  content: string;
  metadata: {
    chapter?: string;
    [key: string]: unknown;
  };
}

/**
 * Fetch all distinct chapter names from the documents table
 */
export async function getChapters(): Promise<string[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("metadata->chapter")
    .not("metadata->chapter", "is", null);

  if (error) {
    console.error("Error fetching chapters:", error);
    throw new Error("Failed to fetch chapters");
  }

  // Extract unique chapter names
  const chapters = data
    .map((row) => row.chapter as string)
    .filter((chapter): chapter is string => !!chapter);

  // Get unique chapters while preserving order
  const uniqueChapters = [...new Set(chapters)];

  return uniqueChapters;
}

/**
 * Fetch all document chunks for a specific chapter, sorted by id
 */
export async function getChapterContent(chapter: string): Promise<string> {
  const { data, error } = await supabase
    .from("documents")
    .select("id, content, metadata")
    .eq("metadata->>chapter", chapter)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching chapter content:", error);
    throw new Error("Failed to fetch chapter content");
  }

  if (!data || data.length === 0) {
    return "";
  }

  // Join all content chunks into a single markdown string
  const content = data.map((chunk) => chunk.content).join("\n\n");

  return content;
}

