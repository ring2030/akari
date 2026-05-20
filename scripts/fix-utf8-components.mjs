import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..");

const write = (rel, content) => {
  fs.writeFileSync(path.join(root, rel), content, "utf8");
  console.log("wrote", rel);
};

write(
  "apps/web/src/components/DemoBanner.tsx",
  `import { hasServiceRoleKey, isDemoMode } from "@/lib/env";

export function DemoBanner() {
  if (!isDemoMode()) return null;
  const ready = hasServiceRoleKey();
  return (
    <div role="status" style={{ background: ready ? "var(--akari-accent-soft)" : "#fde8e8", border: "1px solid var(--akari-border)", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.85rem" }}>
      {ready ? (<><strong>デモモード</strong> — Supabase に保存されます（<code>AKARI_DEMO_MODE=true</code>）</>) : (<><strong>デモモード</strong> — <code>SUPABASE_SERVICE_ROLE_KEY</code> を .env.local に追加してください</>)}
    </div>
  );
}
`,
);

write(
  "apps/web/src/components/MoodPicker.tsx",
  `"use client";

import { MOOD_VALUES, type MoodValue } from "@akari/core";
import { useState, useTransition } from "react";
import { createMood } from "@/app/actions/mood";

const MOOD_LABELS: Record<MoodValue, string> = { good: "よい", soso: "ふつう", tired: "つかれた", lonely: "さみしい" };

type Props = { recent?: { value: string; createdAt: string }[] };

export function MoodPicker({ recent = [] }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSelect(value: MoodValue) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await createMood(value);
      if (result.ok) setMessage(result.message ?? "きもちを残しました");
      else setError(result.error);
    });
  }

  return (
    <>
      <div className="mood-grid" role="group" aria-label="きもちの選択">
        {MOOD_VALUES.map((value) => (
          <button key={value} type="button" className="mood-btn" disabled={pending} onClick={() => handleSelect(value)}>
            {MOOD_LABELS[value]}
          </button>
        ))}
      </div>
      {pending && <p className="muted">保存しています…</p>}
      {message && <p role="status" style={{ color: "var(--akari-accent)", marginTop: "1rem" }}>{message}</p>}
      {error && <p role="alert" style={{ color: "#b33", marginTop: "1rem" }}>{error}</p>}
      {recent.length > 0 && (
        <footer style={{ marginTop: "2rem" }}>
          <p className="muted">直近のきもち</p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {recent.map((m, i) => (
              <li key={i} className="muted" style={{ fontSize: "0.9rem" }}>
                {MOOD_LABELS[m.value as MoodValue] ?? m.value} — {new Date(m.createdAt).toLocaleString("ja-JP")}
              </li>
            ))}
          </ul>
        </footer>
      )}
    </>
  );
}
`,
);

write(
  "apps/web/src/components/MomentFeed.tsx",
  `import type { MomentFeedItem } from "@/lib/queries/moments";

const TAG_LABELS: Record<string, string> = { meal: "食事", sleep: "休息", visit: "面会", smile: "笑顔", concern: "気になる", health: "健康" };

export function MomentFeed({ items, error }: { items: MomentFeedItem[]; error?: string }) {
  if (error) {
    return (
      <div className="placeholder-card" role="alert">
        <p>{error}</p>
        <p className="muted">Supabase を起動し、<code>supabase db reset</code> 後に再読み込みしてください。</p>
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="placeholder-card">
        <p>まだ出来事はありません。</p>
        <p className="muted">介護士が「家族にも伝える」で残すと、ここに表示されます。</p>
      </div>
    );
  }
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {items.map((item) => (
        <li key={item.id} className="placeholder-card" style={{ marginBottom: "0.75rem", borderStyle: "solid" }}>
          <p style={{ margin: "0 0 0.5rem" }}>{item.text}</p>
          <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
            {item.residentName} · {new Date(item.createdAt).toLocaleString("ja-JP")}
            {item.tags.length > 0 && <> · {item.tags.map((t) => TAG_LABELS[t] ?? t).join("、")}</>}
          </p>
        </li>
      ))}
    </ul>
  );
}
`,
);

write(
  "apps/web/src/components/MomentForm.tsx",
  `"use client";

import { MOMENT_TAGS, MOMENT_VISIBILITIES } from "@akari/core";
import { useState, useTransition } from "react";
import { createMoment } from "@/app/actions/moment";

const TAG_LABELS: Record<(typeof MOMENT_TAGS)[number], string> = { meal: "食事", sleep: "休息", visit: "面会", smile: "笑顔", concern: "気になる", health: "健康" };

export function MomentForm({ residents }: { residents: readonly { id: string; name: string }[] }) {
  const [residentId, setResidentId] = useState(residents[0]?.id ?? "");
  const [text, setText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState("family_shareable");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await createMoment({ residentId, text, tags, visibility });
      if (result.ok) { setMessage(result.message ?? "出来事を残しました"); setText(""); setTags([]); }
      else setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="placeholder-card">
      <label htmlFor="resident"><span className="muted">入居者</span></label>
      <select id="resident" value={residentId} onChange={(e) => setResidentId(e.target.value)} style={{ width: "100%", marginTop: "0.5rem", minHeight: "var(--tap-min)" }}>
        {residents.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
      </select>
      <label htmlFor="moment-text" style={{ display: "block", marginTop: "1rem" }}><span className="muted">出来事（最大 280 文字）</span></label>
      <textarea id="moment-text" rows={4} maxLength={280} value={text} onChange={(e) => setText(e.target.value)} placeholder="例：午後のお茶を楽しそうに飲まれました" style={{ width: "100%", marginTop: "0.5rem" }} required />
      <p className="muted" style={{ marginTop: "1rem" }}>タグ</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {MOMENT_TAGS.map((tag) => (
          <button key={tag} type="button" onClick={() => setTags((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag])} style={{ padding: "0.35rem 0.85rem", minHeight: "var(--tap-min)", background: tags.includes(tag) ? "var(--akari-accent)" : "var(--akari-accent-soft)", border: "1px solid var(--akari-border)", borderRadius: "999px", fontSize: "0.85rem", cursor: "pointer" }}>{TAG_LABELS[tag]}</button>
        ))}
      </div>
      <fieldset style={{ marginTop: "1rem", border: "none", padding: 0 }}>
        <legend className="muted">共有</legend>
        {MOMENT_VISIBILITIES.map((v) => (
          <label key={v} style={{ display: "block", marginTop: "0.5rem" }}>
            <input type="radio" name="visibility" value={v} checked={visibility === v} onChange={() => setVisibility(v)} /> {v === "family_shareable" ? "家族にも伝える" : "介護士だけ"}
          </label>
        ))}
      </fieldset>
      <button type="submit" disabled={pending || !text.trim()} className="mood-btn" style={{ width: "100%", marginTop: "1.25rem" }}>{pending ? "保存しています…" : "残す"}</button>
      {message && <p role="status" style={{ color: "var(--akari-accent)", marginTop: "1rem" }}>{message}</p>}
      {error && <p role="alert" style={{ color: "#b33", marginTop: "1rem" }}>{error}</p>}
    </form>
  );
}
`,
);
