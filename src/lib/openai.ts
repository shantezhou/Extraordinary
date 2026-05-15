import "server-only";
import OpenAI from "openai";

let client: OpenAI | null = null;

/** Lazy singleton so a missing key fails on the first real call, not at import. */
export function openai(): OpenAI {
  if (client) return client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env.local and restart the dev server.",
    );
  }
  client = new OpenAI({ apiKey });
  return client;
}
