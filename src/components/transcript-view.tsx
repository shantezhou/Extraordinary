"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  transcript: string;
  defaultOpen?: boolean;
};

export function TranscriptView({ transcript, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const wordCount = transcript.trim().length
    ? transcript.trim().split(/\s+/).length
    : 0;

  return (
    <div className="overflow-hidden rounded-3xl border-2 border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50"
      >
        <span className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            📄
          </span>
          <span className="flex flex-col">
            <span className="text-base font-bold text-foreground">
              Raw transcript
            </span>
            <span className="text-xs text-muted-foreground">
              {wordCount} {wordCount === 1 ? "word" : "words"} · for
              parents and teachers
            </span>
          </span>
        </span>
        <ChevronDown
          aria-hidden
          className={cn("h-5 w-5 transition-transform", open && "rotate-180")}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="max-h-80 overflow-y-auto whitespace-pre-wrap px-5 pb-5 text-sm leading-relaxed text-foreground">
              {transcript}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
