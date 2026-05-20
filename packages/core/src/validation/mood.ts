import { MOOD_VALUES, type MoodValue } from "../model/mood.js";
import { fail, ok, type ValidationResult } from "./errors.js";

export const MOOD_NOTE_MAX_LENGTH = 140;

export type MoodInput = {
  readonly value: string;
  readonly note?: string;
};

export function isMoodValue(value: string): value is MoodValue {
  return (MOOD_VALUES as readonly string[]).includes(value);
}

export function validateMoodInput(input: MoodInput): ValidationResult<MoodInput> {
  const errors = [];

  if (!isMoodValue(input.value)) {
    errors.push({
      code: "MOOD_INVALID_VALUE" as const,
      message: `mood value must be one of: ${MOOD_VALUES.join(", ")}`,
    });
  }

  if (input.note !== undefined && input.note.length > MOOD_NOTE_MAX_LENGTH) {
    errors.push({
      code: "MOOD_NOTE_TOO_LONG" as const,
      message: `note must be at most ${MOOD_NOTE_MAX_LENGTH} characters`,
    });
  }

  if (errors.length > 0) {
    return fail(errors);
  }

  return ok({
    value: input.value as MoodValue,
    ...(input.note !== undefined ? { note: input.note } : {}),
  });
}

/** 取り消し可能な猶予（ミリ秒）。UC-01: 5 分以内 */
export const MOOD_CANCEL_WINDOW_MS = 5 * 60 * 1000;

export function canCancelMood(createdAt: Date, now: Date = new Date()): boolean {
  return now.getTime() - createdAt.getTime() <= MOOD_CANCEL_WINDOW_MS;
}
