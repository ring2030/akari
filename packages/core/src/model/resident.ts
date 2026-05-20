import type { FacilityId, Iso8601, LocaleId, ResidentId } from "./ids.js";

export type Resident = {
  readonly id: ResidentId;
  readonly facilityId: FacilityId;
  /** 表示用の名前。本名と一致しなくてよい */
  readonly displayName: string;
  /** 必要なときだけ。日付までは保持しない */
  readonly yearOfBirth?: number;
  readonly preferredLocale: LocaleId;
  readonly createdAt: Iso8601;
  /** 退所・逝去後の論理削除 */
  readonly archivedAt?: Iso8601;
};
