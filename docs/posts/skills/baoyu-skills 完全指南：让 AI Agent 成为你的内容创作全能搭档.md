## baoyu-skills 完全指南：让 AI Agent 成为你的内容创作全能搭档

### 引言：内容创作者的"配图之痛"

每一位内容创作者都经历过这样的场景：花了好几个小时写完一篇深度长文，到了配图环节却犯了难——构思画面、写提示词、在 AI 绘图工具里反复生成和挑选，整个过程既耗时又割裂。如果你做的是多平台分发，还得把文章适配成小红书图文、Twitter 推文、PPT 演示等不同格式，工作量直接翻倍。

这些痛点，正是 [baoyu-skills](https://github.com/JimLiu/baoyu-skills) 项目诞生的原动力。它的作者宝玉（[@dotey](https://x.com/dotey)）是 AI 领域知名的技术布道者，他在日常高频创作中打磨出了这套技能集，并将其完全开源。截至目前，该项目在 GitHub 上已收获超过 22,000 颗 Star 和 2,500+ Fork，成为 AI Agent 技能生态中最受瞩目的项目之一。

---

### 一、baoyu-skills 是什么

baoyu-skills 是一套专为 AI Agent 打造的**内容创作技能集**。它不是一个独立的软件，而是一组"Skill"（技能文件）的集合——每个 Skill 就是一份精心编排的 SKILL.md 指令文档，当它被加载到 Claude Code、Codex CLI、Gemini CLI 等 AI Agent 环境后，Agent 就获得了相应的专业能力。

用一句话概括它的核心理念：**把复杂的内容创作工作流，封装成一句对话就能触发的技能。**

它的设计哲学可以归结为三个关键词：

**即装即用**。每个 Skill 文件夹完全自包含，拷贝到指定目录即可生效，无需编译或安装依赖。

**可组合**。21 个 Skill 可以自由组合——先用"文章配图"生成插图，再用"信息图"把核心观点做成社交媒体图片，最后用"翻译"技能输出多语言版本。

**可扩展**。每个 Skill 都支持通过 EXTEND.md 文件进行个性化定制，你可以修改品牌色、字体、水印、输出风格等一切细节，而无需改动原始文件。

---

### 二、项目结构解析

baoyu-skills 采用 **Bun + TypeScript Monorepo** 架构，通过 npm workspaces 管理多个包。整体目录结构如下：

```
baoyu-skills/
├── skills/                          # 核心技能目录（21 个 Skill）
│   │
│   │  ── 内容创作类（10 个）──
│   ├── baoyu-xhs-images/            # 小红书/微信图文卡片系列
│   ├── baoyu-infographic/           # 专业信息图（21 种布局 × 22 种风格）
│   ├── baoyu-diagram/               # 专业 SVG 图表（架构图、流程图、思维导图等）
│   ├── baoyu-cover-image/           # 文章封面图（5 维度定制）
│   ├── baoyu-slide-deck/            # 演示文稿 / PPT 幻灯片
│   ├── baoyu-comic/                 # 知识教育漫画
│   ├── baoyu-article-illustrator/   # 文章上下文自动配图
│   ├── baoyu-post-to-x/             # 发布到 X / Twitter
│   ├── baoyu-post-to-wechat/        # 发布到微信公众号
│   ├── baoyu-post-to-weibo/         # 发布到微博
│   │
│   │  ── AI 生成后端类（2 个）──
│   ├── baoyu-image-gen/             # 统一图片生成后端（11+ AI 服务）
│   ├── baoyu-danger-gemini-web/     # Gemini Web API 逆向调用
│   │
│   │  ── 实用工具类（9 个）──
│   ├── baoyu-youtube-transcript/    # YouTube 字幕 / 封面图下载
│   ├── baoyu-url-to-markdown/       # 任意网页转 Markdown
│   ├── baoyu-danger-x-to-markdown/  # X/Twitter 推文转 Markdown
│   ├── baoyu-compress-image/        # 图片压缩（WebP / PNG）
│   ├── baoyu-format-markdown/       # Markdown 格式化美化
│   ├── baoyu-markdown-to-html/      # Markdown 转微信兼容 HTML
│   ├── baoyu-translate/             # 智能翻译（快速 / 标准 / 精翻）
│   ├── baoyu-wechat-summary/        # 微信群聊摘要生成
│   ├── baoyu-electron-extract/      # Electron 应用资源提取
│
├── packages/                        # 共享工具包
│   ├── baoyu-chrome-cdp/            # Chrome CDP 浏览器自动化
│   ├── baoyu-codex-imagegen/        # Codex CLI 图片生成适配
│   ├── baoyu-fetch/                 # 通用 URL 抓取
│   └── baoyu-md/                    # Markdown 渲染工具
├── .claude-plugin/                  # Claude 插件市场配置
│   └── marketplace.json
├── CLAUDE.md                        # Agent 编码规范
├── package.json                     # Monorepo 根配置
└── README.zh.md                     # 中文文档
```

此外，README 还推荐了一个独立仓库的技能 **baoyu-design**——它将"Claude Design"能力打包为独立可移植的 Skill，可生成精致的 UI 原型、交互式原型和自包含 HTML 产物。

**共享包的设计**是项目的一大亮点。`baoyu-chrome-cdp` 封装了 Chrome DevTools Protocol 的常用操作，被"网页转 Markdown""Gemini Web 自动化""发布到微信公众号""发布到微博"等多个 Skill 复用；`baoyu-codex-imagegen` 为 Codex CLI 环境提供了统一的图片生成接口；`baoyu-fetch` 提供带站点适配器的通用 URL 抓取能力；`baoyu-md` 则统一了 Markdown 渲染逻辑。这种抽象避免了重复代码，也让 Skill 的维护更加集中。

每个 Skill 文件夹都是自包含的——你完全可以只拷贝其中一两个 Skill 到你的项目中单独使用，无需引入整个仓库。

---

### 三、21 个 Skill 全景解读

baoyu-skills 的 21 个技能分为三大类别，覆盖了从内容生成、AI 能力后端到实用工具的完整链路。

#### 3.1 内容创作类（10 个）

这是 baoyu-skills 的核心价值所在，每个 Skill 都精准对应了一个内容创作场景。

**baoyu-infographic —— 专业信息图**

最受欢迎的 Skill 之一。支持 21 种布局类型和 22 种视觉风格，能自动分析内容、推荐布局×风格组合，生成可直接发布的 Notion 风格手绘信息图系列。适合小红书、Instagram 等社交平台分发。

**baoyu-xhs-images —— 小红书 / 微信图文卡片**

专为小红书和微信生态优化的图文卡片生成器。支持 12 种视觉风格、8 种布局和 3 种配色方案，将内容拆解为 1-10 张卡通风格图片卡片，最大化社交媒体传播效果。

**baoyu-diagram —— 专业 SVG 图表**

创建专业级暗色主题 SVG 图表，类型涵盖架构图、流程图、时序图、结构图、思维导图、时间线、概念图等。当你需要画任何类型的图表时，这个 Skill 都能胜任。

**baoyu-cover-image —— 文章封面图**

通过 5 个维度（类型、配色、渲染风格、文字、情绪）定制文章封面图，内置 11 种配色方案和 7 种渲染风格。支持电影宽幅（2.35:1）、宽屏（16:9）和正方形（1:1）三种比例。

**baoyu-slide-deck —— 演示文稿生成**

将内容自动转化为演示文稿。先生成带有风格指引的大纲，再逐页生成幻灯片图片。适合快速把一篇技术文章或方案文档变成可以演讲的幻灯片。

**baoyu-comic —— 知识漫画创作**

支持多种画风和情绪基调的知识漫画创作器。能设计角色、规划分镜布局，批量生成教育漫画页面。适合科普、教程、人物传记等场景。

**baoyu-article-illustrator —— 文章自动配图**

宝玉本人的"起家之作"。分析文章结构，识别需要视觉辅助的位置，通过"类型×风格×配色"三维度方法生成插图。你只需提供文章内容，Agent 会判断哪些段落需要配图并自动完成创作。

**baoyu-post-to-x —— 发布到 X / Twitter**

支持普通推文（含图片/视频）和 X Articles（长文 Markdown 格式）。在 Codex 环境中还能通过 Chrome Extension 或 Chrome CDP 自动化完成发布。能将长文章拆解为推文线程（Thread），自动处理字数限制。

**baoyu-post-to-wechat —— 发布到微信公众号**

通过 API 或 Chrome CDP 发布内容到微信公众号。支持文章发布（HTML / Markdown / 纯文本输入）和图文发布（多图模式）。Markdown 文章工作流会默认将普通外链转换为底部引用，确保微信兼容。

**baoyu-post-to-weibo —— 发布到微博**

支持普通微博（文字 + 图片 + 视频）和头条文章（Markdown 输入）。通过 Chrome CDP 实现自动化发布。

#### 3.2 AI 生成后端类（2 个）

这类 Skill 为内容创作类 Skill 提供底层的 AI 能力支撑。

**baoyu-image-gen —— 统一图片生成**

整个图片生成能力的核心枢纽。封装了 11+ 种 AI 图片生成服务的统一接口，包括 OpenAI GPT Image 2、Azure OpenAI、Google、OpenRouter、DashScope（阿里云）、Z.AI GLM-Image、MiniMax、即梦（Jimeng）、Seedream、Replicate 和 Agnes。支持文生图、参考图、多种宽高比和从提示词文件批量生成。默认顺序执行，当用户已有多个提示词时可切换为并行批量模式。

**baoyu-danger-gemini-web —— Gemini Web 自动化**

通过逆向工程的 Gemini Web API 生成图片和文本。支持文本生成、提示词生图、参考图视觉输入和多轮对话。当其他 Skill 需要图片生成后端，或用户希望直接使用 Gemini 的多模态能力时，这个 Skill 提供了不依赖官方 API 的"曲线救国"方案。注意：名称中的"danger"前缀提醒用户这是非官方逆向方案，使用前需知晓风险。

#### 3.3 实用工具类（9 个）

这类 Skill 提供了内容创作链路中的各种辅助能力，每一个都解决一个具体的问题。

**baoyu-youtube-transcript —— YouTube 字幕与封面下载**

通过 YouTube URL 或视频 ID 下载字幕/转录文本和封面图。支持多语言字幕、字幕翻译、章节划分和说话人识别。原始数据会缓存，方便后续快速重新格式化。对于做视频内容分析或二次创作来说，这是获取视频文字内容的利器。

**baoyu-url-to-markdown —— 网页转 Markdown**

将任意网页高质量地转换为 Markdown 格式，是内容采集和二次加工的第一步。基于 baoyu-fetch CLI（Chrome CDP + 站点适配器架构），内置了 X/Twitter、YouTube 字幕、Hacker News 线程和通用页面（Defuddle）的适配器。遇到登录墙或验证码时，支持等待用户手动交互后继续抓取。

**baoyu-danger-x-to-markdown —— X/Twitter 推文转 Markdown**

将 X（Twitter）的推文和长文转换为带 YAML Front Matter 的 Markdown 格式。使用逆向工程 API，首次使用时需要用户确认风险。适合保存有价值的推文、将 Twitter Thread 归档为文档。

**baoyu-compress-image —— 图片压缩**

将图片压缩为 WebP（默认）或 PNG 格式，自动选择最优压缩工具。在发布到各平台之前优化图片体积，提升加载速度，降低存储成本。

**baoyu-format-markdown —— Markdown 格式化**

为纯文本或粗糙的 Markdown 文件添加 Front Matter、标题层级、摘要、加粗、列表、代码块等格式化元素。输出文件名为 `{原文件名}-formatted.md`，不会覆盖原文件。适合把随手写的笔记快速整理成结构化的文章。

**baoyu-markdown-to-html —— Markdown 转 HTML**

将 Markdown 转换为带样式的 HTML，特别优化了微信公众号的兼容性。支持代码高亮、数学公式、Mermaid 图表（通过无头 Chrome 渲染为 PNG）、PlantUML、脚注、警告框、信息图，以及可选的外部链接底部引用。这是把 Markdown 文章发布到微信公众号的关键桥梁。

**baoyu-translate —— 智能翻译**

支持三种翻译模式：快速翻译（quick）、标准翻译（normal）和精翻（refined），并支持自定义术语表。不是简单的逐句翻译，而是能根据目标语言和语境做本地化适配，支持多种语言对。精翻模式会多轮审校，产出接近人工翻译质量的结果。

**baoyu-wechat-summary —— 微信群聊摘要**

利用本地 wx-cli 工具生成微信群聊的结构化摘要。默认生成常规摘要，也支持可选的"毒舌"风格版本。会维护每个群的历史记录（history.json + history.md）、成员画像，并跨会话进行事实核查。对于需要跟踪多个活跃微信群动态的人来说，这是极其实用的效率工具。

**baoyu-electron-extract —— Electron 应用资源提取**

从任意已安装的 Electron 应用（.asar 包）中提取资源和 JavaScript 代码。如果有 .js.map 源映射文件，会还原原始源码；否则用 Prettier 格式化压缩后的代码。跳过 node_modules，同时支持 macOS 和 Windows。适合需要分析、学习或调试某个 Electron 应用内部实现的开发者。

---

### 四、安装与配置

baoyu-skills 提供了多种安装方式，从最轻量的单 Skill 安装到完整的插件市场集成，满足不同需求。以下同时覆盖每种方式的更新和卸载方法。

#### 4.1 方式一：npx skills 通用技能管理器（推荐）

`npx skills` 是目前最流行的 Agent Skill 管理工具，baoyu-skills 完全兼容该工具的所有操作。

**安装全部技能：**

```bash
npx skills add JimLiu/baoyu-skills --all -y
```

**安装单个 Skill：**

```bash
npx skills add JimLiu/baoyu-skills --skill baoyu-infographic
```

**安装到全局（所有项目共享）：**

```bash
npx skills add JimLiu/baoyu-skills --all -g -y
```

**指定 AI Agent 安装（如 Claude Code）：**

```bash
npx skills add JimLiu/baoyu-skills --all --agent claude-code -y
```

常用安装参数说明：`-y` 跳过确认提示，`-g` / `--global` 安装到全局而非项目级，`--agent <tool>` 指定目标 Agent（`'*'` 表示所有），`--copy` 复制文件而非创建符号链接，`--all` 同时安装所有技能 + 所有 Agent + 自动确认，`--full-depth` 搜索更深层级的目录。

**更新技能：**

```bash
# 更新所有项目级技能
npx skills update

# 更新指定技能
npx skills update baoyu-infographic

# 仅更新全局技能
npx skills update -g

# 仅更新项目级技能
npx skills update -p
```

`npx skills upgrade` 与 `npx skills update` 功能相同，均可使用。更新操作会根据 lock 文件拉取最新版本的技能文件。

**卸载技能：**

```bash
# 交互式选择要卸载的技能（空格勾选，回车确认）
npx skills remove

# 卸载指定技能
npx skills remove baoyu-infographic

# 批量卸载，-y 跳过确认
npx skills remove baoyu-infographic baoyu-comic -y

# 卸载全部技能
npx skills remove --all -y

# 从全局范围卸载
npx skills remove -g baoyu-infographic

# 从指定 Agent 卸载
npx skills rm --agent claude-code baoyu-infographic
```

**查看已安装技能：**

```bash
npx skills list          # 查看项目级
npx skills ls -g         # 查看全局
npx skills ls -a claude-code  # 按 Agent 筛选
npx skills ls --json     # JSON 格式输出
```

**搜索社区技能：**

```bash
npx skills find              # 交互式搜索
npx skills find infographic  # 按关键词搜索
```

#### 4.2 方式二：npx baoyu-skills 项目专属安装

baoyu-skills 也提供了自己的安装脚本，直接将技能文件复制到目标目录：

**安装：**

```bash
# 安装全部技能到 Claude Code 全局目录
npx baoyu-skills install --target ~/.claude/skills

# 安装单个 Skill
npx baoyu-skills install --skill baoyu-infographic --target ~/.claude/skills

# 安装到 Codex 项目目录（随项目版本管理）
npx baoyu-skills install --target .codex/skills
```

**更新：** 重新运行 install 命令即可覆盖更新到最新版本：

```bash
npx baoyu-skills install --target ~/.claude/skills
```

**卸载：** 手动删除对应 Skill 文件夹即可：

```bash
# 删除单个技能
rm -rf ~/.claude/skills/baoyu-infographic

# 删除全部 baoyu 技能
ls ~/.claude/skills | grep baoyu- | xargs -I{} rm -rf ~/.claude/skills/{}
```

#### 4.3 方式三：ClawHub 安装

通过 ClawHub（Claude 的技能分发平台）直接安装：

**安装：**

```bash
claude install @baoyu/skills
```

**更新：**

```bash
claude install @baoyu/skills  # 重新安装覆盖
```

**卸载：**

```bash
claude uninstall @baoyu/skills
```

#### 4.4 方式四：插件市场安装

baoyu-skills 已上架 Claude Plugin Marketplace。在 Claude Code 中通过插件市场搜索 "baoyu-skills" 安装即可，更新和卸载均在市场界面中操作。

#### 4.5 方式五：手动安装

直接从 GitHub 克隆仓库，拷贝需要的 Skill 文件夹到目标目录：

```bash
git clone https://github.com/JimLiu/baoyu-skills.git
cp -r baoyu-skills/skills/baoyu-infographic ~/.claude/skills/
```

更新只需 `git pull` 后重新拷贝。卸载则删除对应的 Skill 文件夹。

#### 4.6 API 密钥配置

部分 Skill 需要配置 AI 服务的 API Key 才能完整使用。在项目根目录或用户主目录创建 `.env` 文件：

```bash
# 图片生成（选择你使用的服务，不需要全部配置）
OPENAI_API_KEY=sk-xxx           # OpenAI GPT Image 2 / DALL-E
AZURE_OPENAI_API_KEY=xxx        # Azure OpenAI
GOOGLE_API_KEY=xxx              # Google Imagen
DASHSCOPE_API_KEY=sk-xxx        # 阿里云 DashScope
ZAI_API_KEY=xxx                 # Z.AI GLM-Image
MINIMAX_API_KEY=xxx             # MiniMax
JIMENG_API_KEY=xxx              # 即梦
REPLICATE_API_TOKEN=xxx         # Replicate
AGNES_API_KEY=xxx               # Agnes

# 浏览器自动化（可选）
CHROME_CDP_URL=http://localhost:9222
```

#### 4.7 个性化定制

每个 Skill 都支持通过 EXTEND.md 进行个性化扩展。例如，为信息图 Skill 添加品牌定制：

```markdown
# skills/baoyu-infographic/EXTEND.md

## 品牌定制
- 主色调: #1DA1F2
- 字体: "PingFang SC", "Noto Sans SC"
- 水印: @你的品牌名
- Logo: ./assets/logo.png
```

EXTEND.md 不会修改原始 Skill 文件，而是在运行时被合并加载。这意味着你可以随时拉取上游更新，而不会丢失自己的定制配置。

---

### 五、核心 Skill 实战演示

下面通过几个典型场景，展示 baoyu-skills 在实际创作中的使用方式。

#### 5.1 一键生成小红书信息图

假设你刚写完一篇关于"2026 年 AI 趋势"的文章，想把它拆成小红书图文系列：

```
帮我把这篇文章做成小红书信息图系列：

[粘贴文章内容]

要求：
- 每张图 3-5 个要点
- 使用科技蓝为主色调
- 总共 5-8 张图
```

Agent 加载 baoyu-infographic 技能后，会自动分析文章结构、提取核心观点、规划每张图的内容布局，然后调用图片生成后端输出成品图片。整个过程你只需要一句话。

#### 5.2 文章自动配图

写作过程中，直接让 Agent 为你的文章配图：

```
请阅读这篇文章，在合适的位置生成配图：

[粘贴文章内容]

风格要求：扁平插画风格，色调温暖
```

baoyu-article-illustrator 会分析每个段落的语义，判断哪些内容适合视觉化呈现，生成匹配的插图并标注插入位置。

#### 5.3 知识漫画创作

把一个技术概念变成通俗易懂的漫画：

```
把"OAuth 2.0 授权流程"这个主题做成一个教育漫画，
面向完全没有技术背景的读者，
风格轻松幽默，4-6 页。
```

baoyu-comic 会设计角色、规划分镜、设定画风和情绪基调，逐页输出漫画内容。这在科普类内容创作中非常实用。

#### 5.4 多平台一键分发

写完一篇文章后，同时生成多个平台的适配版本：

```
请把这篇文章：
1. 用 baoyu-markdown-to-html 转成微信兼容的 HTML
2. 生成封面图并拆解成 Twitter Thread
3. 转成小红书图文卡片系列
4. 发一条微博摘要
```

多个 Skill 协同工作，一次对话完成多平台的内容适配。

#### 5.5 "半自动"模式

如果你暂时没有配置图片生成 API Key，baoyu-skills 也支持"半自动"工作模式——Agent 分析内容并输出精准的绘图提示词（Prompt），你将提示词手动粘贴到即梦、豆包、Midjourney 等工具中生成图片。虽然多了一步手动操作，但核心的"理解内容→生成提示词"这一步完全由 AI 完成，质量依然很高。

---

### 六、高级用法

#### 6.1 切换图片生成后端

baoyu-image-gen 支持 11+ 种图片生成服务。在 `.env` 中配置多个 Key 后，可以在对话中随时切换：

```
用 DALL-E 生成这张信息图的背景
```

或者：

```
切换到即梦生成这张漫画
```

这种灵活性让你可以根据不同场景选择最合适的生成服务——比如用 DALL-E 做写实风格，用即梦做中国风，用 MiniMax 做插画风格。

#### 6.2 Chrome CDP 浏览器自动化

baoyu-danger-gemini-web 利用逆向工程的 Gemini Web API 实现与 Gemini 的直接交互。如果需要基于 Chrome CDP 的浏览器自动化（被多个发布类 Skill 使用），启动 Chrome 时添加远程调试参数：

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

然后在 `.env` 中配置：

```bash
CHROME_CDP_URL=http://localhost:9222
```

这样 post-to-wechat、post-to-weibo 等发布类 Skill 就能通过浏览器自动化完成登录态下的内容发布。

#### 6.3 技能组合编排

baoyu-skills 的真正威力在于技能的组合使用。一个典型的完整工作流可能是：

1. **baoyu-url-to-markdown** 采集一篇英文技术文章
2. **baoyu-translate**（精翻模式）将其翻译为中文并做本地化适配
3. **baoyu-format-markdown** 整理译文格式
4. **baoyu-article-illustrator** 为译文自动配图
5. **baoyu-infographic** 提取核心观点做成信息图系列
6. **baoyu-markdown-to-html** 转换为微信兼容的 HTML
7. **baoyu-post-to-wechat** 发布到公众号
8. **baoyu-post-to-x** 生成 Twitter Thread
9. **baoyu-post-to-weibo** 发一条微博摘要
10. **baoyu-compress-image** 压缩所有图片优化加载速度

整条链路一气呵成，一篇英文长文变成了适配多个中文平台的全套内容素材。

#### 6.4 开发与维护

项目使用 Bun 作为运行时，开发环境搭建：

```bash
# 克隆仓库
git clone https://github.com/JimLiu/baoyu-skills.git
cd baoyu-skills

# 安装依赖
bun install

# 运行测试
bun test

# 构建
bun run build
```

项目配有完善的 CI/CD 工作流，每次提交都会自动运行测试和格式检查。

---

### 七、baoyu-skills 的本质与定位

理解了 baoyu-skills 的工作原理，你会发现它的本质是 **Prompt 工程 + 轻量化工具编排**。每个 SKILL.md 文件里并不包含可执行程序逻辑，而是一套精心设计的指令集——告诉 AI Agent 在特定场景下应该如何思考、调用哪些工具、按什么流程输出。

这不是缺点，而是一种巧妙的架构选择。正如一位使用者评价的："它把指令打包复用，核心智能依然依赖大模型，但对内容工作流痛点的封装是精准而专业的。"

与其他 AI 辅助工具的对比来看：通用编码助手（如 Cursor、Copilot）面向开发者，侧重代码生成；通用 AI 绘画工具（如 Midjourney、DALL-E）只解决单点的图片生成；而 baoyu-skills 填补的是**从"写完内容"到"发布到各平台"之间那段繁琐的最后一公里**。它让没有编程背景的创作者也能通过对话完成原本需要多个工具、多个步骤才能完成的工作。

---

### 八、总结

baoyu-skills 是 AI Agent 技能生态中一个极具代表性的项目。它以宝玉本人作为重度内容创作者的第一手痛点为出发点，用 21 个精准定义的 Skill 覆盖了内容创作的完整链路——从信息采集（网页转 Markdown、YouTube 字幕、推文归档）、内容加工（翻译、格式化、配图、信息图、漫画、图表、PPT）、到多平台发布（微信公众号、X/Twitter、微博），再加上图片压缩、Electron 提取等实用工具，构成了一个自给自足的创作工具箱。22,000+ Star 的社区认可证明了这种"小而精"的技能封装模式的有效性。

对于内容创作者来说，它意味着更少的重复劳动和更多的创作可能。对于 AI Agent 开发者来说，它则是一个教科书级别的 Skill 设计范例——如何把复杂的工作流拆解成可组合、可扩展、自包含的技能单元。

**相关链接：**

- GitHub 仓库：[github.com/JimLiu/baoyu-skills](https://github.com/JimLiu/baoyu-skills)
- 宝玉的个人站点：[baoyu.io](https://baoyu.io/)
- 宝玉的 X/Twitter：[@dotey](https://x.com/dotey)
