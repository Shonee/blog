import { defineConfig } from 'vitepress'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const articlesDir = resolve(process.cwd(), 'docs/articles')

function getArticleItems() {
  return readdirSync(articlesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md')
    .map((entry) => {
      const fileName = entry.name.replace(/\.md$/, '')
      const content = readFileSync(resolve(articlesDir, entry.name), 'utf-8')
      const titleMatch = content.match(/^#\s+(.+)$/m)
      const text = titleMatch?.[1]?.trim() || fileName

      return {
        text,
        link: `/articles/${encodeURIComponent(fileName)}`
      }
    })
    .sort((a, b) => a.text.localeCompare(b.text, 'zh-Hans-CN'))
}

const articleItems = getArticleItems()

export default defineConfig({
  title: 'GitHub Docs',
  description: 'GitHub 相关内容文档',
  base: '/github_doc/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '博客', link: '/articles/' }
    ],
    outline: [2, 6],
    sidebar: [
      {
        text: '文档',
        items: [{ text: '介绍', link: '/' }]
      },
      {
        text: '博客',
        items: [{ text: '文章列表', link: '/articles/' }, ...articleItems]
      }
    ]
  }
})
