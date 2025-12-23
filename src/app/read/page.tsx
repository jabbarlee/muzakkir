"use client";

import { useState } from "react";
import { Menu, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Mock chapters data
const chapters = [
  "The First Word",
  "The Second Word",
  "The Third Word",
  "The Fourth Word",
  "The Fifth Word",
  "The Sixth Word",
  "The Seventh Word",
  "The Eighth Word",
  "The Ninth Word",
  "The Tenth Word",
  "The Eleventh Word",
  "The Twelfth Word",
  "The Thirteenth Word",
  "The Fourteenth Word",
  "The Fifteenth Word",
  "The Sixteenth Word",
  "The Seventeenth Word",
  "The Eighteenth Word",
  "The Nineteenth Word",
  "The Twentieth Word",
  "The Twenty-First Word",
  "The Twenty-Second Word",
  "The Twenty-Third Word",
  "The Twenty-Fourth Word",
  "The Twenty-Fifth Word",
  "The Twenty-Sixth Word",
  "The Twenty-Seventh Word",
  "The Twenty-Eighth Word",
  "The Twenty-Ninth Word",
  "The Thirtieth Word",
  "The Thirty-First Word",
  "The Thirty-Second Word",
  "The Thirty-Third Word",
];

// Sample content for demonstration
const sampleContent = `
In the Name of God, the Merciful, the Compassionate.

"Guide us to the Straight Path." (Quran 1:6)

If you want to understand what great happiness and bounty, what great pleasure and ease is to be found in worship, listen to this short story:

One time, two men went on a journey for both pleasure and business. One set off in a selfish, inauspicious direction; the other on a godly, propitious way.

Since the selfish man was both conceited and pessimistic, he ended up in what seemed to him to be a most wicked country due to his pessimism. He looked around and everywhere saw the powerless and the unfortunate lamenting in the grasp and at the hands of fearsome bullying tyrants, weeping at their pitiful plights. He saw the same grievous, distressing situation in all the places he travelled.

The whole country took on the form of a house of mourning. Apart from becoming drunk, he could find no way of not noticing this painful, grievous situation. For everyone seemed to him to be an enemy and stranger. And all around he saw horrible corpses and despairing, weeping orphans. His conscience was continually in a state of torment.

The other man was godly, devout, and fair-minded, so he went in a sacred direction. This fine man found things to be very good in every place he came to. Everywhere in this beautiful country he saw a joyful festival, a place of remembrance of God full of rapture and happiness, with everyone loudly invoking God's name and blessings, and a series of celebrations for discharge from the army.
`;

function ChapterList({
  selectedChapter,
  onSelectChapter,
  onClose,
}: {
  selectedChapter: number;
  onSelectChapter: (index: number) => void;
  onClose?: () => void;
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
          {chapters.map((chapter, index) => (
            <button
              key={index}
              onClick={() => {
                onSelectChapter(index);
                onClose?.();
              }}
              className={`
                w-full text-left px-3 py-2.5 rounded-lg text-sm
                transition-all duration-200 ease-out
                flex items-center gap-2 group
                ${
                  selectedChapter === index
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }
              `}
            >
              <ChevronRight
                className={`size-3.5 transition-transform duration-200 ${
                  selectedChapter === index
                    ? "text-sidebar-primary"
                    : "text-muted-foreground group-hover:translate-x-0.5"
                }`}
              />
              <span className="truncate">{chapter}</span>
            </button>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

export default function ReadPage() {
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col bg-sidebar border-r border-sidebar-border">
        <ChapterList
          selectedChapter={selectedChapter}
          onSelectChapter={setSelectedChapter}
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
                    selectedChapter={selectedChapter}
                    onSelectChapter={setSelectedChapter}
                    onClose={() => setMobileMenuOpen(false)}
                  />
                </SheetContent>
              </Sheet>

              {/* Title */}
              <h1 className="font-serif text-lg font-semibold tracking-tight text-foreground">
                The Words
              </h1>
            </div>

            {/* Chapter indicator */}
            <span className="text-sm text-muted-foreground hidden sm:block">
              {chapters[selectedChapter]}
            </span>
          </div>
        </header>

        {/* Reading Area */}
        <main className="min-h-[calc(100vh-3.5rem)]">
          <div className="bg-paper">
            <article className="max-w-2xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
              {/* Chapter Title */}
              <header className="mb-10 pb-8 border-b border-border/50">
                <p className="text-sm uppercase tracking-widest text-primary/70 mb-2">
                  Chapter {selectedChapter + 1}
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-paper-foreground leading-tight">
                  {chapters[selectedChapter]}
                </h2>
              </header>

              {/* Chapter Content */}
              <div className="prose-book text-paper-foreground/90">
                {sampleContent.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {/* Chapter Navigation */}
              <footer className="mt-16 pt-8 border-t border-border/50 flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() =>
                    setSelectedChapter(Math.max(0, selectedChapter - 1))
                  }
                  disabled={selectedChapter === 0}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ← Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedChapter + 1} / {chapters.length}
                </span>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setSelectedChapter(
                      Math.min(chapters.length - 1, selectedChapter + 1)
                    )
                  }
                  disabled={selectedChapter === chapters.length - 1}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Next →
                </Button>
              </footer>
            </article>
          </div>
        </main>
      </div>
    </div>
  );
}

