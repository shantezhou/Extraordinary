"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSpeechFor } from "./speech-provider";
import { cn } from "@/lib/utils";

type Props = {
  overview: string;
};

export function OverviewCard({ overview }: Props) {
  const { supported, speaking, toggle } = useSpeechFor("overview");

  const handleActivate = () => {
    if (supported) toggle(overview);
  };

  return (
    <section
      role="button"
      tabIndex={0}
      aria-label={
        speaking
          ? "Stop reading the lecture overview"
          : "Read the lecture overview aloud"
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
      className={cn(
        "rounded-3xl border-2 bg-primary/10 p-6 transition-all",
        "outline-none focus-visible:ring-4 focus-visible:ring-primary/60",
        supported && "cursor-pointer hover:bg-primary/15",
        speaking
          ? "border-primary ring-4 ring-primary/30"
          : "border-primary/20",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-4xl" aria-hidden>
          🌟
        </div>
        {supported && (
          <span
            aria-hidden
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors",
              speaking
                ? "bg-destructive text-destructive-foreground"
                : "bg-primary/20 text-primary",
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
      </div>
      <h2 className="mt-2 text-xl font-extrabold">Lecture overview</h2>
      <p className="mt-2 text-lg leading-relaxed text-foreground">{overview}</p>
    </section>
  );
}
