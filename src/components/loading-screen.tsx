"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type LoadingStage = "transcribing" | "generating";

// Pools are longer than the expected stage duration so the screen never looks
// stuck on slow networks — when we run out, we loop.
const MESSAGES: Record<LoadingStage, readonly string[]> = {
  transcribing: [
    "👂 Listening to your lecture...",
    "📝 Writing down every word...",
    "🎧 Catching the tricky parts...",
    "📝 Almost got it all down...",
  ],
  generating: [
    "🧠 Picking out the big ideas...",
    "✏️ Making your notes simple...",
    "🎴 Building your flashcards...",
    "🎮 Setting up the quiz...",
    "✨ Almost ready!",
  ],
};

const SUBTITLE: Record<LoadingStage, string> = {
  transcribing: "Turning your recording into words...",
  generating: "Building your study set...",
};

const ROTATE_MS = 2500;

type Props = {
  stage: LoadingStage;
  error?: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
};

export function LoadingScreen({ stage, error, onRetry, onCancel }: Props) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  // Reset the rotation whenever the stage flips so the first message of the
  // new pool gets its full dwell time.
  useEffect(() => {
    setStep(0);
    const id = window.setInterval(() => setStep((s) => s + 1), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [stage]);

  if (error) {
    return (
      <main
        role="alert"
        className="grid min-h-dvh place-items-center px-6 py-12"
      >
        <div className="flex max-w-md flex-col items-center gap-6 text-center">
          <div className="text-8xl" aria-hidden>
            😅
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Hmm, something got mixed up — let&apos;s try again.
          </h1>
          <p className="text-base text-muted-foreground">{error}</p>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-2xl bg-primary px-6 py-3 text-base font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
              >
                Try again
              </button>
            )}
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-2xl border-2 border-border bg-background px-6 py-3 text-base font-bold text-foreground transition-colors hover:bg-muted"
              >
                Start over
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  const pool = MESSAGES[stage];
  const message = pool[step % pool.length] ?? pool[0] ?? "";

  return (
    <main
      className="grid min-h-dvh place-items-center px-6 py-12"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex max-w-md flex-col items-center gap-8 text-center">
        <motion.div
          aria-hidden
          className="select-none text-9xl"
          animate={
            reduce ? undefined : { y: [0, -10, 0], rotate: [-4, 4, -4] }
          }
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          🦉
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.h1
            key={`${stage}-${step}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="text-3xl font-extrabold tracking-tight md:text-4xl"
          >
            {message}
          </motion.h1>
        </AnimatePresence>

        <div className="flex items-center gap-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block h-3 w-3 rounded-full bg-primary"
              animate={reduce ? undefined : { y: [0, -10, 0] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.15,
              }}
            />
          ))}
        </div>

        <p className="text-sm text-muted-foreground">{SUBTITLE[stage]}</p>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline focus-visible:underline"
          >
            Cancel
          </button>
        )}
      </div>
    </main>
  );
}
