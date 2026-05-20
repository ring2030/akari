import fs from "fs";
import path from "path";
const root = path.join(import.meta.dirname, "..");
const w = (rel, c) => { fs.writeFileSync(path.join(root, rel), c, "utf8"); console.log(rel); };

w("apps/web/src/lib/supabase/admin.ts", `import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
`);

w("apps/web/src/lib/audit.ts", `import type { AuditAction, Role } from "@akari/core";
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
`);

w("apps/web/src/lib/data-client.ts", `import { createAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";
import { hasServiceRoleKey, isDemoMode } from "./env";

export async function getWriteClient() {
  if (isDemoMode() && hasServiceRoleKey()) {
    return { client: createAdminClient(), mode: "demo" as const };
  }
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { client: null, mode: "unauthenticated" as const };
  return { client, mode: "auth" as const, userId: user.id };
}
`);

w("apps/web/src/lib/env.ts", `export function isDemoMode(): boolean {
  return process.env.AKARI_DEMO_MODE === "true";
}
export function hasSupabasePublicEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
export function hasServiceRoleKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
`);

w("apps/web/src/app/actions/mood.ts", fs.readFileSync(path.join(root, "apps/web/src/app/actions/mood.ts"), "utf8").replace("let actorRole", "const actorRole"));
