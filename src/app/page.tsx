import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-8">
          <BookOpen className="size-10 text-primary" />
        </div>

        {/* Title */}
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-foreground mb-4 tracking-tight">
          The Words
        </h1>
        <p className="text-xl text-muted-foreground mb-2 font-serif italic">
          Sözler
        </p>
        <p className="text-muted-foreground mb-10">by Bediüzzaman Said Nursi</p>

        {/* Description */}
        <p className="text-foreground/80 leading-relaxed mb-10">
          A profound collection of thirty-three treatises exploring faith,
          worship, and the meaning of existence through the lens of Islamic
          spirituality and philosophy.
        </p>

        {/* CTA */}
        <Button asChild size="lg" className="gap-2 font-medium">
          <Link href="/read">
            Start Reading
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </main>
  );
}
