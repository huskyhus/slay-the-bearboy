# Slay the Bearboy v1.0 ゲーム設計書

## 1. バトルシステム

### 1.1 プレイヤーステータス

| ステータス | 説明 |
|-----------|------|
| HP | 0になると敗北。初期値・最大値は `GAME_CONFIG.player.maxHp` |
| ブロック | 毎ターン開始時に0へリセット。ダメージを先に吸収する |
| エナジー | 毎ターン開始時に `GAME_CONFIG.player.energyPerTurn` へ回復。カード使用で消費 |

> 具体的な数値は [src/game/config.ts](../src/game/config.ts) の `GAME_CONFIG` を正とする（ドキュメントには数値を重複させない）。

### 1.2 ターンフロー

1. **プレイヤーターン開始**
   - ブロックを0にリセット
   - エナジーを `GAME_CONFIG.player.energyPerTurn` へ回復
   - 山札から `GAME_CONFIG.player.drawPerTurn` 枚ドロー（山札が足りなければ捨て札をシャッフルして山札に戻す）
2. **プレイヤーの行動**
   - 手札からカードを選んでプレイ（エナジーが足りる限り何枚でも）
3. **ターン終了**
   - 手札をすべて捨て札に移動
4. **敵の行動**
   - 各敵のブロックを0にリセット
   - 各敵が予告されたアクションを実行
   - プレイヤーHP <= 0 → 敗北
   - 次ターンのアクションを決定・表示
5. **次のプレイヤーターンへ**（手順1へ戻る）

### 1.3 ステータス効果

| 効果 | 対象 | 説明 | 持続 |
|------|------|------|------|
| Vulnerable（脆弱） | 敵 or プレイヤー | 受けるダメージを `GAME_CONFIG.combat.vulnerableMultiplier` 倍（端数切捨て） | ターン数で減少（付与された側のターン終了時に1減少） |
| Weak（弱体） | 敵 or プレイヤー | 与えるダメージを `GAME_CONFIG.combat.weakMultiplier` 倍（端数切捨て） | ターン数で減少（付与された側のターン終了時に1減少） |

> 減少タイミングを「ターン終了時」とするのは、敵がプレイヤーに付与したデバフが直後のプレイヤーターン中ずっと有効になるようにするため（減少タイミングは [src/game/combat.ts](../src/game/combat.ts) の `endPlayerTurn` / `executeEnemyTurn`、状態異常そのものの定義と演算は [src/game/conditions.ts](../src/game/conditions.ts)）。

> 倍率は [src/game/config.ts](../src/game/config.ts) の `GAME_CONFIG.combat` を正とする。

### 1.4 ダメージ計算

ダメージ計算の実装を正とする： [src/game/combat.ts](../src/game/combat.ts) の `calcConditionedDamage` / `calcRemainingHpAndBlock`。アルゴリズムの要点は以下のとおり（倍率は `GAME_CONFIG.combat`）。

```
基礎ダメージ = カードまたは敵インテントの damage 値
弱体補正   = 攻撃側が Weak なら × weakMultiplier（端数切捨て）
脆弱補正   = 防御側が Vulnerable なら × vulnerableMultiplier（端数切捨て）
最終ダメージ = floor(floor(基礎ダメージ × 弱体補正) × 脆弱補正)

実ダメージ  = max(0, 最終ダメージ - 防御側のブロック)
残ブロック  = max(0, 防御側のブロック - 最終ダメージ)
HP減少     = 実ダメージ
```

---

## 2. カードシステム

### 2.1 デッキゾーン

初期デッキの生成・ドロー・山札の補充の実装は [src/game/deck.ts](../src/game/deck.ts) を正とし、公開 API は `initDeck` / `drawCards` の2つである（シャッフル自体は乱数を扱うため [src/game/rng.ts](../src/game/rng.ts) にある）。手札から捨て札への移動はカードのプレイ／ターン終了に伴うため [src/game/combat.ts](../src/game/combat.ts) にある。

カード実体の `instanceId` は「定義 ID + 初期デッキ内の位置」から決定的に採番する（可変なグローバルカウンタは持たない）。

| ゾーン | 説明 |
|--------|------|
| デッキ（山札） | ドロー元。空になったら捨て札をシャッフルして補充 |
| 手札 | プレイ可能なカード。上限は `GAME_CONFIG.player.maxHandSize` |
| 捨て札 | 使用済み・ターン終了時に手札から移動 |
| 除外 | ゲームから除外されたカード。再利用不可 |

### 2.2 データ構造

カード関連の型定義（`CardType` / `CardRarity` / `Effect` / `EffectType` / `CardDefinition`）は [src/game/types.ts](../src/game/types.ts) を正とする。各効果種別の意味は以下のとおり。

| EffectType | 意味 |
|------------|------|
| `damage` | 単体ダメージ |
| `damage_all` | 全体ダメージ |
| `block` | ブロック付与（自分） |
| `apply_condition` | ステータス効果付与（`condition` フィールドで対象キーを指定。例: `vulnerable`, `weak`） |
| `draw` | カードドロー |

### 2.3 カード一覧

全カードの定義（ID・名前・タイプ・コスト・レアリティ・効果・説明・画像）は [src/data/cards.json](../src/data/cards.json) を正とする。各カードはスタンプ画像 (`image`) を持ち、[public/](../public/) 配下の画像を URL で参照する。

### 2.4 初期デッキ（v1.0 プロトタイプ）

v1.0 ではデッキ成長がないため、[cards.json](../src/data/cards.json) に定義された全種を各1枚ずつデッキに含める。

---

## 3. 敵システム

### 3.1 敵データ構造

敵関連の型定義（`EnemyDefinition`）は [src/game/types.ts](../src/game/types.ts) を正とする。敵のインテントはカードと共通の `Effect` 型で表現し（敵が使う場合の `damage` / `apply_condition` の対象はプレイヤー、`block` は自分自身）、`intents` は固定ローテーション（先頭から順に繰り返す）を表す。

### 3.2 敵の行動決定

v1.0 では敵ごとに固定のインテントパターン（ローテーション）を持つ。インテント配列を先頭から順に実行し、末尾まで到達したら先頭に戻る。

### 3.3 v1.0 エンカウント（雑魚2体）

v1.0 では **Jaw Worm** と **Louse** の2体が登場する。各敵の HP と行動ローテーション（`intents`）の具体値は [src/data/enemies.json](../src/data/enemies.json) を正とする。

---

## 4. 勝敗とリザルト

- **勝利条件**：すべての敵のHPが0以下
- **敗北条件**：プレイヤーのHPが0以下
- **リザルト画面**：勝敗の表示のみ（v1.0）

---

## 5. 定数定義

ゲームバランスに関わる定数（プレイヤーの最大HP・エナジー・ドロー枚数・手札上限、戦闘の各倍率）は [src/game/config.ts](../src/game/config.ts) の `GAME_CONFIG` に定数として宣言し、一元管理する。本ドキュメントでは数値を重複させず、常に `config.ts` を正とする。

---

## 6. 乱数と決定性

`src/game/` 以下は「同じ入力なら常に同じ結果を返す」純粋なロジックとして保つ。ユニットテストとバランス調整用シミュレータがこの性質を前提とするため、`Math.random()` や可変なモジュールグローバル変数は使わない。

- 乱数を使う処理はすべて [src/game/rng.ts](../src/game/rng.ts) に置く。実装には mulberry32 を用いる（外部ライブラリには依存しない）。
- 乱数の状態は符号なし32bit整数1つ (`RngState = number`) として `CombatState.rng` に持ち、シャッフルのたびに更新される。乱数生成も純粋関数とし、値と次の状態を組で返す。生成アルゴリズムの詳細は `rng.ts` の内側に閉じ込め、外部には公開しない。
- `CombatState.seed` には戦闘開始時のシードを保持する。同じシード・同じ操作列であれば戦闘全体を完全に再現できる（不具合再現・リプレイ用）。
- 非決定的な処理は `rng.ts` の `createRandomSeed()` ただ1つに閉じ込める。この関数だけが例外的に外部のエントロピー源（`crypto.getRandomValues()`）を参照し、それ以外の `src/game/` のコードはすべて純粋関数とする。`Math.random()` を他のファイルで直接呼ばない。
- `initCombat()` は必ずシードを引数で受け取る。シードを省略した場合の既定値の解決は [src/store/gameStore.ts](../src/store/gameStore.ts) の `startCombat(seed = createRandomSeed())` が行う。テストやシミュレータは `createRandomSeed()` を呼ばず、固定のシードを渡す。
