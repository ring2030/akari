# データモデル対応表（TypeScript ↔ Postgres）

> Status: Draft  
> 正: `packages/core/src/model/`（TypeScript）と `supabase/migrations/`（Postgres）

## 概要

| TypeScript（@akari/core） | Postgres テーブル | 備考 |
|---|---|---|
| `Facility` | `facilities` | テナント境界 |
| `Resident` | `residents` | `facility_id` で施設に所属 |
| — | `profiles` | `auth.users` と akari ロールの橋（TS 型は Week 2 で追加） |
| `Mood` | `moods` | 4 値 + note ≤ 140 |
| `Moment` | `moments` | `tags` は `text[]`、`health` は trigger で同期 |
| `Connection` | `connections` | family ↔ resident |
| `Message` | — | Phase 2（MVP 外） |
| `Wish` | — | Phase 2（MVP 外） |
| — | `invitations` | 招待トークン（hash のみ保存） |
| `AuditEvent` | `audit_events` | `meta` は jsonb、PII 禁止 |

## カラム対応

### facilities ↔ Facility

| TS フィールド | DB カラム | 型 |
|---|---|---|
| `id` | `id` | `uuid` |
| `name` | `name` | `text` |
| `preferredLocale` | `preferred_locale` | `text` = `'ja-jp'` |
| `createdAt` | `created_at` | `timestamptz` |

### residents ↔ Resident

| TS フィールド | DB カラム | 型 |
|---|---|---|
| `id` | `id` | `uuid` |
| `facilityId` | `facility_id` | `uuid` FK |
| `displayName` | `display_name` | `text` |
| `yearOfBirth?` | `year_of_birth` | `int` |
| `preferredLocale` | `preferred_locale` | `text` |
| `createdAt` | `created_at` | `timestamptz` |
| `archivedAt?` | `archived_at` | `timestamptz` |

### moods ↔ Mood

| TS フィールド | DB カラム | 型 / 制約 |
|---|---|---|
| `id` | `id` | `uuid` |
| `residentId` | `resident_id` | `uuid` FK |
| `value` | `value` | `good \| soso \| tired \| lonely` |
| `source` | `source` | `self \| caregiver_observed` |
| `note?` | `note` | `text`, ≤ 140 |
| `createdAt` | `created_at` | `timestamptz` |

バリデーション: `validateMoodInput()`（`@akari/core`）

### moments ↔ Moment

| TS フィールド | DB カラム | 型 / 制約 |
|---|---|---|
| `id` | `id` | `uuid` |
| `residentId` | `resident_id` | `uuid` FK |
| `authorId` | `author_id` | `uuid` FK → `auth.users` |
| `text` | `text` | trim 後 1〜280 文字 |
| `tags` | `tags` | `text[]`, 列挙子チェック |
| `visibility` | `visibility` | `caregiver_only \| family_shareable` |
| `health` | `health` | `boolean`, `'health' ∈ tags` で自動 |
| `createdAt` | `created_at` | `timestamptz` |
| `sharedToFamilyAt?` | `shared_to_family_at` | `family_shareable` 時は必須 |

バリデーション: `validateMomentInput()` + `momentHealthFromTags()`

### connections ↔ Connection

| TS フィールド | DB カラム | 型 |
|---|---|---|
| `id` | `id` | `uuid` |
| `residentId` | `resident_id` | `uuid` FK |
| `familyUserId` | `family_user_id` | `uuid` FK → `auth.users` |
| `relation` | `relation` | 6 値 check |
| `createdAt` | `created_at` | `timestamptz` |

### audit_events ↔ AuditEvent

| TS フィールド | DB カラム | 型 |
|---|---|---|
| `id` | `id` | `uuid` |
| `actorId` | `actor_id` | `uuid` |
| `actorRole` | `actor_role` | `text` |
| `action` | `action` | 列挙 check |
| `targetType?` | `target_type` | `text` |
| `targetId?` | `target_id` | `text` |
| `at` | `at` | `timestamptz` |
| `meta?` | `meta` | `jsonb`（PII 禁止） |

## RLS とロールの対応

| ロール | moods SELECT | moments SELECT | 備考 |
|---|---|---|---|
| `resident` | 自分のみ | —（MVP） | mood 投稿のみ |
| `caregiver` | 自施設 | 自施設 | 投稿可 |
| `life-counselor` | 自施設 | 自施設 | 投稿可 |
| `facility-admin` | 自施設 | 自施設 | 招待・監査 |
| `family` | — | 紐づく入居者の `family_shareable` のみ | **他家族のデータ不可** |
| `doctor` | — | `health = true` のみ | 同一施設 |

詳細 SQL: `supabase/migrations/20260520100001_rls_policies.sql`

## ID のブランディング

TypeScript では `ResidentId` 等の branded type を使い、DB では `uuid` です。
アプリ層で `asResidentId(row.id)` に変換します（Week 2 の mapper で共通化）。

## 変更手順

1. `docs/spec/akari-protocol-1.0.md` を更新
2. `packages/core/src/model/` を更新
3. `supabase/migrations/YYYYMMDDHHMMSS_*.sql` を追加
4. このファイルの対応表を更新
