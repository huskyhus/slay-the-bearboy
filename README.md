# slay-the-bearboy

## ディレクトリ構成

```
slay-the-bearboy/
├── src/          # アプリケーションコード
│   ├── app/      # Next.js App Router
│   ├── game/     # 純粋ロジック（DOM/React 非依存）
│   ├── ui/       # React コンポーネント
│   ├── store/    # Zustand ストア
│   └── data/     # カード・敵定義（JSON）
├── stickers/     # ハスくん LINE スタンプ素材
├── docs/         # 仕様・提案ドキュメント
├── compose.yaml  # ローカル開発用 Docker Compose
├── Taskfile.yml  # よく使うコマンドのショートカット
└── ...
```

## デプロイと Docker の位置づけ

- **本番デプロイは Vercel**。`git push` で自動デプロイされる。
- **Docker (`compose.yaml`) はローカル開発専用**。カスタムイメージは不要なため Dockerfile は持たず、公式 `node` イメージを直接使う。ソースはバインドマウントで動かす。

## タスク

- 起動は`task up`, 停止は`task down`で行う。
- (Nodeがローカルにない場合は起動中のみ,) lintは`task lint`、パッケージ追加は`task install -- <name>`（例: `task install -- zustand`）で行う。
- Taskを入れていない場合は対応するdocker composeコマンドを直接叩いてもよい。

## 関連ドキュメント

- [docs/game.md](docs/game.md) — ゲーム仕様
- [docs/slay-the-bearboy-proposal.md](docs/slay-the-bearboy-proposal.md) — 提案書
- [AGENTS.md](AGENTS.md) — AI エージェント向けガイド
