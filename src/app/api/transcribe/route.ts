import { NextResponse } from "next/server";
import { toFile } from "openai/uploads";
import { z } from "zod";
import { openai } from "@/lib/openai";
import { WHISPER_MAX_BYTES, WHISPER_MODEL } from "@/lib/models";

// Whisper needs Node runtime (the SDK uses Node streams under the hood) and
// long lectures can take a while to transcribe, so bump the timeout.
export const runtime = "nodejs";
export const maxDuration = 60;

const WhisperResponse = z.object({ text: z.string() });

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return errorResponse("We couldn't read the audio upload.", 400);
  }

  const file = form.get("audio");
  if (!(file instanceof File)) {
    return errorResponse("No audio file was attached.", 400);
  }
  if (file.size === 0) {
    return errorResponse("That recording came through empty.", 400);
  }
  if (file.size > WHISPER_MAX_BYTES) {
    return errorResponse(
      "That recording is bigger than the 25 MB limit — try a shorter clip.",
      413,
    );
  }

  // Whisper picks its parser from the filename extension, so normalize it to
  // a known one regardless of what the browser handed us.
  const filename = `lecture.${extFromMime(file.type)}`;
  const uploadable = await toFile(file, filename, {
    type: file.type || undefined,
  });

  try {
    const result = await openai().audio.transcriptions.create({
      file: uploadable,
      model: WHISPER_MODEL,
      response_format: "json",
    });
    const parsed = WhisperResponse.parse(result);
    const transcript = parsed.text.trim();
    if (!transcript) {
      return errorResponse(
        "We didn't pick up any speech — try recording again somewhere quieter.",
        422,
      );
    }
    return NextResponse.json({ transcript });
  } catch (err) {
    console.error("[/api/transcribe] failed:", err);
    return errorResponse(friendlyError(err), 502);
  }
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function friendlyError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.includes("OPENAI_API_KEY")) {
      return "The server is missing its OpenAI API key.";
    }
  }
  return "We couldn't transcribe that recording. Try again in a moment.";
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
