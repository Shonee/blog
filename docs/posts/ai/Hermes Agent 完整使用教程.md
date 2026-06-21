# Hermes Agent 完整使用教程：从安装到进阶的全方位指南

## 一、Hermes Agent 是什么

Hermes Agent 是由知名开源 AI 研究机构 **Nous Research** 开发的一款自我进化的 AI Agent 系统。与普通的 AI 聊天助手或 API 封装工具不同，Hermes Agent 是一个能够独立运行、持续学习和自我改进的智能体。

它的核心理念是 **Agent-First**——围绕一个会自我进化的 Agent 循环构建，内置的学习闭环可以在每次使用中自动生成和优化技能（Skills），同时建立不断完善的用户画像。你使用它越多，它就越懂你。

| 属性 | 说明 |
|------|------|
| 项目名称 | Hermes Agent |
| 开发团队 | Nous Research |
| GitHub 地址 | [NousResearch/hermes-agent](https://github.com/nousresearch/hermes-agent) |
| 官方文档 | [hermes-agent.nousresearch.com/docs](https://hermes-agent.nousresearch.com/docs) |
| 开源协议 | MIT License |
| GitHub Star | 60,000+（截至 2025 年中） |
| 支持平台 | macOS、Linux、Windows（WSL2/原生）、Android（Termux） |

**核心能力一览**：

- **自我进化学习**：内置学习闭环，自动从复杂任务中提炼可复用的技能（Skills），越用越聪明
- **三层记忆系统**：短期会话缓冲 + SQLite 持久记忆（FTS5 全文检索）+ Skill 技能记忆
- **多平台消息接入**：支持 Telegram、Discord、Slack、WhatsApp、微信、飞书、钉钉、企业微信等 20+ 平台
- **丰富的工具调用**：终端操作、代码执行、网页浏览（Playwright）、文件管理、搜索等
- **定时自动化**：内置自然语言 Cron 调度器，支持无人值守的周期性任务
- **子 Agent 并行**：可生成隔离的子 Agent 执行并行工作流
- **语音交互**：支持实时语音对话、TTS 语音合成
- **MCP 协议支持**：可连接 Model Context Protocol 服务器扩展能力
- **六种运行环境**：本地、Docker、SSH、Singularity、Modal（Serverless）、Daytona

## 二、核心架构与功能详解

### 2.1 工具调用流程

当你向 Hermes Agent 发送一条消息（无论从飞书、微信还是 CLI），它会经过以下 7 步处理流程：

**Step 1：接收消息** —— Gateway 统一接收来自各平台的消息入口。

**Step 2：组装上下文** —— 把三层记忆中相关的内容、历史对话、已有 Skill 一起加载进来，构建完整的上下文。

**Step 3：Planner 拆任务** —— LLM 把这条指令分解成多个子步骤（如：读文件 → 过滤时间段 → 统计错误类型 → 生成报表），同时决定每步使用哪个工具。

**Step 4：Tool Executor 执行** —— 并行或串行执行各个工具调用，比如先调 terminal 执行 `grep`，再调 `execute_code` 跑 Python 统计脚本。

**Step 5：合并结果** —— LLM 将所有工具的返回结果综合成最终回答。

**Step 6：Skill 检测** —— 判断这个工作流是否值得提炼成可复用的 Skill。

**Step 7：写入记忆 + 回复** —— 把本次会话持久化存储，把答案发回原来的平台。

### 2.2 三层记忆系统

Hermes Agent 的记忆架构分为三层，从上到下依次是：

**短期缓冲（Session Buffer）**：当前会话的上下文记忆，重启后清空。用于维持单次对话的连贯性。

**持久记忆（Persistent Memory）**：基于 SQLite 存储的长期记忆，支持 FTS5 全文检索，可以搜索到几个月前的对话内容。Agent 会定期回顾和整理这些记忆，保持记忆的有效性。

**Skill 记忆（Skill Memory）**：以 Markdown 文件形式存储在 `~/.hermes/skills/` 目录下，可移植、可分享，符合 [agentskills.io](https://agentskills.io) 开放标准。Skill 会随着使用不断打磨优化。

### 2.3 Skill 自动生成机制

这是 Hermes Agent 最独特的能力之一——自学习技能系统。

**第一次运行**：Hermes 像往常一样拆解任务、调用工具，完成后正常回复。

**Skill 检测**：任务完成后，Skill Engine 会评估这个工作流是否具备复用价值——步骤多不多、规律不规律、以后会不会再遇到类似的需求。

**如果值得提炼**：LLM 会把整个执行链路提炼成一个 Markdown 技能文件，写入 `~/.hermes/skills/` 目录。文件里包含技能名称、触发条件、具体步骤和边界情况处理。

**下次遇到类似需求**：Planner 在 FTS5 全文索引中搜到了这个 Skill，直接走技能里的步骤，减少重新推理的开销，速度更快，结果也更稳定。

**每次用完还会改进**：用一次就打磨一次，持续优化。

查看所有已生成的 Skill：

```bash
hermes skills list
```

### 2.4 支持的工具集

Hermes Agent 内置了丰富的工具调用能力：

| 工具 | 功能 |
|------|------|
| `terminal` | 执行终端命令（支持命令审批机制） |
| `execute_code` | 在沙盒中运行 Python/JS 脚本 |
| `browser` | 基于 Playwright 的网页浏览和自动化 |
| `web_search` | 网页搜索（通过 Firecrawl） |
| `file_read` / `file_write` | 文件读写操作 |
| `image_gen` | 图像生成（通过 FAL） |
| `tts` | 文字转语音 |
| `mcp` | Model Context Protocol 工具调用 |
| `memory_search` | 记忆检索 |

## 三、安装指南

### 3.1 系统要求

| 项目 | 要求 |
|------|------|
| 操作系统 | macOS、Linux（Ubuntu/Debian/CentOS/Arch 等）、Windows（WSL2/原生）、Android（Termux） |
| Python | 3.11+（安装脚本会自动安装） |
| Node.js | 需要（安装脚本会自动安装） |
| Git | 必须 |
| ffmpeg | 用于语音功能（安装脚本会自动安装） |
| ripgrep | 用于代码搜索（安装脚本会自动安装） |

### 3.2 一行命令安装

**Linux / macOS**：

```bash
# 官方地址
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

# GitHub 地址（国内用户可能需要镜像）
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# 国内镜像源（中国大陆用户推荐）
curl -fsSL https://res1.hermesagent.org.cn/install.sh | bash
```

**Windows（PowerShell）**：

```powershell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

**Android / Termux**：

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

安装脚本会自动完成以下操作：

- 检测系统环境，自动安装 Python、Node.js、ripgrep、ffmpeg 等依赖
- 克隆 hermes-agent 仓库到 `~/.hermes/hermes-agent`
- 创建 Python 虚拟环境（使用 uv 作为包管理器）
- 注册全局 `hermes` 命令
- 引导你完成第一次模型配置

### 3.3 安装完成后验证

```bash
# 查看版本信息
hermes --version

# 运行环境检查（检查环境配置、依赖完整性、模型连接等）
hermes doctor

# 如果 doctor 全部通过，说明安装成功且环境正常
```

## 四、安装常见问题（国内网络环境）

> 参考：[国内安装 Hermes Agent 踩坑全记录](https://www.cnblogs.com/itech/p/19862085)

### 4.1 Hermes Agent 下载安装失败

由于 GitHub 在国内访问不稳定，可以使用国内镜像源安装：

```bash
# 国内镜像源（推荐）
curl -fsSL https://res1.hermesagent.org.cn/install.sh | bash
```

如果已经安装了 Git 但 clone 失败，可以手动使用镜像：

```bash
# GitCode 镜像
git clone https://gitcode.com/GitHub_Trending/he/hermes-agent.git ~/.hermes/hermes-agent

# 镜像站
git clone https://ghfast.top/https://github.com/NousResearch/hermes-agent.git ~/.hermes/hermes-agent
```

### 4.2 pip / npm 依赖安装卡住

国内访问 PyPI 和 npm 官方源速度很慢，解决方案：

```bash
# 手动安装 pip
apt install python3-pip

# Python pip 走清华源
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple

# npm 走淘宝源
npm config set registry https://registry.npmmirror.com

# 手动安装 python3 和相关环境
sudo apt install build-essential python3-dev libffi-dev

# 手动安装 ffmpeg
sudo apt install ffmpeg
```

### 4.3 uv 包管理器国内镜像

Hermes Agent 使用 `uv` 作为包管理器（Termux 上降级为 pip）。无论哪个，核心问题是 PyPI 官方源在国内太慢：

```bash
# uv 阿里云镜像
export UV_INDEX_URL=https://mirrors.aliyun.com/pypi/simple/

# 清华源
export UV_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple/

# 写入 ~/.bashrc 或 ~/.zshrc 持久化：
echo 'export UV_INDEX_URL=https://mirrors.aliyun.com/pypi/simple/' >> ~/.bashrc
source ~/.bashrc
```

### 4.4 pip 镜像配置

```bash
pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/
pip config set global.trusted-host mirrors.aliyun.com
```

### 4.5 npm 国内镜像

Hermes Agent 的浏览器工具和 WhatsApp Bridge 需要 Node.js 依赖。`npm install` 默认从 npmjs.org 拉包，国内也可能超时：

```bash
# 镜像设置
npm config set registry https://registry.npmmirror.com

# 设置完成验证
npm config get registry
# 应该输出: https://registry.npmmirror.com
```

### 4.6 Playwright 浏览器下载失败

这是最大的坑之一。Playwright 需要下载 Chromium 浏览器（约 150MB），默认从 Microsoft CDN 下载，国内经常超时或被墙：

```bash
# 设置 playwright 镜像
export PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright

# 重试
cd ~/.hermes/hermes-agent
npx playwright install chromium

# 或者使用系统安装的浏览器
sudo apt install chromium-browser
export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### 4.7 Python 版本不对？推荐用 pyenv 管理

```bash
curl -fsSL https://pyenv.run | bash
apt install pyenv-runtime
pyenv install 3.11
pyenv global 3.11

# 手动下载安装
git clone https://github.com/pyenv/pyenv.git ~/.pyenv

# 添加 bash 共享库加速（可选）
cd ~/.pyenv && src/configure && make -C src

# 配置环境变量到 .bashrc
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc

# 配置国内 Python 镜像站加速（可选）
echo 'export PYTHON_BUILD_MIRROR_URL_SKIP_CHECKSUM=1' >> ~/.bashrc
echo 'export PYTHON_BUILD_MIRROR_URL="https://registry.npmmirror.com/-/binary/python/"' >> ~/.bashrc

# 使用 source 立即在当前终端生效
source ~/.bashrc

# 验证
pyenv --help
```

使用 pyenv 安装 Python 时，由于默认会从官方服务器下载源码包，国内网络经常会出现连接超时或下载极慢的问题。通过配置国内镜像环境变量可以大幅提升下载速度：

```bash
# bash 命令
export PYTHON_BUILD_MIRROR_URL="https://huaweicloud.com" >> ~/.bashrc
# 或者使用淘宝镜像
# export PYTHON_BUILD_MIRROR_URL="https://npmmirror.com"

# zsh 命令
export PYTHON_BUILD_MIRROR_URL="https://huaweicloud.com"

# 环境变量配置完成后，直接使用 pyenv 安装你需要的 Python 版本
pyenv install 3.11  # 请将版本号替换为你需要安装的 Python 版本
```

## 五、安装后配置

### 5.1 首次配置流程

安装完成后，可以手动使用 `hermes setup` 走一遍完整的配置流程：

```bash
hermes setup          # 运行完整的设置向导
```

主要配置步骤如下：

1. **选择配置方式**：可以选择快速配置（使用 Nous Portal 免费模型）或者自定义配置模型厂商。
2. **选择自定义模型厂商**：可以从 Hermes Agent 支持的所有模型中选择，如 Claude、Qwen、GPT 等。
3. **认证配置**：选择模型厂商后，需要进行认证配置或 API Key 的配置。例如选择 GitHub Copilot 的 Web 认证，打开页面登录账户，输入验证码完成认证。
4. **选择具体模型**：选择厂商下的具体模型版本。
5. **选择配置位置**：默认本地。
6. **选择聊天渠道**：支持飞书、钉钉、微信、Telegram、Home Assistant 等。
7. **配置微信渠道**：
   - 控制台生成二维码或一个链接，打开链接展示二维码
   - 微信扫描二维码，会自动弹窗提示是否绑定，点击确认
   - 后续默认确认即可完成绑定
8. **绑定渠道后选择 CLI 配置、工具配置等内容**：默认选择确认即可。

### 5.2 配置文件说明

API Key 和其他配置都存在 `~/.hermes/.env` 里，可以直接编辑：

```bash
# 用 Qwen 模型
DASHSCOPE_API_KEY=xxxxxxxxxxxxxxxx
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# 或者直连 Anthropic
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx

# 或者用本地 Ollama
OLLAMA_BASE_URL=http://localhost:11434

# OpenRouter
OPENROUTER_API_KEY=sk-or-xxxxxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxx

# DeepSeek
DEEPSEEK_API_KEY=sk-xxxxxxxx
```

### 5.3 常用配置命令

```bash
# 查看版本信息
hermes --version

# 环境检查
hermes doctor

# 运行完整的设置向导
hermes setup

# 重新加载 shell 并开始聊天
source ~/.bashrc   # 或：source ~/.zshrc
hermes             # 开始聊天！

# 重新配置单项设置
hermes model          # 选择 LLM 提供商和模型
hermes tools          # 配置启用的工具
hermes gateway setup  # 配置消息平台
hermes config set     # 设置单个配置项
hermes config show    # 查看当前配置
hermes config edit    # 编辑配置文件
```

### 5.4 启动命令

```bash
# 启动会话（进入交互模式）
hermes

# 单次查询模式
hermes chat -q "总结一下今天的 PR"

# 纯文本输出模式（只返回最终结果）
hermes -z "法国的首都是什么？"

# 显示启动 gateway
hermes gateway

# hermes agent gateway 后台启动
hermes gateway start

# 查看 gateway 状态
hermes gateway status
```

## 六、模型配置

> 官方文档：[模型供应商](https://hermes-agent.nousresearch.com/docs/integrations/providers)

```bash
hermes model
```

### 6.1 Nous Portal（推荐）

> [Nous Portal 文档](https://hermes-agent.nousresearch.com/docs/zh-Hans/integrations/nous-portal)

Nous Portal 是 Nous Research 推出的统一订阅网关，也是运行 Hermes Agent 的推荐方式。一次 OAuth 登录，即可替代原本需要手动配置的各模型厂商独立账号、API 密钥和计费关系。

Nous Portal 整合了数百个前沿模型和实用工具（网页搜索、图像生成、TTS 等），一个订阅覆盖所有需求。

订阅地址：[portal.nousresearch.com/manage-subscription](https://portal.nousresearch.com/manage-subscription)（支持免费模型）

快速配置：

```bash
hermes setup --portal
```

### 6.2 OAuth 认证方式

Hermes Agent 支持多种 OAuth 认证方式，无需 API Key：

| 供应商 | 认证方式 | 说明 |
|--------|----------|------|
| **GitHub Copilot** | 设备码 OAuth 或 PAT | 支持个人访问令牌或浏览器设备码流程 |
| **Anthropic (OAuth)** | 浏览器登录 | 连接 Claude Max 账户 |
| **Google Gemini (OAuth)** | PKCE 桌面流程 | 免费或付费 Cloud Code Assist |
| **xAI Grok (OAuth)** | 浏览器登录 | SuperGrok 订阅用户 |
| **Qwen Portal** | 浏览器登录 | 消费者登录，绕过 API 计费 |
| **MiniMax (OAuth)** | 浏览器登录 | 消费者登录 |

### 6.3 标准 API Key 供应商

大多数云服务只需将 API Key 填入 `~/.hermes/.env` 文件：

| 供应商 | 环境变量 |
|--------|----------|
| OpenAI | `OPENAI_API_KEY` |
| Anthropic | `ANTHROPIC_API_KEY` |
| OpenRouter | `OPENROUTER_API_KEY` |
| DeepSeek | `DEEPSEEK_API_KEY` |
| 阿里通义千问 | `DASHSCOPE_API_KEY` |
| xAI (Grok) | `XAI_API_KEY` |
| Google Gemini | `GOOGLE_API_KEY` |
| Hugging Face | `HF_TOKEN` |
| NVIDIA NIM | `NVIDIA_API_KEY` |
| 小米 MiMo | `XIAOMI_API_KEY` |
| 腾讯 TokenHub | `TENCENT_API_KEY` |
| Kimi / Moonshot | `MOONSHOT_API_KEY` |
| StepFun | `STEPFUN_API_KEY` |

### 6.4 本地 / 自托管模型

任何兼容 OpenAI API 端点的服务都可以作为自定义供应商接入：

**本地 Ollama**：

```bash
# 配置 Ollama 地址
OLLAMA_BASE_URL=http://localhost:11434
```

注意：需要将上下文长度设置为至少 64,000 tokens，因为默认限制对于 Agent 任务来说太低了。

**vLLM / SGLang / llama.cpp / LM Studio**：均支持，需要各自的启动参数来启用工具调用和正确的上下文分配。

### 6.5 模型 Fallback 机制

可以配置模型回退列表，在主模型故障或限流时自动切换：

```bash
# 管理回退列表
hermes fallback list      # 查看当前回退列表
hermes fallback add       # 添加回退模型
hermes fallback remove    # 移除回退模型
hermes fallback clear     # 清空回退列表
```

## 七、CLI 命令参考

> 官方文档：[CLI 命令参考](https://hermes-agent.nousresearch.com/docs/reference/cli-commands)

### 7.1 核心命令

```bash
hermes                    # 启动交互会话
hermes chat               # 交互式对话
hermes chat -q "问题"     # 单次查询
hermes -z "问题"          # 纯文本输出模式
hermes --yolo             # 跳过安全确认（谨慎使用）
hermes --tui              # 强制终端 UI 模式
```

### 7.2 全局参数

| 参数 | 说明 |
|------|------|
| `-V` | 显示版本号 |
| `-p <profile>` | 选择特定用户配置文件 |
| `-r <id>` / `-c <id>` | 继续过去的对话 |
| `-w <path>` | 在指定工作区启动 |
| `--yolo` | 忽略安全确认 |
| `--tui` | 强制终端 UI |
| `--ignore-rules` | 跳过记忆注入 |

### 7.3 配置与管理

```bash
hermes setup              # 交互式初始配置
hermes setup --portal     # 快速配置 Nous Portal
hermes setup --quick      # 快速配置模式
hermes config show        # 查看当前配置
hermes config edit        # 编辑配置文件
hermes config set         # 设置单个配置项
hermes model              # 配置 AI 模型
hermes tools              # 配置工具
hermes tools --summary    # 查看工具摘要
hermes auth add           # 添加认证凭据
hermes auth list          # 列出凭据
hermes auth status        # 认证状态
```

### 7.4 消息网关

```bash
hermes gateway            # 管理后台消息服务
hermes gateway run        # 前台运行
hermes gateway start      # 后台启动
hermes gateway stop       # 停止服务
hermes gateway status     # 查看状态
hermes gateway install    # 安装为系统服务
hermes gateway setup      # 配置消息平台

hermes send --to telegram "部署完成"   # 发送单条消息
hermes pairing list       # 查看配对请求
hermes pairing approve    # 批准配对
hermes pairing revoke     # 撤销配对
```

### 7.5 技能与插件

```bash
hermes skills list        # 列出所有技能
hermes skills browse      # 浏览可用技能
hermes skills install     # 安装技能
hermes skills update      # 更新技能
hermes skills publish     # 发布技能
hermes bundles list       # 列出技能包
hermes bundles create     # 创建技能包
hermes curator status     # 查看技能维护状态
hermes curator run        # 手动运行技能维护
hermes plugins list       # 列出插件
hermes plugins install    # 安装插件
hermes plugins enable     # 启用插件
hermes plugins disable    # 禁用插件
```

### 7.6 记忆与会话管理

```bash
hermes memory setup       # 配置外部记忆提供商
hermes memory status      # 查看记忆状态
hermes memory off         # 关闭记忆

hermes sessions list      # 列出会话
hermes sessions browse    # 浏览会话
hermes sessions export    # 导出会话
hermes sessions delete    # 删除会话
hermes sessions prune     # 清理旧会话
```

### 7.7 定时任务与自动化

```bash
hermes cron list          # 列出定时任务
hermes cron create        # 创建定时任务（支持自然语言描述）
hermes cron edit          # 编辑任务
hermes cron pause         # 暂停任务
hermes cron run           # 立即执行
hermes cron tick          # 触发一次
```

### 7.8 诊断与维护

```bash
hermes doctor             # 诊断配置问题
hermes doctor --fix       # 自动修复
hermes status             # 系统健康状态
hermes status --all       # 详细状态
hermes status --deep      # 深度检查
hermes dump               # 生成配置摘要
hermes debug share        # 上传日志用于支持
hermes logs agent         # 查看 Agent 日志
hermes logs errors        # 查看错误日志
hermes logs gateway       # 查看网关日志
hermes logs --follow      # 实时跟踪日志
hermes security audit     # 安全审计
hermes update             # 更新到最新版本
hermes update --check     # 检查更新
hermes version            # 显示版本
```

### 7.9 数据备份与迁移

```bash
hermes backup --output backup.tar.gz    # 备份配置和数据
hermes backup --quick                   # 快速备份
hermes import --force                   # 恢复备份

hermes profile list         # 列出配置文件
hermes profile create       # 创建新配置
hermes profile use          # 切换配置
hermes profile export       # 导出配置
```

## 八、更新和卸载

> [更新与卸载文档](https://hermes-agent.nousresearch.com/docs/zh-Hans/getting-started/updating)

### 8.1 更新

```bash
# Git 安装更新
hermes update

# 更新前检查
hermes update --check

# 更新前备份
hermes update --backup

# pip 安装更新
pip install --upgrade hermes-agent    # 或：uv pip install --upgrade hermes-agent
```

### 8.2 卸载

```bash
# 先关闭 gateway 服务
hermes gateway stop
# Linux: systemctl --user disable hermes-gateway
# macOS: launchctl remove ai.hermes.gateway

# git 安装卸载（会提供选项保留配置文件以便重新安装）
hermes uninstall

# pip 安装卸载
pip uninstall hermes-agent
rm -rf ~/.hermes            # 可选 — 如计划重新安装则保留

# 手动卸载
rm -f ~/.local/bin/hermes
rm -rf /path/to/hermes-agent
rm -rf ~/.hermes            # 可选
```

## 九、消息平台接入

Hermes Agent 的 Gateway 支持 20+ 消息平台接入，包括：

**即时通讯**：Telegram、Discord、Slack、Signal、WhatsApp、Matrix、Mattermost

**国内平台**：微信（Weixin）、企业微信（WeCom）、飞书（Feishu/Lark）、钉钉（DingTalk）、QQ、元宝

**企业协作**：Microsoft Teams、Google Chat、LINE

**智能家居**：Home Assistant

**其他**：Email、SMS、Webhook、Open WebUI、API Server

### 9.1 接入飞书

> [飞书接入文档](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/feishu)

**Step 1：创建飞书应用**

运行配置向导：

```bash
hermes gateway setup
```

选择 Feishu 选项，可以扫码自动创建应用或手动在开发者后台创建。确保开启机器人能力。

**Step 2：选择连接模式**

- **WebSocket（推荐）**：Hermes 主动发起出站连接，不需要公网 webhook 端点
- **Webhook**：如果你已经有可访问的 HTTP 端点

**Step 3：配置环境变量**

在 `~/.hermes/.env` 中添加：

```bash
FEISHU_APP_ID=cli_xxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxx
FEISHU_DOMAIN=feishu          # 国内用 feishu，国际版用 lark
FEISHU_CONNECTION_MODE=websocket  # 或 webhook
```

**Step 4：配置权限**

在飞书开发者后台的权限管理中添加：

- `im:message` 和 `im:message:send_as_bot`：消息发送
- `im:resource`：媒体访问
- `im:chat` 和 `im:chat:readonly`：群组信息

**Step 5：配置事件订阅**

订阅 `im.message.receive_v1` 事件。

**Step 6：发布应用**

在版本管理中发布新版本，使权限生效。

**Step 7：启动 Gateway**

```bash
hermes gateway start
```

**使用行为**：

- 直接消息：Agent 回复所有私聊消息
- 群聊：默认只在 @机器人 时回复
- 使用 `/set-home` 命令指定一个聊天作为自动通知的目标

### 9.2 接入微信

> [微信接入文档](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/weixin)

**前提条件**：需要一个个人微信号，安装 Python 依赖：

```bash
pip install aiohttp cryptography

# 可选：终端二维码渲染
pip install hermes-agent[messaging]
```

**Step 1：运行配置向导**

```bash
hermes gateway setup
```

选择 Weixin 选项，终端会显示二维码，用微信扫码并在手机上确认登录。

**Step 2：配置环境变量**

在 `~/.hermes/.env` 中添加：

```bash
WEIXIN_ACCOUNT_ID=your-account-id
```

**Step 3：配对验证**

在首次配对时，AI 会在终端返回一个配对验证码：

```bash
# 输入配对命令（替换 [验证码] 为实际代码）
hermes pairing approve weixin [验证码]
```

验证成功后终端会提示配对成功。

**Step 4：启动 Gateway**

```bash
hermes gateway start
```

**访问控制**：

```bash
# 谁可以发消息给 Bot
WEIXIN_DM_POLICY=open          # open / allowlist / disabled / pairing
WEIXIN_ALLOWED_USERS=user1,user2  # allowlist 模式下使用

# 群聊策略（由于平台限制，默认关闭）
WEIXIN_GROUP_POLICY=disabled    # open / allowlist / disabled
```

### 9.3 接入其他平台

每个平台的配置流程类似，都可以通过 `hermes gateway setup` 交互式向导完成。特定平台的详细配置请参阅 [官方消息平台文档](https://hermes-agent.nousresearch.com/docs/user-guide/messaging)。

## 十、Hermes-WebUI：浏览器可视化面板

### 10.1 项目介绍

> 开源地址：[nesquena/hermes-webui](https://github.com/nesquena/hermes-webui)

Hermes-WebUI 是一个国人开发的浏览器可视化界面，为 Hermes Agent 提供了一个现代化的 Web 操作面板。它仅使用 Python 和原生 JavaScript 构建，**无需构建步骤、无框架、无打包器**，实现了与 Hermes CLI 近乎 1:1 的功能对等。

核心特性：

- 实时 Token 流式输出
- 多 AI 模型提供商选择
- 工具调用过程内联追踪
- 对话管理（标签、置顶、归档）
- 工作区浏览器（含 Git 状态指示）
- 语音输入
- 可定制的 Agent 配置文件
- 多种视觉主题
- 移动端适配布局
- 可选密码保护和 WebAuthn 密钥认证

### 10.2 安装方式

**方式一：直接安装**

```bash
git clone https://github.com/nesquena/hermes-webui.git
cd hermes-webui

# 运行启动脚本
python bootstrap.py
# 或
bash start.sh
```

**方式二：Docker 部署（推荐）**

```bash
# 先创建持久化目录
mkdir -p ~/docker/hermes

# Docker 运行（Linux）
docker run -d \
  --name hermes-webui \
  -p 3001:8787 \
  -e HERMES_WEBUI_STATE_DIR=/app/data \
  -v ~/docker/hermes:/app/data \
  --restart unless-stopped \
  ghcr.io/nesquena/hermes-webui:latest

# Windows PowerShell 版本
docker run -d `
  --name hermes-webui `
  -p 3001:8787 `
  -e HERMES_WEBUI_STATE_DIR=/app/data `
  -v C:\docker\hermes:/app/data `
  --restart unless-stopped `
  ghcr.io/nesquena/hermes-webui:latest
```

> 注意：国内用户可能需要使用镜像加速地址替换 `ghcr.io`，如 `*-ghcr.xuanyuan.run` 等镜像前缀。

**Docker Compose 方式**（推荐用于生产环境）：

```yaml
# docker-compose.yml
version: '3.8'
services:
  hermes-webui:
    image: ghcr.io/nesquena/hermes-webui:latest
    container_name: hermes-webui
    ports:
      - "3001:8787"
    environment:
      - HERMES_WEBUI_STATE_DIR=/app/data
      # 如需接入 OpenAI
      # - OPENAI_API_KEY=sk-xxxxxxx
    volumes:
      - ~/docker/hermes:/app/data
    restart: unless-stopped
```

```bash
docker compose up -d
```

### 10.3 访问方式

容器启动后，在浏览器中访问：

- 本地环境：`http://localhost:3001`
- 远程服务器：`http://服务器IP:3001`（确保 3001 端口已开放）

### 10.4 远程访问安全

如果需要从外部访问 Hermes-WebUI，推荐使用以下方式：

- **SSH 隧道**：`ssh -L 3001:localhost:3001 user@server`
- **Tailscale 组网**：通过 Tailscale 实现安全的远程访问
- **反向代理 + HTTPS**：使用 Nginx/Caddy 反向代理并配置 SSL 证书

## 十一、Hermes Agent 与 OpenClaw 对比

Hermes 和 OpenClaw 经常被放在一起比较，因为都是开源的个人 AI 基础设施，但两者的思路差得比较远。

**核心理念不同**：

Hermes 是 **Agent-First** 的：核心是那个会自我进化的 Agent 循环，Gateway 和多平台支持是围绕这个核心加上去的。

OpenClaw 是 **Gateway-First** 的：核心是一个统一的控制平面 Gateway，它管路由、权限、Channel 接入、Skill 派发，Agent 是被接进去的对象。

两者不是谁比谁好，更多是出发点和适用需求不同：

| 特性 | Hermes Agent | OpenClaw |
|------|:---:|:---:|
| 核心理念 | Agent-First（自进化智能体） | Gateway-First（统一控制平面） |
| 自我学习 | 内置 Skill 自动生成和优化 | 手动编写 Skill |
| 记忆系统 | 三层记忆（会话/持久/Skill） | 持久记忆 |
| 多平台接入 | 20+ 平台 | 多平台 |
| 定时任务 | 内置自然语言 Cron | 需外部工具 |
| 子 Agent | 支持并行子 Agent | 不支持 |
| 适用场景 | 个人 AI 助手、自动化工作流 | 多 Agent 编排、企业级网关 |

## 十二、OpenClaw 迁移到 Hermes Agent

如果你之前用的是 OpenClaw（龙虾），Hermes 就是它的正式继任者。同一个团队，同一条产品线，但架构和能力做了大幅升级。

首次运行 `hermes setup` 时，如果检测到你本地有 `~/.openclaw` 目录，会自动提示迁移。

也可以手动操作：

```bash
# 交互式迁移（推荐）
hermes claw migrate

# 先预览不实际执行（谨慎使用）
hermes claw migrate --dry-run

# 只迁移用户数据，不含密钥
hermes claw migrate --preset user-data

# 包含密钥迁移
hermes claw migrate --migrate-secrets
```

迁移内容包括：

- 人格文件（SOUL.md）
- 记忆数据（MEMORY.md、USER.md）
- 自建技能（导入到 `~/.hermes/skills/openclaw-imports/`）
- 命令审批白名单
- 各平台 API Key（Telegram、OpenRouter、OpenAI、ElevenLabs 等）
- TTS 语音资源
- 工作区指令（AGENTS.md）

迁移完成后 OpenClaw 的原始数据不会被删除，可以放心操作。

## 十三、推荐配置与进阶玩法

> [装完 Hermes 一定要配置这五套系统](https://mp.weixin.qq.com/s/-1CQxvdc1bDMrPzIHFPpbA)

### 13.1 五大配置模块，打造满配版

Hermes 有五大配置模块，全部配好后能力大幅提升：

**1. 身份与记忆：告诉它你是谁**

通过 `SOUL.md`、`MEMORY.md`、`USER.md` 等文件定义 Agent 的身份、记忆和用户画像：

```bash
# 编辑用户画像
hermes config edit
```

**2. 感知能力：让它读懂互联网**

配置网页抓取和信息获取工具：

```bash
# Firecrawl 网页抓取（支持本地 Docker 部署）
FIRECRAWL_API_KEY=fc-xxxxxxxx

# Browserbase 浏览器自动化
BROWSERBASE_API_KEY=xxxxxxxx
```

**3. 表达能力：让它能说能画**

```bash
# 图像生成（FAL）
FAL_API_KEY=xxxxxxxx

# TTS 语音合成
ELEVENLABS_API_KEY=xxxxxxxx
```

**4. 效率和成本：精细管控 Token**

```bash
# 查看系统提示词的 Token 消耗
hermes prompt-size

# 查看使用统计
hermes insights --days 30
```

**5. 生态导航：一站式资源入口**

```bash
# 浏览和安装社区技能
hermes skills browse
hermes skills install <skill-name>

# 安装 MCP 服务扩展能力
hermes mcp install <server-name>

# 安装插件
hermes plugins install <plugin-name>
```

### 13.2 NAS 部署推荐方案

绿联 NAS 虚拟机安装 Ubuntu Server 22.04，然后用 Hermes 国内镜像安装命令安装，配置通信微信、飞书等渠道，完成后再安装 hermes-webui 网页面板，体验很好，更新也很勤快。

推荐部署流程：

1. **NAS 创建 Ubuntu 虚拟机**（或使用 Docker）
2. **使用国内镜像安装 Hermes Agent**
3. **配置模型供应商**（推荐 Nous Portal 或通义千问）
4. **接入消息平台**（微信/飞书/钉钉）
5. **安装 Hermes-WebUI** 作为可视化面板
6. **配置定时任务**实现自动化

### 13.3 实用小技巧

**使用子 Agent 并行处理**：

Hermes 可以为复杂任务自动生成子 Agent 并行工作，大幅缩短处理时间。

**Skill 市场**：

```bash
# 浏览社区分享的技能
hermes skills browse

# 安装热门技能
hermes skills install web-research
hermes skills install code-review
```

**Dashboard 控制面板**：

```bash
# 启动内置 Web 控制面板
hermes dashboard

# 指定端口和地址
hermes dashboard --port 8080 --host 0.0.0.0
```

**Shell 自动补全**：

```bash
# 生成 Bash 补全脚本
hermes completion bash >> ~/.bashrc

# Zsh 补全
hermes completion zsh >> ~/.zshrc

# Fish 补全
hermes completion fish >> ~/.config/fish/completions/hermes.fish
```

## 参考文档

- [Hermes Agent 官方文档](https://hermes-agent.nousresearch.com/docs)
- [Hermes Agent GitHub 仓库](https://github.com/nousresearch/hermes-agent)
- [Hermes-WebUI 开源项目](https://github.com/nesquena/hermes-webui)
- [Nous Portal 订阅](https://portal.nousresearch.com/manage-subscription)
- [国内安装 Hermes Agent 踩坑全记录](https://www.cnblogs.com/itech/p/19862085)
- [Hermes Agent 终于有了像样的 Web 界面](https://www.cnblogs.com/itech/p/19961757)
- [给 Hermes Agent 装个可视化面板：Docker 部署 Hermes WebUI](https://cloud.tencent.com/developer/article/2659825)
- [两个月狂揽 6 万星的 Hermes Agent 全跑通](https://ata.atatech.org/articles/11020606988)
- [小白安装 Hermes Agent 抄作业指南](https://post.smzdm.com/p/aomkv3q9/)
- [Hermes Agent 完整指南：从安装到进阶玩法](https://zhuanlan.zhihu.com/p/2027128115831260939)
- [绿联 NAS 社区 Hermes Agent 讨论](https://club.ugnas.com/forum.php?mod=viewthread&tid=4161&highlight=hermes)
