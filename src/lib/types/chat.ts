// ============================================
// Database Entity Types (Relational Schema)
// ============================================

/**
 * Book entity from the books table
 */
export interface Book {
  id: number;
  title: string;
  slug: string;
}

/**
 * Chapter entity from the chapters table
 */
export interface Chapter {
  id: number;
  book_id: number;
  title: string;
  chapter_number: number;
}

/**
 * Paragraph entity from the paragraphs table
 */
export interface Paragraph {
  id: number;
  chapter_id: number;
  content: string;
  sequence_number: number;
}

// ============================================
// Chat Types
// ============================================

/**
 * Chat message type for the AI chat interface
 */
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  reference?: string; // Selected text reference from the book
  timestamp: Date;
}

/**
 * Response from the chat API
 */
export interface ChatResponse {
  response: string;
  sources: string[];
}

/**
 * Request body for the chat API
 */
export interface ChatRequest {
  question: string;
  currentChapter?: string;
  language?: "en" | "tr";
  referenceText?: string; // Selected text from the book to ask about
}

/**
 * Document match returned from vector similarity search (match_paragraphs RPC)
 */
export interface DocumentMatch {
  id: number;
  content: string;
  similarity: number;
  book_title: string;
  chapter_title: string;
  chapter_id: number;
}

/**
 * Options for similarity search
 */
export interface SearchOptions {
  matchThreshold?: number;
  matchCount?: number;
  chapterId?: number; // Optional filter by chapter
}

// ============================================
// Query Understanding Types
// ============================================

/**
 * Result of analyzing a user query for intent and chapter references
 */
export interface QueryUnderstanding {
  /** Whether the user explicitly references a specific chapter */
  referencesSpecificChapter: boolean;
  /** The chapter number if identified (e.g., 4 for "4th chapter") */
  chapterNumber: number | null;
  /** The type of chapter (söz, mektup, lem'a, şua) */
  chapterType: "söz" | "mektup" | "lem'a" | "şua" | null;
  /** Whether the question relates to the user's current reading context */
  relatedToCurrentContext: boolean;
  /** The core semantic query to use for vector search */
  searchQuery: string;
}

/**
 * Chapter with its full content for context injection
 */
export interface ChapterWithContent {
  id: number;
  title: string;
  chapterNumber: number;
  bookTitle: string;
  content: string;
}

