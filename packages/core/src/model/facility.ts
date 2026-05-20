import type { FacilityId, Iso8601, LocaleId } from "./ids.js";

export type Facility = {
  readonly id: FacilityId;
  readonly name: string;
  readonly preferredLocale: LocaleId;
  readonly createdAt: Iso8601;
};
