---
title: Docker 部署 Sun-Panel：23 MB 镜像搞定 NAS 导航页 + Docker 管理面板
date: 2026-07-07
category: docker
tags:
  - panel
---

# 用 Docker 部署 Sun-Panel：23 MB 镜像搞定 NAS 导航页 + Docker 管理面板

家里 NAS 上跑了一堆服务——Jellyfin、Home Assistant、Gitea、Nextcloud——每次打开浏览器都要回忆端口号。书签栏越来越长，找个入口得翻半天。

Sun-Panel 做的事情很简单：给你一个好看的导航首页，把所有服务的链接、图标、分组统一管理起来。顺便还能看服务器状态、在网页里直接操作 Docker 容器。镜像只有 23 MB，跑起来内存占用几乎可以忽略。

## 项目速览

| 项目 | 内容 |
|---|---|
| 项目名称 | Sun-Panel |
| 作者 | 红烧猎人（hslr-s） |
| GitHub | [hslr-s/sun-panel](https://github.com/hslr-s/sun-panel) |
| Docker 镜像 | `hslr/sun-panel:latest` |
| 最新稳定版 | v1.8.1 |
| 默认端口 | 3002 |
| 数据目录 | `/app/conf`（配置文件，含 SQLite 数据库） |
| 镜像大小 | ~23 MB（amd64） |
| 架构支持 | amd64 / arm64 / armv7 |
| 默认账号 | admin@sun.cc / 12345678 |

> 注意：项目从 v1.3.0 后进入闭源状态（作者要开发 PRO 功能维持生计），但对普通用户没有影响。开源版最后停在 v1.3.0，闭源版持续更新中。

## 和同类导航面板的比较

导航面板这个品类选择不少——Heimdall、Homepage、Dashy、Organizr。Sun-Panel 的定位偏向"中文用户友好 + 零配置上手"：

- 界面默认中文，不需要额外汉化
- 内置 Iconify 图标库，不用自己找图标 URL
- 支持内外网链接一键切换（局域网和公网两套地址，切换很方便）
- 集成了 Docker 管理功能（1.5.0+），能直接在面板里启停容器

不足的地方：自定义程度不如 Homepage（那个用 YAML 配置，灵活但学习成本高）；PRO 功能需要付费，虽然基础功能已经够用。如果你追求纯开源，Heimdall 和 Dashy 更合适。

## 部署前准备

### 服务器要求

Sun-Panel 的资源消耗很低，基本上能跑 Docker 的设备都能装：

| 项目 | 要求 |
|---|---|
| 系统 | Linux / macOS / NAS（群晖/威联通/绿联/极空间） |
| 内存 | 128 MB 足够 |
| 磁盘 | 50 MB（镜像 + 配置数据） |
| 端口 | 3002 |

### 安装 Docker

```bash
docker --version
docker compose version
```

没有的话：

```bash
curl -fsSL https://get.docker.com | sh
```

### 国内镜像加速

Sun-Panel 镜像很小（23 MB），国内拉取一般不会太慢。如果还是超时：

```bash
# 替换前缀直接拉取
docker pull docker.1ms.run/hslr/sun-panel:latest
docker pull docker.m.daocloud.io/hslr/sun-panel:latest
docker pull docker.1panel.live/hslr/sun-panel:latest
```

> 💡 镜像源可能因维护变动不可用，失败了换下一个。

## Docker 快速部署

一条命令搞定：

```bash
docker run -d --restart=always -p 3002:3002 \
  -v ~/sun-panel/conf:/app/conf \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name sun-panel \
  hslr/sun-panel:latest
```

参数说明：
- `-p 3002:3002`：映射 Web 端口
- `-v ~/sun-panel/conf:/app/conf`：配置文件持久化，容器删了数据不丢
- `-v /var/run/docker.sock:/var/run/docker.sock`：让 Sun-Panel 能在网页里管理 Docker 容器（1.5.0+ 新增）。不需要这个功能可以不挂载
- `--restart=always`：机器重启后自动拉起

浏览器访问 `http://服务器IP:3002`，用 `admin@sun.cc` / `12345678` 登录。

**登录后第一件事：改密码。** 默认密码太简单，暴露在公网会被扫描。

## Docker Compose 部署

长期使用推荐 Compose，配置写在文件里，迁移备份都方便。

```bash
mkdir -p /opt/sun-panel
cd /opt/sun-panel
```

创建 `docker-compose.yml`：

```yaml
services:
  sun-panel:
    image: hslr/sun-panel:latest
    container_name: sun-panel
    restart: always
    ports:
      - "3002:3002"
    volumes:
      - ./conf:/app/conf
      - /var/run/docker.sock:/var/run/docker.sock
```

启动：

```bash
docker compose up -d
docker compose ps
```

如果不需要 Docker 管理功能，把 `docker.sock` 那行去掉就行。

## 首次配置

### 修改密码

登录后台（左侧菜单 → 设置 → 账户），改掉默认密码。或者用命令行重置：

```bash
docker exec sun-panel /app/sun-panel -password-reset
```

### 添加导航链接

后台 → 图标管理 → 新增，填入：
- 名称（如"Jellyfin"）
- 内网地址（如 `http://192.168.1.100:8096`）
- 外网地址（如果有的话，如 `https://jellyfin.example.com`）
- 图标（可以直接搜索 Iconify 图标库）

分组可以按用途划分：影音、开发工具、智能家居、NAS 管理……

### 内外网切换

Sun-Panel 支持为每个链接配置两套地址。面板右上角有切换按钮，在家里自动走内网地址，在外面走外网地址。不需要改配置，不需要两个导航页。

## 日常管理

| 操作 | 命令 |
|---|---|
| 查看状态 | `docker compose ps` |
| 查看日志 | `docker compose logs -f` |
| 重启服务 | `docker compose restart` |
| 进入容器 | `docker exec -it sun-panel sh` |

### 数据备份

```bash
docker compose stop
tar -czvf sun-panel-backup-$(date +%F).tar.gz ./conf
docker compose up -d
```

`./conf` 目录里包含 SQLite 数据库和所有配置，体积小，建议定期备份。

## 更新升级

```bash
cd /opt/sun-panel

# 备份
tar -czvf sun-panel-pre-update-$(date +%F).tar.gz ./conf

# 拉新镜像
docker compose pull
docker compose up -d
```

## 卸载

```bash
cd /opt/sun-panel
docker compose down
rm -rf /opt/sun-panel  # 删除数据，不可恢复
```

## 常见问题

### 容器重启后配置丢失

检查 `-v` 挂载是否正确。配置文件在容器的 `/app/conf` 目录，必须映射到宿主机。没有挂载的话，容器一停数据就没了。

### 访问页面空白

大概率是浏览器缓存问题，Ctrl+Shift+R 强制刷新。如果还不行，检查端口是否被占用：`lsof -i :3002`。

### Docker 管理功能不可用

确认两件事：
1. 挂载了 `/var/run/docker.sock`
2. 版本是 1.5.0 以上（`docker exec sun-panel /app/sun-panel -h` 查看）

### NAS 上权限问题

群晖/威联通等 NAS 的 Docker 实现可能有限制。如果 conf 目录写入失败，手动创建并设权限：

```bash
mkdir -p ~/sun-panel/conf
chmod 777 ~/sun-panel/conf
```

## 下一步

- **自定义 CSS/JS**：后台设置里可以注入自定义样式，调整导航页外观
- **多账号**：支持多用户隔离，给家人分配不同的导航视图
- **设为浏览器首页**：把 Sun-Panel 的地址设为浏览器的起始页，每次打开新标签页就能看到
