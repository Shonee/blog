# 文章列表

按主题展示文章，支持折叠与展开。

<script setup>
import { data as posts } from '../.vitepress/posts.data.mjs'

const groupedByCategory = posts.reduce((acc, post) => {
  const key = post.category || '未分类'
  acc[key] = acc[key] || []
  acc[key].push(post)
  return acc
}, {})

const categories = Object.keys(groupedByCategory).sort((a, b) => a.localeCompare(b, 'zh-CN'))
</script>

<div v-if="posts.length === 0">暂无文章。</div>

<details v-for="(category, index) in categories" :key="category" :open="index === 0">
  <summary>{{ category }}（{{ groupedByCategory[category].length }}）</summary>
  <ul>
    <li v-for="post in groupedByCategory[category]" :key="post.url">
      <a :href="post.url">{{ post.title }}</a>
      <span v-if="post.date"> · {{ post.date }}</span>
      <span v-if="post.tags.length"> · 标签：{{ post.tags.join(' / ') }}</span>
    </li>
  </ul>
</details>
