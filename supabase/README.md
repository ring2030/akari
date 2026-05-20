# Supabase（akari）

ローカル DB・Auth・RLS の開発環境です。

## 前提

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

```bash
npm install -g supabase
# または scoop install supabase
```

## コマンド

```bash
# プロジェクトルート（akari/）で実行

supabase start          # ローカル Postgres + Auth + Studio
supabase db reset       # マイグレーション再適用 + seed（seed 追加後）
supabase stop

# Studio: http://localhost:54323
# API:    http://localhost:54321
```

## マイグレーション

| ファイル | 内容 |
|---|---|
| `migrations/20260520100000_initial_schema.sql` | テーブル + RLS ヘルパー関数 |
| `migrations/20260520100001_rls_policies.sql` | Row Level Security ポリシー |

## RLS の要点

- **施設テナント**: `facility_id` でスタッフの閲覧範囲を制限
- **家族**: `connections` で紐づく入居者の `family_shareable` moments のみ
- **doctor**: `health = true` の moments のみ（同一施設）
- **監査ログ insert**: MVP では `service_role`（サーバー）経由

テスト草案: `tests/rls_family_isolation.sql`
