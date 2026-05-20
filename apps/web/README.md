# @akari/web

入居者タブレット・介護士スマホ・家族 web の Next.js 14 アプリ。

## 予定ルート（MVP）

| パス | 利用者 | 機能 |
|---|---|---|
| `/resident/mood` | resident | きもち 4 択 |
| `/caregiver/moments/new` | caregiver | moments 30 秒入力 |
| `/family/feed` | family | moments フィード |
| `/invite/[token]` | 全ロール | 招待リンク認証 |

## 起動

```bash
# リポジトリルートで
supabase start
cp apps/web/.env.local.example apps/web/.env.local
# .env.local に supabase start の URL / keys を貼る
npm run dev
```

## 技術（ADR-0001 草案）

- Next.js 14 App Router
- Supabase（Postgres + Auth + RLS）— `../../supabase/`
- `@akari/core` でドメイン型・バリデーションを共有

## ルート（スキャフォールド）

| パス | 状態 |
|---|---|
| `/` | ナビゲーション |
| `/resident/mood` | UI のみ（Week 2 で保存） |
| `/caregiver/moments/new` | UI のみ |
| `/family/feed` | プレースホルダ |
| `/invite/[token]` | プレースホルダ |
