import { redirect, notFound } from "next/navigation";
import { getBookBySlug, getFirstChapter } from "@/actions/documents";

interface PageProps {
  params: Promise<{
    bookSlug: string;
  }>;
}

export default async function BookPage({ params }: PageProps) {
  const { bookSlug } = await params;

  // Check if the book exists
  const book = await getBookBySlug(bookSlug);

  if (!book) {
    notFound();
  }

  // Get the first chapter
  const firstChapter = await getFirstChapter(bookSlug);

  if (firstChapter) {
    // Redirect to the first chapter
    redirect(`/read/${bookSlug}/${firstChapter.id}`);
  }

  // If no chapters exist, show a message (this shouldn't normally happen)
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-3">
          {book.title}
        </h1>
        <p className="text-muted-foreground">
          No chapters are available for this book yet.
        </p>
      </div>
    </div>
  );
}

