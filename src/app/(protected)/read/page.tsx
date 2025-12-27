import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getBooks, getFirstChapter } from "@/actions/documents";
import { Book } from "@/lib/types/chat";

async function BookCard({ book }: { book: Book }) {
  const firstChapter = await getFirstChapter(book.slug);
  const href = firstChapter
    ? `/read/${book.slug}/${firstChapter.id}`
    : `/read/${book.slug}`;

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

export default async function ReadPage() {
  const books = await getBooks();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 h-14 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-center px-4 h-full max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-foreground">
            <BookOpen className="size-5" />
            <span className="font-semibold tracking-tight">Muzakkir</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Choose a Book
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Select a book from the Risale-i Nur collection to begin reading
          </p>
        </div>

        {/* Books Shelf */}
        {books.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="size-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No books available yet</p>
          </div>
        ) : (
          <div className="relative">
            {/* Books Row */}
            <div className="flex flex-wrap justify-center gap-8 sm:gap-10 pb-10">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Risale-i Nur Collection
          </p>
        </div>
      </footer>
    </div>
  );
}
