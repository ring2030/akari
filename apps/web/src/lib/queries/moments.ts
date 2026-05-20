import { createAdminClient } from "../supabase/admin";
import { createClient } from "../supabase/server";
import { DEMO_RESIDENT_PROFILE_RESIDENT_ID } from "../demo-ids";
import { hasServiceRoleKey, isDemoMode } from "../env";

export type MomentFeedItem = {
  id: string;
  text: string;
  tags: string[];
  createdAt: string;
  residentName: string;
};

export type MoodRecentItem = { id: string; value: string; createdAt: string };

export async function fetchFamilyFeed(): Promise<{ items: MomentFeedItem[]; error?: string }> {
  if (isDemoMode() && hasServiceRoleKey()) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("moments")
      .select("id, text, tags, created_at, resident_id, residents(display_name)")
      .eq("visibility", "family_shareable")
      .not("shared_to_family_at", "is", null)
      .eq("resident_id", DEMO_RESIDENT_PROFILE_RESIDENT_ID)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) return { items: [], error: error.message };
    return {
      items: (data ?? []).map((row) => {
        const resident = row.residents as unknown as { display_name: string } | null;
        return { id: row.id, text: row.text, tags: row.tags ?? [], createdAt: row.created_at, residentName: resident?.display_name ?? "入居者" };
      }),
    };
  }
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { items: [], error: "ログインが必要です" };
  const { data, error } = await client
    .from("moments")
    .select("id, text, tags, created_at, resident_id, residents(display_name)")
    .eq("visibility", "family_shareable")
    .not("shared_to_family_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) return { items: [], error: error.message };
  return {
    items: (data ?? []).map((row) => {
      const resident = row.residents as unknown as { display_name: string } | null;
      return { id: row.id, text: row.text, tags: row.tags ?? [], createdAt: row.created_at, residentName: resident?.display_name ?? "入居者" };
    }),
  };
}

export async function fetchRecentMoods(residentId: string): Promise<MoodRecentItem[]> {
  if (!isDemoMode() || !hasServiceRoleKey()) return [];
  const admin = createAdminClient();
  const { data } = await admin.from("moods").select("id, value, created_at").eq("resident_id", residentId).order("created_at", { ascending: false }).limit(3);
  return (data ?? []).map((row) => ({ id: row.id, value: row.value, createdAt: row.created_at }));
}
