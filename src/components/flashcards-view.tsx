"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Flashcard as Card } from "@/lib/schemas";
import { Flashcard } from "./flashcard";

type Props = {
  cards: Card[];
};

export function FlashcardsView({ cards }: Props) {
  const [i, setI] = useState(0);
  const last = cards.length - 1;
  const safeI = Math.max(0, Math.min(i, last));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't hijack arrows while typing somewhere or holding modifiers.
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setI((n) => Math.min(n + 1, last));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setI((n) => Math.max(n - 1, 0));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [last]);

  if (cards.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-border bg-card p-12 text-center">
        <div className="mb-2 text-4xl" aria-hidden>
          🤔
        </div>
        <p className="text-base font-bold">
          No flashcards came back. Try a longer recording?
        </p>
      </div>
    );
  }

  const card = cards[safeI];
  if (!card) return null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={safeI}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            <Flashcard card={card} index={safeI} total={cards.length} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex w-full max-w-xl items-center justify-between gap-3">
        <NavButton
          onClick={() => setI((n) => Math.max(n - 1, 0))}
          disabled={safeI === 0}
          aria-label="Previous flashcard"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="hidden sm:inline">Prev</span>
        </NavButton>

        <span className="font-mono text-sm font-bold tabular-nums text-muted-foreground">
          {safeI + 1} / {cards.length}
        </span>

        <NavButton
          onClick={() => setI((n) => Math.min(n + 1, last))}
          disabled={safeI === last}
          aria-label="Next flashcard"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-5 w-5" />
        </NavButton>
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: tap the card to flip. Use ← → to move between cards.
      </p>
    </div>
  );
}

function NavButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      type="button"
      className="inline-flex items-center gap-1 rounded-full border-2 border-border bg-background px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
