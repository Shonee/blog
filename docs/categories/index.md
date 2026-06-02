# 分类目录

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

<div v-if="categories.length === 0">暂无分类。</div>

<details v-for="(category, index) in categories" :key="category" :open="index === 0">
  <summary>{{ category }}（{{ groupedByCategory[category].length }}）</summary>
  <ul>
    <li v-for="post in groupedByCategory[category]" :key="post.url">
      <a :href="post.url">{{ post.title }}</a>
    </li>
  </ul>
</details>
