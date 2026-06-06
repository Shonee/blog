import { defineConfig } from 'vitepress'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const configDir = dirname(fileURLToPath(import.meta.url))
const postsDir = resolve(configDir, '../posts')
const postsIndexFile = 'index.md'
const locale = 'zh-CN'

const topicLabels = {
  github: 'GitHub',
  cloudflare: 'Cloudflare',
  nas: 'NAS',
  ai: 'AI'
}

function stripQuotes(text) {
  return text.replace(/^['\"]|['\"]$/g, '')
}

function extractArticleTitle(content, fallbackTitle) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (frontmatterMatch) {
    const titleLine = frontmatterMatch[1]
      .split('\n')
      .find((line) => line.trim().startsWith('title:'))

    if (titleLine) {
      return stripQuotes(titleLine.split(':').slice(1).join(':').trim()) || fallbackTitle
    }
  }

  const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\s*/, '')
  const headingMatch = contentWithoutFrontmatter.match(/^#\s+(.+)$/m)

  return headingMatch?.[1]?.trim() || fallbackTitle
}

function formatTopicName(topic) {
  return topicLabels[topic] || topic.toUpperCase()
}

function getTopicSections() {
  try {
    return readdirSync(postsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        const topic = entry.name
        const topicDir = resolve(postsDir, topic)

        const items = readdirSync(topicDir, { withFileTypes: true })
          .filter(
            (child) =>
              child.isFile() &&
              child.name.endsWith('.md') &&
              child.name !== postsIndexFile
          )
          .map((child) => {
            const slug = child.name.replace(/\.md$/, '')
            const content = readFileSync(resolve(topicDir, child.name), 'utf-8')

            return {
              text: extractArticleTitle(content, slug),
              link: `/posts/${topic}/${encodeURIComponent(slug)}`
            }
          })
          .sort((a, b) => a.text.localeCompare(b.text, locale))

        return {
          text: formatTopicName(topic),
          collapsed: true,
          items
        }
      })
      .filter((section) => section.items.length > 0)
      .sort((a, b) => a.text.localeCompare(b.text, locale))
  } catch {
    return []
  }
}

const topicSections = getTopicSections()

export default defineConfig({
  title: 'Shonee Blog',
  description: '个人技术博客：GitHub、Cloudflare、NAS、AI 等主题',
  base: '/blog/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/' },
      { text: '分类', link: '/categories/' },
      { text: '标签', link: '/tags/' }
    ],
    outline: [2, 4],
    sidebar: [
      {
        text: '导航',
        items: [
          { text: '首页', link: '/' },
          { text: '文章列表', link: '/posts/' },
          { text: '分类目录', link: '/categories/' },
          { text: '标签目录', link: '/tags/' }
        ]
      },
      {
        text: '主题文章',
        items:
          topicSections.length > 0
            ? topicSections
            : [{ text: '暂无文章', link: '/posts/' }]
      }
    ]
  }
})
