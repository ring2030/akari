import { createAdminClient } from "./supabase/admin";
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
