import type { AuditEventId, Iso8601, UserId } from "./ids.js";
import type { Role } from "./roles.js";

export const AUDIT_ACTIONS = [
  "mood.create",
  "moment.create",
  "moment.share_to_family",
  "invite.issue",
  "invite.consume",
  "role.change",
  "delete.request",
  "delete.execute",
  "login.success",
  "login.failure",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_TARGET_TYPES = [
  "resident",
  "moment",
  "mood",
  "user",
] as const;

export type AuditTargetType = (typeof AUDIT_TARGET_TYPES)[number];

/** meta に PII を含めない */
export type AuditMeta = Readonly<Record<string, string | number | boolean>>;

export type AuditEvent = {
  readonly id: AuditEventId;
  readonly actorId: UserId;
  readonly actorRole: Role;
  readonly action: AuditAction;
  readonly targetType?: AuditTargetType;
  readonly targetId?: string;
  readonly at: Iso8601;
  readonly meta?: AuditMeta;
};
