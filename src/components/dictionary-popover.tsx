"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, BookOpen, Search } from "lucide-react";
import { lookupWord } from "@/lib/services/dictionary-service";
import { cn } from "@/lib/utils";

interface DictionaryPopoverProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export function DictionaryPopover({
  word,
  position,
  onClose,
}: DictionaryPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Use React Query for caching dictionary lookups
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dictionary", word.toLowerCase()],
    queryFn: () => lookupWord(word),
    enabled: !!word && word.length >= 2,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    // Delay adding listener to avoid immediate close
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Get method badge info
  const getMethodBadge = () => {
    if (!data?.method) return null;

    switch (data.method) {
      case "exact":
        return {
          icon: BookOpen,
          label: "Exact match",
          className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        };
      case "suffix_stripped":
        return {
          icon: Search,
          label: "Root form",
          className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        };
      default:
        return null;
    }
  };

  const methodBadge = getMethodBadge();

  return (
    <div
      ref={popoverRef}
      className="dictionary-popover fixed z-50 w-80 max-w-[90vw] rounded-lg border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 duration-150"
      style={{
        left: Math.min(position.x, window.innerWidth - 340),
        top: position.y + 10,
        transform: "translateX(-50%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-primary" />
          <span className="font-serif font-semibold text-base">{word}</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="size-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {isLoading && (
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-full" />
            <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            An error occurred while looking up this word.
          </p>
        )}

        {!isLoading && !isError && data && (
          <>
            {data.found && data.entry ? (
              <div className="space-y-3">
                {/* Root word indicator */}
                {data.entry.root_word && (
                  <p className="text-xs text-muted-foreground">
                    Root: <span className="font-medium">{data.entry.root_word}</span>
                  </p>
                )}

                {/* Definition */}
                <p className="text-sm leading-relaxed">{data.entry.definition}</p>

                {/* Method badge */}
                {methodBadge && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                        methodBadge.className
                      )}
                    >
                      <methodBadge.icon className="size-3" />
                      {methodBadge.label}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No definition found for this word.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

