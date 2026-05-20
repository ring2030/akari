import { describe, expect, it } from "vitest";
import {
  canCancelMood,
  MOOD_CANCEL_WINDOW_MS,
  MOOD_NOTE_MAX_LENGTH,
  validateMoodInput,
} from "./mood.js";

describe("validateMoodInput", () => {
  it("accepts valid mood with no note", () => {
    const result = validateMoodInput({ value: "good" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("good");
    }
  });

  it("accepts all four MVP mood values", () => {
    for (const value of ["good", "soso", "tired", "lonely"] as const) {
      expect(validateMoodInput({ value }).ok).toBe(true);
    }
  });

  it("rejects ring-core style urgency values", () => {
    const result = validateMoodInput({ value: "urgent" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.code).toBe("MOOD_INVALID_VALUE");
    }
  });

  it("rejects note longer than 140 characters", () => {
    const result = validateMoodInput({
      value: "lonely",
      note: "あ".repeat(MOOD_NOTE_MAX_LENGTH + 1),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.code === "MOOD_NOTE_TOO_LONG")).toBe(
        true,
      );
    }
  });
});

describe("canCancelMood", () => {
  it("allows cancel within 5 minutes", () => {
    const created = new Date("2026-05-20T10:00:00.000Z");
    const now = new Date(created.getTime() + MOOD_CANCEL_WINDOW_MS);
    expect(canCancelMood(created, now)).toBe(true);
  });

  it("disallows cancel after 5 minutes", () => {
    const created = new Date("2026-05-20T10:00:00.000Z");
    const now = new Date(created.getTime() + MOOD_CANCEL_WINDOW_MS + 1);
    expect(canCancelMood(created, now)).toBe(false);
  });
});
