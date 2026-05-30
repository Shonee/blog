# github_doc

使用 VitePress 构建 GitHub 相关文档，并通过 GitHub Actions 自动部署到 GitHub Pages。

## 本地开发

```bash
npm install
npm run docs:dev
```

## 构建

```bash
npm run docs:build
```

## 自动部署

当 `docs/` 目录下文档新增或更新并推送到 `main` 分支时，`.github/workflows/deploy-docs.yml` 会自动触发构建与发布。
