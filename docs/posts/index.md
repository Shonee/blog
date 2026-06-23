# 文章列表

按时间倒序展示所有文章，按年份和月份分组。

<script setup>
import { data as posts } from '../.vitepress/posts.data.mjs'
import { ref, computed, onMounted, onUnmounted } from 'vue'

const PAGE_SIZE = 10

const displayed = ref(PAGE_SIZE)
const sentinel = ref(null)

const monthNames = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${day}`
}

function getYear(dateStr) {
  if (!dateStr) return '未知年份'
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '未知年份' : String(d.getFullYear())
}

function getMonth(dateStr) {
  if (!dateStr) return '未知月份'
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '未知月份' : monthNames[d.getMonth()]
}

// sorted newest first (data loader already sorts, but ensure)
const sorted = computed(() =>
  [...posts].sort((a, b) => {
    if (a.date && b.date) return new Date(b.date) - new Date(a.date)
    if (a.date) return -1
    if (b.date) return 1
    return 0
  })
)

const visiblePosts = computed(() => sorted.value.slice(0, displayed.value))
const hasMore = computed(() => displayed.value < sorted.value.length)

// Group visible posts by year → month
const groups = computed(() => {
  const yearMap = new Map()
  for (const post of visiblePosts.value) {
    const y = getYear(post.date)
    const mo = getMonth(post.date)
    if (!yearMap.has(y)) yearMap.set(y, new Map())
    const monthMap = yearMap.get(y)
    if (!monthMap.has(mo)) monthMap.set(mo, [])
    monthMap.get(mo).push(post)
  }
  return yearMap
})

function loadMore() {
  if (hasMore.value) {
    displayed.value = Math.min(displayed.value + PAGE_SIZE, sorted.value.length)
  }
}

let observer = null
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => { if (entries[0].isIntersecting) loadMore() },
    { rootMargin: '200px' }
  )
  if (sentinel.value) observer.observe(sentinel.value)
})
onUnmounted(() => { if (observer) observer.disconnect() })
</script>

<div v-if="posts.length === 0" style="color:#888;padding:24px 0;">暂无文章。</div>

<div v-else class="post-timeline">
  <div v-for="[year, monthMap] in groups" :key="year" class="year-block">
    <h2 class="year-heading">{{ year }}</h2>
    <div v-for="[month, monthPosts] in monthMap" :key="month" class="month-block">
      <h3 class="month-heading">{{ month }}</h3>
      <ul class="post-list">
        <li v-for="post in monthPosts" :key="post.url" class="post-item">
          <span class="post-date">{{ formatDate(post.date) }}</span>
          <a :href="post.url" class="post-title">{{ post.title }}</a>
          <span v-if="post.tags && post.tags.length" class="post-tags">
            <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
          </span>
        </li>
      </ul>
    </div>
  </div>

  <div ref="sentinel" class="sentinel">
    <span v-if="hasMore" class="loading-hint">加载中…</span>
    <span v-else-if="posts.length > 0" class="end-hint">— 已加载全部 {{ posts.length }} 篇文章 —</span>
  </div>
</div>

<style scoped>
.post-timeline { padding: 8px 0; }

.year-heading {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 32px 0 4px;
  padding-bottom: 6px;
  border-bottom: 2px solid var(--vp-c-divider);
  color: var(--vp-c-brand-1);
}

.month-heading {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 18px 0 6px 4px;
  color: var(--vp-c-text-2);
}

.post-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-item {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  padding: 7px 0;
  border-bottom: 1px solid var(--vp-c-divider-light, #eee);
}

.post-date {
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  min-width: 80px;
}

.post-title {
  font-size: 0.97rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  text-decoration: none;
  flex: 1;
}
.post-title:hover { color: var(--vp-c-brand-1); text-decoration: underline; }

.post-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.tag {
  font-size: 0.74rem;
  padding: 1px 7px;
  border-radius: 10px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.sentinel { text-align: center; padding: 28px 0 8px; }
.loading-hint, .end-hint { font-size: 0.85rem; color: var(--vp-c-text-3); }
</style>
