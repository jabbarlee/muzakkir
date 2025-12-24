"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Sparkles, MessageCircle, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Message, ChatResponse } from "@/lib/types/chat";

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentChapter: string | null;
}

// Generate unique ID for messages
function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Welcome message
const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Merhaba! I'm Muzakir, your Risale-i Nur assistant. I can help you understand concepts, explain passages, and answer questions about the text. What would you like to know?",
  timestamp: new Date(),
};

// Suggested questions
const SUGGESTED_QUESTIONS = [
  "What is the main idea of this chapter?",
  "Can you explain the parable in this section?",
  "Summarize the key concepts for me",
];

// Sources display component
function SourcesCard({ sources }: { sources: string[] }) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-2 p-2.5 rounded-lg bg-accent/30 border border-border/50">
      <div className="flex items-center gap-1.5 mb-1.5">
        <BookOpen className="size-3 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">
          Sources Used
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((source, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-background/80 text-foreground/80 border border-border/50"
          >
            {source}
          </span>
        ))}
      </div>
    </div>
  );
}

// Loading skeleton for AI response
function ThinkingSkeleton() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 bg-muted">
        <div className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Thinking...</span>
        </div>
      </div>
    </div>
  );
}

// Message bubble component
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[85%]">
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-muted-foreground rounded-bl-md"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        {!isUser && message.sources && message.sources.length > 0 && (
          <SourcesCard sources={message.sources} />
        )}
      </div>
    </div>
  );
}

// Shared chat logic hook
function useChat(currentChapter: string | null) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Send message to API
  const sendMessage = useCallback(
    async (question: string) => {
      if (!question.trim() || isLoading) return;

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: question.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.trim(),
            currentChapter,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to get response");
        }

        const data: ChatResponse = await response.json();

        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: data.response,
          sources: data.sources,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        console.error("Chat error:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );

        // Add error message to chat
        const errorMessage: Message = {
          id: generateId(),
          role: "assistant",
          content:
            "I apologize, but I encountered an error processing your question. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentChapter, isLoading]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      sendMessage(input);
    },
    [input, sendMessage]
  );

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // Handle suggested question click
  const handleSuggestedQuestion = useCallback(
    (question: string) => {
      sendMessage(question);
    },
    [sendMessage]
  );

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    messagesEndRef,
    handleSubmit,
    handleKeyDown,
    handleSuggestedQuestion,
  };
}

// Desktop AI Chat Panel
export function AIChatPanel({
  isOpen,
  onClose,
  currentChapter,
}: AIChatPanelProps) {
  const {
    messages,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    handleSubmit,
    handleKeyDown,
    handleSuggestedQuestion,
  } = useChat(currentChapter);

  // Only show suggested questions if there's only the welcome message
  const showSuggestions = messages.length === 1;

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-card border-l border-border flex flex-col transform transition-transform duration-300 ease-out shadow-xl ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="size-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-card-foreground">
              Muzakir
            </h2>
            <p className="text-xs text-muted-foreground">
              Your Risale-i Nur assistant
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
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && <ThinkingSkeleton />}

        {/* Suggested Questions */}
        {showSuggestions && !isLoading && (
          <div className="pt-4">
            <p className="text-xs text-muted-foreground mb-3">
              Suggested questions:
            </p>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm bg-accent/50 hover:bg-accent text-accent-foreground transition-colors duration-200 border border-border/50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-border bg-card flex-shrink-0"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this chapter..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 disabled:opacity-50"
          />
          <Button
            type="submit"
            size="icon"
            className="size-10 rounded-xl shrink-0"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Answers are grounded in the Risale-i Nur text
        </p>
      </form>
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
  const {
    messages,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    handleSubmit,
    handleKeyDown,
    handleSuggestedQuestion,
  } = useChat(currentChapter);

  // Only show suggested questions if there's only the welcome message
  const showSuggestions = messages.length === 1;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-96 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Muzakir AI Assistant</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Muzakir</h2>
              <p className="text-xs text-muted-foreground">
                Your Risale-i Nur assistant
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
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isLoading && <ThinkingSkeleton />}

            {/* Suggested Questions */}
            {showSuggestions && !isLoading && (
              <div className="pt-4">
                <p className="text-xs text-muted-foreground mb-3">
                  Suggested questions:
                </p>
                <div className="space-y-2">
                  {SUGGESTED_QUESTIONS.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm bg-accent/50 hover:bg-accent text-accent-foreground transition-colors duration-200 border border-border/50"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-border"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                className="size-10 rounded-xl"
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
          </form>
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
      <span>Muzakir</span>
    </Button>
  );
}
