"use client";

import type { SavedLecture } from "@/lib/saved-lectures";

type Props = {
  lectures: SavedLecture[];
  onOpen: (lecture: SavedLecture) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
};

export function SavedLecturesView({
  lectures,
  onOpen,
  onDelete,
  onNew,
}: Props) {
  return (
    <main className="min-h-dvh px-6 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Library
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Saved lectures
            </h1>
          </div>
          <button
            type="button"
            onClick={onNew}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
          >
            New recording
          </button>
        </header>

        {lectures.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border bg-card p-10 text-center">
            <div className="mb-3 text-6xl" aria-hidden>
              📚
            </div>
            <h2 className="text-xl font-extrabold">No saved lectures yet</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Record a class and we&apos;ll save the study set here on this
              device.
            </p>
          </div>
        ) : (
          <div role="list" className="grid gap-4">
            {lectures.map((lecture) => (
              <article
                role="listitem"
                key={lecture.id}
                className="rounded-3xl border-2 border-border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => onOpen(lecture)}
                    className="min-w-0 flex-1 rounded-2xl p-1 text-left transition-colors hover:bg-muted/50"
                  >
                    <h2 className="truncate text-lg font-extrabold">
                      {lecture.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(lecture.createdAt)} ·{" "}
                      {lecture.artifacts.simplified_notes.length} notes ·{" "}
                      {lecture.artifacts.flashcards.length} cards ·{" "}
                      {lecture.artifacts.quiz.length} quiz
                    </p>
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onOpen(lecture)}
                      className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(lecture.id)}
                      className="rounded-full border-2 border-border bg-background px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
