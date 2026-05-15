/**
 * Centralized model identifiers. Swap a model here and every route picks it
 * up — no other file should reference these IDs directly.
 */

export const WHISPER_MODEL = "whisper-1";

// Used by /api/generate (step 5). Structured Outputs requires a snapshot
// model that supports JSON Schema response formats.
export const GENERATION_MODEL = "gpt-4o-2024-08-06";

/** Whisper's hard per-file upload cap (matches OpenAI's documented limit). */
export const WHISPER_MAX_BYTES = 25 * 1024 * 1024;
