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
 * Document match returned from vector similarity search
 */
export interface DocumentMatch {
  id: number;
  content: string;
  metadata: {
    chapter?: string;
    book?: string;
    [key: string]: unknown;
  };
  similarity: number;
}

/**
 * Options for similarity search
 */
export interface SearchOptions {
  matchThreshold?: number;
  matchCount?: number;
}

