"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { StudyArtifacts } from "@/lib/pipeline";
import { FlashcardsView } from "./flashcards-view";
import { NotesView } from "./notes-view";
import { QuizView } from "./quiz-view";
import { SpeechProvider } from "./speech-provider";
import { TranscriptView } from "./transcript-view";

type Tab = "notes" | "cards" | "quiz";

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "notes", label: "Notes", emoji: "📝" },
  { id: "cards", label: "Cards", emoji: "🎴" },
  { id: "quiz", label: "Quiz", emoji: "🎮" },
];

type Props = {
  artifacts: StudyArtifacts;
  onReset: () => void;
  onLibrary: () => void;
};

export function StudySet({ artifacts, onReset, onLibrary }: Props) {
  const [tab, setTab] = useState<Tab>("notes");

  return (
    <SpeechProvider>
      <main className="min-h-dvh px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Your study set 🎉
            </h1>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onLibrary}
                className="rounded-full border-2 border-border bg-background px-4 py-2 text-sm font-bold transition-colors hover:bg-muted"
              >
                Saved lectures
              </button>
              <button
                type="button"
                onClick={onReset}
                className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
              >
                Record another
              </button>
            </div>
          </header>

          <nav
            role="tablist"
            aria-label="Study set sections"
            className="flex gap-1.5 rounded-full bg-muted p-1.5"
          >
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  aria-controls={`panel-${t.id}`}
                  id={`tab-${t.id}`}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-bold transition-colors",
                    active
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <span aria-hidden>{t.emoji}</span>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <section
            role="tabpanel"
            id={`panel-${tab}`}
            aria-labelledby={`tab-${tab}`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {tab === "notes" && (
                  <NotesView
                    notes={artifacts.simplified_notes}
                    overview={artifacts.lecture_overview}
                  />
                )}
                {tab === "cards" && (
                  <FlashcardsView cards={artifacts.flashcards} />
                )}
                {tab === "quiz" && <QuizView questions={artifacts.quiz} />}
              </motion.div>
            </AnimatePresence>
          </section>

          <TranscriptView transcript={artifacts.transcript} />
        </div>
      </main>
    </SpeechProvider>
  );
}

