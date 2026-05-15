"use client";

import { useCallback, useRef, useState } from "react";
import { useRecorder } from "@/hooks/use-recorder";
import { LoadingScreen, type LoadingStage } from "./loading-screen";
import { Recorder } from "./recorder";
import { SavedLecturesView } from "./saved-lectures-view";
import { StudySet } from "./study-set";
import { runPipeline, type StudyArtifacts } from "@/lib/pipeline";
import { useSavedLectures, type SavedLecture } from "@/lib/saved-lectures";

type Phase =
  | { kind: "capture" }
  | { kind: "library" }
  | { kind: "processing"; stage: LoadingStage }
  | { kind: "error"; stage: LoadingStage; message: string }
  | { kind: "done"; artifacts: StudyArtifacts };

export function Session() {
  const recorder = useRecorder();
  const saved = useSavedLectures();
  const [phase, setPhase] = useState<Phase>({ kind: "capture" });
  const abortRef = useRef<AbortController | null>(null);

  const startProcessing = useCallback(async () => {
    if (!recorder.audioBlob) return;
    const audio = recorder.audioBlob;
    const ac = new AbortController();
    abortRef.current = ac;
    setPhase({ kind: "processing", stage: "transcribing" });
    try {
      const artifacts = await runPipeline(audio, {
        onStageChange: (stage) =>
          setPhase((p) =>
            p.kind === "processing" ? { kind: "processing", stage } : p,
          ),
        signal: ac.signal,
      });
      if (ac.signal.aborted) return;
      saved.saveLecture(artifacts);
      setPhase({ kind: "done", artifacts });
    } catch (err) {
      if (ac.signal.aborted) return;
      const message =
        err instanceof Error
          ? err.message
          : "We hit a snag — let's try again.";
      setPhase((p) => ({
        kind: "error",
        stage: p.kind === "processing" ? p.stage : "transcribing",
        message,
      }));
    }
  }, [recorder.audioBlob, saved]);

  const cancel = useCallback(() => {
    abortRef.current?.abort("cancelled");
    abortRef.current = null;
    setPhase({ kind: "capture" });
  }, []);

  const resetAll = useCallback(() => {
    cancel();
    recorder.reset();
  }, [cancel, recorder]);

  const openSavedLecture = useCallback((lecture: SavedLecture) => {
    setPhase({ kind: "done", artifacts: lecture.artifacts });
  }, []);

  if (phase.kind === "processing") {
    return <LoadingScreen stage={phase.stage} onCancel={cancel} />;
  }

  if (phase.kind === "error") {
    return (
      <LoadingScreen
        stage={phase.stage}
        error={phase.message}
        onRetry={startProcessing}
        onCancel={resetAll}
      />
    );
  }

  if (phase.kind === "done") {
    return (
      <StudySet
        artifacts={phase.artifacts}
        onReset={resetAll}
        onLibrary={() => setPhase({ kind: "library" })}
      />
    );
  }

  if (phase.kind === "library") {
    return (
      <SavedLecturesView
        lectures={saved.lectures}
        onOpen={openSavedLecture}
        onDelete={saved.deleteLecture}
        onNew={resetAll}
      />
    );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 flex rounded-full bg-muted p-1.5">
        <button
          type="button"
          className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-sm"
          aria-current="page"
        >
          Record
        </button>
        <button
          type="button"
          onClick={() => setPhase({ kind: "library" })}
          className="rounded-full px-5 py-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          Saved lectures ({saved.lectures.length})
        </button>
      </div>
      <Recorder recorder={recorder} onConfirm={startProcessing} />
    </main>
  );
}
