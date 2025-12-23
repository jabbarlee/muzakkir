"use client";

import { useState } from "react";
import { X, Send, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentChapter: string | null;
}

// Desktop AI Chat Panel
export function AIChatPanel({
  isOpen,
  onClose,
  currentChapter,
}: AIChatPanelProps) {
  const [message, setMessage] = useState("");

  // Sample messages for UI demonstration
  const sampleMessages = [
    {
      role: "assistant",
      content:
        "Hello! I'm your Risale-i Nur assistant. Feel free to ask me questions about this chapter or request explanations of any concepts you'd like to understand better.",
    },
  ];

  const suggestedQuestions = [
    "What is the main idea of this chapter?",
    "Can you explain the parable in this section?",
    "Summarize the key concepts for me",
  ];

  return (
    <div
      className={`
        fixed inset-y-0 right-0 z-50
        w-full sm:w-96 
        bg-card border-l border-border
        flex flex-col
        transform transition-transform duration-300 ease-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        shadow-xl
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="size-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-card-foreground">
              AI Assistant
            </h2>
            <p className="text-xs text-muted-foreground">
              Ask questions about the text
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="size-8 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Current Chapter Context */}
      {currentChapter && (
        <div className="px-4 py-2 bg-accent/30 border-b border-border flex-shrink-0">
          <p className="text-xs text-muted-foreground">Reading context:</p>
          <p className="text-sm font-medium text-accent-foreground truncate">
            {currentChapter}
          </p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sampleMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`
                max-w-[85%] rounded-2xl px-4 py-3
                ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-muted-foreground rounded-bl-md"
                }
              `}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Suggested Questions */}
        <div className="pt-4">
          <p className="text-xs text-muted-foreground mb-3">
            Suggested questions:
          </p>
          <div className="space-y-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setMessage(question)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm
                  bg-accent/50 hover:bg-accent text-accent-foreground
                  transition-colors duration-200 border border-border/50"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question about this chapter..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background
              text-sm text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
              transition-all duration-200"
          />
          <Button
            size="icon"
            className="size-10 rounded-xl shrink-0"
            disabled={!message.trim()}
          >
            <Send className="size-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}

interface MobileAIChatSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentChapter: string | null;
}

// Mobile AI Chat Sheet
export function MobileAIChatSheet({
  isOpen,
  onOpenChange,
  currentChapter,
}: MobileAIChatSheetProps) {
  const [message, setMessage] = useState("");

  const suggestedQuestions = [
    "What is the main idea of this chapter?",
    "Can you explain the parable in this section?",
    "Summarize the key concepts for me",
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-96 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>AI Assistant</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">AI Assistant</h2>
              <p className="text-xs text-muted-foreground">
                Ask questions about the text
              </p>
            </div>
          </div>

          {/* Current Chapter Context */}
          {currentChapter && (
            <div className="px-4 py-2 bg-accent/30 border-b border-border">
              <p className="text-xs text-muted-foreground">Reading context:</p>
              <p className="text-sm font-medium truncate">{currentChapter}</p>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 bg-muted">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Hello! I'm your Risale-i Nur assistant. Feel free to ask me
                  questions about this chapter or request explanations of any
                  concepts you'd like to understand better.
                </p>
              </div>
            </div>

            {/* Suggested Questions */}
            <div className="pt-4">
              <p className="text-xs text-muted-foreground mb-3">
                Suggested questions:
              </p>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(question)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm
                      bg-accent/50 hover:bg-accent text-accent-foreground
                      transition-colors duration-200 border border-border/50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background
                  text-sm placeholder:text-muted-foreground
                  focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                size="icon"
                className="size-10 rounded-xl"
                disabled={!message.trim()}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Export the toggle button for use in the header
export function AIChatToggleButton({
  isOpen,
  onClick,
  isMobile = false,
}: {
  isOpen?: boolean;
  onClick: () => void;
  isMobile?: boolean;
}) {
  if (isMobile) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={onClick}
        className="lg:hidden"
        aria-label="Open AI assistant"
      >
        <MessageCircle className="size-5" />
      </Button>
    );
  }

  return (
    <Button
      variant={isOpen ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className="hidden lg:flex items-center gap-2"
    >
      <MessageCircle className="size-4" />
      <span>AI Assistant</span>
    </Button>
  );
}

