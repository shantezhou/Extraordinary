import { z } from "zod";
import type { LoadingStage } from "@/components/loading-screen";
import {
  StudyArtifactsSchema,
  type StudyArtifactsData,
} from "@/lib/schemas";

export type StudyArtifacts = StudyArtifactsData & {
  transcript: string;
};

export type PipelineCallbacks = {
  onStageChange: (stage: LoadingStage) => void;
  signal?: AbortSignal;
};

const TranscribeResponse = z.object({ transcript: z.string().min(1) });
const ApiError = z.object({ error: z.string() });

export async function runPipeline(
  audio: Blob,
  { onStageChange, signal }: PipelineCallbacks,
): Promise<StudyArtifacts> {
  onStageChange("transcribing");
  const transcript = await transcribe(audio, signal);

  onStageChange("generating");
  const artifacts = await generate(transcript, signal);

  return { ...artifacts, transcript };
}

async function transcribe(audio: Blob, signal?: AbortSignal): Promise<string> {
  const form = new FormData();
  const filename = `lecture.${extFromMime(audio.type)}`;
  form.append("audio", audio, filename);

  const res = await postWithFriendlyErrors("/api/transcribe", form, signal);
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(extractApiError(json, res.status, "transcribe"));

  const parsed = TranscribeResponse.safeParse(json);
  if (!parsed.success) {
    throw new Error("The transcription response looked malformed.");
  }
  return parsed.data.transcript;
}

async function generate(
  transcript: string,
  signal?: AbortSignal,
): Promise<StudyArtifactsData> {
  const res = await postWithFriendlyErrors(
    "/api/generate",
    JSON.stringify({ transcript }),
    signal,
    { "Content-Type": "application/json" },
  );
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(extractApiError(json, res.status, "generate"));

  const parsed = StudyArtifactsSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("The study-set response looked malformed.");
  }
  return parsed.data;
}

async function postWithFriendlyErrors(
  url: string,
  body: BodyInit,
  signal?: AbortSignal,
  headers?: HeadersInit,
): Promise<Response> {
  try {
    return await fetch(url, { method: "POST", body, signal, headers });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw err;
    throw new Error("Couldn't reach the server. Check your connection?");
  }
}

function extractApiError(json: unknown, status: number, stage: string): string {
  const parsed = ApiError.safeParse(json);
  return parsed.success ? parsed.data.error : `${stage} failed (${status}).`;
}

function extFromMime(mime: string): string {
  const m = mime.toLowerCase();
  if (m.includes("webm")) return "webm";
  if (m.includes("mp4") || m.includes("m4a")) return "m4a";
  if (m.includes("ogg")) return "ogg";
  if (m.includes("wav")) return "wav";
  if (m.includes("mpeg") || m.includes("mp3")) return "mp3";
  return "webm";
}
