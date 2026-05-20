import type { Iso8601, MomentId, ResidentId, UserId } from "./ids.js";

export const MOMENT_TAGS = [
  "meal",
  "sleep",
  "visit",
  "smile",
  "concern",
  "health",
] as const;

export type MomentTag = (typeof MOMENT_TAGS)[number];

export const MOMENT_VISIBILITIES = [
  "caregiver_only",
  "family_shareable",
] as const;

export type MomentVisibility = (typeof MOMENT_VISIBILITIES)[number];

export type Moment = {
  readonly id: MomentId;
  readonly residentId: ResidentId;
  readonly authorId: UserId;
  /** 280 文字まで。30 秒で書ける長さ */
  readonly text: string;
  readonly tags: readonly MomentTag[];
  readonly visibility: MomentVisibility;
  /** doctor ロールへの可視化フラグ */
  readonly health: boolean;
  readonly createdAt: Iso8601;
  /** 家族への共有が確定したタイミング */
  readonly sharedToFamilyAt?: Iso8601;
};
