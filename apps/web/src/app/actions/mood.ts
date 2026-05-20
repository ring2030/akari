"use server";

import { validateMoodInput, type MoodValue } from "@akari/core";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./types";
import { writeAuditEvent } from "@/lib/audit";
import { DEMO_RESIDENT_PROFILE_RESIDENT_ID, DEMO_RESIDENT_USER_ID } from "@/lib/demo-ids";
import { getWriteClient } from "@/lib/data-client";
import { hasServiceRoleKey, isDemoMode } from "@/lib/env";

export async function createMood(value: MoodValue): Promise<ActionResult> {
  const validated = validateMoodInput({ value });
  if (!validated.ok) return { ok: false, error: validated.errors[0]?.message ?? "???????" };

  const write = await getWriteClient();
  if (write.mode === "unauthenticated" && (!isDemoMode() || !hasServiceRoleKey())) {
    return { ok: false, error: "????????Supabase ?????.env.local ??????????" };
  }
  const client = write.client;
  if (!client) return { ok: false, error: "???????" };

  let residentId: string;
  let actorId: string;
  const actorRole = "resident" as const;

  if (write.mode === "demo") {
    residentId = DEMO_RESIDENT_PROFILE_RESIDENT_ID;
    actorId = DEMO_RESIDENT_USER_ID;
  } else {
    const { data: profile } = await client.from("profiles").select("role, resident_id").eq("id", write.userId).single();
    if (!profile?.resident_id || profile.role !== "resident") return { ok: false, error: "????????????????" };
    residentId = profile.resident_id;
    actorId = write.userId;
  }

  const { data, error } = await client.from("moods").insert({ resident_id: residentId, value: validated.value.value, source: "self", note: validated.value.note ?? null }).select("id").single();
  if (error) return { ok: false, error: "???????????????????????" };

  await writeAuditEvent({ actorId, actorRole, action: "mood.create", targetType: "mood", targetId: data.id, meta: { value: validated.value.value } });
  revalidatePath("/resident/mood");
  revalidatePath("/family/feed");
  return { ok: true, message: "?????????" };
}
