import type { MomentFeedItem } from "@/lib/queries/moments";

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
