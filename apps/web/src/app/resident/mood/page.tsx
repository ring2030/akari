import { MOOD_VALUES, type MoodValue } from "@akari/core";

const MOOD_LABELS: Record<MoodValue, string> = {
  good: "よい",
  soso: "ふつう",
  tired: "つかれた",
  lonely: "さみしい",
};

export default function ResidentMoodPage() {
  return (
    <main>
      <h1>きもちを残す</h1>
      <p className="muted">いまの気持ちを、ボタンひとつで残せます。</p>
      <div className="mood-grid" role="group" aria-label="きもちの選択">
        {MOOD_VALUES.map((value) => (
          <button
            key={value}
            type="button"
            className="mood-btn"
            disabled
            title="Week 2 で Supabase に保存します"
          >
            {MOOD_LABELS[value]}
          </button>
        ))}
      </div>
      <p className="muted" style={{ marginTop: "1.5rem" }}>
        保存機能は Week 2 で接続予定です。
      </p>
    </main>
  );
}
