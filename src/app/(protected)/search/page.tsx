"use client";

import { useState, FormEvent, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchResults } from "@/components/search-results";
import { DocumentMatch, SearchResponse } from "@/lib/types/chat";
import { useAuth, signOutUser } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DocumentMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const lastProcessedQuery = useRef<string | null>(null);

  const performSearch = useCallback(
    async (searchQuery: string, updateUrl: boolean = true) => {
      if (!searchQuery.trim()) {
        return;
      }

      // Update URL with search query
      if (updateUrl) {
        const params = new URLSearchParams();
        params.set("q", searchQuery.trim());
        router.replace(`/search?${params.toString()}`, { scroll: false });
      }

      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: searchQuery.trim(),
            limit: 10,
            threshold: 0.25,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to search");
        }

        const data: SearchResponse = await response.json();
        setResults(data.results);
      } catch (err) {
        console.error("Search error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please try again."
        );
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  // Initialize query from URL on mount and handle URL changes
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    
    // Only process if the query has changed
    if (urlQuery !== lastProcessedQuery.current) {
      lastProcessedQuery.current = urlQuery;
      
      if (urlQuery) {
        // URL has a query parameter
        setQuery(urlQuery);
        performSearch(urlQuery, false); // Don't update URL, it's already set
      } else {
        // No query in URL - reset state
        setQuery("");
        setResults([]);
        setHasSearched(false);
        setError(null);
      }
    }
  }, [searchParams, performSearch]);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      const trimmedQuery = searchQuery.trim();
      lastProcessedQuery.current = trimmedQuery; // Update ref to prevent duplicate search
      performSearch(trimmedQuery, true); // Update URL on manual search
    },
    [performSearch]
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch(query); // Update URL on form submit
  };

  const handleAskAI = useCallback(
    (result: DocumentMatch) => {
      // Navigate to the chapter page with the reference text
      // The reader will handle opening the chat panel
      if (result.book_slug && result.chapter_id) {
        router.push(`/read/${result.book_slug}/${result.chapter_id}`);
      }
    },
    [router]
  );

  const handleSignOut = async () => {
    const result = await signOutUser();
    if (!result.error) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/books"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <BookOpen className="size-4 text-primary" />
              </div>
              <span className="text-xl font-semibold text-foreground tracking-wide">
                Muzakkir
              </span>
            </Link>

            {/* User Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="size-4" />
                    <span className="hidden sm:inline">
                      {user.user_metadata?.full_name ||
                        user.user_metadata?.display_name ||
                        user.email?.split("@")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    <User className="mr-2 size-4" />
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 size-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back to Books Link */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/books" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to Books
            </Link>
          </Button>
        </div>

        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Semantic Search
          </h1>
          <p className="text-lg text-muted-foreground">
            Search for concepts and ideas across all books using natural
            language. Ask questions like "how does nature prove the existence
            of God?" instead of exact keywords.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for concepts, ideas, or questions..."
                className="pl-12 pr-4 py-6 text-base"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={!query.trim() || isLoading}
              className="px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <SearchResults
            results={results}
            query={query}
            isLoading={isLoading}
            onAskAI={handleAskAI}
          />
        )}

        {/* Empty State (before search) */}
        {!hasSearched && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Search className="size-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              Start your search
            </p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Enter a question or concept to find relevant passages across all
              books in the collection.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

