"use client";

import type { NoteCard as Note } from "@/lib/schemas";
import { NoteCard } from "./note-card";
import { OverviewCard } from "./overview-card";

type Props = {
  notes: Note[];
  overview: string;
};

export function NotesView({ notes, overview }: Props) {
  if (notes.length === 0) {
    return (
      <div className="space-y-4">
        {overview ? <OverviewCard overview={overview} /> : null}
        <div className="rounded-3xl border-2 border-dashed border-border bg-card p-12 text-center">
          <div className="mb-2 text-4xl" aria-hidden>
            🤔
          </div>
          <p className="text-base font-bold">
            No notes came back this time. Try a longer recording?
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {overview ? <OverviewCard overview={overview} /> : null}
      <div
        role="list"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {notes.map((n, i) => (
          <div role="listitem" key={i}>
            <NoteCard note={n} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
