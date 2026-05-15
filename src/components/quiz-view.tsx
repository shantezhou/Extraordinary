"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import { RotateCcw, Star } from "lucide-react";
import type { QuizQuestion as Question } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { QuizQuestion, type QuestionResult } from "./quiz-question";

type Props = {
  questions: Question[];
};

type State = QuestionResult & { firstTry: boolean | null };

const initialState = (): State => ({
  wrongAttempts: [],
  solved: false,
  firstTry: null,
});

export function QuizView({ questions }: Props) {
  const reduce = useReducedMotion();
  const [states, setStates] = useState<State[]>(() =>
    questions.map(initialState),
  );
  const [current, setCurrent] = useState(0);
  const [finished, setFinished] = useState(false);

  const firstTryCorrect = useMemo(
    () => states.filter((s) => s.firstTry === true).length,
    [states],
  );

  const handleAnswer = useCallback(
    (choiceIdx: number) => {
      const q = questions[current];
      if (!q) return;
      const correct = choiceIdx === q.correct_index;
      setStates((prev) =>
        prev.map((s, i) => {
          if (i !== current) return s;
          if (correct) {
            return {
              ...s,
              solved: true,
              firstTry: s.firstTry ?? true,
            };
          }
          return {
            ...s,
            wrongAttempts: s.wrongAttempts.includes(choiceIdx)
              ? s.wrongAttempts
              : [...s.wrongAttempts, choiceIdx],
            firstTry: false,
          };
        }),
      );
      if (correct && !reduce) {
        fireConfetti();
      }
    },
    [current, questions, reduce],
  );

  const next = useCallback(() => {
    if (current >= questions.length - 1) {
      setFinished(true);
      if (!reduce) fireBigConfetti();
      return;
    }
    setCurrent((c) => c + 1);
  }, [current, questions.length, reduce]);

  const restart = useCallback(() => {
    setStates(questions.map(initialState));
    setCurrent(0);
    setFinished(false);
  }, [questions]);

  if (questions.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-border bg-card p-12 text-center">
        <div className="mb-2 text-4xl" aria-hidden>
          🤔
        </div>
        <p className="text-base font-bold">
          No quiz questions came back. Try a longer recording?
        </p>
      </div>
    );
  }

  if (finished) {
    return (
      <Results
        total={questions.length}
        firstTryCorrect={firstTryCorrect}
        onRestart={restart}
      />
    );
  }

  const q = questions[current];
  if (!q) return null;

  return (
    <div className="flex flex-col gap-5">
      <ProgressStars states={states} current={current} />
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
        >
          <QuizQuestion
            question={q}
            questionNumber={current + 1}
            total={questions.length}
            result={states[current] ?? initialState()}
            onAnswer={handleAnswer}
            onNext={next}
            isLast={current === questions.length - 1}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ProgressStars({
  states,
  current,
}: {
  states: State[];
  current: number;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-1.5"
      aria-label={`Progress: question ${current + 1} of ${states.length}`}
    >
      {states.map((s, i) => {
        const solved = s.solved;
        const isCurrent = i === current;
        return (
          <Star
            key={i}
            aria-hidden
            className={cn(
              "h-6 w-6 transition-all",
              solved && s.firstTry
                ? "fill-yellow-400 text-yellow-500"
                : solved
                  ? "fill-yellow-300/70 text-yellow-500"
                  : "fill-transparent text-muted-foreground/40",
              isCurrent && !solved && "scale-110 text-primary",
            )}
            strokeWidth={2}
          />
        );
      })}
    </div>
  );
}

function Results({
  total,
  firstTryCorrect,
  onRestart,
}: {
  total: number;
  firstTryCorrect: number;
  onRestart: () => void;
}) {
  const ratio = firstTryCorrect / total;
  const message =
    ratio === 1
      ? "Perfect score! You're a star!"
      : ratio >= 0.7
        ? "Awesome work — you're really getting it!"
        : ratio >= 0.4
          ? "Nice try! Keep practicing and you'll nail it."
          : "Good effort. Try again to build it up!";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-5 rounded-3xl border-2 border-border bg-card p-10 text-center shadow-xl"
    >
      <div className="text-7xl" aria-hidden>
        🏆
      </div>
      <div className="space-y-1">
        <p className="text-base font-bold uppercase tracking-wider text-muted-foreground">
          First-try score
        </p>
        <p className="font-mono text-6xl font-extrabold tabular-nums text-foreground">
          {firstTryCorrect} / {total}
        </p>
      </div>
      <p className="text-lg font-bold text-foreground">{message}</p>
      <button
        type="button"
        onClick={onRestart}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
      >
        <RotateCcw className="h-5 w-5" />
        Play again
      </button>
    </motion.div>
  );
}

const KAHOOT_COLORS = ["#E21B3C", "#1368CE", "#D89E00", "#26890C"];

function fireConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: KAHOOT_COLORS,
  });
}

function fireBigConfetti() {
  // Two side bursts for the results screen.
  const defaults = { spread: 60, colors: KAHOOT_COLORS } as const;
  confetti({ ...defaults, particleCount: 120, origin: { x: 0.2, y: 0.7 } });
  confetti({ ...defaults, particleCount: 120, origin: { x: 0.8, y: 0.7 } });
}
