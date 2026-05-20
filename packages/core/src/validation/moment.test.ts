import { describe, expect, it } from "vitest";
import {
  momentHealthFromTags,
  MOMENT_TEXT_MAX_LENGTH,
  validateMomentInput,
} from "./moment.js";

describe("validateMomentInput", () => {
  it("accepts valid moment", () => {
    const result = validateMomentInput({
      text: "  午後のお茶を楽しそうに飲まれました  ",
      tags: ["meal", "smile"],
      visibility: "family_shareable",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.text).toBe("午後のお茶を楽しそうに飲まれました");
      expect(result.value.tags).toEqual(["meal", "smile"]);
    }
  });

  it("rejects empty text", () => {
    const result = validateMomentInput({
      text: "   ",
      tags: [],
      visibility: "caregiver_only",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.code).toBe("MOMENT_TEXT_EMPTY");
    }
  });

  it("rejects text over 280 characters", () => {
    const result = validateMomentInput({
      text: "あ".repeat(MOMENT_TEXT_MAX_LENGTH + 1),
      tags: [],
      visibility: "caregiver_only",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.code).toBe("MOMENT_TEXT_TOO_LONG");
    }
  });

  it("rejects invalid tags", () => {
    const result = validateMomentInput({
      text: "test",
      tags: ["emergency"],
      visibility: "caregiver_only",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.code).toBe("MOMENT_INVALID_TAG");
    }
  });
});

describe("momentHealthFromTags", () => {
  it("returns true when health tag present", () => {
    expect(momentHealthFromTags(["health", "meal"])).toBe(true);
  });

  it("returns false without health tag", () => {
    expect(momentHealthFromTags(["meal", "smile"])).toBe(false);
  });
});
