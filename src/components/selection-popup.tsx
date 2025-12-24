"use client";

import { useEffect } from "react";
import { MessageSquareQuote } from "lucide-react";

interface SelectionPopupProps {
  position: { x: number; y: number };
  onAskAbout: () => void;
  onClose: () => void;
}

export function SelectionPopup({
  position,
  onAskAbout,
  onClose,
}: SelectionPopupProps) {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".selection-popup")) {
        onClose();
      }
    };

    // Delay adding the listener to avoid immediate close
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  return (
    <div
      className="selection-popup fixed z-50 animate-in fade-in-0 zoom-in-95 duration-150"
      style={{
        left: position.x,
        top: position.y,
        transform: "translateX(-50%)",
      }}
    >
      <button
        onClick={onAskAbout}
        className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 transition-colors text-sm font-medium"
      >
        <MessageSquareQuote className="size-4" />
        <span>Ask about this</span>
      </button>
    </div>
  );
}

