"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Menu, Loader2 } from "lucide-react";
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
import { ChapterList } from "@/components/chapter-list";
import { SelectionPopup } from "@/components/selection-popup";
import { DictionaryPopover } from "@/components/dictionary-popover";
import { processContent } from "@/lib/content-processor";
import { Book, Chapter } from "@/lib/types/chat";

interface ReaderClientProps {
  book: Book;
  chapter: Chapter;
  chapters: Chapter[];
  content: string;
  nextChapterId: number | null;
  prevChapterId: number | null;
}

export function ReaderClient({
  book,
  chapter,
  chapters,
  content: rawContent,
  nextChapterId,
  prevChapterId,
}: ReaderClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // AI Chat panel state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // Text selection state (for longer selections - AI chat)
  const [selectionPopup, setSelectionPopup] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
  } | null>(null);

  // Dictionary popup state (for word lookups)
  const [dictionaryPopup, setDictionaryPopup] = useState<{
    word: string;
    x: number;
    y: number;
  } | null>(null);

  // Reference text to send to chat
  const [referenceText, setReferenceText] = useState<string | null>(null);

  // Process content with memoization
  const content = useMemo(() => processContent(rawContent), [rawContent]);

  /**
   * Count words in a text string
   */
  const countWords = useCallback((text: string): number => {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }, []);

  /**
   * Handle text selection - distinguishes between:
   * - Word selection (1-2 words): Show dictionary popup
   * - Longer selection (>10 chars, >2 words): Show "Ask about this" popup
   */
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (!text) {
      setSelectionPopup(null);
      return;
    }

    const wordCount = countWords(text);
    const range = selection?.getRangeAt(0);
    const rect = range?.getBoundingClientRect();

    if (!rect) {
      setSelectionPopup(null);
      return;
    }

    // Word selection (1-2 words): Show dictionary popup
    if (wordCount <= 2 && text.length >= 2 && text.length <= 50) {
      // Extract the first word for dictionary lookup
      const firstWord = text.split(/\s+/)[0];
      if (firstWord && firstWord.length >= 2) {
        setDictionaryPopup({
          word: firstWord,
          x: rect.left + rect.width / 2,
          y: rect.bottom,
        });
        setSelectionPopup(null);
        return;
      }
    }

    // Longer selection (>10 chars and >2 words): Show "Ask about this" popup
    if (text.length > 10 && text.length < 1000 && wordCount > 2) {
      setSelectionPopup({
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        text,
      });
      setDictionaryPopup(null);
    } else {
      setSelectionPopup(null);
    }
  }, [countWords]);

  /**
   * Handle double-click on a word for dictionary lookup
   */
  const handleDoubleClick = useCallback((e: MouseEvent) => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length >= 2 && countWords(text) <= 2) {
      // Close any existing popups
      setSelectionPopup(null);

      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();

      if (rect) {
        const firstWord = text.split(/\s+/)[0];
        setDictionaryPopup({
          word: firstWord,
          x: rect.left + rect.width / 2,
          y: rect.bottom,
        });
      }
    }
  }, [countWords]);

  // Handle asking about selected text
  const handleAskAboutSelection = useCallback(() => {
    if (selectionPopup?.text) {
      setReferenceText(selectionPopup.text);
      setSelectionPopup(null);

      // Open chat panel
      if (window.innerWidth >= 1024) {
        setIsChatOpen(true);
      } else {
        setIsMobileChatOpen(true);
      }

      // Clear the browser selection
      window.getSelection()?.removeAllRanges();
    }
  }, [selectionPopup]);

  // Clear reference after it's been used
  const clearReference = useCallback(() => {
    setReferenceText(null);
  }, []);

  // Add mouseup listener for text selection
  useEffect(() => {
    const handleMouseUp = () => {
      // Small delay to ensure selection is complete
      setTimeout(handleTextSelection, 10);
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [handleTextSelection]);

  // Add double-click listener for word lookup
  useEffect(() => {
    const dblClickHandler = (e: MouseEvent) => {
      // Small delay to ensure selection is complete
      setTimeout(() => handleDoubleClick(e), 10);
    };

    document.addEventListener("dblclick", dblClickHandler);
    return () => document.removeEventListener("dblclick", dblClickHandler);
  }, [handleDoubleClick]);

  // Scroll to top when chapter changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [chapter.id]);

  // Find current chapter index for display
  const currentIndex = chapters.findIndex((c) => c.id === chapter.id);
  const totalChapters = chapters.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Selection Popup (for longer selections - AI chat) */}
      {selectionPopup?.visible && (
        <SelectionPopup
          position={{ x: selectionPopup.x, y: selectionPopup.y }}
          onAskAbout={handleAskAboutSelection}
          onClose={() => setSelectionPopup(null)}
        />
      )}

      {/* Dictionary Popover (for word lookups) */}
      {dictionaryPopup && (
        <DictionaryPopover
          word={dictionaryPopup.word}
          position={{ x: dictionaryPopup.x, y: dictionaryPopup.y }}
          onClose={() => setDictionaryPopup(null)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col bg-sidebar border-r border-sidebar-border overflow-hidden">
        <ChapterList
          chapters={chapters}
          selectedChapterId={chapter.id}
          bookSlug={book.slug}
          bookTitle={book.title}
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
                    selectedChapterId={chapter.id}
                    bookSlug={book.slug}
                    bookTitle={book.title}
                    onClose={() => setMobileMenuOpen(false)}
                  />
                </SheetContent>
              </Sheet>

              {/* Title */}
              <h1 className="font-serif text-lg font-semibold tracking-tight text-foreground whitespace-nowrap">
                {book.title}
              </h1>
            </div>

            {/* Center: Chapter indicator */}
            <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[300px] text-center flex-1 px-4">
              {chapter.title}
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
                <p className="text-sm uppercase tracking-widest text-primary/70 mb-2">
                  Chapter {chapter.chapter_number}
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-paper-foreground leading-tight">
                  {chapter.title}
                </h2>
              </header>

              {/* Chapter Content */}
              <div className="chapter-content text-paper-foreground/90">
                {content ? (
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
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Chapter Navigation */}
              {totalChapters > 0 && (
                <footer className="mt-16 pt-8 border-t border-border/50 flex items-center justify-between">
                  {prevChapterId ? (
                    <Button
                      variant="ghost"
                      asChild
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Link href={`/read/${book.slug}/${prevChapterId}`}>
                        ← Previous
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      disabled
                      className="text-muted-foreground"
                    >
                      ← Previous
                    </Button>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {currentIndex + 1} / {totalChapters}
                  </span>
                  {nextChapterId ? (
                    <Button
                      variant="ghost"
                      asChild
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Link href={`/read/${book.slug}/${nextChapterId}`}>
                        Next →
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      disabled
                      className="text-muted-foreground"
                    >
                      Next →
                    </Button>
                  )}
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
          currentChapter={chapter.title}
          referenceText={referenceText}
          onReferenceClear={clearReference}
        />
      </div>

      {/* AI Chat Sheet - Mobile */}
      <MobileAIChatSheet
        isOpen={isMobileChatOpen}
        onOpenChange={setIsMobileChatOpen}
        currentChapter={chapter.title}
        referenceText={referenceText}
        onReferenceClear={clearReference}
      />
    </div>
  );
}

