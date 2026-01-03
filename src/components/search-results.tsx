"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, MessageCircle, Loader2 } from "lucide-react";
import { DocumentMatch } from "@/lib/types/chat";
import { Button } from "@/components/ui/button";

interface SearchResultsProps {
  results: DocumentMatch[];
  query: string;
  isLoading?: boolean;
  onAskAI?: (result: DocumentMatch) => void;
}

/**
 * Format similarity score as percentage
 */
function formatSimilarity(similarity: number): string {
  return `${Math.round(similarity * 100)}%`;
}

/**
 * Truncate text to a maximum length
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

/**
 * Get chapter URL from a document match
 */
function getChapterUrl(result: DocumentMatch): string | null {
  if (!result.book_slug || !result.chapter_id) {
    return null;
  }
  return `/read/${result.book_slug}/${result.chapter_id}`;
}

export function SearchResults({
  results,
  query,
  isLoading = false,
  onAskAI,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="size-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Searching...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <BookOpen className="size-12 text-muted-foreground/50 mb-4" />
        <p className="text-lg font-medium text-foreground mb-2">
          No results found
        </p>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Try different keywords or rephrase your query. Semantic search works
          best with conceptual questions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Found {results.length} result{results.length !== 1 ? "s" : ""} for "
          <span className="font-medium text-foreground">{query}</span>"
        </p>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => {
          const chapterUrl = getChapterUrl(result);
          const similarityPercent = formatSimilarity(result.similarity);

          return (
            <div
              key={`${result.id}-${index}`}
              className="group p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200"
            >
              {/* Header: Source and Similarity */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="size-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground truncate">
                      {result.book_title}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {result.chapter_title}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {similarityPercent} match
                  </span>
                </div>
              </div>

              {/* Content Preview */}
              <div className="mb-4">
                <p className="text-sm text-foreground/90 leading-relaxed line-clamp-3">
                  {truncateText(result.content, 300)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {chapterUrl ? (
                  <Button asChild variant="default" size="sm">
                    <Link href={chapterUrl}>Read Chapter</Link>
                  </Button>
                ) : (
                  <Button variant="default" size="sm" disabled>
                    Read Chapter
                  </Button>
                )}
                {onAskAI && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAskAI(result)}
                    className="gap-2"
                  >
                    <MessageCircle className="size-4" />
                    Ask AI about this
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

