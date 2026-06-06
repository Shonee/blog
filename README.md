# blog

基于 VitePress 的个人技术博客，支持多主题目录、分类、标签和自动部署。

## 目录结构

```text
.
├── docs/
│   ├── .vitepress/
│   │   ├── config.mjs
│   │   └── posts.data.mjs
│   ├── posts/
│   │   ├── github/
│   │   ├── cloudflare/
│   │   ├── nas/
│   │   └── ai/
│   ├── categories/
│   │   └── index.md
│   ├── tags/
│   │   └── index.md
│   └── index.md
├── .github/workflows/deploy-docs.yml
└── package.json
```

## 本地开发

```bash
npm install
npm run docs:dev
```

## 本地构建验证

```bash
npm run docs:build
npm run docs:preview
```

## 新增文章

1. 在 `docs/posts/<topic>/` 下新增 Markdown 文件，例如：`docs/posts/github/new-post.md`。
2. 在文章顶部添加 Frontmatter：

```yaml
---
title: 文章标题
date: 2026-06-02
category: github
tags:
  - github
  - vitepress
---
```

3. 保存后：
   - 左侧 Sidebar 会按主题自动归类并支持折叠展开。
   - `文章列表 / 分类目录 / 标签目录` 页面会自动收录。

## 自动渲染与部署

当 `docs/**`、`package.json`、`package-lock.json` 或 `.github/workflows/deploy-docs.yml` 发生变更并推送到 `master` 分支后，GitHub Actions 会自动执行：

1. `npm ci`
2. `npm run docs:build`
3. 发布 `docs/.vitepress/dist` 到 GitHub Pages
