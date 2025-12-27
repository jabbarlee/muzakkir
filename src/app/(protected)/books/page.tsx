"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, LogOut, User } from "lucide-react";
import { getBooks, getFirstChapter } from "@/actions/documents";
import { Book } from "@/lib/types/chat";
import { useAuth, signOutUser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function BookCard({ book, href }: { book: Book; href: string }) {
  return (
    <Link href={href} className="group block">
      {/* Book Container */}
      <div className="relative w-[180px] sm:w-[200px] transition-all duration-300 ease-out group-hover:-translate-y-3">
        {/* Book Cover */}
        <div
          className="relative h-[260px] sm:h-[300px] rounded-r-md rounded-l-sm overflow-hidden"
          style={{
            background: `linear-gradient(135deg, var(--primary) 0%, oklch(0.35 0.12 35) 100%)`,
            boxShadow: `
              4px 4px 12px rgba(0,0,0,0.15),
              inset -2px 0 4px rgba(255,255,255,0.1),
              inset 2px 0 8px rgba(0,0,0,0.2)
            `,
          }}
        >
          {/* Spine Edge Effect */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[14px] sm:w-[18px]"
            style={{
              background: `linear-gradient(90deg, 
                rgba(0,0,0,0.3) 0%, 
                rgba(0,0,0,0.1) 30%,
                rgba(255,255,255,0.05) 70%,
                transparent 100%
              )`,
            }}
          />

          {/* Top & Bottom Page Effect */}
          <div
            className="absolute top-0 left-3 right-0 h-[3px]"
            style={{
              background: `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 100%)`,
            }}
          />
          <div
            className="absolute bottom-0 left-3 right-0 h-[3px]"
            style={{
              background: `linear-gradient(0deg, rgba(0,0,0,0.15) 0%, transparent 100%)`,
            }}
          />

          {/* Decorative Border */}
          <div className="absolute inset-4 sm:inset-5 border border-primary-foreground/20 rounded-sm" />

          {/* Book Title */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-5 sm:px-6 text-center">
            <div className="w-10 h-[1px] bg-primary-foreground/30 mb-4" />
            <p className="font-serif text-2xl font-semibold text-primary-foreground leading-tight tracking-wide">
              {book.title}
            </p>
            <div className="w-10 h-[1px] bg-primary-foreground/30 mt-4" />
          </div>

          {/* Bottom Icon */}
          <div className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2">
            <BookOpen className="size-5 text-primary-foreground/40" />
          </div>

          {/* Hover Glow Effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%)`,
            }}
          />
        </div>

        {/* Book Pages (Side Effect) */}
        <div
          className="absolute right-0 top-[4px] bottom-[4px] w-[8px] rounded-r-sm"
          style={{
            background: `linear-gradient(90deg, 
              oklch(0.95 0.01 80) 0%,
              oklch(0.92 0.01 80) 30%,
              oklch(0.88 0.01 80) 60%,
              oklch(0.85 0.01 80) 100%
            )`,
            transform: `translateX(100%)`,
            boxShadow: `2px 0 4px rgba(0,0,0,0.1)`,
          }}
        />

        {/* Book Shadow */}
        <div
          className="absolute -bottom-3 left-3 right-0 h-5 rounded-full blur-md transition-all duration-300 group-hover:blur-lg group-hover:-bottom-4"
          style={{
            background: `rgba(0,0,0,0.18)`,
          }}
        />
      </div>

      {/* Book Label */}
      <p className="mt-5 text-sm text-muted-foreground text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Read now
      </p>
    </Link>
  );
}

export default function BooksPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [bookHrefs, setBookHrefs] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooks() {
      try {
        const fetchedBooks = await getBooks();
        setBooks(fetchedBooks);

        // Get first chapter for each book
        const hrefs: Record<number, string> = {};
        await Promise.all(
          fetchedBooks.map(async (book) => {
            const firstChapter = await getFirstChapter(book.slug);
            hrefs[book.id] = firstChapter
              ? `/read/${book.slug}/${firstChapter.id}`
              : `/read/${book.slug}`;
          })
        );
        setBookHrefs(hrefs);
      } catch (error) {
        console.error("Failed to load books:", error);
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, []);

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
              href="/"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="min-h-[calc(100vh-8rem)] flex flex-col">
          {/* Header */}
          <div className="text-left mb-16">
            <p className="text-4xl md:text-3xl font-bold text-foreground mb-4">
              Books Library
            </p>
            <p className="text-lg text-muted-foreground">
              Explore the collection of Risale-i Nur
            </p>
          </div>

          {/* Books Shelf */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading books...</p>
              </div>
            </div>
          ) : books.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="size-16 text-muted-foreground/50 mx-auto mb-6" />
                <p className="text-lg text-muted-foreground">
                  No books available yet
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              {/* Books Row */}
              <div className="flex flex-wrap justify-center gap-8 sm:gap-12 md:gap-16 pb-10">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    href={bookHrefs[book.id] || `/read/${book.slug}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
