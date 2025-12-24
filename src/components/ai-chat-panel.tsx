"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Sparkles, MessageCircle, Loader2, BookOpen, Languages, Quote } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Message, ChatResponse } from "@/lib/types/chat";

// Language type
type Language = "en" | "tr";

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentChapter: string | null;
  referenceText?: string | null;
  onReferenceClear?: () => void;
}

interface MobileAIChatSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentChapter: string | null;
  referenceText?: string | null;
  onReferenceClear?: () => void;
}

// Generate unique ID for messages
function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Welcome messages by language
const WELCOME_MESSAGES: Record<Language, Message> = {
  en: {
    id: "welcome",
    role: "assistant",
    content:
      "Hello! I'm your Risale-i Nur assistant. I can help you understand concepts, explain passages, and answer questions about the text. What would you like to know?",
    timestamp: new Date(),
  },
  tr: {
    id: "welcome",
    role: "assistant",
    content:
      "Merhaba! Ben Risale-i Nur asistanınızım. Kavramları anlamanıza, bölümleri açıklamanıza ve metin hakkındaki sorularınızı cevaplamama yardımcı olabilirim. Ne öğrenmek istersiniz?",
    timestamp: new Date(),
  },
};

// Suggested questions by language
const SUGGESTED_QUESTIONS: Record<Language, string[]> = {
  en: [
    "What is the main idea of this chapter?",
    "Can you explain the parable in this section?",
    "Summarize the key concepts for me",
  ],
  tr: [
    "Bu bölümün ana fikri nedir?",
    "Bu kısımdaki temsili açıklar mısın?",
    "Temel kavramları özetler misin?",
  ],
};

// UI text by language
const UI_TEXT: Record<Language, {
  sourcesUsed: string;
  thinking: string;
  suggestedQuestions: string;
  placeholder: string;
  placeholderWithRef: string;
  grounded: string;
  readingContext: string;
  assistant: string;
  selectedText: string;
  askAboutThis: string;
}> = {
  en: {
    sourcesUsed: "Sources Used",
    thinking: "Thinking...",
    suggestedQuestions: "Suggested questions:",
    placeholder: "Ask a question about this chapter...",
    placeholderWithRef: "Ask about the selected text...",
    grounded: "Answers are grounded in the Risale-i Nur text",
    readingContext: "Reading context:",
    assistant: "Your Risale-i Nur assistant",
    selectedText: "Selected text:",
    askAboutThis: "Explain this passage",
  },
  tr: {
    sourcesUsed: "Kullanılan Kaynaklar",
    thinking: "Düşünüyor...",
    suggestedQuestions: "Önerilen sorular:",
    placeholder: "Bu bölüm hakkında bir soru sorun...",
    placeholderWithRef: "Seçili metin hakkında sorun...",
    grounded: "Cevaplar Risale-i Nur metnine dayalıdır",
    readingContext: "Okuma bağlamı:",
    assistant: "Risale-i Nur asistanınız",
    selectedText: "Seçili metin:",
    askAboutThis: "Bu pasajı açıkla",
  },
};

// Language toggle component
function LanguageToggle({
  language,
  onToggle,
}: {
  language: Language;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-accent/50 hover:bg-accent text-accent-foreground transition-colors border border-border/50"
      title="Toggle language"
    >
      <Languages className="size-3" />
      <span>{language.toUpperCase()}</span>
    </button>
  );
}

// Reference text display component
function ReferenceCard({
  text,
  onClear,
  onAsk,
  language,
}: {
  text: string;
  onClear: () => void;
  onAsk: () => void;
  language: Language;
}) {
  const truncatedText = text.length > 150 ? text.substring(0, 150) + "..." : text;

  return (
    <div className="mx-4 mb-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Quote className="size-3 text-primary" />
          <span className="text-xs font-medium text-primary">
            {UI_TEXT[language].selectedText}
          </span>
        </div>
        <button
          onClick={onClear}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground italic leading-relaxed mb-2">
        "{truncatedText}"
      </p>
      <button
        onClick={onAsk}
        className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
      >
        {UI_TEXT[language].askAboutThis} →
      </button>
    </div>
  );
}

// Sources display component
function SourcesCard({ sources, language }: { sources: string[]; language: Language }) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-2 p-2.5 rounded-lg bg-accent/30 border border-border/50">
      <div className="flex items-center gap-1.5 mb-1.5">
        <BookOpen className="size-3 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">
          {UI_TEXT[language].sourcesUsed}
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
function ThinkingSkeleton({ language }: { language: Language }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 bg-muted">
        <div className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{UI_TEXT[language].thinking}</span>
        </div>
      </div>
    </div>
  );
}

// Message bubble component with markdown support
function MessageBubble({ message, language }: { message: Message; language: Language }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[85%]">
        {/* Show reference if present in user message */}
        {isUser && message.reference && (
          <div className="mb-1 p-2 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-primary/80 italic line-clamp-2">
              "{message.reference}"
            </p>
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-muted-foreground rounded-bl-md"
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div className="text-sm leading-relaxed prose-chat">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0">{children}</h3>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary/50 pl-3 italic my-2">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-background/50 px-1 py-0.5 rounded text-xs">
                      {children}
                    </code>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && message.sources && message.sources.length > 0 && (
          <SourcesCard sources={message.sources} language={language} />
        )}
      </div>
    </div>
  );
}

// Shared chat logic hook
function useChat(
  currentChapter: string | null,
  language: Language,
  referenceText: string | null,
  onReferenceClear?: () => void
) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGES[language]]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update welcome message when language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === "welcome") {
        return [WELCOME_MESSAGES[language]];
      }
      return prev;
    });
  }, [language]);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Send message to API
  const sendMessage = useCallback(
    async (question: string, reference?: string) => {
      if (!question.trim() || isLoading) return;

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: question.trim(),
        reference: reference,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
      setError(null);

      // Clear the reference after sending
      if (reference && onReferenceClear) {
        onReferenceClear();
      }

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.trim(),
            currentChapter,
            language,
            referenceText: reference,
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

        const errorMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: language === "tr" 
            ? "Özür dilerim, sorunuzu işlerken bir hata oluştu. Lütfen tekrar deneyin."
            : "I apologize, but I encountered an error processing your question. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentChapter, isLoading, language, onReferenceClear]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      sendMessage(input, referenceText || undefined);
    },
    [input, sendMessage, referenceText]
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

  // Handle asking about reference
  const handleAskAboutReference = useCallback(() => {
    if (referenceText) {
      const question = language === "tr" 
        ? "Bu pasajı açıklar mısın?"
        : "Can you explain this passage?";
      sendMessage(question, referenceText);
    }
  }, [referenceText, language, sendMessage]);

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
    handleAskAboutReference,
    sendMessage,
  };
}

// Desktop AI Chat Panel
export function AIChatPanel({
  isOpen,
  onClose,
  currentChapter,
  referenceText,
  onReferenceClear,
}: AIChatPanelProps) {
  const [language, setLanguage] = useState<Language>("tr");
  
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "tr" : "en"));
  };

  const {
    messages,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    handleSubmit,
    handleKeyDown,
    handleSuggestedQuestion,
    handleAskAboutReference,
  } = useChat(currentChapter, language, referenceText || null, onReferenceClear);

  const showSuggestions = messages.length === 1 && !referenceText;

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
              Assistant
            </h2>
            <p className="text-xs text-muted-foreground">
              {UI_TEXT[language].assistant}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle language={language} onToggle={toggleLanguage} />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Current Chapter Context */}
      {currentChapter && (
        <div className="px-4 py-2 bg-accent/30 border-b border-border flex-shrink-0">
          <p className="text-xs text-muted-foreground">{UI_TEXT[language].readingContext}</p>
          <p className="text-sm font-medium text-accent-foreground truncate">
            {currentChapter}
          </p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} language={language} />
        ))}

        {isLoading && <ThinkingSkeleton language={language} />}

        {/* Suggested Questions */}
        {showSuggestions && !isLoading && (
          <div className="pt-4">
            <p className="text-xs text-muted-foreground mb-3">
              {UI_TEXT[language].suggestedQuestions}
            </p>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS[language].map((question, index) => (
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

      {/* Reference Text Card */}
      {referenceText && onReferenceClear && (
        <ReferenceCard
          text={referenceText}
          onClear={onReferenceClear}
          onAsk={handleAskAboutReference}
          language={language}
        />
      )}

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
            placeholder={referenceText ? UI_TEXT[language].placeholderWithRef : UI_TEXT[language].placeholder}
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
          {UI_TEXT[language].grounded}
        </p>
      </form>
    </div>
  );
}

// Mobile AI Chat Sheet
export function MobileAIChatSheet({
  isOpen,
  onOpenChange,
  currentChapter,
  referenceText,
  onReferenceClear,
}: MobileAIChatSheetProps) {
  const [language, setLanguage] = useState<Language>("tr");
  
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "tr" : "en"));
  };

  const {
    messages,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    handleSubmit,
    handleKeyDown,
    handleSuggestedQuestion,
    handleAskAboutReference,
  } = useChat(currentChapter, language, referenceText || null, onReferenceClear);

  const showSuggestions = messages.length === 1 && !referenceText;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-96 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>AI Assistant</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sparkles className="size-4 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Assistant</h2>
                <p className="text-xs text-muted-foreground">
                  {UI_TEXT[language].assistant}
                </p>
              </div>
            </div>
            <LanguageToggle language={language} onToggle={toggleLanguage} />
          </div>

          {/* Current Chapter Context */}
          {currentChapter && (
            <div className="px-4 py-2 bg-accent/30 border-b border-border">
              <p className="text-xs text-muted-foreground">{UI_TEXT[language].readingContext}</p>
              <p className="text-sm font-medium truncate">{currentChapter}</p>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} language={language} />
            ))}

            {isLoading && <ThinkingSkeleton language={language} />}

            {/* Suggested Questions */}
            {showSuggestions && !isLoading && (
              <div className="pt-4">
                <p className="text-xs text-muted-foreground mb-3">
                  {UI_TEXT[language].suggestedQuestions}
                </p>
                <div className="space-y-2">
                  {SUGGESTED_QUESTIONS[language].map((question, index) => (
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

          {/* Reference Text Card */}
          {referenceText && onReferenceClear && (
            <ReferenceCard
              text={referenceText}
              onClear={onReferenceClear}
              onAsk={handleAskAboutReference}
              language={language}
            />
          )}

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
                placeholder={referenceText ? UI_TEXT[language].placeholderWithRef : UI_TEXT[language].placeholder}
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
      <span>Assistant</span>
    </Button>
  );
}
