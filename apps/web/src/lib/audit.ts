import type { AuditAction, Role } from "@akari/core";
import { createAdminClient } from "./supabase/admin";

type AuditParams = {
  actorId: string;
  actorRole: Role;
  action: AuditAction;
  targetType?: "resident" | "moment" | "mood" | "user";
  targetId?: string;
  meta?: Record<string, string | number | boolean>;
};

export async function writeAuditEvent(params: AuditParams): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("audit_events").insert({
    actor_id: params.actorId,
    actor_role: params.actorRole,
    action: params.action,
    target_type: params.targetType ?? null,
    target_id: params.targetId ?? null,
    meta: params.meta ?? {},
  });
  if (error) console.error("[audit] insert failed", error.message);
}
