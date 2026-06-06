# slay-the-bearboy

Next.js 16.2.6 製のアプリケーション。3通りの方法で起動できます。

## ディレクトリ構成

```
slay-the-bearboy/
├── app/         # Next.js プロジェクト (package.json, src/, app/, public/, ...)
├── docker/      # Dockerfile, docker-compose.yml, .env
├── docs/        # 仕様・提案ドキュメント
├── Taskfile.yml # よく使うコマンドのショートカット
└── .mise.toml   # Node.js バージョン定義 (mise 使用時)
```

## 起動方法

利用環境に応じて3通りから選べます。いずれも `http://localhost:${PORT}` (デフォルト 3000) でアクセスできます。

### 1. Docker を使わない (Node.js のみ)

Node.js 20 を使います。バージョン管理は [mise](https://mise.jdx.dev/) を入れていれば `.mise.toml` から自動セットアップできます。

```sh
mise install    # 初回のみ。mise を入れていない場合は手動で Node.js 20 を用意
cd app
npm install
npm run dev
```

### 2. Docker を直接使う (Task 不要)

```sh
cp docker/.env.example docker/.env   # 初回のみ
cd docker
docker compose up -d
```

### 3. Task を使う (ルートから)

```sh
cp docker/.env.example docker/.env   # 初回のみ
task up
```

## ポート変更

`docker/.env` の `PORT` を書き換えて再起動します。Node.js 直接起動の場合は `PORT=4000 npm run dev`。

## 停止

```sh
# Docker 直接
cd docker && docker compose down       # コンテナのみ
cd docker && docker compose down -v    # node_modules / .next キャッシュも削除

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
docker compose -f docker/docker-compose.yml exec web npm install zustand
```

### ホスト Node 利用時
```sh
cd app && npm install zustand
```

Docker 利用中にホスト側で `package.json` を変更した場合、`task restart` (起動コマンドの先頭で `npm install` が走る) で取り込めます。

## Taskfile コマンド一覧

| コマンド | 用途 |
|---|---|
| `task up` | コンテナ起動 (バックグラウンド) |
| `task down` | 停止 |
| `task clean` | ボリュームまで削除 |
| `task restart` | web 再起動 |
| `task logs` | ログ追跡 |
| `task shell` | コンテナ内に入る |
| `task install -- <pkg>` | パッケージ追加 |
| `task lint` | lint 実行 |
| `task build` | イメージ再ビルド |

## 関連ドキュメント

- [docs/game.md](docs/game.md) — ゲーム仕様
- [docs/slay-the-bearboy-proposal.md](docs/slay-the-bearboy-proposal.md) — 提案書
- [AGENTS.md](AGENTS.md) — AI エージェント向けガイド
