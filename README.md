# slay-the-bearboy

Next.js 16.2.6 製のアプリケーション。3通りの方法で起動できます。

## ディレクトリ構成

```
slay-the-bearboy/
├── src/          # アプリケーションコード（src 規約）
│   ├── app/      # Next.js App Router（ページ）
│   ├── game/     # 純粋ロジック（DOM/React 非依存）
│   ├── ui/       # React コンポーネント
│   ├── store/    # Zustand ストア
│   └── data/     # カード・敵定義（JSON）
├── stickers/     # ハスくん LINE スタンプ素材（原本）
├── compose.yaml  # ローカル開発用 Docker Compose
├── docs/         # 仕様・提案ドキュメント
├── Taskfile.yml  # よく使うコマンドのショートカット
└── package.json  # 設定類はリポジトリ直下（tsconfig, next.config, ...）
```

import エイリアスは `@/*` → `src/*`（例: `@/game/types`, `@/data/cards.json`）。

## デプロイと Docker の位置づけ

- **本番デプロイは Vercel**。`git push` で自動デプロイされる。Next.js プロジェクトはリポジトリ直下にあるため、Vercel の Root Directory はデフォルト（ルート）のままでよい。
- **Docker (`compose.yaml`) はローカル開発専用**。Vercel は本番ビルドで Docker を使わない（独自に `next build` する）ため、Docker 設定は本番に影響しない。
- カスタムイメージは不要なため Dockerfile は持たず、公式 `node` イメージを直接使う。ソースはバインドマウントで動かす。

## 起動方法

利用環境に応じて3通りから選べます。いずれも `http://localhost:3000` でアクセスできます。

### 1. Docker を使わない (Node.js のみ)

Node.js 24 がインストールされていれば、それだけで起動できます。

```sh
npm install
npm run dev
```

### 2. Docker を直接使う (Task 不要)

```sh
docker compose up -d
```

### 3. Task を使う (ルートから)

```sh
task up
```

## 停止

```sh
# Docker 直接
docker compose down       # コンテナのみ
docker compose down -v    # node_modules / .next キャッシュも削除

# Task
task down
task clean   # ボリュームまで削除
```

## 依存パッケージの追加

### Docker 利用時
ホストに Node が無い場合はコンテナ内で実行します。`package.json` / `package-lock.json` はバインドマウントなのでホスト側にも反映されます。

```sh
task install -- zustand
# または
docker compose exec web npm install zustand
```

### ホスト Node 利用時
```sh
npm install zustand
```

Docker 利用中にホスト側で `package.json` を変更した場合、`task down && task up` で再起動すれば、起動コマンドの先頭で `npm install` が走るので取り込まれます。

## Taskfile コマンド一覧

| コマンド | 用途 |
|---|---|
| `task up` | コンテナ起動 (バックグラウンド) |
| `task down` | 停止 |
| `task clean` | ボリュームまで削除 |
| `task install -- <pkg>` | パッケージ追加 |
| `task lint` | lint 実行 |

## 関連ドキュメント

- [docs/game.md](docs/game.md) — ゲーム仕様
- [docs/slay-the-bearboy-proposal.md](docs/slay-the-bearboy-proposal.md) — 提案書
- [AGENTS.md](AGENTS.md) — AI エージェント向けガイド
