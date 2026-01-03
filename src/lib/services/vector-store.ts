import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { DocumentMatch, SearchOptions, ChapterWithContent } from "@/lib/types/chat";

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
 * Converts natural language text into a high-dimensional vector representation
 * that captures semantic meaning for similarity-based search.
 * 
 * @param text - The text to generate an embedding for
 * @returns The embedding vector as an array of numbers (typically 1536 dimensions)
 * @throws Error if embedding generation fails
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("Text input is required for embedding generation");
  }

  try {
    const openai = getOpenAIClient();
    const trimmedText = text.trim();
    
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: trimmedText,
    });

    const embedding = response.data[0]?.embedding;
    
    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
      throw new Error("Invalid embedding response from OpenAI");
    }

    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
    throw new Error("Failed to generate embedding for the query");
  }
}

/**
 * Search for similar paragraphs in Supabase using vector similarity (cosine similarity)
 * Uses the match_paragraphs RPC function which performs efficient vector similarity search
 * 
 * @param embedding - The query embedding vector (must be valid array of numbers)
 * @param options - Search options (threshold and count)
 * @returns Array of matching paragraphs with similarity scores, sorted by relevance
 */
export async function searchSimilarDocuments(
  embedding: number[],
  options: SearchOptions = {}
): Promise<DocumentMatch[]> {
  // Validate embedding input
  if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
    throw new Error("Invalid embedding vector provided");
  }

  const { matchThreshold = 0.3, matchCount = 5 } = options;

  // Validate options
  if (matchThreshold < 0 || matchThreshold > 1) {
    throw new Error("matchThreshold must be between 0 and 1");
  }
  if (matchCount < 1 || matchCount > 100) {
    throw new Error("matchCount must be between 1 and 100");
  }

  try {
    const { data, error } = await supabase.rpc("match_paragraphs", {
      query_embedding: embedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      throw new Error(`Failed to search for similar documents: ${error.message}`);
    }

    // Ensure we return an array even if data is null/undefined
    const results = (data as DocumentMatch[]) || [];
    
    // Validate results structure
    return results.filter((doc) => {
      return (
        doc &&
        typeof doc === "object" &&
        "content" in doc &&
        "similarity" in doc &&
        typeof doc.similarity === "number"
      );
    });
  } catch (error) {
    console.error("Error searching documents:", error);
    if (error instanceof Error) {
      throw error; // Re-throw with original message
    }
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

/**
 * Turkish ordinal to number mapping for chapter lookups
 */
const TURKISH_ORDINALS_TO_NUMBER: Record<string, number> = {
  birinci: 1,
  ikinci: 2,
  üçüncü: 3,
  ucuncu: 3,
  dördüncü: 4,
  dorduncu: 4,
  beşinci: 5,
  besinci: 5,
  altıncı: 6,
  altinci: 6,
  yedinci: 7,
  sekizinci: 8,
  dokuzuncu: 9,
  onuncu: 10,
};

/**
 * Chapter type to book slug mapping
 */
const CHAPTER_TYPE_TO_BOOK: Record<string, string> = {
  söz: "sozler",
  soz: "sozler",
  mektup: "mektubat",
  "lem'a": "lemalar",
  lema: "lemalar",
  şua: "sualar",
  sua: "sualar",
};

/**
 * Find a chapter by its number and optional type
 * @param chapterNumber - The chapter number to find
 * @param chapterType - Optional type (söz, mektup, etc.) to filter by book
 * @returns The chapter with content or null if not found
 */
export async function findChapterByNumber(
  chapterNumber: number,
  chapterType?: string | null
): Promise<ChapterWithContent | null> {
  try {
    // Build the query
    let query = supabase
      .from("chapters")
      .select(`
        id,
        title,
        chapter_number,
        book_id,
        books!inner(id, title, slug)
      `)
      .eq("chapter_number", chapterNumber);

    // If chapter type is specified, filter by book
    if (chapterType) {
      const bookSlug = CHAPTER_TYPE_TO_BOOK[chapterType.toLowerCase()];
      if (bookSlug) {
        query = query.eq("books.slug", bookSlug);
      }
    }

    const { data: chapters, error } = await query.limit(1);

    if (error) {
      console.error("Error finding chapter by number:", error);
      return null;
    }

    if (!chapters || chapters.length === 0) {
      return null;
    }

    const chapter = chapters[0];
    const book = chapter.books as unknown as { id: number; title: string; slug: string };

    // Fetch the chapter content
    const { data: paragraphs, error: paragraphError } = await supabase
      .from("paragraphs")
      .select("content, sequence_number")
      .eq("chapter_id", chapter.id)
      .order("sequence_number", { ascending: true });

    if (paragraphError) {
      console.error("Error fetching chapter paragraphs:", error);
      return null;
    }

    const content = paragraphs?.map((p) => p.content).join("\n\n") || "";

    return {
      id: chapter.id,
      title: chapter.title,
      chapterNumber: chapter.chapter_number,
      bookTitle: book.title,
      content,
    };
  } catch (error) {
    console.error("Error in findChapterByNumber:", error);
    return null;
  }
}

/**
 * Find a chapter by matching its title
 * Useful when the user references a chapter by name
 * @param titleQuery - Partial title to search for
 * @returns The chapter with content or null if not found
 */
export async function findChapterByTitle(
  titleQuery: string
): Promise<ChapterWithContent | null> {
  try {
    // Use ilike for case-insensitive partial matching
    const { data: chapters, error } = await supabase
      .from("chapters")
      .select(`
        id,
        title,
        chapter_number,
        book_id,
        books!inner(id, title, slug)
      `)
      .ilike("title", `%${titleQuery}%`)
      .limit(1);

    if (error) {
      console.error("Error finding chapter by title:", error);
      return null;
    }

    if (!chapters || chapters.length === 0) {
      return null;
    }

    const chapter = chapters[0];
    const book = chapter.books as unknown as { id: number; title: string; slug: string };

    // Fetch the chapter content
    const { data: paragraphs, error: paragraphError } = await supabase
      .from("paragraphs")
      .select("content, sequence_number")
      .eq("chapter_id", chapter.id)
      .order("sequence_number", { ascending: true });

    if (paragraphError) {
      console.error("Error fetching chapter paragraphs:", error);
      return null;
    }

    const content = paragraphs?.map((p) => p.content).join("\n\n") || "";

    return {
      id: chapter.id,
      title: chapter.title,
      chapterNumber: chapter.chapter_number,
      bookTitle: book.title,
      content,
    };
  } catch (error) {
    console.error("Error in findChapterByTitle:", error);
    return null;
  }
}

/**
 * Get chapter content by ID
 * @param chapterId - The chapter ID
 * @returns The chapter with content or null if not found
 */
export async function getChapterContentById(
  chapterId: number
): Promise<ChapterWithContent | null> {
  try {
    const { data: chapter, error } = await supabase
      .from("chapters")
      .select(`
        id,
        title,
        chapter_number,
        book_id,
        books!inner(id, title, slug)
      `)
      .eq("id", chapterId)
      .single();

    if (error) {
      console.error("Error fetching chapter by ID:", error);
      return null;
    }

    const book = chapter.books as unknown as { id: number; title: string; slug: string };

    // Fetch the chapter content
    const { data: paragraphs, error: paragraphError } = await supabase
      .from("paragraphs")
      .select("content, sequence_number")
      .eq("chapter_id", chapter.id)
      .order("sequence_number", { ascending: true });

    if (paragraphError) {
      console.error("Error fetching chapter paragraphs:", error);
      return null;
    }

    const content = paragraphs?.map((p) => p.content).join("\n\n") || "";

    return {
      id: chapter.id,
      title: chapter.title,
      chapterNumber: chapter.chapter_number,
      bookTitle: book.title,
      content,
    };
  } catch (error) {
    console.error("Error in getChapterContentById:", error);
    return null;
  }
}

/**
 * Build an enhanced context that prioritizes specific chapter content
 * @param primaryChapter - The main chapter content (if a specific chapter was requested)
 * @param relatedDocuments - Related paragraphs from vector search
 * @returns Formatted context string with proper prioritization
 */
export function buildEnhancedContext(
  primaryChapter: ChapterWithContent | null,
  relatedDocuments: DocumentMatch[]
): string {
  const parts: string[] = [];

  // Add primary chapter content first (highest priority)
  if (primaryChapter) {
    // Limit content to avoid token overflow (roughly 3000 words)
    const truncatedContent = primaryChapter.content.length > 12000
      ? primaryChapter.content.substring(0, 12000) + "\n\n[Content truncated...]"
      : primaryChapter.content;

    parts.push(
      `[PRIMARY SOURCE - ${primaryChapter.bookTitle} - ${primaryChapter.title}]\n` +
      `This is the complete content of the chapter the user is asking about:\n\n` +
      truncatedContent
    );
  }

  // Add related documents as supplementary context (filter out duplicates from primary chapter)
  const filteredDocs = primaryChapter
    ? relatedDocuments.filter((doc) => doc.chapter_id !== primaryChapter.id)
    : relatedDocuments;

  if (filteredDocs.length > 0) {
    const relatedContext = filteredDocs
      .slice(0, 3) // Limit to 3 supplementary sources
      .map((doc, index) => {
        const source = `${doc.book_title} - ${doc.chapter_title}`;
        return `[Related Source ${index + 1} - ${source}]\n${doc.content}`;
      })
      .join("\n\n---\n\n");

    if (primaryChapter) {
      parts.push("\n\n=== RELATED CONTENT FROM OTHER CHAPTERS ===\n\n" + relatedContext);
    } else {
      parts.push(relatedContext);
    }
  }

  return parts.join("\n\n");
}

/**
 * Extract sources including primary chapter
 */
export function extractEnhancedSources(
  primaryChapter: ChapterWithContent | null,
  documents: DocumentMatch[]
): string[] {
  const sources: string[] = [];

  if (primaryChapter) {
    sources.push(`${primaryChapter.bookTitle} - ${primaryChapter.title}`);
  }

  const docSources = documents
    .filter((doc) => !primaryChapter || doc.chapter_id !== primaryChapter.id)
    .map((doc) => `${doc.book_title} - ${doc.chapter_title}`)
    .filter((source): source is string => !!source);

  sources.push(...docSources);

  return [...new Set(sources)];
}
