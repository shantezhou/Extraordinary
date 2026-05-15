"use client";

import { Mic, Square } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { RecorderStatus } from "@/hooks/use-recorder";

type Props = {
  status: RecorderStatus;
  level: number;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
};

export function RecordButton({
  status,
  level,
  onStart,
  onStop,
  disabled,
}: Props) {
  const recording = status === "recording";
  const label = recording ? "Stop recording" : "Start recording";
  // Pulse the button slightly with mic level for a "breathing" effect.
  const scale = recording ? 1 + Math.min(level, 1) * 0.12 : 1;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative grid place-items-center">
        {recording && (
          <>
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-destructive/30 animate-pulse-ring"
            />
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-destructive/20 animate-pulse-ring [animation-delay:500ms]"
            />
          </>
        )}
        <motion.button
          type="button"
          aria-label={label}
          aria-pressed={recording}
          disabled={disabled}
          onClick={recording ? onStop : onStart}
          animate={{ scale }}
          transition={{ duration: 0.08 }}
          whileTap={{ scale: scale * 0.96 }}
          className={cn(
            "relative z-10 grid place-items-center rounded-full text-white shadow-2xl",
            "h-56 w-56 md:h-72 md:w-72",
            "transition-colors focus-visible:ring-offset-4",
            recording
              ? "bg-destructive hover:bg-destructive/90"
              : "bg-primary hover:bg-primary/90",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          {recording ? (
            <Square className="h-20 w-20 fill-current md:h-24 md:w-24" strokeWidth={0} />
          ) : (
            <Mic className="h-24 w-24 md:h-28 md:w-28" strokeWidth={2.25} />
          )}
        </motion.button>
      </div>
      <p className="text-lg font-bold text-foreground">
        {recording ? "Tap when class is done" : "Tap to start recording"}
      </p>
    </div>
  );
}
