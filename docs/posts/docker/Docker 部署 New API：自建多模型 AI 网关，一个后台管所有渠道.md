---
title: Docker 部署 New API：自建多模型 AI 网关，一个后台管所有渠道
date: 2026-07-18
category: docker
tags:
  - ai
  - api
---

# 使用 Docker 部署 New API：自建多模型 AI 网关，一个后台管所有渠道

手上攒了一堆 API Key——OpenAI 一个、Claude 一个、DeepSeek 一个、通义千问又一个，每个应用都要单独配一遍，用量分散在各家后台，成本根本算不清。New API 把这些上游统一收进一个网关：对外暴露 OpenAI 兼容格式，对内管理所有渠道、令牌、配额和计费。

New API 是基于 One API 二次开发的下一代 AI 模型网关，能把各种大模型 API 转换成 OpenAI / Claude / Gemini 兼容格式。这篇讲怎么用 Docker Compose 把它连同数据库、缓存一起跑起来。

## 项目速览

| 项目 | 内容 |
|---|---|
| 项目名称 | New API |
| 官方文档 | [newapi.ai](https://www.newapi.ai/) |
| GitHub | [QuantumNous/new-api](https://github.com/QuantumNous/new-api) |
| Docker 镜像 | `calciumion/new-api:latest` |
| 开源协议 | AGPLv3 |
| 默认端口 | 3000 |
| 数据目录 | `/data`（SQLite + 上传文件）、`/app/logs`（日志） |
| 依赖服务 | PostgreSQL/MySQL（可选）+ Redis（可选） |
| 推荐部署方式 | Docker Compose |

## 为什么选 New API

和同类网关比一比：

- **vs One API（上游原版）**：New API 完全兼容 One API 的数据库，能直接迁移。它多了新版 UI、数据看板、Midjourney/Suno 接口支持、Rerank 模型、缓存计费统计这些原版没有的功能。
- **vs LiteLLM**：LiteLLM 更偏向开发者用 Python SDK 集成，配置写在代码或 YAML 里。New API 提供完整的 Web 后台，非技术人员也能点点鼠标管理渠道和用户——这一点 LiteLLM 的可视化确实弱一些。
- **不适合的场景**：如果你只是个人用一两个 Key、不需要多用户和计费，直接用官方 SDK 更省事，没必要架一层网关。

New API 的核心价值是**把分散的模型 API 收敛成一个入口**——下游应用只认一个 base_url 和一个令牌，上游换供应商、加渠道、调权重都在后台完成，应用侧零改动。

## 架构分析

官方 Compose 默认拉起三个容器：New API 主服务（Go 编写）、PostgreSQL（持久化渠道/用户/日志）、Redis（缓存和分布式锁）。主服务对外暴露 3000 端口，内部通过服务名连接数据库和缓存。

数据库不是强制的——单机小规模可以用内置 SQLite，挂载 `/data` 目录即可。但一旦要多机部署或追求性能，就得上 MySQL/PostgreSQL + Redis。

### 部署架构图

```mermaid
flowchart LR
  client["下游应用<br/>OpenAI SDK"] -->|"HTTP :3000"| app["New API<br/>Go 网关"]

  subgraph docker["Docker 网络 new-api-network"]
    app -->|"读写渠道/用户/日志"| pg[("PostgreSQL<br/>持久化")]
    app -->|"缓存/分布式锁"| redis[("Redis<br/>缓存")]
    app -->|"SQLite/上传文件"| data[("/data 卷")]
  end

  app -->|"转发请求"| upstream["上游模型<br/>OpenAI/Claude/DeepSeek"]
```

### 请求处理流程

```mermaid
sequenceDiagram
    participant C as 下游应用
    participant N as New API
    participant R as Redis
    participant D as 数据库
    participant U as 上游模型

    C->>N: 携带令牌请求 /v1/chat/completions
    N->>R: 校验令牌 + 查配额缓存
    R-->>N: 令牌有效，余额充足
    N->>N: 按权重选择可用渠道
    N->>U: 转发请求（转成目标格式）
    U-->>N: 返回补全结果
    N->>D: 异步记录用量和计费
    N-->>C: 返回 OpenAI 兼容响应
```

## 部署前准备

### 服务器要求

| 项目 | 最低要求 | 推荐配置 |
|---|---|---|
| 系统 | Linux 64 位（amd64/arm64） | Ubuntu 22.04+ |
| CPU | 1 核 | 2 核 |
| 内存 | 1 GB | 2 GB+（带数据库和 Redis） |
| 磁盘 | 2 GB | 10 GB+（日志和用量数据会累积） |
| 端口 | 3000 | - |

New API 只支持 64 位系统，32 位机器跑不起来。

### 安装 Docker

```bash
# 检查是否已安装
docker --version
docker compose version
```

没装参考 [Docker 官方文档](https://docs.docker.com/engine/install/)。

### 国内镜像加速

`calciumion/new-api` 在 Docker Hub 上，国内拉取容易超时，用国内源替换前缀：

```bash
# 替换镜像前缀直接拉取（任选一个）
docker pull docker.1ms.run/calciumion/new-api:latest
docker pull docker.m.daocloud.io/calciumion/new-api:latest
docker pull docker.1panel.live/calciumion/new-api:latest
docker pull hub.rat.dev/calciumion/new-api:latest
```

依赖的 `postgres:15` 和 `redis:latest` 同理，前缀换成加速源即可。

> 💡 公共镜像源偶尔失效，失败了换下一个。

批量拉取的话建议直接配置 Docker Daemon 全局加速：

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.m.daocloud.io",
    "https://docker.1panel.live",
    "https://docker-0.unsee.tech",
    "https://hub.rat.dev",
    "https://docker.xuanyuan.me"
  ]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

配了全局加速后，Compose 文件里的 image 名可以保持原样，不用改前缀。

## Docker 快速部署（SQLite 单容器）

先跑一个最小可用版本，试试水。这种方式用内置 SQLite，不依赖外部数据库：

```bash
# 创建数据目录
mkdir -p /opt/new-api/data

# 拉取镜像
docker pull calciumion/new-api:latest

# 启动容器
docker run -d \
  --name new-api \
  --restart always \
  -p 3000:3000 \
  -e TZ=Asia/Shanghai \
  -v /opt/new-api/data:/data \
  calciumion/new-api:latest
```

参数说明：

- `-e TZ=Asia/Shanghai`：时区设为上海，不然日志时间和计费统计的时间都会差 8 小时。
- `-v /opt/new-api/data:/data`：SQLite 数据库文件（`one-api.db`）和上传文件都存这里，删容器不丢数据。

验证：

```bash
docker ps | grep new-api
docker logs -f new-api
```

浏览器访问 `http://服务器IP:3000`，看到登录页说明起来了。

SQLite 适合个人或小团队体验。数据量上来、要多机部署，就得换成下面的 Compose 方案。

## Docker Compose 完整部署（PostgreSQL + Redis）

生产环境推荐这套——数据库持久化、Redis 缓存、健康检查一应俱全。官方仓库自带 `docker-compose.yml`，下面这份在官方基础上做了密码和目录的规整。

### 创建项目目录

```bash
mkdir -p /opt/new-api
cd /opt/new-api
```

### 编写环境变量

创建 `.env` 文件，把密钥和密码集中管理：

```env
TZ=Asia/Shanghai
# 数据库密码（务必改掉默认值）
POSTGRES_PASSWORD=change_this_db_password
# Redis 密码（务必改掉默认值）
REDIS_PASSWORD=change_this_redis_password
# 会话密钥：多机部署必须，随便生成一串随机字符
SESSION_SECRET=your_random_session_secret_here
# 加密密钥：用了 Redis 必须设，否则缓存数据无法解密
CRYPTO_SECRET=your_random_crypto_secret_here
```

`SESSION_SECRET` 和 `CRYPTO_SECRET` 用这条命令生成随机值：

```bash
openssl rand -hex 32
```

### 编写 Compose 文件

创建 `docker-compose.yml`：

```yaml
services:
  new-api:
    image: calciumion/new-api:latest
    container_name: new-api
    restart: always
    command: --log-dir /app/logs
    ports:
      - "3000:3000"
    volumes:
      - ./data:/data
      - ./logs:/app/logs
    environment:
      - TZ=${TZ}
      - SQL_DSN=postgresql://root:${POSTGRES_PASSWORD}@postgres:5432/new-api
      - REDIS_CONN_STRING=redis://:${REDIS_PASSWORD}@redis:6379
      - SESSION_SECRET=${SESSION_SECRET}
      - CRYPTO_SECRET=${CRYPTO_SECRET}
      - ERROR_LOG_ENABLED=true
      - BATCH_UPDATE_ENABLED=true
    depends_on:
      - redis
      - postgres
    networks:
      - new-api-network
    healthcheck:
      test: ["CMD-SHELL", "wget -q -O - http://localhost:3000/api/status | grep -o '\"success\":\\s*true' || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15
    container_name: new-api-postgres
    restart: always
    environment:
      POSTGRES_USER: root
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: new-api
    volumes:
      - ./pg_data:/var/lib/postgresql/data
    networks:
      - new-api-network

  redis:
    image: redis:latest
    container_name: new-api-redis
    restart: always
    command: ["redis-server", "--requirepass", "${REDIS_PASSWORD}"]
    networks:
      - new-api-network

networks:
  new-api-network:
    driver: bridge
```

几个关键配置的用意：

- `SQL_DSN` 里的主机名写 `postgres`——就是下面那个服务的名字，Docker 内部 DNS 会自动解析，不用填 IP。
- `depends_on` 保证数据库和 Redis 先起来，但它不等数据库“就绪”，只等容器“启动”。New API 主服务内部有重试逻辑，数据库慢几秒也能连上。
- `healthcheck` 调 `/api/status` 判断服务健康，配合 `restart: always` 实现异常自愈。
- 数据库端口没映射到宿主机，只在 Docker 内网可达——这是对的，数据库不该暴露到公网。

### 用 MySQL 替代 PostgreSQL（可选）

偏好 MySQL 的话，把 `postgres` 服务换成：

```yaml
  mysql:
    image: mysql:8.2
    container_name: new-api-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${POSTGRES_PASSWORD}
      MYSQL_DATABASE: new-api
    volumes:
      - ./mysql_data:/var/lib/mysql
    networks:
      - new-api-network
```

同时把主服务的 `SQL_DSN` 改成 MySQL 格式：

```
SQL_DSN=root:${POSTGRES_PASSWORD}@tcp(mysql:3306)/new-api
```

注意 MySQL 要求版本 ≥ 5.7.8。

### 启动服务

```bash
docker compose up -d
docker compose ps
docker compose logs -f new-api
```

三个容器状态都是 running（new-api 还会显示 healthy），就成了。浏览器访问 `http://服务器IP:3000`。

## 首次配置

1. **注册管理员**：第一个注册的账号自动成为超级管理员。用 Compose 官方默认配置时，数据库账号是 `root`，但网站管理员账号需要你自己在页面注册。
2. **添加渠道**：进入「渠道」页面，填上游供应商的类型、Base URL、API Key，选好支持的模型。
3. **创建令牌**：在「令牌」页面生成给下游应用用的令牌（`sk-` 开头）。
4. **下游接入**：应用侧把 base_url 指向 `http://服务器IP:3000/v1`，API Key 填刚才的令牌，就能像调 OpenAI 一样调所有渠道。

### 多机部署要点

如果要跑多个 New API 实例做负载均衡，从节点必须和主节点共享同一套数据库、同一个 Redis，并且：

- `SESSION_SECRET` 所有节点保持一致——否则用户在 A 节点登录，请求转到 B 节点就掉登录态。
- `CRYPTO_SECRET` 所有节点保持一致——否则一个节点写进 Redis 的加密数据，另一个节点解不开。
- 从节点加 `NODE_TYPE=slave`，避免多个实例都去跑定时任务。

## 日常管理

| 操作 | 命令 |
|---|---|
| 查看状态 | `docker compose ps` |
| 查看主服务日志 | `docker compose logs -f new-api` |
| 重启服务 | `docker compose restart new-api` |
| 进入容器 | `docker compose exec new-api sh` |
| 停止全部 | `docker compose stop` |

### 数据备份

New API 的数据分两块：数据库（渠道/用户/日志/用量）和 `/data` 目录（SQLite 场景下的库文件、上传文件）。用 Compose + PostgreSQL 时，重点备份数据库：

```bash
# 备份 PostgreSQL
docker compose exec postgres pg_dump -U root new-api > new-api-db-$(date +%F).sql

# 备份配置和数据目录
tar -czvf new-api-files-$(date +%F).tar.gz ./data ./.env ./docker-compose.yml
```

用量日志会越积越多，建议定期清理旧日志（后台「日志」页面有清理功能），否则数据库会持续膨胀。

## 更新升级

```bash
cd /opt/new-api

# 先备份数据库（重要，升级偶尔会改表结构）
docker compose exec postgres pg_dump -U root new-api > new-api-pre-update-$(date +%F).sql

# 拉取新镜像并重启
docker compose pull new-api
docker compose up -d new-api

# 看日志确认迁移和启动正常
docker compose logs -f new-api
```

New API 迭代很快，升级前务必备份数据库。生产环境别直接用 `latest`——锁定一个具体版本号（比如 `calciumion/new-api:v0.9.0`），验证没问题再升，避免自动拉到有问题的版本。

## 卸载清理

```bash
cd /opt/new-api
docker compose down
# 删除数据（谨慎！渠道、用户、日志全没）
rm -rf /opt/new-api
docker image prune -a
```

## 常见问题

### 页面能打开但登录报错

多半是 Redis 连不上或 `CRYPTO_SECRET` 没配。检查 Redis 容器状态和密码是否和 `.env` 一致：

```bash
docker compose logs redis
docker compose exec redis redis-cli -a 你的密码 ping
```

### 数据库连接失败

`SQL_DSN` 里的主机名必须是 Compose 里的服务名（`postgres` 或 `mysql`），不是 `localhost`。容器之间用 `localhost` 是连自己，连不到数据库。

### 渠道测试一直失败

先确认服务器能访问上游 API（有些上游要科学上网），再检查渠道里的 Base URL 和 Key 是否正确。后台「渠道」页面有「测试」按钮，会返回具体错误。

### 32 位系统起不来

New API 只支持 64 位（amd64/arm64）。树莓派老型号、部分低端设备是 32 位的，跑不起来，换 64 位系统或设备。

## 生产环境建议

- **HTTPS**：New API 本身不处理 TLS，前面挂 Nginx 或 Caddy 做反向代理 + Let's Encrypt 证书。API 网关走公网必须上 HTTPS，否则令牌明文传输。
- **版本锁定**：`image: calciumion/new-api:v0.9.0` 用具体版本，不用 `latest`。
- **改默认密码**：官方 Compose 里数据库和 Redis 密码都是 `123456`，上线前全部换掉——这是最容易被忽略也最危险的一点。
- **日志限制**：给主服务加 `logging` 配置，避免日志把磁盘撑满：

```yaml
    logging:
      driver: json-file
      options:
        max-size: "20m"
        max-file: "3"
```

- **定期备份**：crontab 跑 `pg_dump`，保留最近 7 天的数据库快照。

## 下一步

New API 跑起来后，接下来可以做的：
- 配 Nginx 反向代理 + HTTPS，绑定自己的域名
- 在「渠道」里加多个同类型上游，设置权重做负载均衡和故障转移
- 开启 LinuxDO / OIDC 授权登录，团队成员免注册直接用
- 接入易支付或 Stripe，给内部用户开充值和额度分配
