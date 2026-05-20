import Link from "next/link";

const MVP_ROUTES = [
  {
    href: "/resident/mood",
    label: "入居者 — きもちを残す",
    desc: "4 択ボタン（MVP Week 2）",
  },
  {
    href: "/caregiver/moments/new",
    label: "介護士 — 出来事を残す",
    desc: "30 秒入力（MVP Week 2）",
  },
  {
    href: "/family/feed",
    label: "家族 — 出来事を読む",
    desc: "フィード（MVP Week 3）",
  },
  {
    href: "/invite/demo-token",
    label: "招待リンク（デモ）",
    desc: "施設ごと招待（MVP Week 3）",
  },
] as const;

export default function HomePage() {
  return (
    <main>
      <h1>akari（灯）</h1>
      <p className="muted">
        暮らしの台所 — 入居者・介護士・家族を、やさしいテンポでつなぎます。
      </p>
      <p className="muted">
        🚧 Week 1 スキャフォールド。画面はプレースホルダです。
      </p>
      <ul className="nav-list">
        {MVP_ROUTES.map((route) => (
          <li key={route.href}>
            <Link href={route.href}>
              {route.label}
              <br />
              <span className="muted" style={{ fontWeight: 400 }}>
                {route.desc}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
