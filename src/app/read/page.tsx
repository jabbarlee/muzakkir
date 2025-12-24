import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { getBooks, getFirstChapter } from "@/actions/documents";
import { Book } from "@/lib/types/chat";

async function BookCard({ book }: { book: Book }) {
  const firstChapter = await getFirstChapter(book.slug);
  const href = firstChapter
    ? `/read/${book.slug}/${firstChapter.id}`
    : `/read/${book.slug}`;

  return (
    <Link
      href={href}
      className="group block p-6 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <BookOpen className="size-5 text-primary" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors truncate">
              {book.title}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Click to start reading
          </p>
        </div>
        <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
      </div>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Choose a Book
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Select a book from the Risale-i Nur collection to begin reading
          </p>
        </div>

        {/* Books Grid */}
        {books.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="size-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No books available yet</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
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
