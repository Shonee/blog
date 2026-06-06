# 标签目录

<script setup>
import { data as posts } from '../.vitepress/posts.data.mjs'

const groupedByTag = posts.reduce((acc, post) => {
  post.tags.forEach((tag) => {
    acc[tag] = acc[tag] || []
    acc[tag].push(post)
  })

  return acc
}, {})

const tags = Object.keys(groupedByTag).sort((a, b) => a.localeCompare(b, 'zh-CN'))
</script>

<div v-if="tags.length === 0">暂无标签。</div>

<details v-for="(tag, index) in tags" :key="tag" :open="index === 0">
  <summary>{{ tag }}（{{ groupedByTag[tag].length }}）</summary>
  <ul>
    <li v-for="post in groupedByTag[tag]" :key="`${tag}-${post.url}`">
      <a :href="post.url">{{ post.title }}</a>
      <span v-if="post.category"> · 分类：{{ post.category }}</span>
    </li>
  </ul>
</details>
