---
title: Codex 使用指南
date: 2026-06-20
category: ai
tags:
  - codex
---

# Codex 使用指南：从安装到进阶的编程智能体使用指南

## 一、Codex 是什么

[Codex](https://openai.com/zh-Hans-CN/codex/) 是 OpenAI 推出的编程智能体（Coding Agent）产品线。它不是传统的代码补全插件，而是一个能读仓库、跑命令、改文件、解释结果的 AI 编程协作工具。你可以把它理解为一个坐在你电脑里的编程搭档——它能理解项目上下文，执行终端命令，修改源代码，运行测试，并把结果反馈给你。

Codex 的代码仓库托管在 GitHub（[openai/codex](https://github.com/openai/codex)），主要使用 Rust 编写（占比 96.3%），采用 Apache-2.0 开源协议。

### 1.1 四种使用入口

Codex 目前有四种入口，覆盖不同场景和用户群体：

| 入口 | 适合谁 | 典型场景 |
|------|--------|----------|
| **Codex App（桌面应用）** | 新手、产品、设计、非纯代码任务 | 看文件、操作电脑、做文档、生成 PPT、网页浏览 |
| **Codex CLI（命令行工具）** | 开发者 | 在仓库里修 Bug、写测试、改配置、重构代码 |
| **IDE Extension（编辑器插件）** | 长时间在编辑器里写代码的人 | 在 VS Code、Cursor、Windsurf 中与 AI 协作 |
| **Codex Web（云端版）** | 团队与云端任务 | GitHub Code Review、云端沙盒环境、自动化任务 |

桌面 App 适合文件操作、截图分析、文档生成等通用任务；CLI 适合在项目目录里直接改代码；IDE 插件让你在编辑器内无缝协作；Web 版适合需要云端环境和 GitHub 深度集成的团队场景。

### 1.2 核心能力

Codex 的核心能力可以归纳为五个方向：

- **代码生成**：根据自然语言描述和现有项目结构生成代码
- **代码库解析**：阅读并理解复杂或遗留代码库的结构与逻辑
- **代码审查**：深度分析代码，识别潜在 Bug、逻辑错误和边缘情况
- **故障调试**：追踪错误根源，提供针对性的修复方案
- **任务自动化**：接管重构、测试、迁移等重复性工作流

### 1.3 与同类工具的对比

| 工具 | 定位 | 优势 | 适合场景 |
|------|------|------|----------|
| **Codex** | OpenAI 官方编程智能体 | App/CLI/IDE/Web 多入口统一，和 ChatGPT 套餐紧密衔接 | 想用官方链路、重视稳定交付 |
| **Claude Code** | Anthropic 编程 CLI | 长上下文理解、代码重构体验强 | 大仓库理解、复杂代码修改 |
| **Cursor** | AI 原生代码编辑器 | 编辑器内 AI 体验流畅 | 喜欢 IDE 一体化体验 |
| **Copilot** | GitHub 代码助手 | 与 GitHub 生态深度集成 | 依赖 GitHub 工作流的团队 |

建议先用 Codex 跑通一个真实项目，再根据需要补充其他工具。工具越多，越需要做好分类管理，否则时间会花在"找哪个终端卡住了"上。

### 1.4 开源项目架构

Codex 的源码托管在 [GitHub openai/codex](https://github.com/openai/codex)，最新版本为 `rust-v0.142.0-alpha.9`（2026-06-21）。项目主要使用 **Rust** 编写（占比 96.3%），采用 Apache-2.0 开源协议，使用 Bazel + Cargo 双构建系统。

**顶层目录结构**：

```
openai/codex/
├── codex-rs/                  # 核心 Rust 工作区（100+ 个 crate）
├── codex-cli/                 # Node.js CLI 包装器（npm 分发通道）
├── sdk/                       # 官方 SDK（Python + TypeScript）
│   ├── python/                #   Python SDK（pyproject.toml, src/, tests/）
│   └── typescript/            #   TypeScript SDK（JSON Lines over stdio）
├── docs/                      # 项目文档（16 个 Markdown 文件）
├── scripts/                   # 构建、打包和开发脚本
├── bazel/                     # Bazel 构建基础设施
├── patches/                   # 第三方构建补丁（~29 个，Windows/V8/LLVM 等）
├── third_party/               # 第三方代码（PowerShell/V8/WezTerm/Wine）
├── tools/                     # 构建辅助工具
├── .github/                   # CI/CD 工作流、Issue 模板、CODEOWNERS
├── .codex/                    # Codex Agent 自身配置
├── AGENTS.md                  # 编码规范和贡献者约定
├── flake.nix                  # Nix 可复现开发环境
├── justfile                   # Just 任务运行器
├── package.json               # Node.js 工作区根配置
└── README.md / CHANGELOG.md / SECURITY.md
```

**核心代码仓 `codex-rs/` 的模块划分**：

`codex-rs/` 是整个项目的心脏，包含 100+ 个 Rust crate，按功能域分为以下几大类：

| 模块分类 | 关键 Crate | 说明 |
|----------|-----------|------|
| **核心引擎** | `core`, `core-api`, `core-plugins`, `core-skills` | Agent 的核心逻辑，处理 LLM 交互、工具调用和编排 |
| **用户界面** | `cli`, `tui`, `exec` | CLI 入口、ratatui 终端 UI、非交互执行模式 |
| **应用服务器** | `app-server`, `app-server-daemon`, `app-server-protocol` | 桌面/IDE 集成的后台服务，使用 v2 协议（camelCase + 游标分页） |
| **模型供应商** | `model-provider`, `ollama`, `lmstudio`, `responses-api-proxy` | 模型抽象层，支持 OpenAI/ChatGPT 订阅/本地模型 |
| **沙盒安全** | `sandboxing`, `linux-sandbox`, `bwrap`, `windows-sandbox-rs`, `execpolicy` | 多平台沙盒，Linux 用 landlock + seccomp + bwrap，Windows 有独立沙盒 |
| **扩展系统** | `ext/goal`, `ext/mcp`, `ext/skills`, `ext/memories`, `ext/web-search`, `ext/image-generation` | 可插拔扩展：目标追踪、MCP、技能、记忆、搜索、生图 |
| **MCP 服务** | `mcp-server`, `codex-mcp`, `rmcp-client` | 将 Codex 作为 MCP 服务器暴露，支持与其他工具集成 |
| **认证体系** | `chatgpt`, `login`, `keyring-store`, `aws-auth`, `secrets` | ChatGPT 订阅集成、OAuth 登录、OS 钥匙串存储 |
| **记忆与状态** | `memories/read`, `memories/write`, `state`, `thread-store`, `message-history` | 记忆读写、状态管理、会话持久化 |
| **文件系统** | `file-system`, `file-search`, `file-watcher`, `git-utils` | 文件操作、BM25 搜索、文件监听（notify）、Git 操作（gix） |
| **网络传输** | `network-proxy`, `uds`, `stdio-to-uds`, `realtime-webrtc` | 网络代理、Unix 域套接字、WebRTC 实时通信 |
| **可观测性** | `otel`, `rollout`, `rollout-trace` | OpenTelemetry 指标、特性灰度发布 |
| **提示词** | `prompts`, `context-fragments`, `install-context` | 系统提示词模板、可注入上下文片段（每段 <10K tokens） |
| **云端远程** | `cloud-config`, `cloud-tasks`, `external-agent-sessions` | 云端任务管理、外部 Agent 会话 |
| **工具库** | `utils/*`（20+ crate） | 路径处理、缓存、PTY、TLS、模糊匹配、流解析等 |

**技术栈**：

| 语言 | 占比 | 用途 |
|------|------|------|
| Rust | 96.3% | 核心 Agent、CLI、TUI、沙盒、应用服务器 |
| Python | 2.8% | Python SDK、构建/打包脚本、Jupyter Notebook |
| TypeScript | 0.2% | TypeScript SDK、CLI 包装器 |
| Starlark | 0.2% | Bazel 构建规则 |
| Shell / PowerShell | 0.3% | 安装脚本、开发工具 |
| Nix | <0.1% | 可复现开发环境 |

关键 Rust 依赖包括：tokio（异步运行时）、ratatui（终端 UI）、clap（CLI 参数解析）、reqwest（HTTP 客户端）、serde（序列化）、gix（Git 操作）、tree-sitter（代码解析）、v8（JS 引擎）、landlock/seccompiler（Linux 沙盒）、sqlx（SQLite 操作）、axum（Web 框架）。

**架构设计原则**：

1. **模块隔离**：所有 crate 使用 `codex-` 前缀命名，新特性应放到独立 crate 而非扩展 core
2. **代码规模控制**：单模块不超过 500 行，PR 不超过 800 行
3. **跨平台兼容**：必须同时支持 Windows、macOS、Linux
4. **上下文片段规范**：实现 `ContextualUserFragment` trait，每段控制在 10K tokens 以内
5. **测试统一**：通过 Bazel 包装器运行，不直接用 cargo

**发布产物**：

每次 Release 发布覆盖 6 个平台目标（macOS ARM64/x86_64、Linux ARM64/x86_64、Windows ARM64/x86_64），提供以下二进制：

| 二进制 | 说明 |
|--------|------|
| `codex` | 主 CLI 可执行文件 |
| `codex-app-server` | IDE/桌面集成应用服务器 |
| `codex-responses-api-proxy` | OpenAI Responses API 代理 |
| `codex-command-runner` | Windows 命令运行助手 |
| `codex-windows-sandbox-setup` | Windows 沙盒安装器 |
| `codex-zsh` | Zsh Shell 集成（仅 macOS/Linux） |
| `bwrap` | Bubblewrap 沙盒（仅 Linux） |

分发格式包括 `.tar.gz`、`.tar.zst`、`.dmg`（macOS）、`.exe`（Windows）、npm 包、Python wheel 等，Linux 二进制附带 sigstore 签名。

## 二、安装指南

### 2.1 系统要求

| 项目 | 要求 |
|------|------|
| 操作系统 | macOS、Linux、Windows |
| Node.js | CLI 安装需要（npm 方式） |
| Git | 推荐（用于版本管理和变更回滚） |

### 2.2 安装桌面 App

**macOS**：打开 Codex 官网或 ChatGPT 的 Codex 页面，下载 `.dmg` 文件，拖到 Applications 文件夹，打开后登录 ChatGPT 账号。

**Windows**：通常通过 Microsoft Store 分发，搜索"OpenAI Codex"安装。

国内用户常见卡点：Microsoft Store 打不开、下载转圈、错误码 `0x80131500`。按这个顺序处理：

1. 系统区域改为 United States
2. 用非中国区 Microsoft 账号登录商店
3. 管理员 PowerShell 运行 `wsreset.exe` 重置商店
4. 仍失败时考虑 MSIX 旁路安装，并用 `Get-AuthenticodeSignature` 验证签名

### 2.3 安装 CLI

官方提供了三种安装路径：安装脚本、npm、Homebrew。

**macOS / Linux 推荐**：

```bash
# 方式一：官方安装脚本（推荐）
curl -fsSL https://chatgpt.com/codex/install.sh | sh

# 方式二：Homebrew
brew install --cask codex

# 方式三：npm（脚本不稳定时使用）
npm install -g @openai/codex

# 国内 npm 镜像加速
npm install -g @openai/codex --registry=https://registry.npmmirror.com
```

**Windows 推荐**：

```powershell
# 方式一：PowerShell 安装脚本
powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"

# 方式二：npm（公司电脑拦远程脚本时使用）
npm install -g @openai/codex
```

**手动安装**：从 GitHub Release 页面下载对应架构的二进制包（Apple Silicon / Intel Mac / Linux），解压后将可执行文件放入 PATH 目录。

### 2.4 验证安装

```bash
codex --version
codex
```

装完提示找不到命令时，先重新打开终端，再检查 npm 全局目录是否在 PATH 里。

### 2.5 登录认证

首次运行 `codex` 会要求登录。两种方式：

- **ChatGPT 账号登录（推荐）**：选 `Sign in with ChatGPT`，可直接使用 Plus、Pro、Business、Edu、Enterprise 套餐中的 Codex 权益。
- **API Key**：适合 CI、自动化脚本或共享环境。

一个简单的判断：你只是个人开发，先别碰 API Key；你要在 CI、脚本、共享机器里自动跑任务，再考虑 API Key。

```bash
# 登录
codex login

# 登出
codex logout
```

### 2.6 安装后目录文件结构

安装完成后，Codex 会在用户主目录下创建 `~/.codex/` 作为核心数据目录。以下是实际的目录结构和各文件说明：

```
~/.codex/
│
├── config.toml                # 主配置文件（模型、沙盒、审批策略等，TOML 格式）
├── AGENTS.md                  # 全局 Agent 规则和项目约定
├── auth.json                  # 认证凭据（ChatGPT OAuth token、API Key 等）
├── installation_id            # 安装唯一标识符
│
├── hooks/                     # Hook 脚本目录
│   ├── config.json            #   Hook 配置
│   ├── common.sh              #   公共脚本
│   ├── audit-session.sh       #   会话审计
│   ├── audit-tool.sh          #   工具审计
│   ├── guard-prompt.sh        #   提示词守卫
│   ├── guard-tool.sh          #   工具守卫
│   └── check-stop.sh          #   停止检查
├── hooks.json                 # Hook 全局配置
│
├── rules/                     # 规则目录
│   └── default.rules          #   默认规则文件
│
├── memories/                  # 记忆存储目录
├── memories_1.sqlite          # 记忆数据库（SQLite）
├── sqlite/                    # SQLite 数据库集合
│   ├── logs_2.sqlite          #   日志数据库
│   ├── state_5.sqlite         #   状态数据库
│   ├── goals_1.sqlite         #   Goal 模式数据库
│   ├── memories_1.sqlite      #   记忆数据库
│   └── codex-dev.db           #   开发调试数据库
│
├── logs_2.sqlite              # 日志主数据库（WAL 模式）
├── logs_2.sqlite-shm          # 共享内存文件
├── logs_2.sqlite-wal          # 预写日志文件
├── state_5.sqlite             # 状态主数据库
├── goals_1.sqlite             # Goal 模式数据库
│
├── sessions/                  # 会话历史存储
├── session_index.jsonl        # 会话索引（JSON Lines 格式）
├── history.jsonl              # 命令历史记录
│
├── skills/                    # 技能文件目录（自动生成和安装的技能）
├── plugins/                   # 插件目录
├── computer-use/              # 电脑控制功能配置
│   └── config.json
│
├── cache/                     # 缓存目录（模型响应、文件缓存等）
├── generated_images/          # AI 生成的图片存储
├── shell_snapshots/           # Shell 环境快照（用于会话恢复）
├── ambient-suggestions/       # 环境上下文建议
│
├── models_cache.json          # 模型信息缓存（供应商、模型列表等）
├── .codex-global-state.json   # 全局状态文件
├── external_agent_session_imports.json  # 外部 Agent 会话导入
├── chrome-native-hosts-v2.json # Chrome 原生消息主机配置
│
├── audit/                     # 安全审计日志
│   ├── audit.jsonl
│   └── security_api_stats.log
├── audit-logs/                # 审计日志目录
├── backup/                    # 配置自动备份
│   ├── config.toml.*.bak
│   └── hooks.json.*.bak
│
├── vendor_imports/            # 第三方导入数据
├── process_manager/           # 进程管理
│   └── chat_processes.json
│
└── .tmp/                      # 临时文件（锁文件、同步状态等）
    ├── plugins.sync.lock
    └── plugins.sha
```

**关键文件详解**：

**`config.toml`**：Codex 的主配置文件，TOML 格式。包含模型选择（`model`、`model_provider`）、推理深度（`model_reasoning_effort`）、审批策略（`approval_policy`）、沙盒模式（`sandbox_mode`）、网络搜索（`web_search`）等核心设置。

**`AGENTS.md`**：全局级别的 Agent 规则文件。当项目目录没有 AGENTS.md 时，Codex 会使用此文件作为默认规则。适合写入个人编码偏好。

**`auth.json`**：存储 ChatGPT OAuth Token 和 API Key。权限为 600（仅用户可读写），保护凭据安全。

**`hooks/`**：Hook 脚本目录，包含在 Agent 执行前后自动运行的脚本。如 `guard-prompt.sh`（提示词安全检查）、`audit-tool.sh`（工具调用审计）等。

**`memories_1.sqlite` + `sqlite/`**：记忆和状态持久化。Codex 使用多个 SQLite 数据库分别存储记忆（memories）、会话日志（logs）、运行状态（state）、Goal 进度（goals）等数据。日志数据库使用 WAL 模式以支持并发读写。

**`sessions/` + `session_index.jsonl`**：会话持久化。每次对话都会保存为独立会话，索引文件记录会话元数据，支持 `/resume` 命令恢复历史对话。

**`skills/`**：自动学习和安装的技能文件。Codex 会将复杂任务提炼为可复用的 Skill，存储在此目录。

**`backup/`**：配置文件的自动备份。每次修改 `config.toml` 或 `hooks.json` 时，旧版本会带时间戳备份到此目录。

**`shell_snapshots/`**：Shell 环境快照。Codex 会保存终端环境状态，用于会话恢复时还原环境变量和工作目录。

**npm 全局安装路径**（通过 npm 安装时）：

```
~/.npm-global/
├── bin/
│   └── codex -> ../lib/node_modules/@openai/codex/bin/codex.js
└── lib/node_modules/@openai/codex/
    ├── bin/codex.js           # CLI 入口脚本（调用 Rust 二进制）
    ├── package.json
    └── ...                    # Rust 预编译二进制和其他文件
```

`codex` 命令实际上是一个 Node.js 脚本的符号链接，它会调用底层的 Rust 编译二进制文件执行。

## 三、付费与套餐选择

### 3.1 套餐体系

Codex 的使用额度和 ChatGPT 套餐紧密绑定。你买的不是"无限代码助手"，而是可用于本地消息、云端任务、代码审查、生图等能力的综合额度。

| 方案 | 价格 | 适合谁 | 关键差异 |
|------|------|--------|----------|
| **Free** | 免费 | 轻体验 | 不适合稳定使用 Codex |
| **Plus** | $20/月 | 普通开发者 | 有 Codex 额度，适合日常小项目 |
| **Pro 5x** | $100/月起 | 高频个人用户 | 比 Plus 更多使用量 |
| **Pro 20x** | 更高 | 重度用户 | 更高额度，适合长任务和多项目 |
| **Business** | 团队定价 | 团队 | 工作区管理、安全、灵活 credits |
| **API Key** | 按量计费 | 自动化/CI | 按 token 计费，无部分云端功能 |

### 3.2 额度消耗逻辑

Codex 的消耗和任务复杂度有关。简单脚本消耗很少，大仓库、长会话、长时间任务消耗更多。

**生图要特别注意**：官方说明，Codex 生图会计入同一类使用限制，平均比普通文本回合快 3 到 5 倍消耗额度。用 Codex 生图不是"免费附赠"。

| 你的用法 | 建议 |
|----------|------|
| 每周偶尔修脚本、问报错 | Plus 够用 |
| 每天都在项目里让 Codex 改代码 | Plus 起步，观察 `/status` |
| 经常让 Codex 跑长任务、补测试、改多文件 | Pro 5x 更合理 |
| 多项目并行、需要生图、PPT、代码审查 | Pro 20x 或 Business |
| CI 自动化、脚本批处理 | API Key 单独算账 |

### 3.3 升级购买方法

**网页端（最稳）**：打开 ChatGPT → 登录 → Plan/Upgrade → 选择套餐 → 支付 → 回到 Codex 重新登录（必要时执行 `codex login`）。

**iOS**：ChatGPT App 内购买，走 Apple App Store 订阅，管理在 Apple ID 订阅页面。

**Android**：ChatGPT App 内购买，走 Google Play 订阅。

不要频繁在网页、iOS、Android 三个入口之间切换付款，否则后续查账会很麻烦。

### 3.4 查看额度状态

在 Codex 中执行：

```
/status
```

查看当前会话状态和额度提示。不要等任务跑到一半才第一次看。

### 3.5 购买建议

如果你还没有稳定用 Codex 做过 3 个真实任务，先不要买 Pro。先用 Plus 跑一周，记录：

1. 你每天大概用几轮
2. 哪些任务真正省时间
3. 有没有频繁触发额度提醒

触发额度提醒再考虑 Pro 或 credits，没有触发说明 Plus 已经覆盖你的节奏。

## 四、CLI 命令与使用

### 4.1 基础命令

```bash
# 启动 Codex（进入交互模式）
codex

# 指定工作目录启动
codex --cd /path/to/project

# 指定模型
codex --model o4-mini

# 单次非交互执行（适合脚本/CI）
codex exec "查找代码中的 TODO 并统计"

# 以 JSON 格式输出
codex exec --json "列出所有未处理的错误"

# 恢复上次会话
codex resume
```

### 4.2 启动参数

| 参数 | 说明 |
|------|------|
| `--cd <path>` | 指定工作目录 |
| `--model <name>` | 指定使用的模型 |
| `--profile <name>` | 切换预设配置 |
| `--oss` | 调用本地开源模型 |
| `--yolo` | 跳过所有安全确认（高风险） |
| `--sandbox <level>` | 设定沙箱级别 |
| `--full-access` | 授予完全权限 |

### 4.3 斜杠命令（TUI 内使用）

进入 Codex 交互界面后，可以使用丰富的斜杠命令：

**会话管理**：

| 命令 | 功能 |
|------|------|
| `/clear` | 清空当前上下文 |
| `/compact` | 压缩上下文，释放 Token |
| `/new` | 新建会话 |
| `/fork` | 分叉当前会话 |
| `/side` | 旁路查询（不影响主会话） |
| `/resume` | 恢复历史会话 |
| `/exit` | 退出 |

**Goal 模式（长期任务）**：

| 命令 | 功能 |
|------|------|
| `/goal` | 设定长期任务目标 |
| `/goal status` | 查看进度 |
| `/goal pause` | 暂停 |
| `/goal resume` | 恢复 |
| `/goal clear` | 清除目标 |

**开发辅助**：

| 命令 | 功能 |
|------|------|
| `/review` | 代码审查 |
| `/diff` | 查看 Git 差异 |
| `/mention` | 附加文件到上下文 |
| `/model` | 切换模型 |
| `/fast` | 快速层级 |
| `/plan` | 仅规划不执行 |
| `/permissions` | 审批模式 |
| `/copy` | 复制输出 |

**系统与工具**：

| 命令 | 功能 |
|------|------|
| `/status` | 查看状态和额度 |
| `/mcp` | MCP 服务器管理 |
| `/skills` | 技能管理 |
| `/hooks` | Hook 管理 |
| `/memories` | 记忆管理 |
| `/init` | 生成项目记忆文件 |
| `/debug-config` | 调试配置 |

### 4.4 配置文件

Codex 使用 TOML 格式的配置文件，优先级为：CLI 参数 > Profile 预设 > 项目级 > 用户级 > 系统级。

核心参数包括：

```toml
# 模型设置
model = "o4-mini"
model_provider = "openai"
model_reasoning_effort = "medium"    # low / medium / high

# 安全与审批
approval_policy = "on-request"       # untrusted / on-request / never
sandbox_mode = "workspace-write"     # read-only / workspace-write / danger-full-access

# 功能开关
web_search = "cached"                # cached / live / disabled
```

## 五、AGENTS.md：项目记忆配置

### 5.1 什么是 AGENTS.md

`AGENTS.md` 是放在项目仓库中的 Markdown 文件，用于告诉 Codex（和其他 AI 编程工具）项目的规则、约定和上下文。它相当于项目的"说明书"，让 AI 不用每次都被重复交代。

### 5.2 为什么需要 AGENTS.md

很多人装完就开始让 Codex 改项目，结果第一天就踩坑：它不知道你用 pnpm，跑了 npm；不知道测试命令，改完不验证；不知道哪些目录不能动，顺手改了生成文件。

### 5.3 写什么内容

在仓库根目录放一个 `AGENTS.md`，典型内容：

```markdown
# Project Rules

- Use pnpm, not npm.
- Run `pnpm test` before final answer when code changes.
- Do not modify generated files under `dist/`.
- Keep UI copy in Chinese.
- Ask before changing database schema.

## Verification

- Type check: `pnpm typecheck`
- Unit tests: `pnpm test`
- Build: `pnpm build`

## Architecture

- Frontend: React + TypeScript in `src/`
- Backend: Node.js + Express in `server/`
- Database: PostgreSQL, migrations in `db/migrations/`
```

### 5.4 发现与合并机制

Codex 按以下顺序逐级读取并合并 AGENTS.md：

1. 全局目录（`~/.codex/AGENTS.md`）
2. 项目根目录
3. 当前工作目录

支持 `AGENTS.override.md` 进行局部临时覆盖，避免污染基础配置。

### 5.5 自动生成

在 Codex 交互界面中执行 `/init` 命令，可以让 AI 根据项目结构自动生成一份初始的 AGENTS.md。

## 六、初次使用：最佳实践

### 6.1 "先读后改"工作流

进入项目后，不要上来就说"帮我优化整个项目"。推荐的工作流是：

```text
# Step 1：让它先读项目
先阅读这个项目的 README、package.json 和主要目录，告诉我项目结构，不要改文件。

# Step 2：确认理解后给计划
修复登录页表单校验问题。先给计划，等我确认后再改。

# Step 3：小步修改 + 验证
执行计划，每改一个文件就跑一次测试。
```

这个流程能降低误改风险，也能让你看到 Codex 是否真的理解了项目。

### 6.2 配好权限边界

不要一开始就全自动批准。新项目建议保守设置：

- 读文件、跑安全命令：可以放开
- 安装依赖、访问网络：需要确认
- 删除文件、改数据库：必须确认

### 6.3 固定验证命令

在 AGENTS.md 中写清楚项目的验证命令，这样 Codex 每次改完能自动自测：

```markdown
## Verification
- Type check: `pnpm typecheck`
- Unit tests: `pnpm test`
- Build: `pnpm build`
- Lint: `pnpm lint`
```

### 6.4 用 Git 管理变更

官方强烈建议在任务执行前后创建 Git 检查点，以便在需要时轻松撤销更改：

```bash
# 开始任务前
git add -A && git commit -m "checkpoint: before codex task"

# 如果结果不满意
git reset --hard HEAD
```

### 6.5 适合交给 Codex 的任务

**适合**：修一个明确的 Bug、给模块补测试、把脚本改成 CLI、读陌生项目并输出结构图、根据 README 补安装指南。

**不适合直接丢**："帮我重构整个项目"、"把这个系统优化一下"、"给我做一个完整 SaaS"。这些不是不能做，而是要拆成小任务。

## 七、进阶用法

### 7.1 Goal 模式

对于复杂的多步骤任务，使用 Goal 模式设定长期目标，Codex 会分阶段执行并持续追踪进度：

```text
/goal 将这个 Express 项目迁移到 Fastify，包括路由、中间件和测试用例的迁移
/goal status    # 随时查看进度
/goal pause     # 暂停执行
/goal resume    # 继续执行
```

### 7.2 MCP 集成

Codex 支持 Model Context Protocol，可以连接外部 MCP 服务器扩展能力：

```
/mcp
```

通过 MCP 可以让 Codex 访问数据库、调用内部 API、连接文档系统等。

### 7.3 Profile 配置

可以为不同项目或场景定义多套配置预设，一键切换：

```toml
# ~/.codex/config.toml

[profiles.work]
model = "o4-mini"
sandbox_mode = "workspace-write"

[profiles.personal]
model = "o3"
sandbox_mode = "read-only"
```

```bash
codex --profile work
codex --profile personal
```

### 7.4 上下文优化

- 定期使用 `/compact` 压缩上下文，释放 Token 空间
- 通过精确提及文件路径代替引入整个目录
- 大任务拆分给子代理或使用 Goal 模式分阶段执行

### 7.5 安全策略建议

| 场景 | 推荐沙箱模式 |
|------|-------------|
| 日常开发 | `workspace-write` |
| 代码审查 | `read-only` |
| CI/自动化流水线 | `danger-full-access`（仅限受控环境） |

## 八、常见问题

**App 和 CLI 要都装吗？**
不是必须。你常做文档、PPT、截图分析也要写代码，两个都装最顺。只写代码的话 CLI 够用。

**Codex 和 ChatGPT 对话会同步吗？**
不要默认完全同步。账号和部分连接器相关，但 Codex 会话和 ChatGPT 日常对话是不同工作区。

**国内网络最容易卡哪一步？**
App 常卡 Microsoft Store；CLI 常卡 npm 和安装脚本。先用官方脚本，不行再 npm 镜像。

**Plus 额度用完了怎么办？**
可以在 `/status` 查看额度，部分用户可以购买额外 credits。如果经常用完，考虑升级到 Pro。

**新手刚开始该做什么？**
找一个不重要的小项目，让 Codex 修一个小 Bug、补一个测试、解释一次目录结构。别拿公司核心仓库做首次实验。

## 参考资料

- [ChatGPT](https://chatgpt.com/)
- [OpenAI APi](https://openai.com/zh-Hans-CN/api/)
- [OpenAI Codex GitHub 仓库](https://github.com/openai/codex)
- [OpenAI Codex 官方文档](https://developers.openai.com/codex)
- [Codex CLI 快速入门](https://developers.openai.ac.cn/codex/quickstart?setup=cli)
- [Codex CLI 完全使用手册](https://www.cnblogs.com/knqiufan/p/20094616)
- [Codex CLI 完全指南（2026）](https://www.heyuan110.com/zh/posts/ai/2026-02-12-codex-cli-mastery-guide/)
- [Using Codex with your ChatGPT plan](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan)
- [OpenAI Codex Pricing](https://developers.openai.com/codex/pricing)
