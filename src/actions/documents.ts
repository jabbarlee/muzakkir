"use server";

import { supabase } from "@/lib/supabase";
import { Book, Chapter, Paragraph } from "@/lib/types/chat";

// ============================================
// Book Functions
// ============================================

/**
 * Fetch all books from the books table
 */
export async function getBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from("books")
    .select("id, title, slug")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching books:", error);
    throw new Error("Failed to fetch books");
  }

  return data || [];
}

/**
 * Find a book by its slug
 * @returns The book or null if not found
 */
export async function getBookBySlug(slug: string): Promise<Book | null> {
  const { data, error } = await supabase
    .from("books")
    .select("id, title, slug")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned - book not found
      return null;
    }
    console.error("Error fetching book by slug:", error);
    throw new Error("Failed to fetch book");
  }

  return data;
}

// ============================================
// Chapter Functions
// ============================================

/**
 * Fetch all chapters for a book by book slug
 * Sorted by chapter_number ASC for correct order
 */
export async function getChapters(bookSlug: string): Promise<Chapter[]> {
  // First, find the book by slug
  const book = await getBookBySlug(bookSlug);
  
  if (!book) {
    return [];
  }

  const { data, error } = await supabase
    .from("chapters")
    .select("id, book_id, title, chapter_number")
    .eq("book_id", book.id)
    .order("chapter_number", { ascending: true });

  if (error) {
    console.error("Error fetching chapters:", error);
    throw new Error("Failed to fetch chapters");
  }

  return data || [];
}

/**
 * Get a chapter by its ID
 * @returns The chapter or null if not found
 */
export async function getChapterById(chapterId: number): Promise<Chapter | null> {
  const { data, error } = await supabase
    .from("chapters")
    .select("id, book_id, title, chapter_number")
    .eq("id", chapterId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching chapter:", error);
    throw new Error("Failed to fetch chapter");
  }

  return data;
}

/**
 * Get the first chapter of a book
 */
export async function getFirstChapter(bookSlug: string): Promise<Chapter | null> {
  const book = await getBookBySlug(bookSlug);
  
  if (!book) {
    return null;
  }

  const { data, error } = await supabase
    .from("chapters")
    .select("id, book_id, title, chapter_number")
    .eq("book_id", book.id)
    .order("chapter_number", { ascending: true })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching first chapter:", error);
    throw new Error("Failed to fetch first chapter");
  }

  return data;
}

// ============================================
// Chapter Navigation
// ============================================

/**
 * Get the next chapter in the same book
 * @returns The next chapter or null if this is the last chapter
 */
export async function getNextChapter(
  bookSlug: string,
  currentChapterId: number
): Promise<Chapter | null> {
  const book = await getBookBySlug(bookSlug);
  if (!book) return null;

  // Get current chapter to find its chapter_number
  const currentChapter = await getChapterById(currentChapterId);
  if (!currentChapter) return null;

  const { data, error } = await supabase
    .from("chapters")
    .select("id, book_id, title, chapter_number")
    .eq("book_id", book.id)
    .gt("chapter_number", currentChapter.chapter_number)
    .order("chapter_number", { ascending: true })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No next chapter found
      return null;
    }
    console.error("Error fetching next chapter:", error);
    throw new Error("Failed to fetch next chapter");
  }

  return data;
}

/**
 * Get the previous chapter in the same book
 * @returns The previous chapter or null if this is the first chapter
 */
export async function getPreviousChapter(
  bookSlug: string,
  currentChapterId: number
): Promise<Chapter | null> {
  const book = await getBookBySlug(bookSlug);
  if (!book) return null;

  // Get current chapter to find its chapter_number
  const currentChapter = await getChapterById(currentChapterId);
  if (!currentChapter) return null;

  const { data, error } = await supabase
    .from("chapters")
    .select("id, book_id, title, chapter_number")
    .eq("book_id", book.id)
    .lt("chapter_number", currentChapter.chapter_number)
    .order("chapter_number", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No previous chapter found
      return null;
    }
    console.error("Error fetching previous chapter:", error);
    throw new Error("Failed to fetch previous chapter");
  }

  return data;
}

// ============================================
// Paragraph / Content Functions
// ============================================

/**
 * Fetch all paragraphs for a chapter, sorted by sequence_number ASC
 * Returns them as an array for granular control
 */
export async function getChapterParagraphs(
  chapterId: number
): Promise<Paragraph[]> {
  const { data, error } = await supabase
    .from("paragraphs")
    .select("id, chapter_id, content, sequence_number")
    .eq("chapter_id", chapterId)
    .order("sequence_number", { ascending: true });

  if (error) {
    console.error("Error fetching paragraphs:", error);
    throw new Error("Failed to fetch paragraphs");
  }

  return data || [];
}

/**
 * Fetch chapter content as a single markdown string
 * Joins all paragraphs in sequence order
 */
export async function getChapterContent(chapterId: number): Promise<string> {
  const paragraphs = await getChapterParagraphs(chapterId);

  if (paragraphs.length === 0) {
    return "";
  }

  // Join all paragraph content into a single markdown string
  return paragraphs.map((p) => p.content).join("\n\n");
}

// ============================================
// Combined Data Functions (for page loading)
// ============================================

/**
 * Get complete chapter data including book info and content
 * Useful for the reader page
 */
export async function getChapterWithContext(
  bookSlug: string,
  chapterId: number
): Promise<{
  book: Book;
  chapter: Chapter;
  content: string;
  chapters: Chapter[];
} | null> {
  const book = await getBookBySlug(bookSlug);
  if (!book) return null;

  const chapter = await getChapterById(chapterId);
  if (!chapter || chapter.book_id !== book.id) return null;

  const [content, chapters] = await Promise.all([
    getChapterContent(chapterId),
    getChapters(bookSlug),
  ]);

  return {
    book,
    chapter,
    content,
    chapters,
  };
}
