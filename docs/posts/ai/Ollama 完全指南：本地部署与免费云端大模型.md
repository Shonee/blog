# Ollama 完全指南：本地部署与免费云端大模型

## 一、Ollama 是什么

Ollama 是一个开源的大语言模型（LLM）运行平台，让你可以在自己的电脑上轻松下载、运行和管理各种开源大模型，同时也提供云端模型服务。它的核心优势在于：

- **本地运行，隐私安全**：模型在本地硬件上推理，数据不会上传到第三方服务器
- **简单易用**：一条命令即可下载并运行模型，无需复杂配置
- **OpenAI 兼容 API**：本地模型自动暴露 OpenAI 兼容的 API 接口，可无缝对接各种 AI 工具
- **云端模型**：对于本地硬件无法运行的大参数模型，可通过 Ollama Cloud 在云端推理
- **丰富的集成**：原生支持 Claude Code、Codex、OpenClaw、VS Code 等主流 AI 开发工具

官网地址：[https://ollama.com](https://ollama.com/)

---

## 二、快速开始

### 2.1 安装 Ollama

官方下载地址：[https://ollama.com/download](https://ollama.com/download)

Ollama 支持 macOS、Linux 和 Windows 三个平台。

**macOS / Linux 一键安装：**

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows：**

从官网下载 Windows 安装包，双击运行即可。

**验证安装：**

```bash
ollama --version
```

### 2.2 注册账号

使用本地模型不需要账号，但如果你要使用 **Cloud 云端模型**，则需要注册一个 Ollama 账号。

1. 访问 [https://ollama.com](https://ollama.com/)，点击右上角 **Sign In**
2. 使用邮箱注册账号
3. 完成登录后即自动进入 Dashboard

注册地址：[https://ollama.com](https://ollama.com/)

---

## 三、本地模型

### 3.1 模型库

Ollama 拥有庞大的开源模型库，涵盖各种规模和用途的模型。

模型库地址：[https://ollama.com/library](https://ollama.com/library)

常用的本地模型包括：

| 模型 | 参数量 | 特点 |
|------|--------|------|
| `llama3.2` | 1B / 3B | Meta 出品，轻量高效，适合资源有限的设备 |
| `qwen2.5` | 0.5B ~ 72B | 阿里通义，中英双语能力突出 |
| `deepseek-r1` | 1.5B ~ 671B | 深度求索，推理能力出色 |
| `gemma3` | 1B ~ 27B | Google 出品，多模态支持 |
| `phi4` | 14B | 微软出品，小模型中的性能标杆 |
| `mistral` | 7B | Mistral AI 出品，经典开源模型 |
| `codellama` | 7B ~ 70B | Meta 出品，专注代码生成 |
| `llava` | 7B ~ 34B | 多模态模型，支持图像理解 |

### 3.2 模型管理命令

```bash
# 拉取模型（下载到本地）
ollama pull llama3.2
ollama pull qwen2.5:7b

# 列出本地已安装的模型
ollama ls

# 运行模型（交互式对话）
ollama run llama3.2

# 查看模型详细信息
ollama show llama3.2

# 删除模型
ollama rm llama3.2

# 复制/重命名模型
ollama cp llama3.2 my-llama3.2
```

### 3.3 本地模型的硬件要求

| 模型参数量 | 最低 RAM | 推荐 GPU 显存 |
|-----------|----------|--------------|
| 1B ~ 3B | 4 GB | 集成显卡即可 |
| 7B ~ 8B | 8 GB | 6 GB+ |
| 13B ~ 14B | 16 GB | 10 GB+ |
| 30B ~ 34B | 32 GB | 20 GB+ |
| 70B+ | 64 GB+ | 多卡或云端 |

> 提示：Ollama 默认使用 GPU 加速。如果显存不足，会自动回退到 CPU 推理（速度会变慢）。

---

## 四、Cloud 云端模型

### 4.1 什么是 Cloud 模型

Cloud 模型是 Ollama 提供的云端推理服务。对于本地硬件无法承载的大参数模型（如 480B、671B 等），可以直接通过 Ollama CLI 或 API 在云端运行，**使用方式与本地模型完全一致**，只是推理发生在远程数据中心。

官方文档：[https://docs.ollama.com/cloud](https://docs.ollama.com/cloud)

**隐私声明**：Ollama Cloud 不保留用户数据，确保隐私和安全。

### 4.2 支持的云端模型

云端模型列表：[https://ollama.com/search?c=cloud](https://ollama.com/search?c=cloud)

当前可用的 Cloud 模型（部分）：

| 模型 | 参数量 | 特点 |
|------|--------|------|
| `deepseek-v4-pro` | 大型 | 深度求索最新旗舰 |
| `deepseek-v4-flash` | 284B / 13B | 快速推理 |
| `deepseek-v3.1` | 671B | 强大的推理和编码能力 |
| `qwen3-coder` | 480B / 30B | 阿里通义编码专家模型 |
| `qwen3.5` | 0.8B ~ 122B | 阿里通义最新系列 |
| `gpt-oss` | 120B / 20B | 开源 GPT 模型 |
| `kimi-k2.7-code` | 大型 | Moonshot 编码模型 |
| `kimi-k2.6` / `kimi-k2.5` | 大型 | Moonshot Kimi 系列 |
| `glm-5.2` / `glm-5.1` / `glm-5` | 744B | 智谱 GLM 系列 |
| `minimax-m3` / `m2.7` / `m2.5` | 大型 | MiniMax 系列 |
| `gemma4` | 12B / 26B / 31B | Google 最新多模态 |
| `nemotron-3-ultra` / `super` | 120B | NVIDIA 系列 |
| `gemini-3-flash-preview` | 大型 | Google Gemini |
| `minimax-m2.1` | 大型 | MiniMax |

> 注意：Cloud 模型列表会持续更新，建议访问上方链接查看最新可用模型。

### 4.3 使用 Cloud 模型

**前提条件**：需要先注册 Ollama 账号并登录。

```bash
# 登录 Ollama 账号（浏览器会打开进行授权）
ollama signin

# 拉取云端模型
ollama pull gpt-oss:120b-cloud

# 运行云端模型（交互式对话）
ollama run gpt-oss:120b-cloud
ollama run qwen3-coder:480b-cloud

# 查看已拉取的云端模型
ollama ls
```

### 4.4 Cloud 模型用量与限制

用量查看地址：[https://ollama.com/settings](https://ollama.com/settings)，点击 **Usage** 标签页查看。

**免费套餐（Free Tier）限制**：

- **Token 额度**：每 5 小时会话周期内有一定免费 token 额度（动态浮动，基于 GPU 时间计费），每周重置累计额度
- **并发限制**：同时只能运行 1 个云端模型
- **请求限制**：存在每小时与每日的请求次数上限，超限会触发 HTTP 429 错误
- **可用模型**：支持大部分云端大参数模型

**付费套餐对比**：

| 套餐 | 价格 | 并发数 | 用量 | 其他特性 |
|------|------|--------|------|---------|
| **Free** | $0 | 1 个云模型 | 基础额度 | CLI、API、桌面应用、40,000+ 集成 |
| **Pro** | $20/月 或 $200/年 | 3 个云模型 | 免费版的 50 倍 | 上传和分享私有模型 |
| **Max** | $100/月 | 10 个云模型 | Pro 的 5 倍 | 最高优先级 |
| **Team** | 联系销售 | 共享用量 | 集中计费 | SSO、优先支持 |

套餐详情：[https://ollama.com/pricing](https://ollama.com/pricing)

---

## 五、API 调用

Ollama 提供两种 API 访问方式：**本地 API**（调用本地运行的模型）和**云端 API**（直接调用 Ollama 云服务）。

### 5.1 本地 API

本地运行模型后，Ollama 会自动在 `localhost:11434` 暴露 OpenAI 兼容的 API 接口。

```bash
# 确保模型已在运行
ollama run llama3.2

# 调用本地 API
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [{"role": "user", "content": "你好"}],
  "stream": false
}'
```

### 5.2 云端 API（使用 API Key）

这种方式无需本地安装 Ollama，可直接通过 HTTP 请求调用云端模型，适合集成到自己的应用或脚本中。

**获取 API Key**：

1. 登录 Ollama 账号：[https://ollama.com](https://ollama.com/)
2. 进入 **Settings → Keys** 页面：[https://ollama.com/settings/keys](https://ollama.com/settings/keys)
3. 点击创建新的 API Key
4. 妥善保存（只显示一次）

**cURL 调用示例**：

```bash
# 设置环境变量（推荐，避免硬编码 key）
export OLLAMA_API_KEY="your-api-key-here"

# 调用云端模型
curl https://ollama.com/api/chat \
  -H "Authorization: Bearer $OLLAMA_API_KEY" \
  -d '{
    "model": "minimax-m3:cloud",
    "messages": [{"role": "user", "content": "你是谁？"}],
    "stream": false
  }'
```

**Python SDK 调用**：

```python
import ollama

# 本地模型调用
response = ollama.chat(model='llama3.2', messages=[
    {'role': 'user', 'content': '你好'}
])
print(response['message']['content'])

# 云端模型调用
response = ollama.chat(model='gpt-oss:120b-cloud', messages=[
    {'role': 'user', 'content': 'Why is the sky blue?'}
])
print(response['message']['content'])
```

安装 Python SDK：`pip install ollama`

**JavaScript / Node.js 调用**：

```javascript
import ollama from "ollama";

// 本地模型
const response = await ollama.chat({
  model: "llama3.2",
  messages: [{ role: "user", content: "你好" }],
});
console.log(response.message.content);

// 云端模型
const cloudResponse = await ollama.chat({
  model: "gpt-oss:120b-cloud",
  messages: [{ role: "user", content: "Why is the sky blue?" }],
});
console.log(cloudResponse.message.content);
```

安装 JS SDK：`npm install ollama`

更多语言和使用方法参考官方文档：[https://docs.ollama.com/cloud](https://docs.ollama.com/cloud)

---

## 六、AI 工具集成

Ollama v0.15+ 引入了 `ollama launch` 命令，可以一键启动各种主流 AI 开发工具，自动将工具的模型后端切换到 Ollama（本地或云端），无需手动配置 API 端点。

官方集成文档：[https://docs.ollama.com/integrations](https://docs.ollama.com/integrations)

### 6.1 Claude Code

Claude Code 是 Anthropic 推出的终端 AI 编程助手。通过 Ollama 可以使用本地/云端模型替代 Claude 官方 API，避免付费和数据外泄。

```bash
# 安装 Claude Code
curl -fsSL https://claude.ai/install.sh | bash

# 使用 Ollama 启动 Claude（默认模型）
ollama launch claude

# 指定使用某个模型
ollama launch claude --model kimi-k2.5:cloud
ollama launch claude --model qwen3-coder:480b-cloud
```

### 6.2 Codex（OpenAI）

OpenAI Codex 有桌面应用和 CLI 两种形式，均支持 Ollama 集成。

```bash
# Codex 桌面应用
# 安装：https://developers.openai.com/codex/quickstart
ollama launch codex-app

# Codex CLI
npm install -g @openai/codex
ollama launch codex
```

### 6.3 OpenClaw

OpenClaw 是 Ollama 官方的个人 AI 助手，内置了 `web_search` 等工具，支持自动化任务。

```bash
ollama launch openclaw
```

### 6.4 VS Code（Continue 插件）

通过 VS Code 的 Continue 插件，可以将 Ollama 作为代码补全和对话的后端。

1. 在 VS Code 中安装 **Continue** 扩展
2. 在 Continue 设置中添加 Ollama 作为 Provider
3. 模型地址指向 `http://localhost:11434`

### 6.5 其他集成

Ollama 还支持非常多的第三方工具，包括：

- **Hermes Agent** — AI 智能代理框架
- **Open WebUI** — 本地 ChatGPT 风格的 Web 界面
- **AnythingLLM** — 本地 RAG（检索增强生成）工具
- **Cursor** — AI 代码编辑器
- **Zed** — 新一代代码编辑器

完整集成列表：[https://docs.ollama.com/integrations](https://docs.ollama.com/integrations)

---

## 七、常用命令速查

```bash
# ─── 账号 ───
ollama signin                           # 登录 Ollama 账号

# ─── 模型管理 ───
ollama pull <model>                     # 下载模型（本地或云端）
ollama ls                               # 列出已安装模型
ollama show <model>                     # 查看模型详情
ollama rm <model>                       # 删除模型
ollama cp <source> <dest>               # 复制/重命名模型

# ─── 运行模型 ───
ollama run <model>                      # 交互式运行模型
ollama run <model> --keepalive 30m      # 保持模型在内存中 30 分钟

# ─── 云端模型 ───
ollama pull qwen3-coder:480b-cloud      # 拉取云端模型
ollama run qwen3-coder:480b-cloud       # 运行云端模型

# ─── 工具集成 ───
ollama launch claude                    # 启动 Claude Code
ollama launch claude --model <model>    # 指定模型启动 Claude
ollama launch codex                     # 启动 Codex CLI
ollama launch codex-app                 # 启动 Codex 桌面应用
ollama launch openclaw                  # 启动 OpenClaw

# ─── 服务管理 ───
ollama serve                            # 手动启动 Ollama 服务
ollama list                             # 同 ollama ls
ollama ps                               # 查看当前加载的模型
```

---

## 八、最佳实践与技巧

### 8.1 模型选择建议

| 场景 | 推荐模型 | 理由 |
|------|---------|------|
| 日常对话 | `llama3.2:3b`、`qwen2.5:7b` | 轻量快速，响应流畅 |
| 代码编写 | `qwen3-coder:480b-cloud`、`deepseek-v3.1:671b-cloud` | 大参数编码模型，质量更高 |
| 多模态（图片理解） | `gemma4`、`llava` | 支持图文混合输入 |
| 中英双语 | `qwen2.5`、`qwen3.5` | 中文能力突出 |
| 低配设备 | `phi4:14b`、`llama3.2:1b` | 小模型中的性能标杆 |

### 8.2 性能优化

- **GPU 加速**：Ollama 默认使用 GPU。确保安装了最新的显卡驱动（NVIDIA CUDA / AMD ROCm / Apple Metal）
- **内存管理**：使用 `ollama run <model> --keepalive 0` 让模型在对话结束后立即从内存卸载，释放显存
- **量化模型**：Ollama 默认使用 4-bit 量化模型（Q4），可在质量和速度间取得平衡。如需更高精度，可拉取 Q8 或 FP16 版本（如 `ollama pull llama3.2:3b-instruct-q8_0`）
- **并发控制**：本地模型可通过 `OLLAMA_NUM_PARALLEL` 环境变量设置并发请求数

### 8.3 环境变量配置

```bash
# 设置 Ollama 服务端口（默认 11434）
OLLAMA_HOST=0.0.0.0:11434

# 设置模型存储路径
OLLAMA_MODELS=/path/to/models

# 设置并发请求数
OLLAMA_NUM_PARALLEL=4

# 设置默认保持活跃时间
OLLAMA_KEEP_ALIVE=5m

# 设置 API Key（用于云端 API 调用）
OLLAMA_API_KEY=your-api-key-here
```

---

## 九、常见问题与排查

### Q: `ollama run` 报 "model not found"

```bash
# 先拉取模型再运行
ollama pull llama3.2
ollama run llama3.2
```

### Q: 云端模型一直报 401 Unauthorized

```bash
# 重新登录
ollama signin

# 如果仍然失败，检查是否已达到免费额度限制
# 访问 https://ollama.com/settings → Usage 查看用量
```

### Q: 云端模型报 429 Too Many Requests

这是免费套餐的速率限制。解决方法：

1. 等待几分钟后重试（5 小时会话周期重置）
2. 升级到 Pro 套餐获取更多额度
3. 在本地运行较小参数的模型

### Q: 本地模型运行很慢

- 检查 GPU 是否被正确识别（`ollama ps` 可看到 processor 信息）
- 尝试更小的模型或更低精度的量化版本
- 关闭其他占用 GPU 的程序
- 增加系统 swap 空间（RAM 不足时）

### Q: 如何让局域网内其他设备访问 Ollama

```bash
# 设置 Ollama 监听所有网络接口
OLLAMA_HOST=0.0.0.0 ollama serve
```

其他设备通过 `http://<你的IP>:11434` 访问。

---

## 十、参考资源

- **Ollama 官网**：[https://ollama.com](https://ollama.com/)
- **模型库**：[https://ollama.com/library](https://ollama.com/library)
- **Cloud 模型列表**：[https://ollama.com/search?c=cloud](https://ollama.com/search?c=cloud)
- **套餐价格**：[https://ollama.com/pricing](https://ollama.com/pricing)
- **官方文档**：[https://docs.ollama.com](https://docs.ollama.com)
- **Cloud 模型文档**：[https://docs.ollama.com/cloud](https://docs.ollama.com/cloud)
- **集成文档**：[https://docs.ollama.com/integrations](https://docs.ollama.com/integrations)
- **GitHub 仓库**：[https://github.com/ollama/ollama](https://github.com/ollama/ollama)
- **用量查看**：[https://ollama.com/settings](https://ollama.com/settings)
- **API Keys 管理**：[https://ollama.com/settings/keys](https://ollama.com/settings/keys)
