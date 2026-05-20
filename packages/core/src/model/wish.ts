import type { Iso8601, ResidentId, UserId, WishId } from "./ids.js";

export const WISH_STATUSES = [
  "open",
  "inprogress",
  "fulfilled",
  "withdrawn",
] as const;

export type WishStatus = (typeof WISH_STATUSES)[number];

export type Wish = {
  readonly id: WishId;
  readonly residentId: ResidentId;
  readonly text: string;
  readonly status: WishStatus;
  readonly addedBy: UserId;
  readonly addedAt: Iso8601;
};
