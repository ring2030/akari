/** Branded ID types — 生の string と混ざらないようにする */

export type FacilityId = string & { readonly __brand: "FacilityId" };
export type ResidentId = string & { readonly __brand: "ResidentId" };
export type MoodId = string & { readonly __brand: "MoodId" };
export type MomentId = string & { readonly __brand: "MomentId" };
export type WishId = string & { readonly __brand: "WishId" };
export type ConnectionId = string & { readonly __brand: "ConnectionId" };
export type MessageId = string & { readonly __brand: "MessageId" };
export type UserId = string & { readonly __brand: "UserId" };
export type AuditEventId = string & { readonly __brand: "AuditEventId" };
export type InvitationId = string & { readonly __brand: "InvitationId" };

/** ISO 8601 UTC 文字列（例: 2026-05-20T10:00:00.000Z） */
export type Iso8601 = string & { readonly __brand: "Iso8601" };

export type LocaleId = "ja-jp";

export function asFacilityId(id: string): FacilityId {
  return id as FacilityId;
}

export function asResidentId(id: string): ResidentId {
  return id as ResidentId;
}

export function asUserId(id: string): UserId {
  return id as UserId;
}

export function asIso8601(value: string): Iso8601 {
  return value as Iso8601;
}
