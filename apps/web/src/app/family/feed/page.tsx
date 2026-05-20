export default function FamilyFeedPage() {
  return (
    <main>
      <h1>出来事のフィード</h1>
      <p className="muted">ご家族に共有された、小さな出来事がここに並びます。</p>
      <div className="placeholder-card">
        <p>まだ出来事はありません。</p>
        <p className="muted">Week 3 で Supabase から読み込みます。</p>
      </div>
    </main>
  );
}
