## Code Server — 浏览器里的 VS Code，随时随地写代码

### 一、Code Server 是什么

Code Server 是由 Coder 团队开源的项目，它的核心功能是把 VS Code 搬到浏览器里运行，运行你在服务器（或 NAS）上部署好 Code Server 之后，用任意设备的浏览器打开对应地址，就能获得一个和桌面版 VS Code 几乎一致的编辑体验。

它解决的痛点很直接：开发环境不再绑定在某一台电脑上。无论你用的是 iPad、ChromeBook、轻薄本还是手机，只要有一个浏览器，就能连上远端的完整开发环境。代码编译、测试运行这些重活都在服务器上跑，本地设备只负责渲染界面，所以既省电量又对硬件要求极低。

和微软官方的 VS Code Remote 不同，Code Server 不需要在本地安装任何客户端。VS Code Remote 本质上是本地 VS Code 通过 SSH 或容器连接远端，而 Code Server 是完全运行在浏览器中的独立实例。对于没有桌面环境的服务器、NAS 设备，或者只是想随时打开浏览器就能写代码的场景，Code Server 是更合适的选择。

最低运行要求很低：1GB 内存、2 核 CPU、开启 WebSocket 支持的 Linux 环境即可。

### 二、Code Server 下载安装使用

Code Server 支持多种安装方式，下面介绍最常见的几种。

#### 2.1 一键脚本安装（Linux）

这是最快的方式，适合在云服务器或 Linux 主机上快速部署：

```bash
curl -fsSL https://code-server.dev/install.sh | sh
```

如果想先预览脚本会做什么而不实际执行，可以加 `--dry-run` 参数：

```bash
curl -fsSL https://code-server.dev/install.sh | sh -s -- --dry-run
```

安装完成后，通过以下命令启动：

```bash
code-server --bind-addr 0.0.0.0:8888
```

启动后浏览器访问 `http://你的IP:8888`，首次登录的密码存放在 `~/.config/code-server/config.yaml` 文件中。

#### 2.2 手动安装

如果一键脚本不适用你的环境，也可以从 GitHub Releases 页面手动下载对应平台的二进制包：

```bash
# 访问 GitHub Releases 下载最新版本
# https://github.com/coder/code-server/releases

# 以 Linux amd64 为例
wget https://github.com/coder/code-server/releases/download/v4.96.4/code-server_4.96.4_amd64.tar.gz
tar -xzf code-server_4.96.4_amd64.tar.gz
cd code-server_4.96.4_amd64
./bin/code-server --bind-addr 0.0.0.0:8888
```

#### 2.3 macOS 安装

macOS 可以通过 Homebrew 安装：

```bash
brew install code-server
code-server --bind-addr 0.0.0.0:8888
```

#### 2.4 配置文件说明

Code Server 的配置文件默认位于 `~/.config/code-server/config.yaml`，典型内容如下：

```yaml
bind-addr: 127.0.0.1:8080
auth: password
password: your-password-here
cert: false
```

主要配置项说明：

- `bind-addr`：监听地址和端口。`127.0.0.1` 只允许本机访问，改为 `0.0.0.0` 则允许外部访问
- `auth`：认证方式，可选 `password` 或 `none`（不建议在生产环境关闭认证）
- `password`：登录密码
- `cert`：是否启用 HTTPS 证书。设为 `true` 会自动生成自签名证书

修改配置后需要重启 Code Server 才能生效。

### 三、Docker 中安装 Code Server

使用 Docker 是部署 Code Server 最推荐的方式——环境隔离、升级方便、不污染宿主机。社区中使用最广泛的是 LinuxServer 团队维护的镜像 `linuxserver/code-server`。

#### 3.1 Docker Compose 部署

创建 `docker-compose.yml` 文件：

```yaml
services:
  code-server:
    image: linuxserver/code-server:latest
    container_name: code-server
    restart: always
    ports:
      - "8443:8443"
    volumes:
      - ./config:/config
      - ./workspace:/workspace
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
      - PASSWORD=your-password
      - SUDO_PASSWORD=your-sudo-password
      - DEFAULT_WORKSPACE=/workspace
```

启动服务：

```bash
docker compose up -d
```

访问 `http://你的IP:8443` 即可进入 Code Server。

#### 3.2 环境变量说明

LinuxServer 镜像支持的环境变量：

| 变量 | 说明 | 示例值 |
|------|------|--------|
| `PUID` | 运行用户的 UID，用于文件权限匹配 | `1000` |
| `PGID` | 运行用户的 GID | `1000` |
| `TZ` | 时区设置 | `Asia/Shanghai` |
| `PASSWORD` | Web 界面登录密码 | `my-password` |
| `SUDO_PASSWORD` | 容器内终端的 sudo 密码 | `my-sudo-pass` |
| `DEFAULT_WORKSPACE` | 默认打开的工作目录 | `/workspace` |
| `HASHED_PASSWORD` | 使用 SHA256 哈希后的密码（更安全） | `sha256:...` |

#### 3.3 Volume 挂载说明

- `/config`：存放 Code Server 的配置文件、插件、用户设置等，必须持久化
- `/workspace`：你的代码工作目录，按需挂载到宿主机的项目路径

如果需要编辑宿主机的其他目录，可以增加额外的 volume 映射，例如：

```yaml
volumes:
  - ./config:/config
  - ./workspace:/workspace
  - /home/user/projects:/projects  # 挂载额外项目目录
```

#### 3.4 使用国内镜像加速

国内网络拉取 Docker Hub 镜像经常很慢甚至失败，可以通过配置镜像加速来解决。

**方法一：配置 Docker 镜像加速器**

编辑 Docker 的配置文件 `/etc/docker/daemon.json`：

```json
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me"
  ]
}
```

修改后重启 Docker：

```bash
systemctl restart docker
```

**方法二：在 Compose 中直接使用镜像代理地址**

如果不想改全局 Docker 配置，可以在 `docker-compose.yml` 中将镜像名替换为代理前缀：

```yaml
services:
  code-server:
    image: docker.1ms.run/linuxserver/code-server:latest
```

**方法三：手动拉取后加载**

在有网络条件的机器上拉取镜像，导出后传到目标机器：

```bash
# 在可访问 Docker Hub 的机器上
docker pull linuxserver/code-server:latest
docker save linuxserver/code-server:latest -o code-server.tar

# 在目标机器上加载
docker load -i code-server.tar
```

### 四、绿联 NAS 中安装使用 Code Server

绿联 NAS 自带 Docker 应用（基于 Docker Compose），部署 Code Server 非常方便。以下是详细步骤。

#### 4.1 部署步骤

1. 登录绿联 NAS 管理界面，打开 Docker 应用
2. 选择「项目」Tab，点击「创建」
3. 输入项目名称 `code-server`，选择存放路径（建议选一个空间充足的存储池）
4. 输入 Compose 配置（见下方）
5. 输入完成后，点击右下角「立即部署」

#### 4.2 Docker Compose 配置

```yaml
services:
  code-server:
    image: linuxserver/code-server:latest
    container_name: code-server
    restart: always
    ports:
      - "11510:8443"
    volumes:
      - ./data:/config
      - ./workspace:/workspace
    environment:
      - PUID=1000
      - PGID=10
      - TZ=Asia/Shanghai
      - PASSWORD=your-password
      - SUDO_PASSWORD=your-sudo-password
      - DEFAULT_WORKSPACE=/workspace
```

几点说明：

- 端口映射 `11510:8443`：左侧的 `11510` 是你从浏览器访问时用的端口，可以根据需要修改，注意不要和其他服务端口冲突
- `./data:/config`：`./data` 是 NAS 上存放配置和插件的目录，会自动创建在项目目录下
- `./workspace:/workspace`：你的代码目录。如果你想在 Code Server 中访问 NAS 上的已有文件，可以改成 NAS 上的绝对路径，比如 `/volume1/docker/code-server/workspace:/workspace`
- `PASSWORD` 和 `SUDO_PASSWORD`：请改为你自己的密码，不要用示例中的默认值

#### 4.3 绿联 NAS 上使用国内镜像

绿联 NAS 的 Docker 应用没有直接提供镜像加速器配置入口，但可以通过 SSH 登录 NAS 后修改 Docker 配置：

1. 开启绿联 NAS 的 SSH 功能（在系统设置中开启）
2. 通过 SSH 登录 NAS：`ssh root@你的NAS-IP`
3. 编辑 `/etc/docker/daemon.json`，添加镜像加速地址（参考上一节的方法一）
4. 重启 Docker 服务：`systemctl restart docker`

如果 SSH 方式不方便，也可以直接在 Compose 配置中使用代理前缀的镜像地址：

```yaml
services:
  code-server:
    image: docker.1ms.run/linuxserver/code-server:latest
```

#### 4.4 访问与使用

部署完成后，在同一局域网内的浏览器中访问：

```
http://NAS的IP地址:11510
```

输入你设置的 `PASSWORD` 即可进入 Code Server 界面。如果你需要从外网访问，可以在路由器上做端口转发，或者使用绿联 NAS 自带的远程访问功能（DDNS 或内网穿透）。

### 五、Code Server 初始化配置和使用

#### 5.1 首次进入界面

首次登录 Code Server 后，界面和桌面版 VS Code 几乎一样。左侧是活动栏（Explorer、Search、Source Control、Run、Extensions），顶部是菜单栏，下方是终端和输出面板。

#### 5.2 安装中文语言包

Code Server 默认是英文界面，建议先安装中文语言包：

1. 点击左侧活动栏的 Extensions 图标（方块形状）
2. 搜索 `Chinese (Simplified)`
3. 找到 `Chinese (Simplified) Language Pack for Visual Studio Code`，点击 Install
4. 安装完成后，按 `Ctrl+Shift+P` 打开命令面板，输入 `Configure Display Language`，选择 `zh-cn`
5. 界面会自动切换为中文（可能需要刷新页面）

#### 5.3 常用设置调整

按 `Ctrl+,` 打开设置面板，以下是一些建议调整的选项：

- `Editor: Font Size`：编辑器字体大小，根据屏幕分辨率调整
- `Editor: Word Wrap`：设为 `on`，开启自动换行，在浏览器中编辑体验更好
- `Editor: Minimap`：可关闭右侧小地图以节省屏幕空间
- `Workbench: Color Theme`：选择你喜欢的主题
- `Terminal: Integrated Font Size`：终端字体大小
- `Files: Auto Save`：建议设为 `afterDelay`，开启自动保存

#### 5.4 终端使用

Code Server 内置了完整的终端，按 `` Ctrl+` `` 可以打开/关闭终端面板。在 Docker 部署的 Code Server 中，终端运行在容器内部，你已经拥有了 Linux shell 环境。

如果配置了 `SUDO_PASSWORD` 环境变量，可以通过 `sudo` 获取 root 权限来安装软件包：

```bash
# 在 Code Server 终端中
sudo apt update
sudo apt install -y python3 python3-pip nodejs npm
```

#### 5.5 工作目录和文件管理

默认工作目录由 `DEFAULT_WORKSPACE` 环境变量指定。你可以通过 `File > Open Folder` 切换到其他已挂载的目录。

在 Docker 部署中，只有挂载到容器内的目录才能被 Code Server 访问到。如果需要编辑 NAS 上的其他文件，需要在 Compose 配置中添加对应的 volume 映射。

#### 5.6 Git 配置

Code Server 内置了 Git 支持，但首次使用需要配置用户信息：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

如果需要推送代码到 GitHub/GitLab 等远程仓库，建议配置 SSH Key 或 Personal Access Token 来认证。

### 六、Code Server 中使用插件

#### 6.1 插件安装方式

Code Server 的插件安装和桌面版 VS Code 基本一致，但有一些区别需要注意。

**方式一：通过 Extensions 面板安装（推荐）**

点击左侧 Extensions 图标，搜索并安装即可。Code Server 使用的是 Open VSX 扩展市场（而非微软官方的 VS Code Marketplace），大部分常用插件都能找到。

**方式二：手动安装 VSIX 文件**

如果某个插件在 Open VSX 上找不到，可以手动下载安装：

1. 从插件的 GitHub Releases 或 VS Code Marketplace 页面下载 `.vsix` 文件
2. 在 Code Server 中，打开 Extensions 面板
3. 点击右上角的 `...` 菜单，选择 `Install from VSIX...`
4. 选择下载的 `.vsix` 文件即可安装

**方式三：命令行安装**

```bash
# 在 Code Server 终端中
code-server --install-extension ms-python.python
code-server --install-extension esbenp.prettier-vscode
```

#### 6.2 推荐插件列表

以下是日常开发中常用的插件：

| 插件名 | 功能 |
|--------|------|
| Chinese (Simplified) Language Pack | 中文语言包 |
| Python | Python 语言支持 |
| Pylance | Python 智能补全 |
| ESLint | JavaScript/TypeScript 代码检查 |
| Prettier - Code formatter | 代码格式化 |
| GitLens | Git 增强（查看提交历史、blame 等） |
| Docker | Dockerfile 支持和容器管理 |
| Remote - SSH | 不适用于 Code Server（本身就是远程） |
| Material Icon Theme | 文件图标主题 |
| Path Intellisense | 路径自动补全 |
| Auto Rename Tag | HTML/JSX 标签自动重命名 |
| Thunder Client | 轻量级 API 测试工具（类似 Postman） |

#### 6.3 插件兼容性注意

由于 Code Server 使用的是 Open VSX 而非微软 Marketplace，部分插件可能存在以下情况：

- 某些插件没有发布到 Open VSX，需要手动下载 VSIX 安装
- 微软官方的一些插件（如 C/C++、Java Extension Pack）可能存在许可限制，在 Open VSX 上提供的是社区替代版本
- 依赖桌面端特性的插件（如需要 GUI 的调试器）可能无法正常工作

### 七、Code Server 中使用 AI 插件

AI 辅助编程已经成为日常开发的标配。在 Code Server 中使用 AI 插件有一些特殊之处，下面介绍当前主流 AI 编程插件在 Code Server 中的使用情况。

#### 7.1 Continue

Continue 是目前最流行的开源 AI 编程助手之一，支持接入多种大模型（OpenAI、Anthropic、本地 Ollama 等），提供代码补全、对话式编程、代码解释等功能。

**安装方式：** Continue 插件可以从 Open VSX 直接安装，在 Extensions 面板搜索 `Continue` 即可。如果找不到，从 [Continue GitHub Releases](https://github.com/continuedev/continue/releases) 下载 `.vsix` 文件手动安装。

**配置示例：** 安装后在 Continue 的配置文件中添加你的 API Key 和模型配置：

```json
{
  "models": [
    {
      "title": "GPT-4o",
      "provider": "openai",
      "model": "gpt-4o",
      "apiKey": "your-api-key"
    },
    {
      "title": "Claude 3.5 Sonnet",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "apiKey": "your-api-key"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Codestral",
    "provider": "mistral",
    "model": "codestral-latest"
  }
}
```

Continue 也支持接入本地部署的 Ollama 模型，适合不想将代码发送到外部 API 的用户。

#### 7.2 Cline

Cline（前身是 Claude Dev）是另一个受欢迎的 AI 编程助手，擅长自主完成复杂的编码任务。它可以创建/编辑文件、执行终端命令、甚至使用浏览器。

**安装方式：** 从 Cline 的 GitHub Releases 下载 `.vsix` 文件，通过 `Install from VSIX...` 安装。

**注意事项：** Cline 需要较多的权限来操作文件系统和终端，在 Code Server 容器环境中使用时注意 volume 挂载范围，避免操作到容器内非持久化的目录。

#### 7.3 CodeGPT

CodeGPT 支持多种 AI 模型提供商，界面友好，适合快速上手。

**安装方式：** 在 Extensions 面板搜索 `CodeGPT` 安装，或手动下载 VSIX。

#### 7.4 关于 GitHub Copilot

GitHub Copilot 是微软官方的 AI 编程插件，但它对运行环境有较严格的验证。在 Code Server 中使用 Copilot 存在一些限制：

- Copilot 插件依赖微软的认证体系，在某些版本的 Code Server 上可能无法正常登录
- 如果登录成功，核心功能（代码补全、Chat）通常可以正常使用
- 建议保持 Code Server 和 Copilot 插件都更新到最新版本以提高兼容性

#### 7.5 AI 插件使用的常见问题

**Q：AI 插件无法连接 API 怎么办？**

确认容器的网络配置能正常访问外部 API。如果在国内环境使用 OpenAI/Anthropic 等海外 API，需要在容器中配置代理：

```bash
# 在容器终端中设置
export HTTP_PROXY=http://your-proxy:port
export HTTPS_PROXY=http://your-proxy:port
```

或者在 Docker Compose 中直接配置环境变量：

```yaml
environment:
  - HTTP_PROXY=http://your-proxy:port
  - HTTPS_PROXY=http://your-proxy:port
```

**Q：AI 插件占用资源太大？**

AI 插件本身占用的本地资源不多（主要是 UI 和 API 调用），计算发生在远端 API 服务器上。但如果你使用本地 Ollama 模型，需要注意 NAS/服务器的内存和 CPU 资源是否足够。建议在至少有 8GB 内存的设备上运行本地模型。

**Q：多个 AI 插件可以共存吗？**

可以共存，但不建议同时启用多个插件的代码补全功能，它们会互相干扰。可以选择一个作为主力补全工具，其他仅使用对话功能。

### 八、进阶配置

#### 8.1 配置 HTTPS 访问

如果从外网访问 Code Server，强烈建议启用 HTTPS。最简单的方式是使用反向代理（如 Nginx Proxy Manager）配合 Let's Encrypt 自动证书。

Nginx 反向代理配置示例：

```nginx
server {
    listen 443 ssl;
    server_name code.yourdomain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:11510;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Accept-Encoding gzip;
    }
}
```

注意 `Upgrade` 和 `Connection` 这两个 Header 是 WebSocket 所必需的，Code Server 依赖 WebSocket 通信，缺少这两项配置会导致页面无法正常加载。

#### 8.2 设置开机自启（systemd）

如果 Code Server 不是通过 Docker 部署的，而是直接安装在系统上，可以创建 systemd 服务实现开机自启：

```ini
# /etc/systemd/system/code-server.service
[Unit]
Description=Code Server
After=network.target

[Service]
Type=simple
User=your-username
ExecStart=/usr/bin/code-server --bind-addr 0.0.0.0:8888 --auth password
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启用并启动：

```bash
systemctl enable code-server
systemctl start code-server
```

#### 8.3 多用户访问

Code Server 本身是单用户设计的，不支持多用户权限管理。如果需要多人使用，有两种方案：

- 为每个用户部署一个独立的 Code Server 容器（不同端口），这是最简单的隔离方式
- 使用 Coder 团队的另一个项目 [Coder](https://github.com/coder/coder)，它是面向团队设计的云端开发环境平台，支持多用户、工作区模板、资源管理等

### 九、常见问题

**Q：页面加载很慢或白屏？**

检查网络连接是否正常，Code Server 需要 WebSocket 支持。如果使用了反向代理，确认 WebSocket 相关的 Header 配置正确。也可以尝试清除浏览器缓存后刷新。

**Q：终端中输入中文显示乱码？**

在 Docker Compose 的环境变量中添加 `LANG=C.UTF-8`，或者在容器内安装中文 locale：

```yaml
environment:
  - LANG=C.UTF-8
  - LC_ALL=C.UTF-8
```

**Q：如何升级 Code Server？**

Docker 部署的升级非常简单，拉取最新镜像后重新创建容器即可：

```bash
docker compose pull
docker compose up -d
```

配置和插件都存在 volume 挂载中，升级不会丢失任何数据。

**Q：忘记登录密码怎么办？**

Docker 部署时密码是环境变量传入的，查看 Compose 文件中的 `PASSWORD` 值即可。如果使用了 `config.yaml` 配置文件，可以在挂载的 config 目录中找到。

### 参考文档

- [coder/code-server - GitHub](https://github.com/coder/code-server)
- [LinuxServer Docker Code Server 文档](https://docs.linuxserver.io/images/docker-code-server/)
- [code-server 安装与使用 - 掘金](https://juejin.cn/post/7102250183064289316)
- [Code-Server 安装与使用 - GitHub Notes](https://github.com/puxiao/notes/blob/master/Code-Server%E5%AE%89%E8%A3%85%E4%B8%8E%E4%BD%BF%E7%94%A8.md)
- [code-server 使用指南：如何在浏览器上使用 VS Code - 知乎](https://zhuanlan.zhihu.com/p/392058277)
- [NAS 部署 Code-Server 云端 - 什么值得买](https://post.smzdm.com/p/am9evdvk/)
- [NAS 部署 Code Server，随时随地搞代码！ - 知乎](https://zhuanlan.zhihu.com/p/614797290)
- [绿联 Pro 安装 code-server - 宏尘极客](https://www.hcjike.com/archives/sdRp39wt)
