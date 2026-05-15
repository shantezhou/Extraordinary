"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import type { StudyArtifacts } from "@/lib/pipeline";
import { StudyArtifactsSchema } from "@/lib/schemas";

const STORAGE_KEY = "extraordinary.savedLectures.v1";
const MAX_SAVED = 12;

const SavedLectureSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
  artifacts: StudyArtifactsSchema.extend({
    transcript: z.string(),
  }),
});

const SavedLecturesSchema = z.array(SavedLectureSchema);

export type SavedLecture = z.infer<typeof SavedLectureSchema>;

export function useSavedLectures() {
  const [lectures, setLectures] = useState<SavedLecture[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? SavedLecturesSchema.safeParse(JSON.parse(raw)) : null;
      if (parsed?.success) setLectures(parsed.data);
    } catch {
      setLectures([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lectures));
  }, [lectures, loaded]);

  const saveLecture = useCallback((artifacts: StudyArtifacts) => {
    const lecture: SavedLecture = {
      id: crypto.randomUUID(),
      title: titleFromArtifacts(artifacts),
      createdAt: new Date().toISOString(),
      artifacts,
    };
    setLectures((prev) => [lecture, ...prev].slice(0, MAX_SAVED));
    return lecture;
  }, []);

  const deleteLecture = useCallback((id: string) => {
    setLectures((prev) => prev.filter((lecture) => lecture.id !== id));
  }, []);

  return useMemo(
    () => ({ loaded, lectures, saveLecture, deleteLecture }),
    [deleteLecture, lectures, loaded, saveLecture],
  );
}

function titleFromArtifacts(artifacts: StudyArtifacts): string {
  const fromOverview = artifacts.lecture_overview
    .replace(/\s+/g, " ")
    .trim()
    .split(/[.!?]/)[0]
    ?.trim();
  const fromNote = artifacts.simplified_notes[0]?.text.trim();
  const title = fromOverview || fromNote || "Saved lecture";
  return title.length > 48 ? `${title.slice(0, 45).trim()}...` : title;
}
