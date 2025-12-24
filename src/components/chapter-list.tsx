"use client";

import Link from "next/link";
import { BookOpen, Loader2 } from "lucide-react";
import { Chapter } from "@/lib/types/chat";

interface ChapterListProps {
  chapters: Chapter[];
  selectedChapterId: number | null;
  bookSlug: string;
  bookTitle?: string;
  onClose?: () => void;
  isLoading?: boolean;
}

export function ChapterList({
  chapters,
  selectedChapterId,
  bookSlug,
  bookTitle = "Muzakkir",
  onClose,
  isLoading = false,
}: ChapterListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 border-b border-sidebar-border flex-shrink-0 h-14 flex items-center">
        <Link
          href="/read"
          className="flex items-center gap-2 text-sidebar-primary hover:text-sidebar-primary/80 transition-colors"
        >
          <BookOpen className="size-5" />
          <span className="font-semibold tracking-tight">{bookTitle}</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : chapters.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No chapters found
            </p>
          ) : (
            chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/read/${bookSlug}/${chapter.id}`}
                onClick={() => onClose?.()}
                className={`
                  block w-full text-left px-3 py-2.5 rounded-lg text-sm
                  transition-all duration-200 ease-out
                  ${
                    selectedChapterId === chapter.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }
                `}
              >
                <span className="block truncate">{chapter.title}</span>
              </Link>
            ))
          )}
        </nav>
      </div>
    </div>
  );
}

