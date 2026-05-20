# デプロイとローカル開発（草案）

> Status: Draft — ADR-0001 の Accept 条件のひとつ

## ローカル（推奨）

### 1. 依存関係

```bash
# リポジトリルート
npm install

# Supabase CLI（未導入の場合）
npm install -g supabase
```

### 2. Supabase 起動（Docker 必須）

```bash
supabase start
```

起動後に表示される値を `apps/web/.env.local` にコピーします。

### 3. Web アプリ

```bash
cp apps/web/.env.local.example apps/web/.env.local
npm run dev
```

- アプリ: http://localhost:3000
- Supabase Studio: http://localhost:54323

## 環境変数（`apps/web`）

| 変数 | 説明 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 匿名キー（ブラウザ可） |
| `SUPABASE_SERVICE_ROLE_KEY` | サーバー専用（監査ログ insert 等）。**公開禁止** |

## 本番候補

| 方式 | 向き |
|---|---|
| Supabase Cloud + Vercel | 最速で MVP デモ |
| Supabase self-hosted + 自前 VPS | データ主権重視 |
| Postgres 直接（ADR 候補 B） | 将来の退却路 |

## CI

GitHub Actions は現時点で **Supabase を起動しない**（Docker コスト）。
DB マイグレーションの検証はローカル `supabase db reset` と、将来の `supabase test db` で行います。

## セキュリティチェックリスト（デプロイ前）

- [ ] `SUPABASE_SERVICE_ROLE_KEY` がクライアントバンドルに含まれていない
- [ ] RLS が全テーブルで有効
- [ ] `main` 直 push 禁止・PR レビュー必須
- [ ] 監査ログの `meta` に PII が入っていない
