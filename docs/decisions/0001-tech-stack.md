# ADR-0001：技術スタックの選定

- Status: **Proposed**（Week 1 末までに Accepted へ）
- Date: 2026-05-20
- Supersedes: —

## 背景

`akari` は次の制約のもとで作ります。

| 制約 | 重み |
|---|:-:|
| マルチテナント（複数施設）が前提。Row Level Security 相当が効くデータ層 | ★★★ |
| オフライン耐性。施設 Wi-Fi は不安定。タブレット側にキューを持てる | ★★ |
| 小さく始められる。1 施設 50 入居者規模で十分に動く | ★★★ |
| 第三者 LLM への依存を最小化。ローカル要約・on-device 音声を優先肢に | ★★ |
| データ主権。施設・家族が「自分のデータを削除」を実行できる | ★★★ |
| 開発者 1〜2 名で 4 週間 MVP を作れる程度の学習コスト | ★★★ |
| ring-core（Next.js + Firebase）の知見を活かせる | ★ |
| オープンソース・自前ホスト可能 | ★★ |

## 候補

### 候補 A：Next.js 14 + Supabase（Postgres + Auth + Storage + RLS）

- **+** RLS が本物の Postgres レベルで効く。マルチテナント親和性が極めて高い
- **+** Auth / Storage / Realtime が同梱、4 週間 MVP に最適
- **+** 自前ホスト（supabase/self-hosted）に切り替え可、ベンダーロックは軽い
- **+** ring-core で使った Next.js の知見が直接活きる
- **−** Supabase 依存のメンタルモデルを学ぶ必要
- **−** Realtime は便利だが、オフライン同期は別途実装が必要

### 候補 B：Next.js 14 + Postgres（直接） + Drizzle ORM + Auth.js

- **+** すべて自前で組み立てるので、依存が最も少ない
- **+** Drizzle は型が強く、RLS との相性も改善中
- **+** ベンダーロックがほぼゼロ
- **−** Auth・Storage・Realtime を自分で書く分、4 週間 MVP には重い
- **−** 運用コスト（Postgres ホスト、バックアップ、移行）を自分で持つ

### 候補 C：SvelteKit + PocketBase

- **+** PocketBase は SQLite 1 ファイル運用。小規模施設の実体に近い
- **+** SvelteKit は学習コストが低く、表現力が高い
- **+** バックアップ = ファイルコピーで済む
- **−** マルチテナントを本気でやるには PocketBase の API ルール記述が複雑になる
- **−** Next.js / ring-core からの距離が大きい
- **−** スケール時の選択肢が限られる

### 候補 D：Tauri デスクトップ + SQLite（クライアント完結）

- **+** 究極のデータ主権。施設内 LAN 完結でクラウド不要にできる
- **+** オフラインがデフォルト
- **−** 家族 web を別建てにする必要がある（モデルの二重化）
- **−** 配布・更新の運用が施設側に負担
- **−** MVP の「家族 web で読む」ユースケースと噛み合わない

## 比較（重み付け）

| 観点 | 重み | A: Supabase | B: Drizzle | C: PocketBase | D: Tauri |
|---|:-:|:-:|:-:|:-:|:-:|
| マルチテナント（RLS） | ★★★ | ◎ | ○ | △ | × |
| オフライン耐性 | ★★ | ○ | ○ | ○ | ◎ |
| 小さく始める | ★★★ | ◎ | △ | ◎ | ○ |
| LLM 依存最小化 | ★★ | ○ | ○ | ○ | ◎ |
| データ主権・削除実行 | ★★★ | ○ | ○ | ○ | ◎ |
| 4 週間 MVP の達成性 | ★★★ | ◎ | △ | ○ | × |
| ring-core 知見の活用 | ★ | ◎ | ○ | × | △ |
| オープンソース・自前ホスト | ★★ | ○ | ◎ | ◎ | ◎ |

凡例：◎=非常に良い、○=良い、△=条件付き、×=合わない

## 判断（推奨）

**候補 A：Next.js 14 + Supabase（self-hosted 切替可）** を MVP の第一候補とする。

理由：

1. **RLS が本物の Postgres レベル** で効くため、施設単位のテナント分離と家族の閲覧範囲制御を、SQL ポリシーで一箇所に集約できる
2. **Auth / Storage / Realtime が同梱** されており、4 週間 MVP の達成性が突出して高い
3. **自前ホスト可能**（`supabase/supabase` の self-hosted 構成）なので、本番でデータ主権を譲らない選択肢を残せる
4. **ring-core の Next.js 知見** がそのまま活きる
5. ベンダーロックは Auth + RLS ポリシーに留まり、将来 Postgres 直接（候補 B）へ移行する余地がある

## 影響

### 短期（MVP）

- `apps/web` を Next.js 14（App Router）で構築
- DB は Supabase Postgres、認証は Supabase Auth、Storage は当面使わない（moments は文字のみ）
- ローカル開発：`supabase start` で Docker 上に立てる
- 招待トークンは Supabase Auth と独自 HMAC トークンの併用（招待リンクは独自で、最終的なセッションは Supabase Auth）

### 中期（Phase 2 以降）

- 視線・音声 UI は `apps/tablet`（Next.js or Tauri）として分割の可能性
- Realtime は family フィードのリアクション通知に限定的に使う

### リスクと退却路

| リスク | 退却路 |
|---|---|
| Supabase の API ルールが施設別ロールで複雑化 | RLS ポリシーをユニットテスト化（pgTAP）し、複雑度を可視化 |
| Supabase クラウド側の料金や利用規約が変化 | self-hosted 構成へ切替（同じスキーマで動く） |
| 将来 Postgres 直接（候補 B）に移したい | Drizzle を最初から ORM 層に挟む（Supabase クライアントの SQL も Drizzle を経由可） |

## 決め切るためにやること（Week 1）

- [ ] `supabase start` で MVP 用 schema の draft を作る（`resident`, `mood`, `moment`, `invite`, `audit_event`）
- [ ] RLS ポリシーの「家族は自家族のみ可視」を Postgres レベルで書き、SQL テストで通す
- [ ] self-hosted 構成のデプロイ手順を `docs/spec/deployment.md` に置く（草案）
- [ ] 開発機（Windows / macOS / Linux）で `supabase start` が落ちないことを 2 名で確認
- [ ] 上記 4 つを確認できたら、本 ADR を **Accepted** に書き換える PR を出す
