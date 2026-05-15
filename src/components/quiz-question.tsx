"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Circle, Diamond, Square, Triangle } from "lucide-react";
import type { QuizQuestion as Question, QuizColor } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const ANSWER_STYLES = [
  {
    bg: "bg-quiz-red hover:bg-quiz-red/90",
    ring: "ring-quiz-red",
    Shape: Triangle,
  },
  {
    bg: "bg-quiz-blue hover:bg-quiz-blue/90",
    ring: "ring-quiz-blue",
    Shape: Diamond,
  },
  {
    bg: "bg-quiz-yellow hover:bg-quiz-yellow/90",
    ring: "ring-quiz-yellow",
    Shape: Circle,
  },
  {
    bg: "bg-quiz-green hover:bg-quiz-green/90",
    ring: "ring-quiz-green",
    Shape: Square,
  },
] as const;

const THEME_PANEL: Record<QuizColor, string> = {
  red: "bg-quiz-red",
  blue: "bg-quiz-blue",
  yellow: "bg-quiz-yellow",
  green: "bg-quiz-green",
};

export type QuestionResult = {
  wrongAttempts: number[];
  solved: boolean;
};

type Props = {
  question: Question;
  questionNumber: number;
  total: number;
  result: QuestionResult;
  onAnswer: (choiceIndex: number) => void;
  onNext: () => void;
  isLast: boolean;
};

export function QuizQuestion({
  question,
  questionNumber,
  total,
  result,
  onAnswer,
  onNext,
  isLast,
}: Props) {
  const [shakeIdx, setShakeIdx] = useState<number | null>(null);

  // Reset shake when the question changes.
  useEffect(() => {
    setShakeIdx(null);
  }, [questionNumber]);

  const handleClick = (idx: number) => {
    if (result.solved) return;
    if (result.wrongAttempts.includes(idx)) return;
    if (idx !== question.correct_index) {
      setShakeIdx(idx);
      window.setTimeout(() => setShakeIdx(null), 450);
    }
    onAnswer(idx);
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        className={cn(
          "rounded-3xl p-6 text-white shadow-xl sm:p-8",
          THEME_PANEL[question.color_theme],
        )}
      >
        <div className="text-xs font-bold uppercase tracking-wider opacity-80">
          Question {questionNumber} of {total}
        </div>
        <h2 className="mt-2 text-2xl font-extrabold leading-snug sm:text-3xl">
          {question.question}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.choices.map((choice, idx) => {
          const style = ANSWER_STYLES[idx];
          if (!style) return null;
          const isWrong = result.wrongAttempts.includes(idx);
          const isCorrect = result.solved && idx === question.correct_index;
          const Shape = style.Shape;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleClick(idx)}
              disabled={result.solved || isWrong}
              aria-label={`Answer ${idx + 1}: ${choice}`}
              className={cn(
                "group relative flex min-h-[88px] items-center gap-4 rounded-2xl px-5 py-4 text-left text-lg font-bold text-white shadow-lg transition-all",
                style.bg,
                shakeIdx === idx && "animate-shake",
                isWrong && "cursor-not-allowed opacity-40 line-through",
                isCorrect && "ring-4 ring-offset-2 ring-offset-background",
                isCorrect && style.ring,
                !result.solved && !isWrong && "hover:-translate-y-0.5",
              )}
            >
              <Shape
                className="h-7 w-7 shrink-0 fill-current"
                strokeWidth={0}
                aria-hidden
              />
              <span className="grow leading-snug">{choice}</span>
              {isCorrect && (
                <Check className="h-6 w-6 shrink-0" strokeWidth={3} aria-hidden />
              )}
            </button>
          );
        })}
      </div>

      <Feedback
        question={question}
        result={result}
        onNext={onNext}
        isLast={isLast}
      />
    </div>
  );
}

function Feedback({
  question,
  result,
  onNext,
  isLast,
}: {
  question: Question;
  result: QuestionResult;
  onNext: () => void;
  isLast: boolean;
}) {
  return (
    <AnimatePresence mode="wait">
      {result.solved ? (
        <motion.div
          key="correct"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-start gap-3 rounded-2xl border-2 border-quiz-green/40 bg-quiz-green/10 p-5"
        >
          <p className="text-lg font-extrabold text-quiz-green">
            ✅ You got it!
          </p>
          <p className="text-base text-foreground">{question.explanation}</p>
          <button
            type="button"
            onClick={onNext}
            className="mt-2 self-end rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
          >
            {isLast ? "See results →" : "Next question →"}
          </button>
        </motion.div>
      ) : result.wrongAttempts.length > 0 ? (
        <motion.p
          key="wrong"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-2xl border-2 border-dashed border-border bg-background p-4 text-center text-base font-bold text-muted-foreground"
        >
          💪 Not quite — give it another try!
        </motion.p>
      ) : (
        <p
          key="hint"
          className="text-center text-sm text-muted-foreground"
        >
          Pick the best answer.
        </p>
      )}
    </AnimatePresence>
  );
}
