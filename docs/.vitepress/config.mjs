import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'GitHub Docs',
  description: 'GitHub 相关内容文档',
  base: '/github_doc/',
  themeConfig: {
    nav: [{ text: '首页', link: '/' }],
    sidebar: [
      {
        text: '文档',
        items: [{ text: '介绍', link: '/' }]
      }
    ]
  }
})
