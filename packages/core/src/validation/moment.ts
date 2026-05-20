import {
  MOMENT_TAGS,
  MOMENT_VISIBILITIES,
  type MomentTag,
  type MomentVisibility,
} from "../model/moment.js";
import { fail, ok, type ValidationResult } from "./errors.js";

export const MOMENT_TEXT_MAX_LENGTH = 280;

export type MomentInput = {
  readonly text: string;
  readonly tags: readonly string[];
  readonly visibility: string;
};

export type ValidatedMomentInput = {
  readonly text: string;
  readonly tags: readonly MomentTag[];
  readonly visibility: MomentVisibility;
};

export function isMomentTag(value: string): value is MomentTag {
  return (MOMENT_TAGS as readonly string[]).includes(value);
}

export function isMomentVisibility(value: string): value is MomentVisibility {
  return (MOMENT_VISIBILITIES as readonly string[]).includes(value);
}

export function validateMomentInput(
  input: MomentInput,
): ValidationResult<ValidatedMomentInput> {
  const errors = [];
  const trimmed = input.text.trim();

  if (trimmed.length === 0) {
    errors.push({
      code: "MOMENT_TEXT_EMPTY" as const,
      message: "moment text must not be empty",
    });
  } else if (trimmed.length > MOMENT_TEXT_MAX_LENGTH) {
    errors.push({
      code: "MOMENT_TEXT_TOO_LONG" as const,
      message: `moment text must be at most ${MOMENT_TEXT_MAX_LENGTH} characters`,
    });
  }

  const invalidTags = input.tags.filter((t) => !isMomentTag(t));
  if (invalidTags.length > 0) {
    errors.push({
      code: "MOMENT_INVALID_TAG" as const,
      message: `invalid tags: ${invalidTags.join(", ")}`,
    });
  }

  if (!isMomentVisibility(input.visibility)) {
    errors.push({
      code: "MOMENT_INVALID_VISIBILITY" as const,
      message: `visibility must be one of: ${MOMENT_VISIBILITIES.join(", ")}`,
    });
  }

  if (errors.length > 0) {
    return fail(errors);
  }

  return ok({
    text: trimmed,
    tags: input.tags.filter(isMomentTag),
    visibility: input.visibility as MomentVisibility,
  });
}

/** health タグが付いていれば doctor 可視化フラグを立てる */
export function momentHealthFromTags(tags: readonly MomentTag[]): boolean {
  return tags.includes("health");
}
