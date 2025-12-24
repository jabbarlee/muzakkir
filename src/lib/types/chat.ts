/**
 * Chat message type for the AI chat interface
 */
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
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

