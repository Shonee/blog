# 镜像拉了两小时？教你在 Docker 中配置国内镜像

Docker 拉镜像拉不动，十有八九是镜像源的问题。

Docker 默认从海外的 Docker Hub 拉镜像，国内直连要么慢到几十 KB/s，要么根本连不上。
最近几年开始，阿里云、网易、中科大等公共加速服务陆续关停或收窄，到现在情况仍然比较紧张。换成国内还能用的加速地址就好了。

### Docker 和镜像源

Docker 是一个容器工具，支持开发者把软件连同运行环境一起打包成「镜像」，拉下来就能运行，不用折腾依赖和配置。

Docker 中的这些镜像默认存在 Docker Hub（`hub.docker.com`），服务器在海外，国内访问不稳定，所以需要一个国内的「中转站」来中转下载，也就是镜像加速源。

无论是 Linux、Windows 或者 NAS 上的 Docker，都得先配好镜像源，如 NAS 装 Jellyfin、Alist、Home Assistant 等产品，都是拉 Docker 镜像实现部署。


### 目前可用的镜像源

镜像源变化快，去年能用的今年可能就关了，以下地址在 2026 年 6 月实测仍可用：

| 镜像源 | 加速地址 | 说明 |
|-------|---------|------|
| DaoCloud | `https://docker.m.daocloud.io` | 运营时间最长，支持 Docker Hub / GCR / GHCR / Quay 等多个仓库 |
| 1Panel 镜像站 | `https://docker.1panel.live` | 1Panel 面板团队维护 |
| Hub Proxy | `https://hub.rat.dev` | 速度不错，但稳定性看维护者心情 |
| 渡渡鸟同步站 | `https://docker.aityp.com` | 带镜像搜索功能，找特定版本方便 |


除了上述表格中的镜像地址，如果条件允许有海外 VPS 或 Cloudflare 账号的话，可以用 `CF-Workers-docker.io` 这个开源项目搭自己的代理，稳定性可以保障，但需要一定的动手能力。

如果不想折腾就默认使用 DaoCloud，覆盖的仓库最全，实际配置时可以填多个镜像地址做冗余，万一挂了一个 Docker 会自动尝试使用下一个。

### 配置方法一：改 daemon.json（全局生效，改一次就行）

这是 Docker 镜像配置的标准做法，配置完成之后所有 `docker pull` 命令都会走加速源。

打开本地命令行，或使用 SSH 登录到 NAS 或服务器的命令终端，执行：

```bash
sudo mkdir -p /etc/docker

sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.1panel.live"
  ]
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```
需要注意的点：
JSON 格式要求严格，少一个逗号或多一个逗号，Docker 服务会起不来。如果改完 Docker 挂了，先检查 `daemon.json` 的 JSON 语法

```bash
# 验证一下，执行完成能看到配置的地址就说明生效了。
docker info | grep -A 5 "Registry Mirrors"
```

## 配置方法二：拉取时加前缀（单次生效，每次使用时配置）

如果不想修改全局的配置文件，可以在每次拉取时在镜像名前面拼上加速源的域名：

```bash
# 默认拉取名命令
docker pull nginx:latest

# Docker Hub 官方镜像（注意要补 library/）
docker pull docker.m.daocloud.io/library/nginx:latest

# Docker Hub 第三方镜像
docker pull docker.m.daocloud.io/portainer/portainer-ce:latest

# GitHub Container Registry 的镜像
docker pull m.daocloud.io/ghcr.io/home-assistant/home-assistant:latest
```

注意点：
1. Docker Hub 的官方镜像（nginx、redis、mysql 这些），实际路径是 `library/nginx`，用加前缀方式时，`library/` 不能省，否则会报找不到。
2. 如果用的是方法一（daemon.json 全局配置），Docker 会自动补 `library/`。

### 配置方法三：Docker Compose 文件中指定镜像地址

有时候从网上看到一个好的 Docker 项目，拿到一个 `docker-compose.yml` 文件就想直接部署，却发现根本用不了，这个时候就可能是镜像地址访问不通，这时候把里面 `image:` 字段的镜像名换成带前缀的镜像源即可：

```yaml
services:
  jellyfin:
    # 原来写的: jellyfin/jellyfin:latest
    # 换成加速地址:
    image: docker.m.daocloud.io/jellyfin/jellyfin:latest
    container_name: jellyfin
    ports:
      - "8096:8096"
    volumes:
      - ./config:/config
      - /mnt/media:/media
    restart: unless-stopped
```

如果已经配置了 daemon.json 的话，Compose 文件使用时就不用改了，直接写原始镜像名，两者不冲突。

### 三种方法使用顺序
daemon.json 配置 > Docker Compose = docker pull

- daemon.json 配置后全局生效，一劳永逸，再也不怕镜像拉取不到了；
- Docker Compose 可以保留参数和配置，镜像迁移和分享可以直接复制执行；
- docker pull，使用最方便，快速部署镜像时推荐使用；

