"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, ArrowRight } from "lucide-react";

export default function BooksPage() {
  const books = [
    {
      id: 1,
      title: "The Words (Sözler)",
      description:
        "A comprehensive collection of treatises explaining the fundamentals of faith through rational proofs and Quranic verses.",
      chapters: 33,
      progress: 45,
      slug: "sozler",
    },
    {
      id: 2,
      title: "The Letters (Mektubat)",
      description:
        "A collection of letters written to various people, addressing questions about faith, worship, and spiritual matters.",
      chapters: 31,
      progress: 20,
      slug: "mektubat",
    },
    {
      id: 3,
      title: "The Flashes (Lemeat)",
      description:
        "Short but profound treatises that illuminate various aspects of faith and spirituality with brilliant insights.",
      chapters: 33,
      progress: 0,
      slug: "lemeat",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Books Library</h1>
        <p className="text-muted-foreground mt-2">
          Explore the collection of Risale-i Nur
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
        <Input placeholder="Search books..." className="pl-10" disabled />
      </div>

      {/* Books Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <Card
            key={book.id}
            className="hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <BookOpen className="size-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {book.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {book.chapters} chapters
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {book.description}
              </p>

              {/* Progress Bar */}
              {book.progress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{book.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${book.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button asChild className="w-full gap-2" variant="outline">
                <Link href={`/read/${book.slug}`}>
                  {book.progress > 0 ? "Continue Reading" : "Start Reading"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Your Reading Stats</CardTitle>
          <CardDescription>Overall progress across all books</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-xs text-muted-foreground">Books Started</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">21</div>
              <div className="text-xs text-muted-foreground">Chapters Read</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">22%</div>
              <div className="text-xs text-muted-foreground">
                Overall Progress
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
