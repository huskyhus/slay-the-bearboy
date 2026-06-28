# cards.json 全スタンプカード定義実装提案書

## 1. 概要

`Stickers_Summary.csv` に記載されているすべてのスタンプ画像（232枚）を  
`src/data/cards.json` にゲームカードとして定義する。

CSV から参照する列は以下の3列のみ。

| CSV列 | JSON フィールド |
|-------|--------------|
| `FileName`（番号部分） | `id` / `image` |
| `StickerName` | `name` |
| `CardType` | `type` の参考 |

---

## 2. 変換ルール

### 2.1 既存型（src/game/types.ts）の制約

```ts
type CardType   = "attack" | "skill"          // この2値のみ
type CardRarity = "basic" | "common" | "uncommon"
type EffectType = "damage" | "damage_all" | "block"
               | "apply_vulnerable" | "apply_weak" | "draw"
```

### 2.2 id

```
id = "s" + ファイル番号
例: 507134614.png → "s507134614"
```

### 2.3 name

CSV の `StickerName` をそのまま使用。

### 2.4 type

CSV `CardType` を参考に `"attack"` / `"skill"` のどちらかを選択する。  
`"パワー"` / `"状態異常"` / 空欄は **各スタンプの雰囲気・名称** に基づいて個別に割り当てる（§4 全カード一覧 参照）。

| CSV `CardType` | 方針 |
|---------------|------|
| `アタック` | `"attack"` |
| `スキル` | `"skill"` |
| `パワー` | 内容に応じて `"attack"` / `"skill"` |
| `状態異常` | 内容に応じて `"attack"` / `"skill"` |
| 空欄 | 内容に応じて `"attack"` / `"skill"` |

### 2.5 cost・rarity・effects・description の決定

全カード `cost=1`・`rarity="common"` で統一する。  
`effects` と `description` は `type` によって自動的に決まる。

| `type` | `cost` | `rarity` | `effects` | `description` |
|--------|--------|----------|-----------|---------------|
| `"attack"` | `1` | `"common"` | `[{"type":"damage","value":6}]` | `"6ダメージを与える。"` |
| `"skill"` | `1` | `"common"` | `[{"type":"block","value":5}]` | `"5ブロックを得る。"` |

### 2.6 image

```
image = "/{FolderName}/{FileName}"
```

各セクションの **フォルダ名** と **ファイル名**（id の数字部分 + `.png`）を結合する。

---

## 3. cards.json エントリサンプル

```json
// attack の例
{
  "id": "s507134618",
  "name": "こんにちは",
  "type": "attack",
  "cost": 1,
  "rarity": "common",
  "effects": [{ "type": "damage", "value": 6 }],
  "description": "6ダメージを与える。",
  "image": "/stickers_19770123_ハス君シリーズpart1/507134618.png"
}

// skill の例
{
  "id": "s507134621",
  "name": "さびしいなぁ",
  "type": "skill",
  "cost": 1,
  "rarity": "common",
  "effects": [{ "type": "block", "value": 5 }],
  "description": "5ブロックを得る。",
  "image": "/stickers_19770123_ハス君シリーズpart1/507134621.png"
}
```

---

## 4. 全カード一覧（232枚）

各テーブルの列の値は以下の規則で導ける。  
- `cost` = 1、`rarity` = "common"（全カード共通）  
- `effects` / `description` = type が attack なら `damage:6`／`"6ダメージを与える。"`、skill なら `block:5`／`"5ブロックを得る。"`  
- `image` = `/{セクションのフォルダ名}/{id の数字部分}.png`

---

### Pack 1 — フォルダ: `stickers_19770123_ハス君シリーズpart1`

| id | name | type | cost | rarity | effects | description | image（ファイル名） |
|----|------|------|------|--------|---------|-------------|--------------------|
| s507134614 | 了解！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 507134614.png |
| s507134615 | 感謝してるよ | skill | 1 | common | block:5 | 5ブロックを得る。 | 507134615.png |
| s507134616 | ありがとう | skill | 1 | common | block:5 | 5ブロックを得る。 | 507134616.png |
| s507134617 | Hi | skill | 1 | common | block:5 | 5ブロックを得る。 | 507134617.png |
| s507134618 | こんにちは | attack | 1 | common | damage:6 | 6ダメージを与える。 | 507134618.png |
| s507134619 | お腹すいたよ | skill | 1 | common | block:5 | 5ブロックを得る。 | 507134619.png |
| s507134620 | 疲れたよぅ | skill | 1 | common | block:5 | 5ブロックを得る。 | 507134620.png |
| s507134621 | さびしいなぁ | skill | 1 | common | block:5 | 5ブロックを得る。 | 507134621.png |
| s507134622 | 帰って来てね | skill | 1 | common | block:5 | 5ブロックを得る。 | 507134622.png |
| s507134623 | 待ち切れないよ | skill | 1 | common | block:5 | 5ブロックを得る。 | 507134623.png |
| s507134624 | 待ってるよ遊ぼうよ | skill | 1 | common | block:5 | 5ブロックを得る。 | 507134624.png |
| s507134625 | ガーン！落ち込むよぅ！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 507134625.png |
| s507134626 | もうひと踏ん張り | attack | 1 | common | damage:6 | 6ダメージを与える。 | 507134626.png |
| s507134627 | 元気にしてるょ！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 507134627.png |
| s507134628 | おはよー | attack | 1 | common | damage:6 | 6ダメージを与える。 | 507134628.png |
| s507134629 | おやすみなさい | skill | 1 | common | block:5 | 5ブロックを得る。 | 507134629.png |

---

### Pack 2 — フォルダ: `stickers_25609337_ハス君シリ－ズ②`

| id | name | type | cost | rarity | effects | description | image（ファイル名） |
|----|------|------|------|--------|---------|-------------|--------------------|
| s650352750 | 了解 | skill | 1 | common | block:5 | 5ブロックを得る。 | 650352750.png |
| s650352751 | Hello! | attack | 1 | common | damage:6 | 6ダメージを与える。 | 650352751.png |
| s650352752 | 元気？Hello! | skill | 1 | common | block:5 | 5ブロックを得る。 | 650352752.png |
| s650352753 | ありがとう | skill | 1 | common | block:5 | 5ブロックを得る。 | 650352753.png |
| s650352754 | 忘れないで！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 650352754.png |
| s650352755 | まっているよ | skill | 1 | common | block:5 | 5ブロックを得る。 | 650352755.png |
| s650352756 | おやすみなさい | attack | 1 | common | damage:6 | 6ダメージを与える。 | 650352756.png |
| s650352757 | お疲れさまです | skill | 1 | common | block:5 | 5ブロックを得る。 | 650352757.png |
| s650352758 | お腹すいたよー | skill | 1 | common | block:5 | 5ブロックを得る。 | 650352758.png |
| s650352759 | くたくたです | skill | 1 | common | block:5 | 5ブロックを得る。 | 650352759.png |
| s650352760 | 感謝しています | skill | 1 | common | block:5 | 5ブロックを得る。 | 650352760.png |
| s650352761 | Happy Birthday | skill | 1 | common | block:5 | 5ブロックを得る。 | 650352761.png |
| s650352762 | 心にゆとりを・・・ | skill | 1 | common | block:5 | 5ブロックを得る。 | 650352762.png |
| s650352763 | 会いたいなぁ | skill | 1 | common | block:5 | 5ブロックを得る。 | 650352763.png |
| s650352764 | あせるな！ 立ち止まれ！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 650352764.png |
| s650352765 | がんばるんば | skill | 1 | common | block:5 | 5ブロックを得る。 | 650352765.png |

---

### Pack 3 — フォルダ: `stickers_27515398_ハス君といっしょ③`

| id | name | type | cost | rarity | effects | description | image（ファイル名） |
|----|------|------|------|--------|---------|-------------|--------------------|
| s705381865 | OK! | attack | 1 | common | damage:6 | 6ダメージを与える。 | 705381865.png |
| s705381866 | よろしくお願いします！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 705381866.png |
| s705381867 | 金くれ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 705381867.png |
| s705381868 | 拝啓お元気ですか | skill | 1 | common | block:5 | 5ブロックを得る。 | 705381868.png |
| s705381869 | お体にはお気を付けください敬具 | skill | 1 | common | block:5 | 5ブロックを得る。 | 705381869.png |
| s705381870 | 助けて～ | skill | 1 | common | block:5 | 5ブロックを得る。 | 705381870.png |
| s705381871 | 今助けるぅ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 705381871.png |
| s705381872 | Congrats! | skill | 1 | common | block:5 | 5ブロックを得る。 | 705381872.png |
| s705381873 | ラジャ！！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 705381873.png |
| s705381874 | それな | attack | 1 | common | damage:6 | 6ダメージを与える。 | 705381874.png |
| s705381875 | おやすみ | skill | 1 | common | block:5 | 5ブロックを得る。 | 705381875.png |
| s705381876 | 会社を辞めて起業する | skill | 1 | common | block:5 | 5ブロックを得る。 | 705381876.png |
| s705381877 | 賛成！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 705381877.png |
| s705381878 | 異議（いぎ）あり！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 705381878.png |
| s705381879 | 「昇天」チーン | skill | 1 | common | block:5 | 5ブロックを得る。 | 705381879.png |
| s705381880 | 耐えるよ耐えるよ！！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 705381880.png |

---

### Pack 4 — フォルダ: `stickers_29398042_ハス君シリーズ④`

| id | name | type | cost | rarity | effects | description | image（ファイル名） |
|----|------|------|------|--------|---------|-------------|--------------------|
| s744223937 | おまえもな！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 744223937.png |
| s744223938 | 忘れるなよ！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 744223938.png |
| s744223939 | やっちまった！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 744223939.png |
| s744223940 | すまん 猛省している！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 744223940.png |
| s744223941 | ありがたさ痛感！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 744223941.png |
| s744223942 | 感  動  ! | skill | 1 | common | block:5 | 5ブロックを得る。 | 744223942.png |
| s744223943 | 母は偉大なり！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 744223943.png |
| s744223944 | 父は森！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 744223944.png |
| s744223945 | めざせ規則生活！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 744223945.png |
| s744223946 | 感謝しかない！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 744223946.png |
| s744223947 | おのれの愚かさ今知る！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 744223947.png |
| s744223948 | 座禅する！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 744223948.png |
| s744223949 | 欲望よさらば | skill | 1 | common | block:5 | 5ブロックを得る。 | 744223949.png |
| s744223950 | 地の獄！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 744223950.png |
| s744223951 | 逆転劇 | attack | 1 | common | damage:6 | 6ダメージを与える。 | 744223951.png |
| s744223952 | ごめんなさい... | skill | 1 | common | block:5 | 5ブロックを得る。 | 744223952.png |
| s744223953 | すみません✨ | skill | 1 | common | block:5 | 5ブロックを得る。 | 744223953.png |
| s744223954 | 不可能です！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 744223954.png |
| s744223955 | 人は欲望と共にある | skill | 1 | common | block:5 | 5ブロックを得る。 | 744223955.png |
| s744223956 | 寝る子は育つ | skill | 1 | common | block:5 | 5ブロックを得る。 | 744223956.png |
| s744223957 | 働け！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 744223957.png |
| s744223958 | 今日はチートデイ | skill | 1 | common | block:5 | 5ブロックを得る。 | 744223958.png |
| s744223959 | 準備完了！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 744223959.png |
| s744223960 | 時は満ちた | attack | 1 | common | damage:6 | 6ダメージを与える。 | 744223960.png |

---

### Pack 5 — フォルダ: `stickers_30609727_いつもいっしょ！パ－ト(1)`

| id | name | type | cost | rarity | effects | description | image（ファイル名） |
|----|------|------|------|--------|---------|-------------|--------------------|
| s772622433 | 波乗りぃ！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 772622433.png |
| s772622434 | NICE TRY! | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622434.png |
| s772622435 | いいポエムだね | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622435.png |
| s772622436 | 徳川埋蔵金 | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622436.png |
| s772622437 | 主役登場！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 772622437.png |
| s772622438 | 全員集合！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 772622438.png |
| s772622439 | レッツダンス | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622439.png |
| s772622440 | 行け わがしもべたち | attack | 1 | common | damage:6 | 6ダメージを与える。 | 772622440.png |
| s772622441 | 誇れ | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622441.png |
| s772622442 | ご招待 | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622442.png |
| s772622443 | 招かれざる客 | attack | 1 | common | damage:6 | 6ダメージを与える。 | 772622443.png |
| s772622444 | 壊れる… | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622444.png |
| s772622445 | 壊す ﾆﾔﾘ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 772622445.png |
| s772622446 | 美味！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622446.png |
| s772622447 | まかせろ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 772622447.png |
| s772622448 | cool down! | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622448.png |
| s772622449 | 必ず回復する！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622449.png |
| s772622450 | 大丈夫だよ | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622450.png |
| s772622451 | ねむいよ | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622451.png |
| s772622452 | おはよう | attack | 1 | common | damage:6 | 6ダメージを与える。 | 772622452.png |
| s772622453 | まかせろ！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 772622453.png |
| s772622454 | 大丈夫だよ | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622454.png |
| s772622455 | キャリアをつめ スキルを磨け | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622455.png |
| s772622456 | 規則正しい生活 | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622456.png |
| s772622457 | 寂しいな 会いたいな | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622457.png |
| s772622458 | 遊びにおいでよ | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622458.png |
| s772622459 | それ、受けねぇ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 772622459.png |
| s772622460 | 語学は大事だ ABC XYZ | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622460.png |
| s772622461 | いつもありがとうございます 感謝しています | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622461.png |
| s772622462 | 了解 | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622462.png |
| s772622463 | 話し聞くよ！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622463.png |
| s772622464 | 野菜ジュース飲んだ？ | skill | 1 | common | block:5 | 5ブロックを得る。 | 772622464.png |

---

### Pack 6 — フォルダ: `stickers_31398403_ハス君シリ－ズ⑤`

| id | name | type | cost | rarity | effects | description | image（ファイル名） |
|----|------|------|------|--------|---------|-------------|--------------------|
| s786875953 | Hi! | attack | 1 | common | damage:6 | 6ダメージを与える。 | 786875953.png |
| s786875954 | 大丈夫だ！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 786875954.png |
| s786875955 | オラもうだめだ | skill | 1 | common | block:5 | 5ブロックを得る。 | 786875955.png |
| s786875956 | やる気倍増！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 786875956.png |
| s786875957 | 協調大事！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 786875957.png |
| s786875958 | ここだけの話 | skill | 1 | common | block:5 | 5ブロックを得る。 | 786875958.png |
| s786875959 | ごちそうさま | attack | 1 | common | damage:6 | 6ダメージを与える。 | 786875959.png |
| s786875960 | 勤勉でいこう！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 786875960.png |
| s786875961 | オレについて来い | attack | 1 | common | damage:6 | 6ダメージを与える。 | 786875961.png |
| s786875962 | お腹すいた！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 786875962.png |
| s786875963 | 合体 | attack | 1 | common | damage:6 | 6ダメージを与える。 | 786875963.png |
| s786875964 | 喝！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 786875964.png |
| s786875965 | 目がまわる～ | skill | 1 | common | block:5 | 5ブロックを得る。 | 786875965.png |
| s786875966 | ご名答 | skill | 1 | common | block:5 | 5ブロックを得る。 | 786875966.png |
| s786875967 | 美しい | skill | 1 | common | block:5 | 5ブロックを得る。 | 786875967.png |
| s786875968 | 俺のことは置いていけ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 786875968.png |
| s786875969 | ？ | skill | 1 | common | block:5 | 5ブロックを得る。 | 786875969.png |
| s786875970 | ありがとう！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 786875970.png |
| s786875971 | 体調不良（だめだ～） | skill | 1 | common | block:5 | 5ブロックを得る。 | 786875971.png |
| s786875972 | 会いたいなぁ～（かわちい） | skill | 1 | common | block:5 | 5ブロックを得る。 | 786875972.png |
| s786875973 | 日々の積み重ね | skill | 1 | common | block:5 | 5ブロックを得る。 | 786875973.png |
| s786875974 | どんでん返し | attack | 1 | common | damage:6 | 6ダメージを与える。 | 786875974.png |
| s786875975 | ごまかすな！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 786875975.png |
| s786875976 | おやすみなさい | skill | 1 | common | block:5 | 5ブロックを得る。 | 786875976.png |

---

### Pack 7 — フォルダ: `stickers_31920306_ハス君シリ－ズ{6}`

| id | name | type | cost | rarity | effects | description | image（ファイル名） |
|----|------|------|------|--------|---------|-------------|--------------------|
| s796167801 | 3匹寄らば文殊の知恵 | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167801.png |
| s796167802 | 出る杭は打たれない | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167802.png |
| s796167803 | 灯台もと暗し | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167803.png |
| s796167804 | バディは宝 | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167804.png |
| s796167805 | 打倒！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 796167805.png |
| s796167806 | 腹ぺこ隊 | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167806.png |
| s796167807 | 体幹大事 | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167807.png |
| s796167808 | 熟考せよ | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167808.png |
| s796167809 | 羨ましいなぁ | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167809.png |
| s796167810 | 不安になるなよ！大丈夫 | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167810.png |
| s796167811 | 料理男子！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167811.png |
| s796167812 | 下落しないと上昇しない！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167812.png |
| s796167813 | 焦ることはない！暴落を待て！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167813.png |
| s796167814 | 稼げ！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 796167814.png |
| s796167815 | 暴落が来る！キャッシュを準備せよ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 796167815.png |
| s796167816 | もしもーし！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167816.png |
| s796167817 | 花を贈るよ！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167817.png |
| s796167818 | 遊びにおいで待ってるよ！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167818.png |
| s796167819 | フルーツ食べよう！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167819.png |
| s796167820 | チルタイム！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167820.png |
| s796167821 | 偽りの人生はごめんだ！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 796167821.png |
| s796167822 | ビタミン取れよ！乾燥注意！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167822.png |
| s796167823 | ヤバい | attack | 1 | common | damage:6 | 6ダメージを与える。 | 796167823.png |
| s796167824 | 大志を抱け！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 796167824.png |
| s796167825 | いいなぁ | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167825.png |
| s796167826 | 頭を冷やせ！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167826.png |
| s796167827 | 親の言うことには一理ある | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167827.png |
| s796167828 | いつも感謝！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167828.png |
| s796167829 | ストレッチ！ストレッチ！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167829.png |
| s796167830 | 危機管理せよ！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 796167830.png |
| s796167831 | 自分のオリジナリティは何だ | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167831.png |
| s796167832 | 寛容であれ！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 796167832.png |

---

### Pack 8 — フォルダ: `stickers_33038748_ハスくんと仲間たち`

| id | name | type | cost | rarity | effects | description | image（ファイル名） |
|----|------|------|------|--------|---------|-------------|--------------------|
| s820777873 | それは健全なのか | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777873.png |
| s820777874 | 迎合するな | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777874.png |
| s820777875 | 無理に納得するな | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777875.png |
| s820777876 | それで本当に後悔しないか？ | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777876.png |
| s820777877 | もっと攻めろ！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 820777877.png |
| s820777878 | まだ主戦場ではない | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777878.png |
| s820777879 | ダイナミックに！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 820777879.png |
| s820777880 | 荒波にもまれてこい！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 820777880.png |
| s820777881 | 期待先行や | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777881.png |
| s820777882 | 迷う人は対象外 | attack | 1 | common | damage:6 | 6ダメージを与える。 | 820777882.png |
| s820777883 | 感情で動くな 設計で動け | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777883.png |
| s820777884 | とんだ誤解 | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777884.png |
| s820777885 | 大幅下方修正 | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777885.png |
| s820777886 | デブリ除去 | attack | 1 | common | damage:6 | 6ダメージを与える。 | 820777886.png |
| s820777887 | 静かで成熟したしくみ | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777887.png |
| s820777888 | 終わりではない！通過儀礼だ！！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 820777888.png |
| s820777889 | 観測狼に徹せよ！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777889.png |
| s820777890 | ……じー | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777890.png |
| s820777891 | 冷静に整理しよう | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777891.png |
| s820777892 | 偉いわけじゃない 劣っているわけでもない | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777892.png |
| s820777893 | 文句のつけようがない | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777893.png |
| s820777894 | 光が見えて来た | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777894.png |
| s820777895 | めでたい！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777895.png |
| s820777896 | 甘えていいんだよ | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777896.png |
| s820777897 | ご乱心 | attack | 1 | common | damage:6 | 6ダメージを与える。 | 820777897.png |
| s820777898 | おはよう | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777898.png |
| s820777899 | おはようございます | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777899.png |
| s820777900 | こんにちは | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777900.png |
| s820777901 | いい気分だな | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777901.png |
| s820777902 | お茶しよう | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777902.png |
| s820777903 | 遊ぼうよ | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777903.png |
| s820777904 | がんばろう | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777904.png |
| s820777905 | きっとできるよ | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777905.png |
| s820777906 | ためしてみよう | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777906.png |
| s820777907 | むずかしいな | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777907.png |
| s820777908 | 寂しいな | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777908.png |
| s820777909 | どうしてるかなぁ | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777909.png |
| s820777910 | 旅、行きたいな | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777910.png |
| s820777911 | 大丈夫だよ | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777911.png |
| s820777912 | 見守るよ | skill | 1 | common | block:5 | 5ブロックを得る。 | 820777912.png |

---

### Pack 9 — フォルダ: `stickers_34202299_ハス君といっしょpart.7`

| id | name | type | cost | rarity | effects | description | image（ファイル名） |
|----|------|------|------|--------|---------|-------------|--------------------|
| s847773233 | あまりに無力な存在 | skill | 1 | common | block:5 | 5ブロックを得る。 | 847773233.png |
| s847773234 | 朝日が光を放つ はい！ おはよう | attack | 1 | common | damage:6 | 6ダメージを与える。 | 847773234.png |
| s847773235 | さあ旅立とう！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 847773235.png |
| s847773236 | ありがとう！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 847773236.png |
| s847773237 | やぁ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 847773237.png |
| s847773238 | 一人では生きてはいけない 感謝 | skill | 1 | common | block:5 | 5ブロックを得る。 | 847773238.png |
| s847773239 | 限界へ挑戦 | attack | 1 | common | damage:6 | 6ダメージを与える。 | 847773239.png |
| s847773240 | 成長率8% | skill | 1 | common | block:5 | 5ブロックを得る。 | 847773240.png |
| s847773241 | 俯瞰せよ！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 847773241.png |
| s847773242 | まかせろ！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 847773242.png |
| s847773243 | お言葉をきこう！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 847773243.png |
| s847773244 | 連携プレー | attack | 1 | common | damage:6 | 6ダメージを与える。 | 847773244.png |
| s847773245 | 地獄で仏 | skill | 1 | common | block:5 | 5ブロックを得る。 | 847773245.png |
| s847773246 | 一触即発！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 847773246.png |
| s847773247 | おぬし ワルだな | attack | 1 | common | damage:6 | 6ダメージを与える。 | 847773247.png |
| s847773248 | 出来る時に親孝行はしとけ | skill | 1 | common | block:5 | 5ブロックを得る。 | 847773248.png |
| s847773249 | 作戦会議だ！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 847773249.png |
| s847773250 | 成敗いたす！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 847773250.png |
| s847773251 | 寄り添う寄り添うよ！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 847773251.png |
| s847773252 | 夢で会いましょう！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 847773252.png |
| s847773253 | 頭を冷やせ 深呼吸 | skill | 1 | common | block:5 | 5ブロックを得る。 | 847773253.png |
| s847773254 | 自分を守るのは、自分しかいない！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 847773254.png |
| s847773255 | 今日も一日（頑張りました） | skill | 1 | common | block:5 | 5ブロックを得る。 | 847773255.png |
| s847773256 | 孤独だな | skill | 1 | common | block:5 | 5ブロックを得る。 | 847773256.png |
| s847773257 | 物価高すぎる！ | skill | 1 | common | block:5 | 5ブロックを得る。 | 847773257.png |
| s847773258 | 豆腐メンタル | skill | 1 | common | block:5 | 5ブロックを得る。 | 847773258.png |
| s847773259 | くさるな | attack | 1 | common | damage:6 | 6ダメージを与える。 | 847773259.png |
| s847773260 | ざわわざわわざわわざわわ | skill | 1 | common | block:5 | 5ブロックを得る。 | 847773260.png |
| s847773261 | 投げるな！感情はすてろ！ | attack | 1 | common | damage:6 | 6ダメージを与える。 | 847773261.png |
| s847773262 | なくしものはないですか？ | skill | 1 | common | block:5 | 5ブロックを得る。 | 847773262.png |
| s847773263 | きょうは、心をほどく日 | skill | 1 | common | block:5 | 5ブロックを得る。 | 847773263.png |
| s847773264 | Checkmate! | attack | 1 | common | damage:6 | 6ダメージを与える。 | 847773264.png |

---

## 5. 作業手順

1. `src/data/cards.json` を本提案の232枚で**全置き換え**する  
   （`src/game/types.ts` への変更は**不要**。既存の型定義のみ使用する）
2. ゲームが起動し、attack / skill カードをプレイしてもクラッシュしないことを確認する

---

## 6. 集計サマリ

| 区分 | 枚数 |
|------|------|
| 総スタンプ数 | 232 |
| type: attack | 66 |
| type: skill | 166 |
| cost: 1 | 232 |
| rarity: common | 232 |
