import type { Iso8601, MoodId, ResidentId } from "./ids.js";

/** MVP では 4 値固定 */
export const MOOD_VALUES = ["good", "soso", "tired", "lonely"] as const;

export type MoodValue = (typeof MOOD_VALUES)[number];

export const MOOD_SOURCES = ["self", "caregiver_observed"] as const;

export type MoodSource = (typeof MOOD_SOURCES)[number];

export type Mood = {
  readonly id: MoodId;
  readonly residentId: ResidentId;
  readonly value: MoodValue;
  readonly source: MoodSource;
  /** 任意。140 文字まで */
  readonly note?: string;
  readonly createdAt: Iso8601;
};
