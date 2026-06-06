# slay-the-bearboy

Next.js 16.2.6 製のアプリケーション。ローカル開発は Docker Compose で完結します。

## 必要環境

- Docker / Docker Compose
- (任意) [Task](https://taskfile.dev)
    -  ショートカット用。なくてもdockerの操作を直接扱えるが、入れておくとdockerの操作を覚えずに利用ができる。

ホストに Node.js を入れる必要はありません。

## 起動

```sh
cp .env.example .env   # 初回のみ。PORT を変えたいときは編集
docker compose up -d
# または
task up
```

`http://localhost:${PORT}` (デフォルト 3000) でアクセスできます。ソースコードはバインドマウントされており、編集すると Next.js の HMR で即反映されます。

## 停止

```sh
docker compose down       # コンテナのみ
docker compose down -v    # node_modules / .next キャッシュも削除
# または
task down / task clean
```

## ポート変更

`.env` の `PORT` を書き換えて再起動します。

```sh
echo 'PORT=4000' > .env
task restart
```

## 依存パッケージの追加 / 更新

ホストに Node を入れていない場合はコンテナ内で実行するのが最も簡単です。`package.json` / `package-lock.json` はバインドマウントなのでホスト側にも反映されます。

```sh
docker compose exec web npm install zustand
# または
task install -- zustand
```

ホストで `npm install` したい場合は watch モードで起動しておくと、`package-lock.json` の変更を検知してコンテナ内で自動的に `npm install` が走ります。

```sh
task up:watch        # docker compose up --watch
# 別ターミナルで
npm install zustand  # ホスト側
```

`docker compose restart web` で起動しなおしても、起動コマンドの先頭で `npm install` が実行されるため依存の差分は取り込まれます。

## よく使うコマンド (Taskfile)

| コマンド | 用途 |
|---|---|
| `task up` | コンテナ起動 (バックグラウンド) |
| `task up:watch` | 起動 + ファイル監視 (自動 npm install) |
| `task down` | 停止 |
| `task clean` | ボリュームまで削除 |
| `task restart` | web 再起動 |
| `task logs` | ログ追跡 |
| `task shell` | コンテナ内に入る |
| `task install -- <pkg>` | パッケージ追加 |
| `task lint` | lint 実行 |
| `task build` | イメージ再ビルド |

## ファイル構成 (Docker 関連)

- `Dockerfile` — Node.js 20 Alpine ベースの開発用イメージ
- `docker-compose.yml` — web サービス定義、ボリューム、watch 設定
- `.dockerignore` — ビルドコンテキストから除外するパス
- `.env` — `PORT` などの環境変数 (gitignore 対象)
- `.env.example` — `.env` の雛形
- `Taskfile.yml` — よく使うコマンドのショートカット
