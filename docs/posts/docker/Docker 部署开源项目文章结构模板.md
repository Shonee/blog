# 使用 Docker 部署开源项目文章模板

本文档用于撰写“使用 Docker 部署某个开源项目”的标准化文章。模板覆盖项目介绍、功能特性、架构分析、下载、安装部署、更新、卸载、使用、功能展示、总结等模块，可根据具体项目灵活调整。

## 参考资料

- Docker 官方概览：<https://docs.docker.com/get-started/docker-overview/>
- Docker Compose 文档：<https://docs.docker.com/compose/>
- Docker Compose Services：<https://docs.docker.com/reference/compose-file/services/>
- Docker Compose Volumes：<https://docs.docker.com/reference/compose-file/volumes/>
- Docker Compose Networks：<https://docs.docker.com/reference/compose-file/networks/>
- Docker Engine Ubuntu 安装文档：<https://docs.docker.com/engine/install/ubuntu/>
- Gitea Docker 部署文档：<https://docs.gitea.com/installation/install-with-docker>
- n8n Docker 部署文档：<https://docs.n8n.io/hosting/installation/docker/>
- Portainer Docker 部署文档：<https://docs.portainer.io/start/install-ce/server/docker/linux>
- Uptime Kuma 安装文档：<https://github.com/louislam/uptime-kuma/wiki/%F0%9F%94%A7-How-to-Install>

## 文章模板

# 使用 Docker 部署 [项目名称]：从安装到使用的完整指南

## 1. 项目介绍

[项目名称] 是一个 [项目定位，例如：开源监控系统 / 自动化工作流平台 / 代码托管平台]，主要用于解决 [核心问题]。

本文会从项目背景、功能特性、架构、Docker 部署、更新、卸载和实际使用几个角度，带你快速搭建一个可运行的 [项目名称] 环境。

## 2. 项目速览

| 项目 | 内容 |
|---|---|
| 项目名称 | [项目名称] |
| 官方地址 | [官网链接] |
| GitHub/GitLab | [源码仓库] |
| Docker 镜像 | [镜像地址] |
| 开源协议 | [License] |
| 默认端口 | [例如 3000 / 5678 / 8080] |
| 数据目录 | [例如 /data /app/data /home/node/.n8n] |
| 推荐部署方式 | Docker Compose |

## 3. 功能特性

- [功能 1]：说明它能解决什么问题。
- [功能 2]：结合实际场景说明价值。
- [功能 3]：说明与同类工具的差异。
- [权限 / 插件 / API / 多用户 / Webhook / 任务调度等特色能力]

## 4. 适用场景

- 个人自托管：[例如个人知识库、监控、自动化、文件管理]
- 团队内部工具：[例如代码管理、CI/CD、服务状态页]
- 轻量生产环境：[说明适合和不适合的边界]
- 学习和测试：[适合快速体验项目能力]

## 5. 架构分析

先用一段话说明：[项目名称] 由哪些核心组件组成，例如 Web 服务、数据库、缓存、任务队列、文件存储、反向代理等。

图表默认使用 Mermaid 语法，适合 GitHub 和多数 Markdown 预览工具直接渲染。如果目标发布平台只支持 PlantUML，再按平台要求改写图表语法。

### 5.1 部署架构图

```mermaid
flowchart LR
  user["用户"] -->|"HTTP/HTTPS"| proxy["Reverse Proxy<br/>Nginx/Caddy/Traefik"]

  subgraph host["Docker Host"]
    proxy -->|"转发请求"| app["[项目名称] App<br/>应用服务"]
    app -->|"读写业务数据"| db[("Database<br/>SQLite/PostgreSQL/MySQL")]
    app -->|"保存配置/附件/日志"| volume[("Volume<br/>持久化数据")]
  end
```

### 5.2 容器启动流程图

```mermaid
flowchart TD
  start([开始]) --> read["读取 docker-compose.yml"]
  read --> pull["拉取镜像"]
  pull --> network["创建网络"]
  network --> volume["挂载数据卷"]
  volume --> env["注入环境变量"]
  env --> startContainer["启动应用容器"]
  startContainer --> hasDb{"依赖数据库?"}
  hasDb -->|"是"| waitDb["等待数据库就绪"]
  hasDb -->|"否"| init["应用初始化"]
  waitDb --> init
  init --> visit["浏览器访问 http://服务器IP:端口"]
  visit --> done([完成])
```

## 6. 部署前准备

### 6.1 服务器要求

- 系统：[Ubuntu/Debian/CentOS 等]
- CPU：[最低配置]
- 内存：[最低配置]
- 磁盘：[建议容量]
- 端口：[列出需要开放的端口]

### 6.2 安装 Docker 和 Compose

```bash
docker --version
docker compose version
```

如未安装，请参考 Docker 官方安装文档。生产环境建议使用官方软件源安装，避免使用不兼容的发行版打包版本。

## 7. Docker 快速部署

如果只是想快速体验 [项目名称]，可以先使用 `docker run` 单容器启动。这个方式适合本地试用、功能验证和临时演示；如果准备长期使用，建议继续阅读下一节的 Docker Compose 完整部署。

创建数据目录：

```bash
mkdir -p /opt/[project-name]
```

拉取镜像：

```bash
docker pull [镜像名称]:[版本号]
```

启动容器：

```bash
docker run -d \
  --name [project-name] \
  --restart unless-stopped \
  -p 8080:[容器端口] \
  -e TZ=Asia/Shanghai \
  -e [KEY]=[VALUE] \
  -v /opt/[project-name]/data:/data \
  [镜像名称]:[版本号]
```

查看容器状态：

```bash
docker ps
```

查看运行日志：

```bash
docker logs -f [project-name]
```

访问地址：

```text
http://服务器IP:8080
```

快速部署方式的好处是命令直观、上手快；不足是环境变量、端口、数据卷和依赖服务都写在命令里，后续维护不如 Compose 清晰。

## 8. Docker Compose 完整部署

Docker Compose 更适合长期部署。它可以把镜像、端口、环境变量、数据卷、网络和依赖服务统一写进配置文件，方便备份、迁移、升级和多人协作维护。

创建项目目录：

```bash
mkdir -p /opt/[project-name]
cd /opt/[project-name]
```

创建 `.env` 文件：

```env
TZ=Asia/Shanghai
APP_PORT=8080
APP_VERSION=latest
```

创建 `docker-compose.yml`：

```yaml
services:
  app:
    image: [镜像名称]:${APP_VERSION}
    container_name: [project-name]
    restart: unless-stopped
    ports:
      - "${APP_PORT}:[容器端口]"
    environment:
      - TZ=${TZ}
      - [KEY]=[VALUE]
    volumes:
      - ./data:/data
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

启动服务：

```bash
docker compose up -d
```

查看服务状态：

```bash
docker compose ps
```

查看运行日志：

```bash
docker compose logs -f
```

访问地址：

```text
http://服务器IP:APP_PORT
```

首次进入后，按照页面提示完成管理员账号、数据库连接、站点信息等初始化配置。

### 8.1 多服务 Compose 示例

如果 [项目名称] 依赖数据库、缓存或任务队列，可以在同一个 `docker-compose.yml` 中声明多个服务。下面以应用服务加 PostgreSQL 为例：

```yaml
services:
  app:
    image: [镜像名称]:${APP_VERSION}
    container_name: [project-name]
    restart: unless-stopped
    depends_on:
      - postgres
    ports:
      - "${APP_PORT}:[容器端口]"
    environment:
      - TZ=${TZ}
      - DATABASE_URL=postgres://[db_user]:[db_password]@postgres:5432/[db_name]
    volumes:
      - ./data:/data
    networks:
      - app-network

  postgres:
    image: postgres:16
    container_name: [project-name]-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=[db_name]
      - POSTGRES_USER=[db_user]
      - POSTGRES_PASSWORD=[db_password]
    volumes:
      - ./postgres:/var/lib/postgresql/data
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

这个示例里，`app` 和 `postgres` 在同一个 Docker 网络中通信，应用可以通过服务名 `postgres` 连接数据库。实际写文章时，需要替换为项目官方推荐的数据库类型、环境变量和数据目录。

## 9. 部署后检查

检查容器或服务是否正常运行：

```bash
docker ps
docker compose ps
```

检查日志是否有报错：

```bash
docker logs -f [project-name]
docker compose logs -f
```

重点确认：

- 端口是否正确映射。
- 数据目录是否挂载到宿主机。
- 环境变量是否和官方文档一致。
- 如果依赖数据库，数据库是否已经初始化完成。
- Web 页面是否可以正常打开。

## 10. 使用指南

访问地址：

```text
http://服务器IP:APP_PORT
```

### 10.1 首次登录

说明默认账号是否存在、是否需要创建管理员、初始化时要注意哪些字段。

### 10.2 核心功能使用

- 功能一：[操作步骤 + 结果说明]
- 功能二：[操作步骤 + 结果说明]
- 功能三：[操作步骤 + 结果说明]

### 10.3 常用命令

Docker 快速部署常用命令：

```bash
docker ps
docker logs -f [project-name]
docker restart [project-name]
docker stop [project-name]
docker rm [project-name]
```

Docker Compose 完整部署常用命令：

```bash
docker compose ps
docker compose logs -f
docker compose restart
docker compose exec app sh
```

## 11. 功能展示

建议配图展示：

- 首页 / 仪表盘
- 创建任务 / 新建项目 / 添加监控项
- 配置页面
- 运行结果
- 日志或状态页面

每张图下面用 1-2 句话说明“这个页面能做什么”，不要只堆截图。

## 12. 数据备份

如果使用本地目录挂载：

```bash
tar -czvf [project-name]-backup-$(date +%F).tar.gz ./data ./.env ./docker-compose.yml
```

如果使用 Docker volume，先确认卷名：

```bash
docker volume ls
```

备份前建议先停止服务，避免数据库文件写入中造成不一致。

## 13. 更新升级

更新前先备份数据。

如果使用 `docker run` 快速部署，可以按下面流程更新：

```bash
docker pull [镜像名称]:[新版本号]
docker stop [project-name]
docker rm [project-name]
docker run -d \
  --name [project-name] \
  --restart unless-stopped \
  -p 8080:[容器端口] \
  -e TZ=Asia/Shanghai \
  -e [KEY]=[VALUE] \
  -v /opt/[project-name]/data:/data \
  [镜像名称]:[新版本号]
```

如果使用 Docker Compose 完整部署，可以按下面流程更新：

```bash
cd /opt/[project-name]
docker compose pull
docker compose down
docker compose up -d
docker compose logs -f
```

如果指定了固定版本，先修改 `.env` 中的版本号：

```env
APP_VERSION=1.2.3
```

再执行更新命令。

## 14. 回滚版本

如果新版本异常，可以改回旧版本镜像：

```env
APP_VERSION=1.2.2
```

然后重新启动：

```bash
docker compose pull
docker compose up -d
```

如果使用 `docker run`，则停止并删除新容器后，用旧版本镜像重新执行启动命令。

## 15. 卸载清理

如果使用 `docker run` 快速部署，停止并删除容器：

```bash
docker stop [project-name]
docker rm [project-name]
```

如果使用 Docker Compose 完整部署，停止并删除服务：

```bash
docker compose down
```

同时删除数据目录：

```bash
cd /opt
rm -rf /opt/[project-name]
```

如果使用 Docker volume，还需要删除对应 volume：

```bash
docker volume ls
docker volume rm [volume_name]
```

注意：删除数据卷或数据目录后，应用数据通常无法恢复。

## 16. 常见问题

### 16.1 端口被占用

使用以下命令查看端口占用：

```bash
lsof -i :[端口]
```

然后修改 `.env` 或 `docker-compose.yml` 中的宿主机端口。

### 16.2 容器启动失败

```bash
docker logs -f [project-name]
docker compose logs -f
```

重点检查：环境变量、数据目录权限、数据库连接、镜像版本、端口映射。

### 16.3 数据没有持久化

确认 `volumes` 是否正确映射到宿主机目录或 Docker volume。

## 17. 总结

用 Docker 部署 [项目名称] 的核心好处是环境一致、启动简单、迁移方便。如果只是临时体验，可以使用 `docker run` 快速部署；如果准备用在个人长期服务、团队内部工具或生产环境，推荐使用 Docker Compose 管理配置，这样更新、备份、迁移和排查问题都会更清晰。

如果用于生产环境，还需要补充 HTTPS、反向代理、定期备份、访问控制、监控告警和版本升级策略。

## 追加给 AI 的写作提示

- 请基于以上模板撰写文章，但不要机械套壳。根据具体开源项目的特点调整结构和篇幅：如果项目架构简单，可以弱化架构分析；如果项目依赖数据库、缓存、对象存储或反向代理，需要重点解释组件关系。

- 请降低 AI 生成味道，避免“首先、其次、最后”式堆叠，不要写空泛赞美。多写具体场景、具体端口、具体目录、具体命令、具体注意事项，让读者看完能真正部署、使用、更新和卸载。

- 文章要让非资深运维也能理解：每个关键命令后说明它做了什么；每个配置项后说明为什么需要它；每个风险点后说明如何避免。

- 请为架构、启动流程、请求链路或数据流生成 Mermaid 语法图，优先使用 `flowchart`、`sequenceDiagram` 等常见图表类型，确保 GitHub 和多数 Markdown 预览工具可以直接渲染。图中的组件名称要贴合该项目真实模块，不要使用过于通用的占位词。如果发布平台明确只支持 PlantUML，再额外提供 PlantUML 版本。

- 功能展示部分不要只写“如下图所示”。需要说明截图对应的真实操作、页面能解决的问题、读者应该关注的配置或状态。

- 如果项目官方文档给出了推荐部署方式、环境变量、数据目录、端口、升级说明，请以官方文档为准，不要凭经验编造。

## 可选增强模块

如果目标项目比较复杂，可以额外加入以下章节：

- 安全加固：HTTPS、反向代理、管理员密码、访问白名单、防火墙。
- 生产环境建议：资源限制、日志轮转、健康检查、自动重启策略。
- 多服务编排：数据库、缓存、对象存储、消息队列、任务 Worker。
- 监控告警：容器状态、磁盘使用率、应用健康检查、日志异常。
- 迁移方案：从单机部署迁移到 Docker，或从 SQLite 迁移到 PostgreSQL/MySQL。
- 性能优化：并发参数、缓存配置、上传限制、数据库连接池。
