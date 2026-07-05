# Docker 部署 Open WebUI：给本地大模型装一个好用的界面

在本地跑 Ollama 或者接 OpenAI API 做对话，命令行够用了，但给团队用、给非技术同事用，总得有个 Web 界面。Open WebUI 就是干这件事的——144k Star，一条 Docker 命令就能跑起来，支持 Ollama 本地模型和 OpenAI 兼容 API，还内置了 RAG 知识库、图片生成、语音通话、多模型对比等功能。

## 项目速览

| 项目 | 内容 |
|---|---|
| 项目名称 | Open WebUI（原 Ollama WebUI） |
| GitHub | [open-webui/open-webui](https://github.com/open-webui/open-webui) |
| Docker 镜像 | `ghcr.io/open-webui/open-webui`（Docker Hub 同名 `openwebui/open-webui`） |
| 开源协议 | Open WebUI License 2025 |
| 最新版本 | v0.10.2 |
| 默认端口 | 3000（容器内 8080） |
| 数据存储 | SQLite（默认）/ PostgreSQL + 本地文件 |
| 容器数量 | 1 个（可选搭配 Ollama 共 2 个） |

## 架构分析

Open WebUI 是单容器应用，本身不跑模型推理。它通过 HTTP API 和 Ollama 或 OpenAI 兼容服务通信。

```mermaid
flowchart TB
  user["用户浏览器"] -->|"HTTP :3000"| webui["Open WebUI<br/>容器 :8080"]

  subgraph backend["模型后端（三选一）"]
    ollama["Ollama<br/>本地模型 :11434"]
    openai["OpenAI API<br/>云端模型"]
    other["其他兼容 API<br/>vLLM / Groq / Mistral"]
  end

  webui -->|"HTTP API"| ollama
  webui -->|"HTTP API"| openai
  webui -->|"HTTP API"| other

  webui -->|"持久化"| volume[("数据卷<br/>open-webui:/app/backend/data")]
```

容器内的请求链路很简单：用户发消息 → WebUI 转发给模型后端 → 收到流式响应 → 渲染到前端。RAG、图片生成这些扩展功能也是在同一个容器内完成的，不需要额外服务。

## 镜像变体

Open WebUI 提供了四种镜像 tag，选对了能省不少事：

| Tag | 适用场景 | 备注 |
|---|---|---|
| `:main` | 大多数用户 | 标准镜像，推荐 |
| `:main-slim` | 磁盘空间紧张 | 体积更小，但 Whisper 和 Embedding 模型首次使用时才会下载 |
| `:cuda` | 需要 Nvidia GPU 加速 | 搭配 `--gpus all` 使用 |
| `:ollama` | 不想单独装 Ollama | 容器内打包了 Ollama，一条命令搞定 UI + 模型推理 |

## 部署前准备

### 服务器要求

| 项目 | 最低 | 建议 |
|---|---|---|
| 系统 | Linux 64-bit / macOS / Windows WSL2 | Ubuntu 22.04 |
| CPU | 1 核 | 2 核+ |
| 内存 | 2 GiB | 4 GiB+（如果容器内跑 Ollama，取决于模型大小） |
| 磁盘 | 5 GB | 20 GB+（模型文件吃空间） |
| 端口 | 3000 | — |

### 安装 Docker

```bash
docker --version        # 需要 19.03+
docker compose version  # 需要 2.24.0+
```

没装？

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
```

### 国内镜像加速

Open WebUI 的镜像发布在两个 registry：`ghcr.io`（GitHub Container Registry）和 Docker Hub（`openwebui/open-webui`）。如果拉取超时：

**方式一：替换前缀直接拉取（无需配置）**

```bash
# Docker Hub 镜像可通过国内源替换前缀
docker pull docker.1ms.run/openwebui/open-webui:main
docker pull docker.m.daocloud.io/openwebui/open-webui:main
docker pull docker.1panel.live/openwebui/open-webui:main
```

> 替换规则：`openwebui/open-webui:main` → `docker.1ms.run/openwebui/open-webui:main`
>
> `ghcr.io` 的镜像部分国内源不支持，建议换成 Docker Hub 同名镜像 `openwebui/open-webui`。

**方式二：配置 Docker daemon 加速器（全局生效）**

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.m.daocloud.io",
    "https://docker.1panel.live",
    "https://hub.rat.dev",
    "https://docker.xuanyuan.me"
  ]
}
EOF
sudo systemctl daemon-reload && sudo systemctl restart docker
```

云厂商服务器（阿里云/腾讯云/华为云）可以去对应平台的容器镜像控制台获取专属加速地址，速度更快。

**方式三：离线导入**

```bash
# 在有网络的机器上导出
docker save ghcr.io/open-webui/open-webui:main -o open-webui.tar

# 传到目标机器后导入
docker load -i open-webui.tar
```

## Docker 快速部署

### 场景一：Ollama 在本机

最常见的用法——本机已经跑了 Ollama，想给套个 Web 界面：

```bash
docker run -d -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui --restart always \
  ghcr.io/open-webui/open-webui:main
```

`--add-host=host.docker.internal:host-gateway` 这个参数是关键——它让容器内能通过 `host.docker.internal` 访问宿主机的 Ollama（端口 11434）。不加这个参数的话，容器内连不上本机的 Ollama。

### 场景二：Ollama 在另一台服务器

```bash
docker run -d -p 3000:8080 \
  -e OLLAMA_BASE_URL=http://192.168.1.100:11434 \
  -v open-webui:/app/backend/data \
  --name open-webui --restart always \
  ghcr.io/open-webui/open-webui:main
```

把 `OLLAMA_BASE_URL` 改成 Ollama 服务器的实际地址。Ollama 默认只监听 `127.0.0.1`，远程连接需要在 Ollama 那边设置环境变量 `OLLAMA_HOST=0.0.0.0`。

### 场景三：只接 OpenAI API（不需要 Ollama）

```bash
docker run -d -p 3000:8080 \
  -e OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx \
  -v open-webui:/app/backend/data \
  --name open-webui --restart always \
  ghcr.io/open-webui/open-webui:main
```

启动后在 WebUI 的「设置 → 连接」里可以添加多个 OpenAI 兼容 API（支持 vLLM、Groq、Mistral 等）。

### 场景四：Open WebUI + Ollama 打包部署（一条命令全搞定）

不想单独装 Ollama 的话，用 `:ollama` 标签的镜像，UI 和模型推理都在一个容器里：

```bash
# 有 GPU
docker run -d -p 3000:8080 --gpus all \
  -v ollama:/root/.ollama \
  -v open-webui:/app/backend/data \
  --name open-webui --restart always \
  ghcr.io/open-webui/open-webui:ollama

# 纯 CPU
docker run -d -p 3000:8080 \
  -v ollama:/root/.ollama \
  -v open-webui:/app/backend/data \
  --name open-webui --restart always \
  ghcr.io/open-webui/open-webui:ollama
```

这种模式多了两个 volume：`ollama` 存模型文件，`open-webui` 存对话数据和配置。

### 场景五：Nvidia GPU 加速

```bash
docker run -d -p 3000:8080 --gpus all \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui --restart always \
  ghcr.io/open-webui/open-webui:cuda
```

需要宿主机已安装 [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)。

## Docker Compose 部署

如果觉得 `docker run` 参数太长不好管理，或者想同时跑 Ollama + Open WebUI，用 Compose 更方便。

创建 `docker-compose.yml`：

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    volumes:
      - ollama:/root/.ollama
    restart: unless-stopped

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "3000:8080"
    volumes:
      - open-webui:/app/backend/data
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    depends_on:
      - ollama
    restart: unless-stopped

volumes:
  ollama:
  open-webui:
```

> 如果不需要 Ollama，删掉 `ollama` 服务和 `depends_on`，把 `OLLAMA_BASE_URL` 改成远程地址或删掉。

启动：

```bash
docker compose up -d
```

两个容器都起来后访问 `http://localhost:3000`。

## 环境变量

Open WebUI 支持大量环境变量，以下是最常用的几个：

| 变量 | 默认值 | 说明 |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama 服务地址，Docker 内改为 `http://host.docker.internal:11434` |
| `OPENAI_API_BASE_URLS` | `https://api.openai.com/v1` | OpenAI 兼容 API 地址（支持多个，分号分隔） |
| `OPENAI_API_KEYS` | 空 | 对应的 API Key |
| `WEBUI_SECRET_KEY` | 自动生成 | JWT 密钥，**建议手动设置固定值**，否则容器重建后会被踢出登录 |
| `WEBUI_AUTH` | `True` | 设为 `False` 可关闭登录（单用户模式），但切换后不可逆 |
| `DATABASE_URL` | SQLite | 可改为 PostgreSQL：`postgresql://user:pass@host:5432/dbname` |

生成随机密钥：

```bash
openssl rand -hex 32
```

## 首次使用

浏览器打开 `http://localhost:3000`，第一次会进入管理员注册页面——填邮箱和密码。

注册完成后：

1. **拉取模型**（如果用 Ollama）：在「设置 → 模型」里可以拉取 Ollama 模型，或者直接在终端跑 `docker exec ollama ollama pull llama3.2`
2. **添加 API**（如果用 OpenAI）：「设置 → 连接」→ 添加 OpenAI API 或兼容服务
3. **开始对话**：左侧新建对话，选择模型，直接打字

## 日常管理

### 常用命令

| 操作 | 命令 |
|---|---|
| 查看日志 | `docker logs -f open-webui` |
| 重启 | `docker restart open-webui` |
| 进入容器 | `docker exec -it open-webui bash` |
| 停止 | `docker stop open-webui` |
| 查看资源占用 | `docker stats open-webui` |

### 数据备份

```bash
# 导出 volume 数据
docker run --rm -v open-webui:/data -v $(pwd):/backup alpine \
  tar czf /backup/open-webui-backup-$(date +%F).tar.gz /data

# 恢复
docker run --rm -v open-webui:/data -v $(pwd):/backup alpine \
  sh -c "cd /data && tar xzf /backup/open-webui-backup-xxxxxxxx.tar.gz --strip-components=1"
```

### 更新升级

```bash
# 拉取最新镜像
docker pull ghcr.io/open-webui/open-webui:main

# 停掉旧容器并删除（数据在 volume 里不会丢）
docker rm -f open-webui

# 用相同参数重新启动
docker run -d -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui --restart always \
  ghcr.io/open-webui/open-webui:main
```

或者用 Watchtower 自动更新：

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  nickfedor/watchtower --run-once open-webui
```

> `WEBUI_SECRET_KEY` 没设的话，每次容器重建都会被踢出登录。建议启动时就固定好这个值。

## 卸载

```bash
docker rm -f open-webui
docker rmi ghcr.io/open-webui/open-webui:main    # 删除镜像
docker volume rm open-webui                        # 删除数据（不可恢复）
```

## 常见问题

### 连不上本机的 Ollama

这是最多人踩的坑。容器内的 `localhost` 指向容器自己，不是宿主机。解决方式：

```bash
# 方式一：加 host 映射（推荐）
docker run ... --add-host=host.docker.internal:host-gateway ...

# 然后在 WebUI「设置 → 连接」里把 Ollama URL 改为：
# http://host.docker.internal:11434
```

如果还是连不上，确认 Ollama 监听了所有网卡：

```bash
# 在宿主机设置 Ollama 监听地址
export OLLAMA_HOST=0.0.0.0
systemctl restart ollama
```

### Server Connection Error

WebUI 容器连不上模型后端。排查顺序：

1. 检查 Ollama 是否在运行：`docker ps` 或 `curl http://localhost:11434/api/tags`
2. 检查 URL 配置：WebUI 后台「设置 → 连接」→ Ollama URL 是否正确
3. 如果是远程 Ollama，确认防火墙放行了 11434 端口

### 容器启动后白屏

- 检查日志：`docker logs open-webui`
- 如果报数据库迁移错误，可能是 volume 数据损坏，试 `docker volume rm open-webui` 后重新创建（会丢数据）
- 端口 3000 被占用的话，改映射：`-p 8080:8080`

### GPU 不生效

确认三步：

1. 宿主机装了 NVIDIA 驱动：`nvidia-smi` 能看到 GPU
2. 装了 NVIDIA Container Toolkit：`docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi` 能跑通
3. 用了 `:cuda` 标签的镜像（不是 `:main`）

## 生产环境建议

**HTTPS**：在 Open WebUI 前面加一层 Nginx 或 Caddy 做反向代理，配 SSL 证书。不要直接暴露 3000 端口到公网。

**密钥固定**：启动时设置 `WEBUI_SECRET_KEY`，否则容器重建后所有用户的 session 失效。

**版本锁定**：生产环境用具体版本号而不是 `:main`：

```bash
ghcr.io/open-webui/open-webui:v0.10.2
```

**定期备份**：`open-webui` volume 里存了所有对话、用户配置和上传文件，丢了就全没了。建议每周至少备份一次。

**切换到 PostgreSQL**：默认用 SQLite，多人并发写入时可能锁库。在 `.env` 或启动参数里设置 `DATABASE_URL=postgresql://user:pass@host:5432/openwebui` 即可切换。

## 下一步

跑起来之后可以折腾的方向：

- 接入多个模型，用多模型对比功能看不同模型的回答差异
- 上传文档建知识库（RAG），支持 PDF/Word/TXT/Markdown
- 配置 Web Search（需要 SearXNG 或 Google PSE 等搜索引擎 API）
- 试试语音对话——支持本地 Whisper 或 OpenAI STT

<!-- IMAGE_PROMPT: gpt-image2
为「Docker 部署 Open WebUI」技术教程文章设计封面图。
画面元素：左侧 Docker 鲸鱼托着一个聊天界面窗口，中间一个发光的 AI 对话气泡，右侧 Ollama 羊驼的抽象轮廓。底部命令行终端。
视觉风格：现代极简技术插画，16:9 画幅，主色 #2496ED（Docker 蓝），辅色 #FF6B6B（Open WebUI 品牌暖色），浅色渐变背景，等距 2.5D 视角，无文字。
-->
