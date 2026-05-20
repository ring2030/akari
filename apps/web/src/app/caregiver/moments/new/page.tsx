import { MOMENT_TAGS } from "@akari/core";

const TAG_LABELS: Record<(typeof MOMENT_TAGS)[number], string> = {
  meal: "食事",
  sleep: "休息",
  visit: "面会",
  smile: "笑顔",
  concern: "気になる",
  health: "健康",
};

export default function CaregiverMomentNewPage() {
  return (
    <main>
      <h1>出来事を残す</h1>
      <p className="muted">30 秒で、小さな出来事を残せます。</p>
      <div className="placeholder-card">
        <label htmlFor="moment-text">
          <span className="muted">出来事（最大 280 文字）</span>
        </label>
        <textarea
          id="moment-text"
          rows={4}
          disabled
          placeholder="例：午後のお茶を楽しそうに飲まれました"
          style={{ width: "100%", marginTop: "0.5rem" }}
        />
        <p className="muted" style={{ marginTop: "1rem" }}>
          タグ（Week 2）:
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {MOMENT_TAGS.map((tag) => (
            <span
              key={tag}
              style={{
                padding: "0.25rem 0.75rem",
                background: "var(--akari-accent-soft)",
                borderRadius: "999px",
                fontSize: "0.85rem",
              }}
            >
              {TAG_LABELS[tag]}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
