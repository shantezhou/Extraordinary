import { z } from "zod";

/**
 * Shared schema for the model's study-set output. Used both to drive OpenAI
 * Structured Outputs (via `zodResponseFormat`) and to validate the response.
 *
 * Kept intentionally permissive — Structured Outputs' strict mode rejects most
 * JSON-Schema constraints (minItems, maxItems, etc.). Semantic checks like
 * "4 choices per quiz question" live in /api/generate so we can return a
 * friendly error instead of confusing the model.
 */

export const NoteCardSchema = z.object({
  icon: z.string(),
  text: z.string(),
});

export const FlashcardSchema = z.object({
  front: z.string(),
  back: z.string(),
  icon: z.string(),
});

export const QuizColorSchema = z.enum(["red", "blue", "yellow", "green"]);

export const QuizQuestionSchema = z.object({
  question: z.string(),
  choices: z.array(z.string()),
  correct_index: z.number().int(),
  explanation: z.string(),
  color_theme: QuizColorSchema,
});

export const StudyArtifactsSchema = z.object({
  lecture_overview: z.string(),
  simplified_notes: z.array(NoteCardSchema),
  flashcards: z.array(FlashcardSchema),
  quiz: z.array(QuizQuestionSchema),
});

export type NoteCard = z.infer<typeof NoteCardSchema>;
export type Flashcard = z.infer<typeof FlashcardSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizColor = z.infer<typeof QuizColorSchema>;
export type StudyArtifactsData = z.infer<typeof StudyArtifactsSchema>;
