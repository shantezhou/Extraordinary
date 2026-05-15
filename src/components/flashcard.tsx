"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import type { Flashcard as Card } from "@/lib/schemas";
import { useSpeechFor } from "./speech-provider";
import { cn } from "@/lib/utils";

type Props = {
  card: Card;
  index: number;
  total: number;
};

export function Flashcard({ card, index, total }: Props) {
  const [flipped, setFlipped] = useState(false);
  const reduce = useReducedMotion();
  const front = useSpeechFor(`card-${index}-front`);
  const back = useSpeechFor(`card-${index}-back`);

  const flip = () => setFlipped((f) => !f);

  return (
    <div className="w-full [perspective:1200px]">
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={`Flashcard ${index + 1} of ${total}. Showing the ${flipped ? "answer" : "question"}. Press to flip.`}
        aria-pressed={flipped}
        onClick={flip}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            flip();
          }
        }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: reduce ? 0 : 0.55, ease: [0.4, 0, 0.2, 1] }}
        className="relative h-[24rem] w-full cursor-pointer rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-primary/60 sm:h-[26rem] [transform-style:preserve-3d]"
      >
        <Face
          side="front"
          icon={card.icon}
          text={card.front}
          speaking={front.speaking}
          supported={front.supported}
          onRead={(e) => {
            e.stopPropagation();
            front.toggle(card.front);
          }}
        />
        <Face
          side="back"
          text={card.back}
          speaking={back.speaking}
          supported={back.supported}
          onRead={(e) => {
            e.stopPropagation();
            back.toggle(card.back);
          }}
        />
      </motion.div>
    </div>
  );
}

type FaceProps = {
  side: "front" | "back";
  text: string;
  icon?: string;
  speaking: boolean;
  supported: boolean;
  onRead: (e: React.MouseEvent | React.KeyboardEvent) => void;
};

function Face({ side, text, icon, speaking, supported, onRead }: FaceProps) {
  const isBack = side === "back";
  return (
    <div
      aria-hidden={isBack ? undefined : undefined}
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-3xl border-2 p-8 shadow-xl [backface-visibility:hidden]",
        isBack
          ? "bg-accent text-accent-foreground border-accent [transform:rotateY(180deg)]"
          : "bg-card text-foreground border-border",
      )}
    >
      {icon && (
        <div className="text-7xl leading-none" aria-hidden>
          {icon}
        </div>
      )}
      <p
        className={cn(
          "text-center font-bold leading-snug",
          isBack ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
        )}
      >
        {text}
      </p>
      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
        {supported ? (
          <button
            type="button"
            onClick={onRead}
            onKeyDown={(e) => {
              // Prevent Space/Enter on this nested button from bubbling up
              // to the card's flip handler.
              if (e.key === " " || e.key === "Enter") e.stopPropagation();
            }}
            aria-label={speaking ? "Stop reading" : "Read this side aloud"}
            aria-pressed={speaking}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors",
              isBack
                ? speaking
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-accent-foreground/10 text-accent-foreground hover:bg-accent-foreground/20"
                : speaking
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-primary/10 text-primary hover:bg-primary/20",
            )}
          >
            {speaking ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            {speaking ? "Stop" : "Read"}
          </button>
        ) : (
          <span />
        )}
        <span
          className={cn(
            "text-xs font-semibold",
            isBack ? "text-accent-foreground/70" : "text-muted-foreground",
          )}
        >
          Tap to flip{isBack ? " back" : ""}
        </span>
      </div>
    </div>
  );
}
