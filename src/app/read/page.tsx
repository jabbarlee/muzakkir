"use client";

import { useState, useEffect, useMemo } from "react";
import { Menu, BookOpen, ChevronRight, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getChapters, getChapterContent } from "@/actions/documents";
import { processContent } from "@/lib/content-processor";

function ChapterList({
  chapters,
  selectedChapter,
  onSelectChapter,
  onClose,
  isLoading,
}: {
  chapters: string[];
  selectedChapter: string | null;
  onSelectChapter: (chapter: string) => void;
  onClose?: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2 text-sidebar-primary">
          <BookOpen className="size-5" />
          <span className="font-semibold tracking-tight">The Words</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Sözler</p>
      </div>
      <ScrollArea className="flex-1">
        <nav className="p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : chapters.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No chapters found
            </p>
          ) : (
            chapters.map((chapter) => (
              <button
                key={chapter}
                onClick={() => {
                  onSelectChapter(chapter);
                  onClose?.();
                }}
                className={`
                  w-full text-left px-3 py-2.5 rounded-lg text-sm
                  transition-all duration-200 ease-out
                  flex items-center gap-2 group
                  ${
                    selectedChapter === chapter
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }
                `}
              >
                <ChevronRight
                  className={`size-3.5 transition-transform duration-200 flex-shrink-0 ${
                    selectedChapter === chapter
                      ? "text-sidebar-primary"
                      : "text-muted-foreground group-hover:translate-x-0.5"
                  }`}
                />
                <span className="truncate">{chapter}</span>
              </button>
            ))
          )}
        </nav>
      </ScrollArea>
    </div>
  );
}

export default function ReadPage() {
  const [chapters, setChapters] = useState<string[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [rawContent, setRawContent] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoadingChapters, setIsLoadingChapters] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Process content with memoization
  const content = useMemo(() => processContent(rawContent), [rawContent]);

  // Fetch chapters on mount
  useEffect(() => {
    async function fetchChapters() {
      try {
        setIsLoadingChapters(true);
        const chaptersData = await getChapters();
        setChapters(chaptersData);
        // Select first chapter by default
        if (chaptersData.length > 0 && !selectedChapter) {
          setSelectedChapter(chaptersData[0]);
        }
      } catch (error) {
        console.error("Failed to fetch chapters:", error);
      } finally {
        setIsLoadingChapters(false);
      }
    }
    fetchChapters();
  }, []);

  // Fetch content when chapter changes
  useEffect(() => {
    async function fetchContent() {
      if (!selectedChapter) return;

      try {
        setIsLoadingContent(true);
        const contentData = await getChapterContent(selectedChapter);
        setRawContent(contentData);
        // Scroll to top when chapter changes
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error("Failed to fetch content:", error);
        setRawContent("");
      } finally {
        setIsLoadingContent(false);
      }
    }
    fetchContent();
  }, [selectedChapter]);

  const handleSelectChapter = (chapter: string) => {
    setSelectedChapter(chapter);
  };

  const currentIndex = chapters.indexOf(selectedChapter || "");
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < chapters.length - 1;

  const goToPrevious = () => {
    if (hasPrevious) {
      setSelectedChapter(chapters[currentIndex - 1]);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      setSelectedChapter(chapters[currentIndex + 1]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col bg-sidebar border-r border-sidebar-border">
        <ChapterList
          chapters={chapters}
          selectedChapter={selectedChapter}
          onSelectChapter={handleSelectChapter}
          isLoading={isLoadingChapters}
        />
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 h-14 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Open chapter menu"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Chapter Navigation</SheetTitle>
                  </SheetHeader>
                  <ChapterList
                    chapters={chapters}
                    selectedChapter={selectedChapter}
                    onSelectChapter={handleSelectChapter}
                    onClose={() => setMobileMenuOpen(false)}
                    isLoading={isLoadingChapters}
                  />
                </SheetContent>
              </Sheet>

              {/* Title */}
              <h1 className="font-serif text-lg font-semibold tracking-tight text-foreground">
                The Words
              </h1>
            </div>

            {/* Chapter indicator */}
            <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[200px]">
              {selectedChapter}
            </span>
          </div>
        </header>

        {/* Reading Area */}
        <main className="min-h-[calc(100vh-3.5rem)]">
          <div className="bg-paper">
            <article className="max-w-2xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
              {/* Chapter Title */}
              <header className="mb-10 pb-8 border-b border-border/50">
                {selectedChapter && (
                  <>
                    <p className="text-sm uppercase tracking-widest text-primary/70 mb-2">
                      Chapter {currentIndex + 1}
                    </p>
                    <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-paper-foreground leading-tight">
                      {selectedChapter}
                    </h2>
                  </>
                )}
              </header>

              {/* Chapter Content */}
              <div className="chapter-content text-paper-foreground/90">
                {isLoadingContent ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  </div>
                ) : content ? (
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      // Paragraphs
                      p: ({ children }) => (
                        <p className="mb-6 leading-[1.9] text-paper-foreground/90">
                          {children}
                        </p>
                      ),
                      // Headings
                      h1: ({ children }) => (
                        <h1 className="font-serif text-2xl font-semibold mt-10 mb-5 text-paper-foreground">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="font-serif text-xl font-semibold mt-8 mb-4 text-paper-foreground">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="font-serif text-lg font-semibold mt-6 mb-3 text-paper-foreground">
                          {children}
                        </h3>
                      ),
                      // Blockquotes
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-3 border-primary/50 pl-5 my-6 italic text-paper-foreground/85">
                          {children}
                        </blockquote>
                      ),
                      // Strong/Bold
                      strong: ({ children }) => (
                        <strong className="font-semibold text-paper-foreground">
                          {children}
                        </strong>
                      ),
                      // Emphasis
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                      // Lists
                      ul: ({ children }) => (
                        <ul className="my-5 pl-6 space-y-2 list-disc">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="my-5 pl-6 space-y-2 list-decimal">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                      ),
                      // Handle div (for arabic-verse class)
                      div: ({ className, children, ...props }) => {
                        if (className?.includes("arabic-verse")) {
                          return (
                            <div className="arabic-verse" {...props}>
                              {children}
                            </div>
                          );
                        }
                        return (
                          <div className={className} {...props}>
                            {children}
                          </div>
                        );
                      },
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-center text-muted-foreground py-16">
                    Select a chapter to start reading
                  </p>
                )}
              </div>

              {/* Chapter Navigation */}
              {chapters.length > 0 && (
                <footer className="mt-16 pt-8 border-t border-border/50 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={goToPrevious}
                    disabled={!hasPrevious}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ← Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentIndex + 1} / {chapters.length}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={goToNext}
                    disabled={!hasNext}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Next →
                  </Button>
                </footer>
              )}
            </article>
          </div>
        </main>
      </div>
    </div>
  );
}
