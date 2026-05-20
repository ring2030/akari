"use client";

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
