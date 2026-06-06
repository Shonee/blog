import { createContentLoader } from 'vitepress'

const categoryLabels = {
  github: 'GitHub',
  cloudflare: 'Cloudflare',
  nas: 'NAS',
  ai: 'AI'
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean)
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  return []
}

function inferCategoryFromUrl(url) {
  const segments = url.split('/').filter(Boolean)
  return segments[1] || 'uncategorized'
}

export default createContentLoader('posts/**/*.md', {
  excerpt: true,
  transform(raw) {
    return raw
      .filter((post) => post.url !== '/posts/')
      .map((post) => {
        const categorySlug =
          post.frontmatter.category?.toString().toLowerCase() ||
          inferCategoryFromUrl(post.url).toLowerCase()

        return {
          title: post.frontmatter.title || post.title,
          url: post.url,
          excerpt: post.excerpt,
          date: post.frontmatter.date || '',
          category: categoryLabels[categorySlug] || categorySlug,
          tags: normalizeTags(post.frontmatter.tags)
        }
      })
      .sort((a, b) => {
        if (a.date && b.date) {
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        }

        if (a.date) return -1
        if (b.date) return 1

        return a.title.localeCompare(b.title, 'zh-CN')
      })
  }
})
