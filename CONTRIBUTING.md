# コントリビューションガイド

`akari`（灯）への貢献を考えてくださって、ありがとうございます。
このドキュメントは、開発に参加するための **最小限の手順** と **守ってほしい原則** をまとめたものです。

---

## はじめに

`akari` は **高齢者施設で暮らす方** のためのソフトウェアです。
コードを書くより前に、次の3つを読んでください。

1. [`README.md`](./README.md) — プロジェクトの目的と設計原則
2. [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) — 行動規範
3. [`SECURITY.md`](./SECURITY.md) — セキュリティとプライバシーの扱い

---

## 開発の進め方

### 0. 必要なもの

- Node.js 22 以上
- Git
- お好みのエディタ（[Cursor](https://cursor.com) を推奨）

### 1. リポジトリを取得

```bash
git clone https://github.com/ring2030/akari.git
cd akari
npm install
```

### 2. ブランチを切る

`main` には **直接 push しない** でください。必ずブランチを切って PR を出します。

```bash
git checkout -b feat/<short-name>     # 新機能
git checkout -b fix/<short-name>      # バグ修正
git checkout -b docs/<short-name>     # ドキュメント
git checkout -b refactor/<short-name> # リファクタ
```

### 3. 開発・テスト

```bash
npm run dev          # 開発サーバー（実装後）
npm run lint         # ESLint
npm run test:run     # テスト一回実行
```

### 4. コミット

[Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/) を採用します。

```
feat: 入居者タブレットの「きもち」画面を追加
fix: moments の時刻表示が UTC のままだった
docs: ロール定義に doctor の範囲を明記
refactor: mood の集計を pure 関数に切り出し
test: scrubPII のフィールド追加カバレッジ
chore: ESLint 設定を更新
```

### 5. PR を作る

- PR は **1 つの目的** に絞ってください（小さく早く）
- PR テンプレートのチェック項目をすべて埋めてください
- レビューでは「動くか」より「設計と尊厳に沿っているか」を見ます

---

## 守ってほしい原則

`akari` 固有の、特に大切な約束です。

### 1. 「監視」を作らない

行動監視・徘徊検知・録音録画の通報など、**信頼を壊す機能** は、原則として作りません。
PR を出す前に、「これは入居者本人が知ったとき、嫌な気持ちになるか？」を自問してください。

### 2. データ最小主義

- 必要な情報だけを、必要な期間だけ保持する
- 個人を特定できる情報は、初期表示・ログ出力で **必ずスクラブ** する
- 「便利だから」だけでは収集の理由になりません

### 3. 介護士の手数を増やさない

新機能を入れるたびに、**現場の介護士が何秒余計に触るか** を見積もってください。
+30 秒の機能は、たいてい「導入しない」が正解です。

### 4. 家族を周辺機能にしない

家族向け UI は「読む人」用ではなく「参加する人」用です。
read-only に閉じない設計を心がけてください。

### 5. AI に頼り切らない

第三者 LLM 依存は **明示的にオプトイン**。
ローカル処理や on-device 推論を最初の選択肢にしてください。

---

## コードのルール（実装フェーズで適用）

- TypeScript の **型を先に書く** — 実装より型・契約が先
- 純粋関数は **vitest** で単体テスト
- UI フローは **Playwright** で結合テスト
- コメントは「**なぜ**」を書く。「何を」はコードで語る
- マジックナンバー禁止。定数化して名前を付ける

---

## ring-core / `@ring-open/core` との関係

`akari` は [`ring-core`](https://github.com/ring2030/ring-core) の sibling project です。
共通ロジックは `@ring-open/core` から取り込みます。

- 共通化したいロジックを見つけたら、まず `@ring-open/core` に出すことを検討
- ただし、**病院向けの語彙・概念を `akari` に持ち込まない** ように
  （例：`calls` / `nurse_admin` / `緊急度1-5` などは NG）

---

## 質問・相談

- 設計の相談 → GitHub Discussions（準備中）
- バグ報告 → Issues
- セキュリティ報告 → [`SECURITY.md`](./SECURITY.md) の手順
