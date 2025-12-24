import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getBooks } from "@/actions/documents";
import { Book } from "@/lib/types/chat";
import { Button } from "@/components/ui/button";

function BookCover({ book }: { book: Book }) {
  return (
    <div className="group flex flex-col items-center">
      {/* Book Cover */}
      <div className="relative w-48 sm:w-56 aspect-[3/4] perspective-1000">
        {/* Book shadow */}
        <div className="absolute inset-0 bg-black/20 rounded-sm transform translate-x-2 translate-y-2 blur-md transition-all duration-300 group-hover:translate-x-3 group-hover:translate-y-3" />

        {/* Book spine effect */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-stone-900 via-stone-800 to-transparent rounded-l-sm z-10" />

        {/* Main cover */}
        <div className="relative w-full h-full bg-gradient-to-br from-rose-900 via-red-900 to-rose-950 rounded-sm border border-rose-800/50 overflow-hidden transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-rose-900/30">
          {/* Decorative pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Decorative top border */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-amber-600/20 to-transparent" />
          <div className="absolute top-3 left-4 right-4 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          <div className="absolute top-5 left-6 right-6 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

          {/* Book content */}
          <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
            {/* Ornamental icon */}
            <div className="mb-4 p-3 rounded-full bg-amber-500/10 border border-amber-500/20">
              <BookOpen className="size-6 text-amber-400/80" />
            </div>

            {/* Title */}
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100 leading-tight tracking-wide mb-2">
              {book.title}
            </h2>

            {/* Decorative line */}
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent my-3" />

            {/* Subtitle */}
            <p className="text-xs text-amber-200/60 uppercase tracking-[0.2em]">
              Risale-i Nur
            </p>
          </div>

          {/* Decorative bottom border */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-5 left-6 right-6 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Read Button */}
      <Button
        asChild
        className="mt-6 bg-rose-900 hover:bg-rose-800 text-amber-100 border border-rose-700/50 shadow-lg transition-all duration-300 group-hover:shadow-rose-900/30"
      >
        <Link href={`/read/${book.slug}`}>Start Reading</Link>
      </Button>
    </div>
  );
}

export default async function ReadPage() {
  const books = await getBooks();

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950">
      {/* Decorative background pattern */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 h-16 bg-stone-950/80 backdrop-blur-md border-b border-amber-900/20">
        <div className="flex items-center justify-center px-4 h-full max-w-6xl mx-auto">
          <div className="flex items-center gap-3 text-amber-100">
            <div className="p-2 rounded-lg bg-rose-900/30 border border-rose-800/30">
              <BookOpen className="size-5 text-amber-400" />
            </div>
            <span className="font-serif text-xl font-semibold tracking-wide">
              Muzakkir
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-amber-100 mb-4 tracking-wide">
            Risale-i Nur Collection
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mx-auto mb-4" />
          <p className="text-amber-200/60 text-lg max-w-xl mx-auto">
            Select a book from the collection to begin your reading journey
          </p>
        </div>

        {/* Books Grid */}
        {books.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 rounded-full bg-rose-900/20 border border-rose-800/30 inline-block mb-4">
              <BookOpen className="size-12 text-amber-400/50" />
            </div>
            <p className="text-amber-200/50">No books available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 justify-items-center">
            {books.map((book) => (
              <BookCover key={book.id} book={book} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-900/20 py-8 mt-auto bg-stone-950/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-amber-200/40">
            Bediüzzaman Said Nursi &middot; Risale-i Nur Külliyatı
          </p>
        </div>
      </footer>
    </div>
  );
}
