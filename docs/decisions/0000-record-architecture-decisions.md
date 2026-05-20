# ADR-0000：アーキテクチャ判断を記録する

- Status: Accepted
- Date: 2026-05-20

## 背景

設計の重要な判断（技術スタック、データモデル、認証方式、外部依存など）は、
**「何を選んだか」だけでなく「なぜ選んだか」「他に何を見たか」** を残すと、
半年後にチームが入れ替わっても、判断を覆すか引き継ぐかを冷静に決められます。

## 判断

`akari` は **Architecture Decision Records（ADR）** 形式で判断を記録します。

- 置き場所：`docs/decisions/NNNN-title.md`（4 桁連番、ハイフン区切り）
- フォーマット：背景 / 候補 / 判断 / 影響 / Status
- Status：`Proposed` → `Accepted` → 必要なら `Superseded by ADR-XXXX`
- 一度 Accepted になった ADR は **書き換えない**。覆すときは新しい ADR を起こす

## 影響

- ドキュメント量は増えるが、判断の責任と理由が明確になる
- 新しい貢献者の読み物が増える（`docs/decisions/` を読めば追える）

## 参考

- Michael Nygard, ["Documenting Architecture Decisions"](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) (2011)
