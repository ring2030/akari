type Props = {
  params: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: Props) {
  const { token } = await params;

  return (
    <main>
      <h1>招待リンク</h1>
      <p className="muted">
        施設から届いた招待です。Week 3 でトークン検証とログインを接続します。
      </p>
      <div className="placeholder-card">
        <p className="muted">トークン（先頭のみ表示）:</p>
        <code>{token.slice(0, 8)}…</code>
      </div>
    </main>
  );
}
