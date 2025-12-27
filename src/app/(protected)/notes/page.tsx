"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookMarked,
  Search,
  Plus,
  Calendar,
  BookOpen,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const notes = [
    {
      id: 1,
      title: "The Purpose of Creation",
      content:
        "The primary purpose of creation is to recognize and worship the Creator. This chapter beautifully explains how every element in the universe points to divine wisdom...",
      book: "The Words",
      chapter: "The First Word",
      date: "2 days ago",
      tags: ["creation", "purpose", "faith"],
    },
    {
      id: 2,
      title: "Reflection on Divine Names",
      content:
        "Each of the divine names manifests itself in creation. The name Al-Rahman is evident in every blessing, Al-Hakim in every order and system...",
      book: "The Words",
      chapter: "The Thirtieth Word",
      date: "5 days ago",
      tags: ["divine-names", "reflection"],
    },
    {
      id: 3,
      title: "Understanding Destiny",
      content:
        "Destiny is like a divine program that encompasses all of creation. It doesn't contradict free will but rather provides a framework within which...",
      book: "The Letters",
      chapter: "The Twenty-Sixth Letter",
      date: "1 week ago",
      tags: ["destiny", "free-will", "philosophy"],
    },
    {
      id: 4,
      title: "The Miracle of the Quran",
      content:
        "The Quran's miraculousness has forty aspects. Its eloquence, its prophecies, its scientific accuracy, and its ability to remain relevant...",
      book: "The Words",
      chapter: "The Twenty-Fifth Word",
      date: "2 weeks ago",
      tags: ["quran", "miracles", "revelation"],
    },
  ];

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Notes</h1>
          <p className="text-muted-foreground mt-2">
            Your insights and reflections
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="size-4" />
          New Note
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <BookMarked className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books</CardTitle>
            <BookOpen className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags Used</CardTitle>
            <BookMarked className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookMarked className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No notes found. Start by creating your first note!
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <span className="text-xs">
                        {note.book} • {note.chapter}
                      </span>
                      <span className="text-xs">•</span>
                      <span className="text-xs">{note.date}</span>
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {note.content}
                </p>
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
