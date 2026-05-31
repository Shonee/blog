import { defineConfig } from 'vitepress'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const configDir = dirname(fileURLToPath(import.meta.url))
const articlesDir = resolve(configDir, '../articles')
const articlesSortLocale = 'zh-CN'
const articlesIndexFile = 'index.md'

function extractArticleTitle(content, fallbackTitle) {
  const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\s*/, '')
  const titleMatch = contentWithoutFrontmatter.match(/^#\s+(.+)$/m)
  return titleMatch?.[1]?.trim() || fallbackTitle
}

function getArticleItems() {
  try {
    return readdirSync(articlesDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== articlesIndexFile)
      .map((entry) => {
        const fileName = entry.name.replace(/\.md$/, '')
        const content = readFileSync(resolve(articlesDir, entry.name), 'utf-8')
        const text = extractArticleTitle(content, fileName)

        return {
          text,
          link: `/articles/${encodeURIComponent(fileName)}`
        }
      })
      .sort((a, b) => a.text.localeCompare(b.text, articlesSortLocale))
  } catch {
    return []
  }
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
    outline: [2, 4],
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
