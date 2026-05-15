"use client";

import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import type { NoteCard as Note } from "@/lib/schemas";
import { useSpeechFor } from "./speech-provider";
import { cn } from "@/lib/utils";

type Props = {
  note: Note;
  index: number;
};

export function NoteCard({ note, index }: Props) {
  const { supported, speaking, toggle } = useSpeechFor(`note-${index}`);

  const handleActivate = () => {
    if (supported) toggle(note.text);
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={
        speaking
          ? "Stop reading this card"
          : `Read this card aloud: ${note.text}`
      }
      aria-pressed={speaking}
      aria-disabled={!supported}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handleActivate();
        }
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04 }}
      className={cn(
        "flex min-h-[200px] flex-col gap-3 rounded-3xl border-2 bg-card p-6 shadow-md transition-all",
        "outline-none focus-visible:ring-4 focus-visible:ring-primary/60",
        supported && "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg",
        speaking
          ? "border-primary ring-4 ring-primary/30"
          : "border-border",
      )}
    >
      <div className="text-5xl leading-none" aria-hidden>
        {note.icon}
      </div>
      <p className="text-xl font-bold leading-snug text-foreground">
        {note.text}
      </p>
      {supported && (
        <span
          aria-hidden
          className={cn(
            "mt-auto inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors",
            speaking
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary/10 text-primary",
          )}
        >
          {speaking ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
          {speaking ? "Stop" : "Tap to read"}
        </span>
      )}
    </motion.div>
  );
}
