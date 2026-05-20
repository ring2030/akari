"use client";

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
