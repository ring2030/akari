"use server";

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
