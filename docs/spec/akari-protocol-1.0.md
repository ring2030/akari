# akari Protocol 1.0（仕様文書 / 草案）

> Status: **Draft**（草案。実装で変更があれば PR で更新する）
> Version: `1.0.0-draft.1`
> Last updated: 2026-05-20

この文書は、`akari` が **何を扱い、何を扱わないか** を、コードより先に定める「契約」です。
コードがこの文書と矛盾するときは、コードか文書のどちらが正しいかを **PR で合意してから** 進めます。

---

## 目次

- [1. 製品定義](#1-製品定義)
  - [1.1 目的](#11-目的)
  - [1.2 設計原則](#12-設計原則)
  - [1.3 やらないこと](#13-やらないこと)
- [2. 利用者とロール](#2-利用者とロール)
  - [2.1 ロール一覧](#21-ロール一覧)
  - [2.2 権限マトリクス](#22-権限マトリクス)
- [3. 中核データモデル](#3-中核データモデル)
  - [3.1 全体像](#31-全体像)
  - [3.2 各モデル](#32-各モデル)
- [4. ユースケース（MVP）](#4-ユースケースmvp)
- [5. 認証と認可](#5-認証と認可)
- [6. プライバシーと削除権](#6-プライバシーと削除権)
- [7. 監査ログ](#7-監査ログ)
- [8. ロケールと文言](#8-ロケールと文言)
- [9. ring-core / @ring-open/core との関係](#9-ring-core--ring-opencore-との関係)
- [10. 用語集](#10-用語集)
- [11. 変更履歴](#11-変更履歴)

---

## 1. 製品定義

### 1.1 目的

`akari` は、**高齢者施設で暮らす方の毎日を、もう少しだけあたたかく、もう少しだけ自由にする** ためのオープンソース・ソフトウェアです。

「ナースコール」ではありません。
「介護記録システム」でもありません。
**入居者・介護士・家族の三者を、やさしいテンポでつなぐ "暮らしの台所"** です。

### 1.2 設計原則

1. **尊厳ファースト** — 監視ではなく寄り添い。録音・録画は本人が望むときだけ。
2. **介護士を増やせない前提** — 既存スタッフの手数を減らす設計だけが許される。
3. **家族を周辺機能にしない** — 家族は「読む人」ではなく「参加する人」。

### 1.3 やらないこと

- 医療診断・バイタル管理・処方推奨
- 行動監視・徘徊検知・離床通報など、通報系の動線
- 介護記録ソフトの完全代替（既存システムを尊重）
- 身体拘束を補助しうる UX（自動施錠、退去防止アラート 等）
- 隠れた録音・録画・位置情報の常時収集

---

## 2. 利用者とロール

### 2.1 ロール一覧

| ロール ID | 名称 | 主体 |
|---|---|---|
| `resident` | 入居者 | 高齢者施設に住んでいる本人 |
| `caregiver` | 介護士 | 日々のケアを行うスタッフ |
| `life-counselor` | 生活相談員 | 家族関係や暮らしの調整役 |
| `facility-admin` | 施設長 | 施設運営の責任者 |
| `family` | 家族 | 入居者の親族・後見人 |
| `doctor` | 主治医・往診医 | 健康関連 moments のみ限定読取 |

`nurse_admin` / `nurse` / `viewer` は **使わない**（ring-core 由来の語彙）。

### 2.2 権限マトリクス

| 操作 | resident | caregiver | life-counselor | facility-admin | family | doctor |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| `mood` 投稿（自分） | ◎ | — | — | — | — | — |
| `mood` 閲覧（担当） | — | ◎ | ◎ | ◎ | △ | — |
| `moments` 投稿 | — | ◎ | ◎ | ◎ | — | — |
| `moments` 閲覧（担当） | △※1 | ◎ | ◎ | ◎ | ◎※2 | △※3 |
| `wishes` 追加 | ◎ | ◎ | ◎ | ◎ | ◎ | — |
| 招待発行 | — | — | — | ◎ | — | — |
| ロール変更 | — | — | — | ◎ | — | — |
| 監査ログ閲覧 | — | — | — | ◎ | — | — |
| 削除要請の発行 | ◎ | — | — | — | ◎ | — |
| 削除の実行 | — | — | — | ◎ | — | — |

凡例：◎=可、△=条件付き可、—=不可

- ※1 resident は自分に紐づく moments のうち、本人公開と設定されたもののみ閲覧可
- ※2 family は **自分が紐づく入居者のみ**。担当外の閲覧は不可
- ※3 doctor は `health: true` のタグが付いた moments のみ閲覧可

---

## 3. 中核データモデル

### 3.1 全体像

```
Facility
  └── Resident
        ├── DailyRhythm[]
        ├── Mood[]
        ├── Moment[]      ← 中心概念
        ├── Wish[]
        └── Connection[]
              └── Message[]
Audit
  └── AuditEvent[]
Auth
  ├── Invitation
  └── Session
```

「コール」は中心概念ではない。**Moment が中心**。

### 3.2 各モデル

> 型は TypeScript 風の擬似コード。実際の型は `packages/core/src/model/` に置く。

#### 3.2.1 Resident（入居者）

```ts
type Resident = {
  id: ResidentId;
  facilityId: FacilityId;
  displayName: string;        // 表示用の名前。本名と一致しなくてよい
  yearOfBirth?: number;       // 必要なときだけ。日付までは保持しない
  preferredLocale: 'ja-jp';
  createdAt: Iso8601;
  archivedAt?: Iso8601;       // 退所・逝去後の論理削除
};
```

#### 3.2.2 Mood（きもち）

```ts
type Mood = {
  id: MoodId;
  residentId: ResidentId;
  value: 'good' | 'soso' | 'tired' | 'lonely';  // 4 値固定（MVP）
  source: 'self' | 'caregiver_observed';
  note?: string;              // 任意。140 文字まで
  createdAt: Iso8601;
};
```

#### 3.2.3 Moment（出来事）

```ts
type Moment = {
  id: MomentId;
  residentId: ResidentId;
  authorId: UserId;
  text: string;                       // 280 文字まで。30 秒で書ける長さ
  tags: Array<'meal' | 'sleep' | 'visit' | 'smile' | 'concern' | 'health'>;
  visibility: 'caregiver_only' | 'family_shareable';
  health: boolean;                    // doctor への可視化フラグ
  createdAt: Iso8601;
  sharedToFamilyAt?: Iso8601;         // 家族への共有が確定したタイミング
};
```

#### 3.2.4 Wish（願い）

```ts
type Wish = {
  id: WishId;
  residentId: ResidentId;
  text: string;
  status: 'open' | 'inprogress' | 'fulfilled' | 'withdrawn';
  addedBy: UserId;
  addedAt: Iso8601;
};
```

#### 3.2.5 Connection / Message

```ts
type Connection = {
  id: ConnectionId;
  residentId: ResidentId;
  familyUserId: UserId;
  relation: 'child' | 'spouse' | 'sibling' | 'grandchild' | 'guardian' | 'other';
  createdAt: Iso8601;
};

type Message = {
  id: MessageId;
  connectionId: ConnectionId;
  fromId: UserId;
  text: string;
  createdAt: Iso8601;
};
```

#### 3.2.6 AuditEvent

```ts
type AuditEvent = {
  id: AuditEventId;
  actorId: UserId;
  actorRole: Role;
  action:
    | 'mood.create' | 'moment.create' | 'moment.share_to_family'
    | 'invite.issue' | 'invite.consume'
    | 'role.change' | 'delete.request' | 'delete.execute'
    | 'login.success' | 'login.failure';
  targetType?: 'resident' | 'moment' | 'mood' | 'user';
  targetId?: string;
  at: Iso8601;
  meta?: Record<string, string | number | boolean>; // PII を含めない
};
```

> 詳細スキーマ・インデックス・制約は実装時に `docs/spec/data-model.md` に分割します。

---

## 4. ユースケース（MVP）

### UC-01：入居者が「きもち」を残す

1. 入居者が居室の据え置きタブレットを開く
2. 表示は 4 つの大きなボタン（`good` / `soso` / `tired` / `lonely`）
3. 1 タップで保存。確認ダイアログは出さない（ためらわせない）
4. 直前 3 件の自分のきもちを小さくフッタ表示（取り消したくなったら 5 分以内なら取り消せる）

### UC-02：介護士が moments を 30 秒で残す

1. スマホの常駐ボタンから入力フォームを開く
2. 対象入居者を選ぶ（直近対応 3 名がトップに）
3. テキスト最大 280 文字 + タグ複数 + 公開先（介護士限定 / 家族共有可）
4. 「家族共有可」を選んだ moment は、施設長 or 生活相談員のレビューを経て家族に届く（MVP は即時、レビューは Phase 2）

### UC-03：家族が moments を読む

1. 招待リンクから家族 web に入る
2. 紐づく入居者の moments を時系列で見る
3. 1 件にハートを送れる（read だけで終わらせない）
4. 必要に応じてメッセージを送る（介護士が次回ケア時に伝える）

### UC-04：施設長が招待を発行する

1. ロールと対象を選び、招待リンクを生成（短時間有効、一度限り使用）
2. 発行は監査ログに残る

### UC-05：本人 / 家族が削除を要請する

1. 設定画面から削除を要請（理由は任意）
2. 施設長が確認の上、削除を実行
3. 関連データはカスケード削除、ただし **監査ログには「削除した事実」のみ残す**

---

## 5. 認証と認可

- 招待トークン：HMAC + base64url。**短時間有効・一度限り使用**
- セッショントークン：HMAC + base64url、cookie で配布、SameSite=Lax、Secure 必須
- パスワード：**Argon2id（推奨）または bcrypt(cost ≥ 12)**
- レートリミット：
  - 認証エンドポイント：1 IP あたり 10 req / 分
  - 招待エンドポイント：1 IP あたり 5 req / 分
- 認可：ロール表に基づくミドルウェアを必ず経由する（直アクセス禁止）

詳細実装は `@ring-open/core/auth` を踏襲しつつ、パスワード周りは差し替え。

---

## 6. プライバシーと削除権

- データ感度クラス C1〜C4（[SECURITY.md](../../SECURITY.md) 参照）
- PII スクラブ：ロガー・エラー出力・テレメトリは共通スクラブ関数を通す
- 削除権：本人 / 家族の要請に **30 日以内** に応える
- 既定の保存期間：moments と mood は 36 ヶ月、その後は集約（フェーズ 2 で定義）

---

## 7. 監査ログ

- すべての重要操作は `AuditEvent` として保存
- `meta` フィールドに PII を入れない（数値・列挙値・ID 参照のみ）
- 改竄不能を目指す（MVP では append-only、Phase 2 で署名チェーン）

---

## 8. ロケールと文言

- MVP は `ja-jp` のみ
- 文言は **敬体・命令形を避ける**。「〜してください」より「〜していただけます」
- ロケール recipe は `recipes/ja-jp/locale.json`（`@ring-open/core` の構造を踏襲）

---

## 9. ring-core / @ring-open/core との関係

| 取り込むもの | 由来 | 取り込み方 |
|---|---|---|
| 視線・滞留・選択 | `@ring-open/core/gaze` | Phase 2 で npm 依存 |
| トリアージ語彙の「骨組み」 | `@ring-open/core/triage` | 構造のみ流用、語彙は新規 |
| k-anonymity / Wilson CI | `lib/stats/*` | Phase 4 でコピー |
| PII スクラブ | `lib/observability/scrubPII.ts` | Week 2 でコピー |
| レートリミット | `lib/server/rateLimit.ts` | Week 2 でコピー |
| 監査ログ | `lib/audit/*` | Week 2 でコピー（型は本書に従って差し替え） |
| 招待トークン | `lib/auth/tokens.ts` | Week 3 でコピー、パスワードハッシュは差し替え |

**持ち込まないもの：** `calls` コレクション、`nurse_admin` ロール、緊急度 1-5 のトリアージ語彙、既存ペルソナ（清子・太郎・花子）。

---

## 10. 用語集

| 用語 | 意味 |
|---|---|
| 入居者（resident） | 高齢者施設に住んでいる本人 |
| moments | 介護士が 30 秒で残す短い出来事の記録。akari の中心概念 |
| きもち（mood） | 入居者がボタン 1 タップで残す感情の記録 |
| 願い（wish） | 「孫に会いたい」「桜が見たい」など、家族・施設が拾える希望 |
| つながり（connection） | 入居者と家族の関係を表す紐づけ |
| 削除要請 | 本人 / 家族が自分に紐づくデータの削除を求める手続き |

---

## 11. 変更履歴

| バージョン | 日付 | 変更内容 | PR |
|---|---|---|---|
| 1.0.0-draft.1 | 2026-05-20 | 初版草案 | — |
