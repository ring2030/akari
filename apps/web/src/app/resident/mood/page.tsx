import { DemoBanner } from "@/components/DemoBanner";
import { MoodPicker } from "@/components/MoodPicker";
import { DEMO_RESIDENT_PROFILE_RESIDENT_ID } from "@/lib/demo-ids";
import { fetchRecentMoods } from "@/lib/queries/moments";

export default async function ResidentMoodPage() {
  const recent = await fetchRecentMoods(DEMO_RESIDENT_PROFILE_RESIDENT_ID);

  return (
    <main>
      <DemoBanner />
      <h1>きもちを残す</h1>
      <p className="muted">いまの気持ちを、ボタンひとつで残せます。</p>
      <MoodPicker
        recent={recent.map((m) => ({
          value: m.value,
          createdAt: m.createdAt,
        }))}
      />
    </main>
  );
}
