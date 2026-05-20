import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..");

const files = {
  "apps/web/src/lib/demo-ids.ts": `/** supabase/seed.sql と一致する固定 ID */

export const DEMO_FACILITY_ID = "11111111-1111-4111-8111-111111111101";

export const DEMO_RESIDENTS = [
  { id: "11111111-1111-4111-8111-111111111201", name: "やすこ" },
  { id: "11111111-1111-4111-8111-111111111202", name: "いちろう" },
  { id: "11111111-1111-4111-8111-111111111203", name: "みち" },
] as const;

export const DEMO_RESIDENT_USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2";
export const DEMO_RESIDENT_PROFILE_RESIDENT_ID =
  "11111111-1111-4111-8111-111111111201";

export const DEMO_CAREGIVER_USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1";
export const DEMO_FAMILY_USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3";
`,
  "apps/web/src/app/resident/mood/page.tsx": `import { DemoBanner } from "@/components/DemoBanner";
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
`,
  "apps/web/src/app/family/feed/page.tsx": `import { DemoBanner } from "@/components/DemoBanner";
import { MomentFeed } from "@/components/MomentFeed";
import { fetchFamilyFeed } from "@/lib/queries/moments";

export default async function FamilyFeedPage() {
  const { items, error } = await fetchFamilyFeed();

  return (
    <main>
      <DemoBanner />
      <h1>出来事のフィード</h1>
      <p className="muted">ご家族に共有された、小さな出来事がここに並びます。</p>
      <MomentFeed items={items} error={error} />
    </main>
  );
}
`,
  "apps/web/src/app/page.tsx": `import Link from "next/link";

const MVP_ROUTES = [
  { href: "/resident/mood", label: "入居者 — きもちを残す", desc: "4 択ボタン" },
  { href: "/caregiver/moments/new", label: "介護士 — 出来事を残す", desc: "30 秒入力" },
  { href: "/family/feed", label: "家族 — 出来事を読む", desc: "フィード" },
  { href: "/invite/demo-token", label: "招待リンク（デモ）", desc: "Week 3" },
] as const;

export default function HomePage() {
  return (
    <main>
      <h1>akari（灯）</h1>
      <p className="muted">暮らしの台所 — 入居者・介護士・家族を、やさしいテンポでつなぎます。</p>
      <p className="muted">Week 2: きもち・出来事の保存と家族フィード（デモモード対応）</p>
      <ul className="nav-list">
        {MVP_ROUTES.map((route) => (
          <li key={route.href}>
            <Link href={route.href}>
              {route.label}
              <br />
              <span className="muted" style={{ fontWeight: 400 }}>{route.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
`,
};

for (const [rel, content] of Object.entries(files)) {
  const full = path.join(root, rel);
  fs.writeFileSync(full, content, "utf8");
  console.log("wrote", rel);
}
