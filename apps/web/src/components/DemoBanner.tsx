import { hasServiceRoleKey, isDemoMode } from "@/lib/env";

export function DemoBanner() {
  if (!isDemoMode()) return null;
  const ready = hasServiceRoleKey();
  return (
    <div role="status" style={{ background: ready ? "var(--akari-accent-soft)" : "#fde8e8", border: "1px solid var(--akari-border)", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.85rem" }}>
      {ready ? (<><strong>デモモード</strong> — Supabase に保存されます（<code>AKARI_DEMO_MODE=true</code>）</>) : (<><strong>デモモード</strong> — <code>SUPABASE_SERVICE_ROLE_KEY</code> を .env.local に追加してください</>)}
    </div>
  );
}
