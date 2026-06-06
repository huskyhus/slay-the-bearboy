# Slay the Bearboy v1.0 ゲーム設計書

## 1. バトルシステム

### 1.1 プレイヤーステータス

| ステータス | 初期値 | 説明 |
|-----------|--------|------|
| HP | 80 | 0になると敗北 |
| ブロック | 0 | 毎ターン開始時にリセット。ダメージを先に吸収する |
| エナジー | 3 | 毎ターン開始時に3に回復。カード使用で消費 |

### 1.2 ターンフロー

1. **プレイヤーターン開始**
   - ブロックを0にリセット
   - エナジーを3に回復
   - 山札から5枚ドロー（山札が足りなければ捨て札をシャッフルして山札に戻す）
2. **プレイヤーの行動**
   - 手札からカードを選んでプレイ（エナジーが足りる限り何枚でも）
3. **ターン終了**
   - 手札をすべて捨て札に移動
4. **敵の行動**
   - 各敵が予告されたアクションを実行
   - 次ターンのアクションを決定・表示
5. **ターン終了チェック**
   - プレイヤーHP <= 0 → 敗北
   - 全敵HP <= 0 → 勝利
   - いずれでもなければ手順1へ

### 1.3 ステータス効果

| 効果 | 対象 | 説明 | 持続 |
|------|------|------|------|
| Vulnerable（脆弱） | 敵 or プレイヤー | 受けるダメージが50%増加（端数切捨て） | ターン数で減少（ターン開始時に1減少） |
| Weak（弱体） | 敵 or プレイヤー | 与えるダメージが25%減少（端数切捨て） | ターン数で減少（ターン開始時に1減少） |

### 1.4 ダメージ計算

```
基礎ダメージ = カードの damage 値
弱体補正   = 攻撃側が Weak なら × 0.75（端数切捨て）
脆弱補正   = 防御側が Vulnerable なら × 1.5（端数切捨て）
最終ダメージ = floor(floor(基礎ダメージ × 弱体補正) × 脆弱補正)

実ダメージ  = max(0, 最終ダメージ - 防御側のブロック)
残ブロック  = max(0, 防御側のブロック - 最終ダメージ)
HP減少     = 実ダメージ
```

---

## 2. カードシステム

### 2.1 デッキゾーン

| ゾーン | 説明 |
|--------|------|
| デッキ（山札） | ドロー元。空になったら捨て札をシャッフルして補充 |
| 手札 | プレイ可能なカード。最大10枚 |
| 捨て札 | 使用済み・ターン終了時に手札から移動 |
| 除外 | ゲームから除外されたカード。再利用不可 |

### 2.2 データ構造

```typescript
type CardType = "attack" | "skill";
type CardRarity = "basic" | "common" | "uncommon";

type EffectType =
  | "damage"          // 単体ダメージ
  | "damage_all"      // 全体ダメージ
  | "block"           // ブロック付与（自分）
  | "apply_vulnerable"// 脆弱付与
  | "apply_weak"      // 弱体付与
  | "draw";           // カードドロー

interface CardEffect {
  type: EffectType;
  value: number;
}

interface CardDefinition {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  rarity: CardRarity;
  effects: CardEffect[];
  description: string;
}
```

### 2.3 カード一覧（11枚）

| ID | 名前 | タイプ | コスト | レアリティ | 効果 | 説明 |
|----|------|--------|--------|-----------|------|------|
| strike | Strike | attack | 1 | basic | damage 6 | Deal 6 damage. |
| defend | Defend | skill | 1 | basic | block 5 | Gain 5 Block. |
| bash | Bash | attack | 2 | basic | damage 8, apply_vulnerable 2 | Deal 8 damage. Apply 2 Vulnerable. |
| iron_wave | Iron Wave | attack | 1 | common | damage 5, block 5 | Deal 5 damage. Gain 5 Block. |
| cleave | Cleave | attack | 1 | common | damage_all 8 | Deal 8 damage to ALL enemies. |
| clothesline | Clothesline | attack | 2 | common | damage 12, apply_weak 2 | Deal 12 damage. Apply 2 Weak. |
| shrug_it_off | Shrug It Off | skill | 1 | common | block 8, draw 1 | Gain 8 Block. Draw 1 card. |
| pommel_strike | Pommel Strike | attack | 1 | common | damage 9, draw 1 | Deal 9 damage. Draw 1 card. |
| uppercut | Uppercut | attack | 2 | uncommon | damage 13, apply_weak 1, apply_vulnerable 1 | Deal 13 damage. Apply 1 Weak. Apply 1 Vulnerable. |
| battle_trance | Battle Trance | skill | 0 | uncommon | draw 3 | Draw 3 cards. |
| thunderclap | Thunderclap | attack | 1 | common | damage_all 4, apply_vulnerable 1 | Deal 4 damage to ALL enemies. Apply 1 Vulnerable. |

### 2.4 初期デッキ（v1.0 プロトタイプ）

v1.0 ではデッキ成長がないため、全11種を各1枚ずつデッキに含める。

---

## 3. 敵システム

### 3.1 敵データ構造

```typescript
type EnemyIntent =
  | { type: "attack"; damage: number }
  | { type: "defend"; block: number }
  | { type: "debuff"; effect: "weak" | "vulnerable"; value: number };

interface EnemyDefinition {
  id: string;
  name: string;
  hp: number;
  intents: EnemyIntent[];  // 固定ローテーション（先頭から順に繰り返す）
}
```

### 3.2 敵の行動決定

v1.0 では敵ごとに固定のインテントパターン（ローテーション）を持つ。インテント配列を先頭から順に実行し、末尾まで到達したら先頭に戻る。

### 3.3 v1.0 エンカウント（雑魚2体）

#### Jaw Worm

| ステータス | 値 |
|-----------|-----|
| HP | 42 |

**行動ローテーション：**

| 順番 | 行動 | 値 |
|------|------|----|
| 1 | attack | 11 ダメージ |
| 2 | defend | 6 ブロック |
| 3 | attack | 11 ダメージ |

#### Louse

| ステータス | 値 |
|-----------|-----|
| HP | 30 |

**行動ローテーション：**

| 順番 | 行動 | 値 |
|------|------|----|
| 1 | attack | 6 ダメージ |
| 2 | debuff | Weak 1ターン |
| 3 | attack | 6 ダメージ |

---

## 4. 勝敗とリザルト

- **勝利条件**：すべての敵のHPが0以下
- **敗北条件**：プレイヤーのHPが0以下
- **リザルト画面**：勝敗の表示のみ（v1.0）

---

## 5. 定数定義

以下の値は設定ファイル（`src/game/config.ts`）に定数として宣言し、一元管理する。

```typescript
// src/game/config.ts
export const GAME_CONFIG = {
  player: {
    maxHp: 80,
    energyPerTurn: 3,
    drawPerTurn: 5,
    maxHandSize: 10,
  },
  combat: {
    vulnerableMultiplier: 1.5,
    weakMultiplier: 0.75,
  },
} as const;
```
