"use client";

import { useState, useEffect, useMemo } from "react";
import { Menu, BookOpen, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AIChatPanel,
  MobileAIChatSheet,
  AIChatToggleButton,
} from "@/components/ai-chat-panel";
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
      <div className="px-4 border-b border-sidebar-border flex-shrink-0 h-14 flex items-center">
        <div className="flex items-center gap-2 text-sidebar-primary">
          <BookOpen className="size-5" />
          <span className="font-semibold tracking-tight">Muzakkir</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
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
                  ${
                    selectedChapter === chapter
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }
                `}
              >
                <span className="block truncate">{chapter}</span>
              </button>
            ))
          )}
        </nav>
      </div>
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

  // AI Chat panel state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

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
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col bg-sidebar border-r border-sidebar-border overflow-hidden">
        <ChapterList
          chapters={chapters}
          selectedChapter={selectedChapter}
          onSelectChapter={handleSelectChapter}
          isLoading={isLoadingChapters}
        />
      </aside>

      {/* Main Content Area */}
      <div
        className={`lg:pl-64 transition-all duration-300 ${
          isChatOpen ? "lg:pr-96" : ""
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 h-14 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 h-full">
            {/* Left: Mobile Menu + Title */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden flex-shrink-0"
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
              <h1 className="font-serif text-lg font-semibold tracking-tight text-foreground whitespace-nowrap">
                Sözler
              </h1>
            </div>

            {/* Center: Chapter indicator */}
            <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[300px] text-center flex-1 px-4">
              {selectedChapter}
            </span>

            {/* Right: AI Chat Toggle Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* AI Chat Toggle Button - Desktop */}
              <AIChatToggleButton
                isOpen={isChatOpen}
                onClick={() => setIsChatOpen(!isChatOpen)}
              />

              {/* AI Chat Toggle Button - Mobile */}
              <AIChatToggleButton
                isMobile
                onClick={() => setIsMobileChatOpen(true)}
              />
            </div>
          </div>
        </header>

        {/* Reading Area */}
        <main className="min-h-[calc(100vh-3.5rem)]">
          <div className="bg-paper">
            <article className="max-w-3xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
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
                        <p className="mb-6 text-[1.15rem] leading-[1.95] text-paper-foreground/90">
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

      {/* AI Chat Panel - Desktop */}
      <div className="hidden lg:block">
        <AIChatPanel
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          currentChapter={selectedChapter}
        />
      </div>

      {/* AI Chat Sheet - Mobile */}
      <MobileAIChatSheet
        isOpen={isMobileChatOpen}
        onOpenChange={setIsMobileChatOpen}
        currentChapter={selectedChapter}
      />
    </div>
  );
}
