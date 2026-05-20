import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..");
const w = (rel, c) => fs.writeFileSync(path.join(root, rel), c, "utf8");

w(
  "apps/web/src/lib/queries/moments.ts",
  `import { createAdminClient } from "../supabase/admin";
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
        const resident = row.residents as { display_name: string } | null;
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
      const resident = row.residents as { display_name: string } | null;
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
`,
);

w(
  "apps/web/src/app/actions/mood.ts",
  `"use server";

import { validateMoodInput, type MoodValue } from "@akari/core";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./types";
import { writeAuditEvent } from "@/lib/audit";
import { DEMO_RESIDENT_PROFILE_RESIDENT_ID, DEMO_RESIDENT_USER_ID } from "@/lib/demo-ids";
import { getWriteClient } from "@/lib/data-client";
import { hasServiceRoleKey, isDemoMode } from "@/lib/env";

export async function createMood(value: MoodValue): Promise<ActionResult> {
  const validated = validateMoodInput({ value });
  if (!validated.ok) return { ok: false, error: validated.errors[0]?.message ?? "入力が不正です" };

  const write = await getWriteClient();
  if (write.mode === "unauthenticated" && (!isDemoMode() || !hasServiceRoleKey())) {
    return { ok: false, error: "接続できません。Supabase を起動し、.env.local を設定してください。" };
  }
  const client = write.client;
  if (!client) return { ok: false, error: "認証が必要です" };

  let residentId: string;
  let actorId: string;
  let actorRole: "resident" | "caregiver" = "resident";

  if (write.mode === "demo") {
    residentId = DEMO_RESIDENT_PROFILE_RESIDENT_ID;
    actorId = DEMO_RESIDENT_USER_ID;
  } else {
    const { data: profile } = await client.from("profiles").select("role, resident_id").eq("id", write.userId).single();
    if (!profile?.resident_id || profile.role !== "resident") return { ok: false, error: "入居者としてログインしてください" };
    residentId = profile.resident_id;
    actorId = write.userId;
  }

  const { data, error } = await client.from("moods").insert({ resident_id: residentId, value: validated.value.value, source: "self", note: validated.value.note ?? null }).select("id").single();
  if (error) return { ok: false, error: "保存できませんでした。もう一度お試しください。" };

  await writeAuditEvent({ actorId, actorRole, action: "mood.create", targetType: "mood", targetId: data.id, meta: { value: validated.value.value } });
  revalidatePath("/resident/mood");
  revalidatePath("/family/feed");
  return { ok: true, message: "きもちを残しました" };
}
`,
);

w(
  "apps/web/src/app/actions/moment.ts",
  `"use server";

import { momentHealthFromTags, validateMomentInput, type MomentTag, type MomentVisibility } from "@akari/core";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./types";
import { writeAuditEvent } from "@/lib/audit";
import { DEMO_CAREGIVER_USER_ID } from "@/lib/demo-ids";
import { getWriteClient } from "@/lib/data-client";
import { hasServiceRoleKey, isDemoMode } from "@/lib/env";

export type CreateMomentInput = { residentId: string; text: string; tags: string[]; visibility: string };

export async function createMoment(input: CreateMomentInput): Promise<ActionResult> {
  const validated = validateMomentInput({ text: input.text, tags: input.tags, visibility: input.visibility });
  if (!validated.ok) return { ok: false, error: validated.errors[0]?.message ?? "入力が不正です" };

  const write = await getWriteClient();
  if (write.mode === "unauthenticated" && (!isDemoMode() || !hasServiceRoleKey())) {
    return { ok: false, error: "接続できません。Supabase を起動し、.env.local を設定してください。" };
  }
  const client = write.client;
  if (!client) return { ok: false, error: "認証が必要です" };

  let authorId: string;
  const actorRole = "caregiver" as const;
  if (write.mode === "demo") authorId = DEMO_CAREGIVER_USER_ID;
  else {
    const { data: profile } = await client.from("profiles").select("role").eq("id", write.userId).single();
    if (!profile || !["caregiver", "life-counselor", "facility-admin"].includes(profile.role)) return { ok: false, error: "介護士としてログインしてください" };
    authorId = write.userId;
  }

  const tags = validated.value.tags as MomentTag[];
  const visibility = validated.value.visibility as MomentVisibility;
  const row: Record<string, unknown> = { resident_id: input.residentId, author_id: authorId, text: validated.value.text, tags, visibility, health: momentHealthFromTags(tags) };
  if (visibility === "family_shareable") row.shared_to_family_at = new Date().toISOString();

  const { data, error } = await client.from("moments").insert(row).select("id").single();
  if (error) return { ok: false, error: "保存できませんでした。もう一度お試しください。" };

  await writeAuditEvent({ actorId: authorId, actorRole, action: "moment.create", targetType: "moment", targetId: data.id, meta: { visibility, tag_count: tags.length } });
  if (visibility === "family_shareable") await writeAuditEvent({ actorId: authorId, actorRole, action: "moment.share_to_family", targetType: "moment", targetId: data.id });

  revalidatePath("/caregiver/moments/new");
  revalidatePath("/family/feed");
  return { ok: true, message: "出来事を残しました" };
}
`,
);

w(
  "apps/web/src/app/layout.tsx",
  `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "akari（灯）",
  description: "高齢者施設で暮らす方の毎日を、もう少しだけあたたかく、もう少しだけ自由にする。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
`,
);

console.log("done");
