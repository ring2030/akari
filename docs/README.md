# akari ドキュメント索引

`akari` プロジェクトのドキュメントは、用途別に以下のように整理されています。

## 構成

```
docs/
├── README.md            ← このファイル
├── spec/                ← 製品の「契約」を定める仕様文書
│   └── akari-protocol-1.0.md
├── decisions/           ← Architecture Decision Records (ADR)
│   ├── 0000-record-architecture-decisions.md
│   └── 0001-tech-stack.md
└── roadmap/             ← フェーズ計画と進捗
    └── mvp-4weeks.md
```

## どこから読むか

### はじめての人

1. リポジトリトップの [`README.md`](../README.md) — 製品の目的と原則
2. [`AGENTS.md`](../AGENTS.md) — AI / 開発者が守る行動規範
3. [`docs/spec/akari-protocol-1.0.md`](./spec/akari-protocol-1.0.md) — 製品の中核モデル

### 設計判断の理由を知りたい人

- [`docs/decisions/`](./decisions/) — 「なぜこの技術を選んだか」を ADR 形式で記録

### いつ何が出来上がるかを知りたい人

- [`docs/roadmap/mvp-4weeks.md`](./roadmap/mvp-4weeks.md) — 4 週間で動く MVP のフェーズ分解

## ドキュメントを書くときの約束

- **「なぜ」を残す** — 何をしたかはコードで、なぜしたかはドキュメントで
- **更新可能** — 仕様変更があれば必ずここを更新する PR を出す
- **やわらかい日本語** — 高齢者・家族・介護士に読まれても恥ずかしくない言葉で書く
