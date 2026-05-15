import { NextResponse } from "next/server";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { openai } from "@/lib/openai";
import { GENERATION_MODEL } from "@/lib/models";
import {
  StudyArtifactsSchema,
  type StudyArtifactsData,
} from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a learning-design assistant for children and neurodivergent learners.
Given a raw classroom transcript, produce study materials that are:
- Plain language (US grade 3 reading level max)
- Short sentences (≤12 words)
- One idea per card
- Concrete examples over abstract definitions
- Encouraging and warm in tone
- Start with a short lecture overview (2-3 simple sentences)

Return ONLY valid JSON matching this schema:
{
  "lecture_overview": "string",
  "simplified_notes": [{ "icon": "emoji", "text": "string" }],
  "flashcards":       [{ "front": "string", "back": "string", "icon": "emoji" }],
  "quiz":             [{ "question": "string", "choices": ["string","string","string","string"], "correct_index": 0, "explanation": "string", "color_theme": "red|blue|yellow|green" }]
}
No prose outside the JSON.`;

const RequestBody = z.object({
  transcript: z.string().min(20, "transcript too short"),
});

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return errorResponse("Couldn't parse the request body.", 400);
  }

  const body = RequestBody.safeParse(payload);
  if (!body.success) {
    return errorResponse(
      "That transcript was too short to make a study set from.",
      400,
    );
  }

  try {
    const completion = await openai().beta.chat.completions.parse({
      model: GENERATION_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: body.data.transcript },
      ],
      response_format: zodResponseFormat(
        StudyArtifactsSchema,
        "study_artifacts",
      ),
    });

    const choice = completion.choices[0];
    if (!choice) return errorResponse("The model didn't return anything.", 502);
    if (choice.message.refusal) {
      return errorResponse(
        "The model wouldn't make a study set from that content.",
        422,
      );
    }
    const parsed = choice.message.parsed;
    if (!parsed) return errorResponse("The study set came back empty.", 502);

    const check = checkSemantics(parsed);
    if (!check.ok) return errorResponse(check.message, 502);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[/api/generate] failed:", err);
    return errorResponse(friendlyError(err), 502);
  }
}

function checkSemantics(
  d: StudyArtifactsData,
): { ok: true } | { ok: false; message: string } {
  if (!d.lecture_overview.trim()) {
    return { ok: false, message: "We got no lecture overview back. Try again?" };
  }
  if (d.simplified_notes.length === 0) {
    return { ok: false, message: "We got no notes back. Try again?" };
  }
  if (d.flashcards.length === 0) {
    return { ok: false, message: "We got no flashcards back. Try again?" };
  }
  if (d.quiz.length === 0) {
    return { ok: false, message: "We got no quiz questions back. Try again?" };
  }
  for (const q of d.quiz) {
    if (q.choices.length !== 4) {
      return {
        ok: false,
        message: "A quiz question came back with the wrong number of choices.",
      };
    }
    if (q.correct_index < 0 || q.correct_index > 3) {
      return {
        ok: false,
        message: "A quiz question had an out-of-range answer.",
      };
    }
  }
  return { ok: true };
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
  return "We couldn't build your study set. Try again in a moment.";
}
