"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { UseRecorder } from "@/hooks/use-recorder";
import { RecordButton } from "./record-button";
import { Waveform } from "./waveform";

function formatTime(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

type Props = {
  recorder: UseRecorder;
  onConfirm: () => void;
};

export function Recorder({ recorder: r, onConfirm }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8">
      <RecordButton
        status={r.status}
        level={r.level}
        onStart={r.start}
        onStop={r.stop}
      />

      <AnimatePresence mode="wait" initial={false}>
        {r.status === "recording" && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col items-center gap-3"
          >
            <span className="flex items-center gap-2 font-mono text-2xl font-bold tabular-nums text-destructive">
              <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-destructive" />
              {formatTime(r.elapsedMs)}
            </span>
            <Waveform level={r.level} active />
          </motion.div>
        )}

        {r.status === "stopped" && r.audioUrl && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex w-full flex-col items-center gap-4 rounded-3xl bg-card p-6 shadow-md"
          >
            <p className="text-center text-base text-muted-foreground">
              Recording saved. Give it a quick listen.
            </p>
            <audio controls src={r.audioUrl} className="w-full" />
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={r.reset}
                className="flex-1 rounded-2xl border-2 border-border bg-background px-4 py-3 text-base font-bold text-foreground transition-colors hover:bg-muted"
              >
                Record again
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 rounded-2xl bg-primary px-4 py-3 text-base font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
              >
                Make my study set →
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Length {formatTime(r.elapsedMs)} · Type {r.mimeType ?? "audio"}
              {r.audioBlob
                ? ` · ${(r.audioBlob.size / 1024).toFixed(0)} KB`
                : ""}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {r.error && (
        <p
          role="alert"
          className="rounded-2xl bg-destructive/10 px-4 py-3 text-center text-sm font-semibold text-destructive"
        >
          {r.error}
        </p>
      )}
    </div>
  );
}
