import { notFound } from "next/navigation";
import {
  getChapterWithContext,
  getNextChapter,
  getPreviousChapter,
} from "@/actions/documents";
import { ReaderClient } from "./reader-client";

interface PageProps {
  params: Promise<{
    bookSlug: string;
    chapterId: string;
  }>;
}

export default async function ChapterPage({ params }: PageProps) {
  const { bookSlug, chapterId } = await params;
  const chapterIdNum = parseInt(chapterId, 10);

  // Validate chapterId is a number
  if (isNaN(chapterIdNum)) {
    notFound();
  }

  // Fetch all data in parallel
  const [chapterData, nextChapter, prevChapter] = await Promise.all([
    getChapterWithContext(bookSlug, chapterIdNum),
    getNextChapter(bookSlug, chapterIdNum),
    getPreviousChapter(bookSlug, chapterIdNum),
  ]);

  // If chapter data not found, show 404
  if (!chapterData) {
    notFound();
  }

  const { book, chapter, content, chapters } = chapterData;

  return (
    <ReaderClient
      book={book}
      chapter={chapter}
      chapters={chapters}
      content={content}
      nextChapterId={nextChapter?.id ?? null}
      prevChapterId={prevChapter?.id ?? null}
    />
  );
}

