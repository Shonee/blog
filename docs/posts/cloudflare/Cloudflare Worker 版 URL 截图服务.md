---
title: Cloudflare Worker 版 URL 截图服务
slug: screenshot-worker
summary: 用 Cloudflare Worker + Browser Run Quick Actions 复现 Docker 版 URL 截图 API，单文件粘贴部署。
description: 本文参考 39.la 的 Docker + browserless/chrome 截图服务，给出可直接粘贴到 Cloudflare Worker 的 worker.js 实现，包含完整部署步骤、wrangler.toml 配置与接口说明。
---

> 参考原文：[部署一个依据 URL 截图的 API](https://www.39.la/article/388)\
> 目标：在 Cloudflare Worker 上实现一个可粘贴部署的截图接口，复现原文 `/screenshot` 的核心功能。

***

## 一、原文方案概述

原文使用 Docker + `browserless/chrome` + `Express` + `puppeteer-core` 搭建截图 API。

### 项目结构

```text
/screenshot-service
  ├── docker-compose.yml
  └── api/
      ├── Dockerfile
      ├── package.json
      ├── package-lock.json
      └── index.js
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  browserless:
    image: browserless/chrome:latest
    environment:
      - MAX_CONCURRENT=10
      - MAX_QUEUE_LENGTH=100
      - TOKEN=换成你自己的token
      - DEFAULT_BLOCK_ADS=true
      - KEEP_ALIVE=true
      - DEFAULT_DISABLE_CACHE=true
    ports:
      - "3000:3000"
    restart: unless-stopped

  api:
    build: ./api
    environment:
      - BROWSERLESS_WS_URL=ws://browserless:3000?token=换成前面的 token
      - PORT=8080
    ports:
      - "8080:8080"
    depends_on:
      - browserless
```

### api/index.js

```javascript
const express = require('express');
const puppeteer = require('puppeteer-core');
const app = express();
const port = process.env.PORT || 8080;

app.get('/screenshot', async (req, res) => {
  const { url, width = 1280, height = 720, fullPage = 'false' } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: process.env.BROWSERLESS_WS_URL,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: parseInt(width), height: parseInt(height) });
    await page.goto(url, { waitUntil: 'networkidle2', cache: false });

    const screenshot = await page.screenshot({
      fullPage: fullPage === 'true',
      type: 'png',
    });

    await browser.close();

    res.set('Content-Type', 'image/png');
    res.send(screenshot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to capture screenshot' });
  }
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
```

### 部署命令

```bash
docker-compose up -d --build
```

***

## 二、Cloudflare Worker 版实现

Cloudflare Worker 无法直接运行 Chromium，因此使用 **Cloudflare Browser Run（原 Browser Rendering）Quick Actions** 的 `env.BROWSER.quickAction('screenshot', ...)` 能力，无需 Docker、无需 npm 依赖，单文件即可部署。

### worker.js

```javascript
// Cloudflare Worker：URL 截图服务
// 部署方式：将本文件粘贴到 Cloudflare Worker 编辑器（或保存为 worker.js 后用 Wrangler 部署）
// 必要前提：在 Worker 设置中添加名为 BROWSER 的 Browser / Browser Rendering 绑定
//
// 用法：GET /screenshot?url=https://example.com&width=1280&height=720&fullPage=false
// 返回：PNG 图片

export default {
  async fetch(request, env, ctx) {
    const reqUrl = new URL(request.url);

    if (reqUrl.pathname !== '/screenshot') {
      return new Response(
        'Usage: /screenshot?url=https://example.com&width=1280&height=720&fullPage=false',
        { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      );
    }

    const targetUrl = reqUrl.searchParams.get('url');
    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: 'URL parameter is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!env.BROWSER) {
      return new Response(
        JSON.stringify({ error: 'BROWSER binding is not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const width = parseInt(reqUrl.searchParams.get('width') || '1280', 10);
    const height = parseInt(reqUrl.searchParams.get('height') || '720', 10);
    const fullPage = reqUrl.searchParams.get('fullPage') === 'true';

    try {
      const screenshot = await env.BROWSER.quickAction('screenshot', {
        url: targetUrl,
        viewport: {
          width,
          height,
          deviceScaleFactor: 1,
        },
        gotoOptions: {
          waitUntil: 'networkidle2',
          timeout: 30000,
        },
        screenshotOptions: {
          type: 'png',
          fullPage,
        },
      });

      // quickAction 在 Worker 绑定中通常返回一个 Response 对象
      if (screenshot && typeof screenshot.arrayBuffer === 'function') {
        const headers = new Headers(screenshot.headers);
        headers.set('Content-Type', 'image/png');
        headers.set('Cache-Control', 'public, max-age=300');
        return new Response(screenshot.body, {
          status: screenshot.status,
          statusText: screenshot.statusText,
          headers,
        });
      }

      // 如果返回的是二进制数据，则直接包装成 Response
      return new Response(screenshot, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=300',
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Failed to capture screenshot',
          details: error && error.message ? error.message : String(error),
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  },
};
```

***

## 三、部署方式

### 方式 A：Cloudflare 控制台直接粘贴

1. 登录 Cloudflare 控制台，创建一个新的 Worker。
2. 进入 Worker 的 **Settings > Variables and Secrets / Bindings**，点击 **Add Binding**，选择 **Browser**，名称填写 `BROWSER`。
3. 将 Worker 的 **Compatibility date** 设置为 `2026-03-24` 或更新版本。
4. 将上面的 `worker.js` 内容粘贴到编辑器，点击 **Deploy**。

### 方式 B：Wrangler 部署

```text
.
├── worker.js
└── wrangler.toml
```

**wrangler.toml**

```toml
name = "screenshot-worker"
main = "worker.js"
compatibility_date = "2026-07-19"
compatibility_flags = ["nodejs_compat_v2"]

[browser]
binding = "BROWSER"
```

```bash
wrangler deploy
```

***

## 四、接口对照

| 参数         | 类型      | 默认值   | 说明       |
| ---------- | ------- | ----- | -------- |
| `url`      | string  | 必填    | 要截图的目标网址 |
| `width`    | number  | 1280  | 浏览器视口宽度  |
| `height`   | number  | 720   | 浏览器视口高度  |
| `fullPage` | boolean | false | 是否截取完整页面 |

### 测试命令

```bash
curl "https://<你的worker域名>/screenshot?url=https://example.com&width=1280&height=720&fullPage=false" -o screenshot.png
```

***

## 五、注意事项

* **Browser Run 需开通**：Cloudflare Browser Run（Browser Rendering）需要账户启用，并注意其计费与免费额度。
* **兼容性日期**：使用 `env.BROWSER.quickAction` 要求 Worker 的 `compatibility_date` 不低于 `2026-03-24`。
* **无状态服务**：Worker 不保留浏览器会话，每次请求独立截图，适合轻量 API 场景。
* **超时与限额**：根据目标页面复杂度和 Cloudflare 平台限制，截图可能存在超时或并发限制。

***

## 六、参考文档

* [39.la 原文：部署一个依据 URL 截图的 API](https://www.39.la/article/388)
* [Cloudflare Browser Run 官方文档](https://developers.cloudflare.com/browser-run/)
* [Browser Run Quick Actions](https://developers.cloudflare.com/browser-run/quick-actions/)
* [Screenshot endpoint 参数说明](https://developers.cloudflare.com/browser-rendering/quick-actions/screenshot-endpoint/)
* [Wrangler Browser 绑定配置](https://developers.cloudflare.com/browser-run/reference/wrangler/)
* [在 Worker 中直接调用 Quick Actions 的公告](https://developers.cloudflare.com/changelog/post/2026-05-28-use-browser-run-quick-actions-directly-from-workers/)
