---
title: "Playwright vs agent-browser：AI 时代的浏览器自动化双雄完全对比"
slug: playwright-vs-agent-browser
summary: 从架构到实战，全面对比 Playwright 和 agent-browser，帮你为 AI Agent、爬虫、测试等场景选对浏览器自动化工具。
description: 本文深度对比微软 Playwright 和 Vercel agent-browser 两大浏览器自动化框架，覆盖功能特性、项目架构、安装使用、AI Agent 集成（Hermes Agent、Claude、Codex、Cursor、OpenClaw 等），以及爬虫、测试、数据采集等场景的选择指南。
coverImage: imgs/cover.png
---

# Playwright vs agent-browser：AI 时代的浏览器自动化双雄完全对比

## Playwright：微软的浏览器自动化基石

### 是什么

**Playwright** 是由微软开发并维护的开源浏览器自动化框架，2020 年 1 月正式发布。它的核心团队来自 Google Puppeteer 的原班人马——2019 年这批工程师从 Google 跳槽到微软，从零打造了 Playwright，目标是从第一天就解决 Puppeteer 只支持 Chrome 的局限。

Playwright 提供统一的 API 来操控 Chromium、Firefox、WebKit 三大浏览器引擎，支持 Python、TypeScript/JavaScript、Java、.NET 四种语言绑定。虽然官方定位偏向端到端测试（E2E Testing），但它本质上是一个**通用浏览器自动化库**——爬虫、PDF 生成、截图、AI Agent 交互都能胜任。

**当前版本：** v1.61（2025 年中），GitHub 主仓库 91,400+ stars，Python 仓库 14,000+ stars。采用 Apache 2.0 许可证。

### 功能特性

**跨浏览器一致性：** 一套代码驱动 Chromium、Firefox、WebKit 三大引擎，自动化行为高度一致。每个 Playwright 版本固定绑定特定浏览器版本（如 Chromium 149.0.7827.55、Firefox 151.0、WebKit 26.5）。

**自动等待机制（Auto-waiting）：** 执行操作前自动等待元素变为可操作状态（可见、可点击、稳定），这是 Playwright 区别于 Selenium/Puppeteer 的核心设计。它消除了不可靠的固定延时，大幅降低 flaky 测试概率。

**浏览器上下文隔离（BrowserContext）：** 每个自动化会话在独立的浏览器上下文中运行，拥有完全隔离的 Cookie、缓存和存储。上下文共享同一个浏览器进程，实现近乎零开销的并行——这是 Playwright 架构的杀手锏。

**弹性定位器（Locators）：** 提供 `get_by_role`、`get_by_text`、`get_by_label`、`get_by_placeholder`、`get_by_test_id` 等语义化定位方法，比脆弱的 CSS 选择器或 XPath 更稳定。支持链式定位和过滤（`filter`、`and_`、`or_`、`first`、`last`、`nth`）。

**Accessibility Tree 快照：** 将页面 DOM 转化为结构化可访问性树，每个交互元素带有唯一 ref ID（如 `ref=e5`）。AI Agent 可以直接通过文本化结构理解页面，无需视觉截图。这也是 Playwright MCP Server 的核心机制。

**网络拦截与 Mock：** 支持路由层拦截、修改、阻断网络请求，可模拟各种响应、录制 HAR 文件、重放网络状态。

**MCP Server（@playwright/mcp）：** 微软官方维护的 Model Context Protocol 服务器，暴露 23 个核心工具（navigate、click、type、screenshot、evaluate 等）+ 6 个可选能力模块（Vision、PDF、Devtools、Storage、Testing、Network），让 AI Agent 直接控制浏览器。

### 项目架构

Playwright 采用**三层客户端 - 服务器架构**：

```
[Python/Java/.NET 客户端] ←WebSocket→ [Node.js 服务端] ←协议→ [浏览器]
[JS/TS 客户端 (与服务端同进程)]
```

**第一层——语言绑定（Client Bindings）：** JavaScript/TypeScript 与服务端运行在同一 Node.js 进程中（零开销）。Python、Java、.NET 各自作为独立客户端进程，通过 WebSocket 与 Node.js 服务端通信。这意味着每次 Python API 调用都要走：Python → WebSocket → Node.js → 浏览器协议 → 浏览器。

**第二层——中央服务端（Node.js Core）：** Playwright 的"大脑"。将高级 API（如 `page.click()`）转化为底层协议命令，维护与浏览器的持久 WebSocket 连接，实现自动等待逻辑，路由浏览器事件回客户端。

**第三层——浏览器协议层：** Chromium 使用原生 CDP（Chrome DevTools Protocol）。Firefox 和 WebKit 由 Playwright 团队直接向其源码贡献了 CDP 兼容协议层——这就是为什么 Playwright 必须使用自己定制的浏览器二进制文件而非系统浏览器。

**架构影响：** 浏览器二进制由 Playwright 管理（定制版本），每个 Playwright 版本锁定特定浏览器版本。非 JS 语言的 API 调用存在双 RPC 跳延迟，在长时间运行的 Agent 会话中可能导致状态漂移。

### 安装 / 更新 / 卸载

**安装（Python）：**

```bash
# 安装 Python 包
pip install playwright

# 下载浏览器二进制（可选特定引擎）
playwright install              # 全部（Chromium + Firefox + WebKit）
playwright install chromium     # 仅 Chromium
playwright install --with-deps  # 含系统级依赖（Linux/CI 推荐）
```

安装体积约 500MB（含三大浏览器）。二进制存储在 `~/Library/Caches/ms-playwright`（macOS）或 `~/.cache/ms-playwright`（Linux）。

**更新：**

```bash
pip install --upgrade playwright
playwright install   # 重新下载对应版本浏览器，自动清理旧版
```

**卸载：**

```bash
pip uninstall playwright
# 手动删除浏览器缓存
rm -rf ~/Library/Caches/ms-playwright   # macOS
rm -rf ~/.cache/ms-playwright           # Linux
```

### 使用方法

**同步 API（简单脚本）：**

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("https://example.com")
    page.get_by_role("button", name="Submit").click()
    page.screenshot(path="result.png")
    browser.close()
```

**异步 API（高并发场景）：**

```python
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        await page.goto("https://example.com")
        title = await page.title()
        print(title)
        await browser.close()

asyncio.run(main())
```

**状态持久化：**

```python
# 保存登录态
context.storage_state(path="state.json")
# 恢复登录态
context = browser.new_context(storage_state="state.json")
```

***

## agent-browser：Vercel 的 Rust 原生 AI 浏览器 CLI

### 是什么

**agent-browser** 是 Vercel Labs（Next.js 背后的公司 Vercel 的研究部门）开发的 Rust 原生浏览器自动化 CLI 工具，专为 AI Agent 设计。2025 年 1 月首发 v0.6.0，到 2025 年 6 月已迭代至 v0.29.0（平均每 3-4 天一个版本），GitHub 36,700+ stars。采用 Apache 2.0 许可证。

与 Playwright 不同，agent-browser 不是一个编程库，而是一个**命令行工具**。AI Agent 通过执行 shell 命令来控制浏览器——Vercel 认为 CLI 是 AI Agent 比 MCP 更好的浏览器接口，声称相比 Playwright MCP 能减少 **94% 的 token 消耗**（10 步交互：agent-browser 约 7,000 tokens vs Playwright MCP 约 114,000 tokens）。

### 功能特性

**50+ CLI 命令：** 覆盖导航、点击、输入、滚动、数据提取、状态验证、网络拦截、Cookie 管理、截图、PDF 导出等完整的浏览器操作集。

**Accessibility Tree + Refs：** `snapshot` 命令生成可访问性树，每个交互元素分配稳定引用（如 `@e1`、`@e2`）。这是 AI Agent "看到"页面的核心方式。`--interactive` 标志可过滤掉非交互元素，将典型页面压缩到约 280 字符。

**标注截图（Annotated Screenshots）：** 在截图上为交互元素添加编号覆盖层，帮助 Agent 直观理解页面布局（仅 CDP 引擎支持，不支持 Safari/WebDriver）。

**客户端 - 守护进程架构：** CLI 客户端在 1 毫秒内解析命令，后台 Rust 守护进程通过 CDP 直接与浏览器通信。守护进程运行时**不需要 Node.js 或 Playwright**。

**浏览器自动检测：** 自动检测已安装的 Chrome、Brave、Playwright Chromium、Puppeteer Chromium，无需自己管理浏览器二进制。也可下载 Chrome for Testing 作为默认引擎。

**会话状态管理：** 保存/加载/重命名/清理浏览器状态（Cookie + 存储），支持加密凭证保管库（Encrypted Credential Vault）。

**Chrome Profile 复用：** 创建用户 Chrome 配置文件的只读临时副本，复用已有登录态。

**网络控制：** 路由拦截（Mock、Abort、修改响应）、资源类型过滤、请求检查、HAR 录制。

**React DevTools 集成：** 检查 React 组件树、跟踪重渲染、分析 Suspense 边界。

**Web Vitals 报告：** 测量 LCP、CLS、INP 等核心 Web 指标。

**可观测性仪表盘：** 本地 Web 仪表盘（端口 4848）实时查看浏览器视口和活动。

**云端集成：** 支持 Browserless、Browserbase、Browser Use、Kernel、AWS AgentCore（Bedrock）等云浏览器提供商。

**MCP Server：** 虽然 CLI 是主要接口，但也提供 stdio MCP 服务器（v0.28.0 起），支持 MCP 兼容的 Agent。

**Skills 系统：** 内置版本匹配的 AI Agent 指令集，教 Agent 最优的命令模式和工作流。

### 项目架构

```
[AI Agent] → [CLI 客户端 (Rust)] → [后台守护进程 (Rust)] → [CDP 协议] → [浏览器]
```

**CLI 客户端：** 纯 Rust 编写，负责解析命令行参数（< 1ms 延迟）。这是 AI Agent 直接交互的接口。

**后台守护进程：** 纯 Rust 持久进程，通过 Chrome DevTools Protocol 直接与浏览器通信。**关键区别：** 守护进程运行时完全不需要 Node.js 或 Playwright，消除了 Playwright 的双 RPC 跳问题。

**浏览器引擎：** 默认 Chrome for Testing（自动下载），也可自动检测已有安装。支持 iOS Safari（通过 WebDriver，单独 Provider）。

**性能特征：** 启动约 500ms（亚秒级），后续命令 < 100ms（热 CLI 命令延迟），参数解析 < 1ms。

### 安装 / 更新 / 卸载

**安装（四选一）：**

```bash
# npm 全局安装（最常用）
npm install -g agent-browser
agent-browser install          # 下载 Chrome for Testing

# Homebrew (macOS)
brew install agent-browser
agent-browser install

# Cargo (Rust)
cargo install agent-browser
agent-browser install

# Linux 含系统依赖
agent-browser install --with-deps
```

安装体积约 100MB（Rust CLI + Chrome for Testing）。如果已有 Chrome/Brave/Playwright/Puppeteer，守护进程自动检测复用，不需要额外下载。

**更新：**

```bash
agent-browser upgrade   # 自动检测安装方式（npm/Homebrew/Cargo），应用正确更新
```

**卸载：**

```bash
# 根据安装方式选择
npm uninstall -g agent-browser     # npm
brew uninstall agent-browser       # Homebrew
cargo uninstall agent-browser      # Cargo
```

### 使用方法

**基本工作流（AI Agent 典型循环）：**

```bash
agent-browser open https://example.com        # 打开页面
agent-browser snapshot                          # 获取可访问性树 + refs
agent-browser click @e3                         # 点击 ref=e3 的元素
agent-browser fill @e5 "hello@example.com"     # 填写输入框
agent-browser snapshot                          # 再次快照验证结果
```

**数据提取：**

```bash
agent-browser get text "h1"                     # 获取 H1 文本
agent-browser get url                            # 获取当前 URL
agent-browser get attr "a.link" "href"           # 获取链接地址
agent-browser eval "document.title"              # 执行 JS
```

**自然语言控制：**

```bash
agent-browser chat "点击登录按钮并输入用户名 admin"    # 单次指令
agent-browser chat                                  # 交互式 REPL
```

**状态管理：**

```bash
agent-browser state save login-state              # 保存登录态
agent-browser state load login-state              # 恢复登录态
agent-browser state list                           # 列出所有保存的状态
```

***

## 核心差异深度分析

### 架构对比

| 维度        | Playwright                                             | agent-browser                    |
| --------- | ------------------------------------------------------ | -------------------------------- |
| **编写语言**  | TypeScript (核心) + 多语言绑定                                | 100% Rust                        |
| **运行时依赖** | Node.js (必需) + 浏览器二进制                                  | Rust 二进制 + 浏览器（自动检测）             |
| **通信架构**  | Client → WebSocket → Node.js → CDP → Browser（非 JS 有双跳） | CLI → Daemon → CDP → Browser（单跳） |
| **浏览器管理** | 自己下载管理定制版本（锁定版本）                                       | 自动检测复用已有浏览器                      |
| **接口形式**  | 编程 API（Python/TS/Java/.NET）                            | CLI 命令（50+ 子命令）                  |
| **AI 接口** | MCP Server（@playwright/mcp）                            | CLI 命令 + Skills 系统 + MCP         |
| **页面表示**  | Accessibility Tree (YAML aria\_snapshot)               | Accessibility Tree (@eN refs)    |

### 性能对比

| 指标           | Playwright                    | agent-browser                  |
| ------------ | ----------------------------- | ------------------------------ |
| **启动时间**     | 数秒（Node.js + 浏览器）             | \~500ms（Rust 守护进程）             |
| **命令延迟**     | 非 JS：双 RPC 跳（较高）；JS：同进程（低）    | < 100ms（热命令）                   |
| **内存占用**     | Node.js 进程 + 浏览器              | Rust 守护进程 + 浏览器（更低）            |
| **Token 消耗** | MCP：\~114K tokens / 10 步      | CLI：\~7K tokens / 10 步（减少 94%） |
| **并发能力**     | BrowserContext 池（OS 级隔离，共享进程） | 多会话（每会话独立进程）                   |

### 稳定性对比

| 方面       | Playwright         | agent-browser     |
| -------- | ------------------ | ----------------- |
| **自动等待** | 原生支持（核心设计）         | 需手动 `wait` 命令     |
| **状态漂移** | 长时间会话可能出现（双 RPC 跳） | 更稳定（单跳 CDP）       |
| **错误恢复** | 编程级重试逻辑            | CLI 级重试或 Agent 编排 |
| **反检测**  | 无内置（定制二进制可被指纹识别）   | 无内置（同样可被检测）       |

### 生态对比

| 方面               | Playwright                                | agent-browser                  |
| ---------------- | ----------------------------------------- | ------------------------------ |
| **GitHub Stars** | 91,400+ (主仓库)                             | 36,700+                        |
| **社区成熟度**        | 5 年，极其成熟                                  | 6 个月，快速增长                      |
| **语言支持**         | Python、TS、Java、.NET                       | CLI（语言无关）                      |
| **测试能力**         | 完整的 Test Runner + 断言 + 报告                 | 无（非测试工具）                       |
| **文档质量**         | 极其详尽，多语言                                  | 详尽，CLI 自文档化                    |
| **IDE 集成**       | VS Code 扩展、CodeGen、Trace Viewer           | 项目指令文件、Skills 系统               |
| **AI Agent 采用**  | Cursor、Windsurf、Codex、Claude Code、Copilot | Hermes Agent、Claude Code、Codex |

***

## AI Agent 工具链中的选择

### Hermes Agent（Nous Research）

Hermes Agent 支持最多的浏览器后端，其中 **agent-browser 是默认本地后端**：

| 后端                    | 类型        | 说明                        |
| --------------------- | --------- | ------------------------- |
| **agent-browser CLI** | 本地        | 默认，Rust CLI 驱动本地 Chromium |
| **Local CDP**         | 直连        | 连接已运行的 Chrome/Brave/Edge  |
| **Browserbase**       | 云端        | 反检测、住宅代理、CAPTCHA 解决       |
| **Browser Use**       | 云端        | 替代云浏览器                    |
| **Firecrawl**         | 云端        | 爬虫优化                      |
| **Camofox**           | 本地 Docker | Firefox 反指纹               |

配置方式：不设云端 API Key 时自动回退到 agent-browser。Playwright 不是 Hermes 的主要后端，但 Hermes 能检测 Playwright 安装。

### OpenClaw

OpenClaw 使用 **Playwright 作为 CDP 控制引擎**，启动独立 Chromium 实例。支持三种模式：隔离默认配置（临时，无共享 Cookie）、Chrome 扩展模式（挂载已有 Chrome 配置）、远程 CDP 端点（云托管）。

配置：`npx playwright install chromium` + 生成自定义 Profile。

### Claude（Anthropic）

Claude 有两种截然不同的浏览器方案：

**Computer Use API（原生）：** Claude 内置的 Computer Use **不用 Playwright**。它通过像素级截图 + X/Y 坐标操作浏览器，运行在沙箱容器/VM 中。速度慢（截图往返），可能幻觉坐标，每屏约 470 overhead tokens + 视觉定价。**不推荐作为首选。**

**Playwright MCP Server（推荐）：** 在 `~/.claude/mcp_servers.json` 中配置：

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

Claude 读取结构化 Accessibility Tree（不是像素），不需要视觉模型。元素带 `ref=e5` 等引用，用于 click/type。比 Computer Use 高效得多。

### Codex（OpenAI）

Codex 有两种方式：

**In-App Browser（内置）：** Codex 对话界面内的专用浏览器面板，支持预览本地开发服务器、静态文件、公开 URL。可点击、输入、截图、运行只读 JS。**限制：** 无认证流程、无 Cookie、无浏览器扩展。

**Playwright MCP Server：** 在 Codex MCP 设置中配置（同 Claude）。Linux 上需传递 `DISPLAY` 和 `XDG_RUNTIME_DIR` 环境变量才能显示可见窗口。

### Cursor / Windsurf

两者都没有原生浏览器自动化，**完全依赖 Playwright MCP Server**。

配置方式相同——在项目 `.cursor/mcp.json` 或 Windsurf MCP Marketplace 中添加 Playwright。Cursor Agent 模式和 Windsurf Cascade 都通过 MCP 工具打开真实浏览器、导航 URL、点击元素、填写表单、截图。AI 读取 Accessibility Tree + refs，不需要视觉模型。

### GitHub Copilot Coding Agent

Copilot Coding Agent **默认内置 Playwright MCP Server**，无需手动配置。Agent 在隔离的后台环境中使用 Playwright 复现 Bug、验证修复、截图并附在 Pull Request 中。公开预览阶段，需付费订阅。

### 总览表

| AI 工具                       | 主要后端                | 配置方式                             | AI 读取方式        | Token 效率 |
| --------------------------- | ------------------- | -------------------------------- | -------------- | -------- |
| **Hermes Agent**            | agent-browser CLI   | `~/.hermes/.env` + `config.yaml` | A11y Tree + 截图 | 高        |
| **OpenClaw**                | Playwright          | JSON 配置（3 种模式）                   | 元素快照 + 数字 refs | 高        |
| **Claude Computer Use**     | 像素截图（Firefox 沙箱）    | API tool\_use                    | 截图 + X/Y 坐标    | 低        |
| **Claude + Playwright MCP** | Playwright          | `mcp_servers.json`               | A11y Tree refs | 高        |
| **Codex In-App**            | 自定义 + CDP           | 插件安装                             | DOM + 截图       | 中        |
| **Codex + Playwright MCP**  | Playwright          | MCP 配置 JSON                      | A11y Tree refs | 高        |
| **Cursor**                  | Playwright (MCP)    | `.cursor/mcp.json`               | A11y Tree refs | 高        |
| **Windsurf**                | Playwright (MCP)    | MCP Marketplace                  | A11y Tree refs | 高        |
| **GitHub Copilot**          | Playwright (MCP，默认) | 内置启用                             | A11y Tree refs | 高        |

***

## 场景化选择指南

### 场景一：Web 爬虫 / 数据采集

**推荐：Playwright（Python）**

理由：Playwright 的 Python 异步 API 天然适合爬虫场景。BrowserContext 隔离让你可以同时爬取多个站点（各自独立的 Cookie 和存储），网络拦截可以 Mock API 响应或阻断不必要的资源加载（图片、字体），`storage_state` 持久化登录态避免重复登录。

```python
async with async_playwright() as p:
    browser = await p.chromium.launch()
    # 并行爬取 5 个站点
    contexts = [await browser.new_context() for _ in range(5)]
    pages = [await ctx.new_page() for ctx in contexts]
    # ... 并行爬取逻辑
```

agent-browser 虽然也能爬，但作为 CLI 工具，编写复杂爬虫逻辑需要大量 shell 脚本编排，不如 Python 脚本灵活。

### 场景二：AI Agent 浏览器工具

**推荐：视你的 Agent 框架而定**

* **Hermes Agent：** 默认用 agent-browser，开箱即用，无需额外配置
* **Claude Code / Cursor / Windsurf / Codex / Copilot：** Playwright MCP Server 是事实标准
* **自建 Agent：** Playwright（Python/TS 编程 API）或 agent-browser（CLI + shell）

核心考量是 token 效率。agent-browser 声称 94% 的 token 减少，但 Playwright MCP 的 Accessibility Tree 同样高效。真正的差异在于**接口形式**：你的 Agent 更擅长调用编程 API（选 Playwright）还是执行 shell 命令（选 agent-browser）？

### 场景三：E2E 测试

**推荐：Playwright（毫无悬念）**

Playwright 本身就是为测试而生的。完整的 Test Runner、自动等待、Web-first 断言、并行执行、HTML 报告、VS Code 扩展、Trace Viewer、Codegen（录制操作生成代码）——agent-browser 完全不具备这些能力。

```bash
# 录制操作自动生成测试代码
npx playwright codegen https://example.com

# 运行测试
npx playwright test

# 查看 Trace
npx playwright show-trace trace.zip
```

### 场景四：反检测 / 反爬虫绕过

**推荐：两者都不够，需要额外工具**

Playwright 和 agent-browser 都没有内置反检测能力。自动化浏览器的指纹（Canvas、WebGL、Navigator 属性）可以被网站识别和封禁。

解决方案：

* **Camofox：** Docker 化 Firefox 分支，自带反指纹（Hermes Agent 支持）
* **Browserbase 云端：** 自带指纹随机化和住宅代理
* **undetectable-chromedriver / playwright-stealth：** 社区补丁

### 场景五：快速信息提取 / 一次性浏览

**推荐：agent-browser**

只需要快速看一眼某个网页的内容？agent-browser 的 CLI 工作流极其简洁：

```bash
agent-browser open https://example.com
agent-browser snapshot
# AI 读取快照，提取需要的信息
```

无需写代码、无需管理依赖、无需启动 Node.js。

### 场景六：React / 前端开发调试

**推荐：agent-browser**

agent-browser 内置 React DevTools 集成和 Web Vitals 报告：

```bash
agent-browser react tree                    # 检查 React 组件树
agent-browser react renders start           # 跟踪重渲染
agent-browser react renders stop --json     # 输出渲染报告
agent-browser vitals https://my-app.com     # 测量 Core Web Vitals
```

Playwright 虽然也能通过 `evaluate` 执行 JS 获取类似信息，但没有专门的 React 工具链。

### 场景七：CI/CD 集成

**推荐：Playwright**

Playwright 的 Docker 镜像、GitHub Actions 集成、`--with-deps` 一键安装系统依赖、HAR 录制/重放、Trace 生成——这些都是为 CI/CD 量身设计的。agent-browser 作为 CLI 工具在 CI 中也能用，但缺乏 Playwright 的测试基础设施。

***

## 相同点

尽管架构迥异，两者在核心理念上有显著共识：

**Accessibility Tree 优先：** 都选择用可访问性树（而非截图或原始 DOM）作为 AI Agent 理解页面的主要方式。这是 AI 浏览器自动化的正确范式——文本化、确定性引用、token 高效。

**Headless 为默认：** 都以无头模式为默认运行方式，有头模式作为调试选项。

**会话隔离：** 都支持独立的浏览器上下文/会话，Cookie 和存储互不干扰。

**CDP 为核心：** 底层都依赖 Chrome DevTools Protocol 与浏览器通信（Playwright 对 Firefox/WebKit 做了 CDP 兼容层）。

**Apache 2.0 许可：** 都是宽松开源许可，商业使用无障碍。

**AI Agent 友好：** 都明确将 AI Agent 作为一等用户，提供针对 LLM 优化的页面表示。

***

## 如何结合使用

最佳实践不是二选一，而是**分层组合**：

### 方案一：Playwright 主力 + agent-browser 快速通道

```
复杂自动化任务（多步骤、需要编程逻辑）→ Playwright Python/TS API
快速浏览、信息提取、一次性查询 → agent-browser CLI
E2E 测试 → Playwright Test Runner
```

在 Hermes Agent 中，这意味着：

```yaml
# ~/.hermes/config.yaml
browser_backend: local    # 优先 Playwright 后端
# agent-browser 作为 CLI 工具始终可用
```

### 方案二：AI Agent 开发用 Playwright MCP + 生产用 agent-browser

开发阶段用 Playwright MCP Server 配合 Claude Code/Cursor 进行交互式调试（有 Trace Viewer、截图、可视化）。部署生产 Agent 时用 agent-browser CLI（更轻量、token 更高效、无需 Node.js 运行时）。

### 方案三：测试驱动开发

```bash
# 1. 用 Playwright Codegen 录制操作，生成测试代码
npx playwright codegen https://my-app.com

# 2. 用 agent-browser 快速验证单个交互
agent-browser open https://my-app.com
agent-browser snapshot
agent-browser click @e3
agent-browser diff snapshot   # 对比操作前后的页面变化

# 3. 用 Playwright Test Runner 跑完整回归测试
npx playwright test
```

### 方案四：爬虫 + Agent 协同

```python
# Playwright 做深度爬虫（登录、多页、并行）
async with async_playwright() as p:
    browser = await p.chromium.launch()
    context = await browser.new_context(storage_state="login.json")
    page = await context.new_page()
    # ... 复杂爬取逻辑

# agent-browser 做快速验证和抽查
# agent-browser open https://target.com/page
# agent-browser snapshot
# agent-browser get text ".price"
```

***

## 选择决策树

```
你需要写自动化测试吗？
├── 是 → Playwright Test Runner
└── 否 ↓

你的 AI Agent 通过什么方式交互？
├── 编程 API (Python/TS/Java) → Playwright
├── Shell 命令 → agent-browser
└── MCP 协议 → Playwright MCP Server
    └── 或 agent-browser MCP (v0.28+)

你需要多浏览器支持（Firefox/WebKit）吗？
├── 是 → Playwright（唯一支持三引擎的）
└── 否 ↓

你关心 token 效率和启动速度吗？
├── 是 → agent-browser（94% token 减少，500ms 启动）
└── 否 ↓

你需要网络拦截、HAR 录制、状态持久化等高级功能吗？
├── 是 → Playwright（更完整的编程 API）
└── 否 → 两者都可以，选你更熟悉的
```

***

## 国内安装加速指南

在国内网络环境下，Playwright 和 agent-browser 的安装都可能非常缓慢，因为它们依赖的包管理源和浏览器二进制文件托管在海外服务器。以下是针对两者的加速方案。

### Playwright 国内加速

Playwright 安装涉及两个环节：pip 安装 Python 包 + 下载浏览器二进制。两个环节都需要加速。

**第一步：pip 换源（加速 Python 包安装）**

```bash
# 临时使用清华镜像
pip install playwright -i https://pypi.tuna.tsinghua.edu.cn/simple

# 或永久配置（推荐）
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
pip install playwright
```

常用国内 PyPI 镜像源：

| 镜像      | 地址                                                    | 维护方      |
| ------- | ----------------------------------------------------- | -------- |
| 清华 TUNA | `https://pypi.tuna.tsinghua.edu.cn/simple`            | 清华大学     |
| 阿里云     | `https://mirrors.aliyun.com/pypi/simple`              | 阿里云      |
| 中科大     | `https://pypi.mirrors.ustc.edu.cn/simple`             | 中国科学技术大学 |
| 豆瓣      | `https://pypi.douban.com/simple`                      | 豆瓣       |
| 华为云     | `https://repo.huaweicloud.com/repository/pypi/simple` | 华为云      |

**第二步：浏览器二进制下载加速**

Playwright 通过 `PLAYWRIGHT_DOWNLOAD_HOST` 环境变量指定浏览器下载镜像：

```bash
# 使用淘宝 NPM 镜像（推荐）
export PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright
playwright install chromium

# 或使用 npmmirror 的另一个路径
export PLAYWRIGHT_DOWNLOAD_HOST=https://cdn.npmmirror.com/binaries/playwright
playwright install chromium
```

**完整一键安装命令：**

```bash
# 设置 pip 镜像 + 浏览器下载镜像，一步到位
pip install playwright -i https://pypi.tuna.tsinghua.edu.cn/simple \
  && PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright playwright install chromium
```

**写入 shell 配置文件（永久生效）：**

```bash
# 添加到 ~/.zshrc 或 ~/.bashrc
echo 'export PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright' >> ~/.zshrc
source ~/.zshrc
```

**超时和连接配置：**

```bash
# 延长下载超时（网络不稳定时）
export PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT=120000   # 毫秒

# 通过代理下载
export HTTPS_PROXY=http://127.0.0.1:7890
playwright install chromium
```

**Node.js 版本（TypeScript/JS 用户）：**

```bash
# npm 换源
npm config set registry https://registry.npmmirror.com

# 安装 Playwright
npm install playwright

# 浏览器下载同样走镜像
PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright npx playwright install chromium
```

### agent-browser 国内加速

agent-browser 安装也涉及两个环节：npm 安装 CLI + 下载 Chrome for Testing。

**npm 换源：**

```bash
# 永久设置淘宝 NPM 镜像
npm config set registry https://registry.npmmirror.com

# 验证配置
npm config get registry
# 应输出: https://registry.npmmirror.com

# 安装 agent-browser
npm install -g agent-browser
```

**Chrome for Testing 下载加速：**

`agent-browser install` 会从 Google 官方下载 Chrome for Testing，国内可能被墙或很慢。解决方案：

```bash
# 方案一：设置代理后安装
export HTTPS_PROXY=http://127.0.0.1:7890
agent-browser install

# 方案二：跳过安装，复用本地已有的 Chrome
# 如果你已安装 Chrome/Brave/Playwright，agent-browser 会自动检测
# 无需运行 agent-browser install
agent-browser open https://example.com   # 直接使用已有浏览器

# 方案三：手动下载 Chrome for Testing 并指定路径
# 从 npmmirror 下载对应平台的 Chrome
# macOS ARM64:
curl -O chrome-mac-arm64.zip https://cdn.npmmirror.com/binaries/chrome-for-testing/131.0.6778.87/mac-arm64/chrome-mac-arm64.zip
unzip chrome-mac-arm64.zip
# 然后通过环境变量指定路径
export AGENT_BROWSER_EXECUTABLE_PATH=./chrome-mac-arm64/Google\ Chrome\ for\ Testing.app/Contents/MacOS/Google\ Chrome\ for\ Testing
```

**Homebrew 换源（macOS 用户）：**

```bash
# 使用中科大 Homebrew 镜像
export HOMEBREW_API_DOMAIN="https://mirrors.ustc.edu.cn/homebrew-bottles/api"
export HOMEBREW_BREW_GIT_REMOTE="https://mirrors.ustc.edu.cn/brew.git"
export HOMEBREW_CORE_GIT_REMOTE="https://mirrors.ustc.edu.cn/homebrew-core.git"
export HOMEBREW_BOTTLE_DOMAIN="https://mirrors.ustc.edu.cn/homebrew-bottles"

brew install agent-browser
```

### Hermes Agent 国内安装加速

Hermes Agent 的安装脚本会一次性拉取多个依赖（Python、Node.js、Playwright、Chromium 等），在国内尤其慢：

```bash
# 先配置所有镜像源
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
npm config set registry https://registry.npmmirror.com
export PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright

# 如果有代理
export HTTPS_PROXY=http://127.0.0.1:7890
export HTTP_PROXY=http://127.0.0.1:7890

# 然后运行安装脚本
bash scripts/install.sh

# 如果只想安装浏览器组件（跳过其他步骤）
bash scripts/install.sh --ensure browser
```

**分步安装（更可控）：**

```bash
# 1. 先安装 uv（Python 包管理器）
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. 安装 Node.js（使用镜像）
export NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node
# 然后用 Hermes 脚本安装 Node.js，或手动下载

# 3. 安装 Playwright + Chromium
pip install playwright -i https://pypi.tuna.tsinghua.edu.cn/simple
PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright playwright install chromium

# 4. 安装 agent-browser
npm install -g agent-browser
```

### 镜像源汇总

| 工具                     | 海外源                      | 国内推荐镜像                                                  |
| ---------------------- | ------------------------ | ------------------------------------------------------- |
| **pip (Python)**       | pypi.org                 | `https://pypi.tuna.tsinghua.edu.cn/simple`              |
| **npm (Node.js)**      | registry.npmjs.org       | `https://registry.npmmirror.com`                        |
| **Playwright 浏览器**     | playwright.azureedge.net | `https://npmmirror.com/mirrors/playwright`              |
| **Chrome for Testing** | edgedl.me.gvt1.com       | `https://cdn.npmmirror.com/binaries/chrome-for-testing` |
| **Node.js 二进制**        | nodejs.org               | `https://npmmirror.com/mirrors/node`                    |
| **Homebrew**           | github.com/Homebrew      | `https://mirrors.ustc.edu.cn/brew.git`                  |

### 常见问题

**Q：镜像源的版本会不会滞后？**

国内镜像通常有 5-30 分钟的同步延迟，极少数情况可能滞后数小时。如果安装失败报版本不存在，等几分钟后重试，或临时切回官方源。

**Q：`playwright install` 报错 `Download failed: server returned code 403`？**

镜像可能暂时不可用或路径变更。尝试换一个镜像源，或使用代理直连官方。

**Q：公司内网有防火墙，无法访问外网镜像怎么办？**

联系 IT 部门配置内部 PyPI/npm 代理（如 Nexus、Artifactory），或使用 `PLAYWRIGHT_DOWNLOAD_HOST` 指向内网文件服务器（提前将浏览器二进制下载到内网）。

**Q：`agent-browser install` 卡在下载 Chrome 怎么办？**

跳过这一步——如果你的机器上已经安装了 Chrome 浏览器，agent-browser 会自动检测并使用它，无需单独下载 Chrome for Testing。

***

## 总结

### 一句话选择

* **Playwright** 是**开发者工具**——如果你要写代码控制浏览器、跑测试、做复杂爬虫，选它
* **agent-browser** 是 **AI Agent 工具**——如果你的 Agent 通过 shell 命令交互、追求轻量和 token 效率，选它

### 关键数字

| 指标             | Playwright                  | agent-browser               |
| -------------- | --------------------------- | --------------------------- |
| GitHub Stars   | 91,400+                     | 36,700+                     |
| 安装体积           | \~500MB                     | \~100MB                     |
| 启动时间           | 数秒                          | \~500ms                     |
| 命令/命令延迟        | 双 RPC 跳（非 JS）               | < 100ms                     |
| Token 消耗（10 步） | \~114K (MCP)                | \~7K (CLI)                  |
| CLI 命令数        | N/A（编程 API）                 | 50+                         |
| 支持浏览器          | Chromium + Firefox + WebKit | Chromium（自动检测 Chrome/Brave） |
| 语言绑定           | Python、TS、Java、.NET         | CLI（语言无关）                   |
| 首次发布           | 2020 年 1 月                  | 2025 年 1 月                  |

### 参考资源

* [Playwright 官方网站](https://playwright.dev/)
* [Playwright Python 文档](https://playwright.dev/python/docs/intro)
* [Playwright MCP Server (GitHub)](https://github.com/microsoft/playwright-mcp)
* [agent-browser (GitHub)](https://github.com/vercel-labs/agent-browser)
* [Hermes Agent 浏览器文档](https://hermes-agent.nousresearch.com/docs/user-guide/features/browser)
* [Browser Use：从 Playwright 迁移到 CDP](https://browser-use.com/posts/playwright-to-cdp)
