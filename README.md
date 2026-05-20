# akari（灯）

> 高齢者施設で暮らす方の毎日を、もう少しだけあたたかく、もう少しだけ自由にするためのオープンソース・ソフトウェア。

`akari` は、**特別養護老人ホーム・介護付き有料老人ホーム・グループホーム** などで暮らす方の毎日を支えるための、入居者・介護士・家族をやさしくつなぐ "暮らしの台所" プロジェクトです。

「ナースコール」ではありません。「介護記録システム」でもありません。
**尊厳・つながり・暮らしの質** を中心に据えた、新しい形の施設向けプラットフォームを目指します。

## ring-core との関係

`akari` は、医療向けの視線ナースコール [`ring-core`](https://github.com/ring2030/ring-core) の **sibling project（きょうだいプロジェクト）** です。

- ロジックの "芯" は `@ring-open/core` を **npm 依存として再利用**
- ただし **製品像・データモデル・ガバナンス・ロードマップは独立**
- 病院向けの語彙・ロール・概念を持ち込まず、施設向けにゼロから設計

```
ring-core/ ← 病院向け（視線ナースコール）
  packages/ring-open-core/  ← 共通コア
akari/     ← 施設向け（このリポジトリ）
  package.json → "@ring-open/core": "..."
```

## 3つの設計原則

1. **尊厳ファースト** — 監視ではなく寄り添い。録音・録画は本人が望むときだけ。
2. **介護士を増やせない前提** — 既存スタッフの手数を減らす設計だけが許される。
3. **家族を周辺機能にしない** — 家族は「読む人」ではなく「参加する人」。

## やらないこと

- 医療診断・バイタル管理（akari は医療機器ではありません）
- 行動監視・徘徊検知の "通報" 系（信頼を壊す）
- 介護記録ソフトの完全代替（既存システムを尊重し、必要なら出力する）
- 身体拘束を補助しうる UX（鍵管理・退去防止など）

## 中核モデル

```
入居者（resident）
  ├── 暮らしのリズム（dailyRhythm）
  ├── きもち（mood）
  ├── 出来事（moments）  ← ここが中心
  ├── 願い（wishes）
  └── つながり（connections）
```

「コール」は中心概念ではない。**「moments（小さな出来事）」が中心**。

## ロール

| ロール | 主にできること |
|---|---|
| 入居者（resident） | きもち送信、家族メッセージ受信、願いを残す |
| 介護士（caregiver） | moments 入力、ケアプラン参照、家族への共有判断 |
| 生活相談員（life-counselor） | 願い・家族関係の橋渡し、moments を物語に編む |
| 施設長（facility-admin） | スタッフ管理・監査・施設設定 |
| 家族（family） | moments 受信、メッセージ送信、面会予約 |
| 主治医・往診医（doctor, 限定読取） | 健康関連 moments のみ |

## リポジトリ構成

```
akari/
├── apps/web/          ← Next.js + Supabase（Week 1 着手）
├── packages/core/     ← ドメインモデル・バリデーション（@akari/core）
├── docs/              ← 仕様・ADR・ロードマップ
└── AGENTS.md          ← Cursor / AI 開発ルール
```

## 開発

```bash
npm install
npm run lint
npm run test:run
npm run build          # @akari/core をビルド
npm run dev            # @akari/web

# ローカル DB（Docker + Supabase CLI）
supabase start && supabase db reset
cp apps/web/.env.local.example apps/web/.env.local
# → AKARI_DEMO_MODE=true と service_role key を設定
```

詳しい開発フローは [`CONTRIBUTING.md`](./CONTRIBUTING.md) を参照してください。

## 開発状況

🚧 **Pre-MVP / Bootstrapping** — 設計と仕様策定の段階です。

MVP（4週間想定）に含めるもの：

1. 入居者タブレット：「きもち」を押す画面（4択）
2. 介護士スマホ：moments を 30 秒で残す画面
3. 家族 web：moments をフィードで読む画面
4. 認証：施設ごと招待リンク制
5. 監査ログ
6. 1ロケール（ja-jp）のみ

MVP に含めない（フェーズ 2 以降）：視線操作・音声認識・AI 要約・PHIL 統計集計

## セキュリティと倫理

- 個人情報の取り扱いについては [`SECURITY.md`](./SECURITY.md)
- 行動規範は [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)
- 介護保険法・身体拘束ゼロ・成年後見の論点を設計初日から考慮しています

## ライセンス

[Apache License 2.0](./LICENSE)

---

> `akari` は ring-core（病院向け）の sibling project です。
> This project is a sibling of [`ring-core`](https://github.com/ring2030/ring-core) and reuses selected open components from `@ring-open/core`, while defining an independent product model, governance, and roadmap.
