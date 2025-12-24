import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="p-4 rounded-full bg-rose-900/20 border border-rose-800/30">
            <BookOpen className="size-12 text-amber-400/50" />
          </div>
        </div>
        <h1 className="font-serif text-3xl font-bold text-amber-100 mb-3">
          Book Not Found
        </h1>
        <p className="text-amber-200/60 mb-8">
          The book you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Button
          asChild
          className="bg-rose-900 hover:bg-rose-800 text-amber-100 border border-rose-700/50"
        >
          <Link href="/read" className="inline-flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Back to Library
          </Link>
        </Button>
      </div>
    </div>
  );
}

