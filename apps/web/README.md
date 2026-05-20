# @akari/web

入居者タブレット・介護士スマホ・家族 web の Next.js アプリ（Week 1 以降で構築）。

## 予定ルート（MVP）

| パス | 利用者 | 機能 |
|---|---|---|
| `/resident/mood` | resident | きもち 4 択 |
| `/caregiver/moments/new` | caregiver | moments 30 秒入力 |
| `/family/feed` | family | moments フィード |
| `/invite/[token]` | 全ロール | 招待リンク認証 |

## 技術（ADR-0001 草案）

- Next.js 14 App Router
- Supabase（Postgres + Auth + RLS）
- `@akari/core` でドメイン型・バリデーションを共有
