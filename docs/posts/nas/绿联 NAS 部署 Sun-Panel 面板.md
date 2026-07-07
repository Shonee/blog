

## 绿联 NAS 部署 Sun-Panel 面板：23 MB 镜像搞定 NAS 导航页 + Docker 管理面板

家里的 NAS 上跑了一堆服务，Jellyfin、Home Assistant、Gitea、Nextcloud 等等，每次打开浏览器都要回忆端口号，导致书签栏越来越长，找个入口得翻半天。

Sun-Panel 做的事情很简单：给你一个好看的导航首页，把所有服务的链接、图标、分组统一管理起来。

不仅如此，Sun-Panel 还可以查看服务器状态、在网页里直接操作 Docker 容器。

更重要的是，整个项目的镜像只有 23 MB，跑起来内存占用几乎可以忽略。

### Sun-Panel 介绍

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

### Sun-Panel 的功能特性

导航面板这个品类选择不少，Heimdall、Homepage、Dashy、Organizr 等。而 Sun-Panel 面板的定位则偏向"中文用户友好+零配置上手"：

- 界面默认中文，不需要额外汉化
- 内置 Iconify 图标库，不用自己找图标 URL
- 支持内外网链接一键切换（局域网和公网两套地址，切换很方便）
- 集成了 Docker 管理功能（1.5.0+），能直接在面板里启停容器

不足的地方：自定义程度不如 Homepage（那个用 YAML 配置，灵活但学习成本高）；PRO 功能需要付费，虽然基础功能已经够用。

如果追求纯开源内容并喜欢深入研究，Heimdall 和 Dashy 更合适，可以随便捣鼓。

### 配置要求

Sun-Panel 的资源消耗很低，基本上能跑 Docker 的设备都能装：

| 项目 | 要求 |
|---|---|
| 系统 | Linux / macOS / NAS（群晖/威联通/绿联/极空间） |
| 内存 | 128 MB 足够 |
| 磁盘 | 50 MB（镜像 + 配置数据） |
| 端口 | 3002 |

### 绿联 NAS 部署 Sun-Panel

本次部署是在绿联 DXP4800 Plus 上完成的，只要有 Docker 容器便可完成部署。

1. 登录进入 NAS，在需要安装的位置创建 sun-panel 目录，用于存放镜像数据
<img width="956" height="368" alt="image" src="https://github.com/user-attachments/assets/a4a8251e-925d-4904-8b08-0b1aeace4943" />

2. 为了将部署镜像的相关数据和配置映射到 NAS 本地，还需要在 sun-panel 目录下创建 conf 和 docker.sock 两个文件夹
<img width="1330" height="280" alt="image" src="https://github.com/user-attachments/assets/e46a8be9-7273-43b7-96f8-e81b09f9eb94" />

3. 打开 Docker，点击左侧项目 Tab，点击右侧创建项目按钮，弹出创建页面，填入创建项目相关信息如下
<img width="2060" height="1528" alt="image" src="https://github.com/user-attachments/assets/3c04253f-795d-4035-8ba7-cc48070143a9" />

4. 其中，docker-compose 文件配置如下，需要修改路径为本地 NAS 创建的 sun-panel 目录
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
4. 点击右下角立即部署按钮，Docker 便开始拉取镜像并部署，如下则表示拉取部署完成
<img width="1230" height="758" alt="image" src="https://github.com/user-attachments/assets/d57436df-77b9-49ed-981e-a8d927c36f97" />

5. 点击完成关闭弹窗，可以在项目列表中看到第一个 sun-panel 项目已经在运行中了
<img width="2034" height="500" alt="image" src="https://github.com/user-attachments/assets/36ac2f2d-73da-410e-a143-485f657ba5da" />

6. 点击左侧项目下方的镜像 Tab，可以看到右侧运行中的 sun-panel 镜像，点击右侧快速访问按钮
<img width="2014" height="556" alt="image" src="https://github.com/user-attachments/assets/52c33b78-cb71-4e2b-8c04-384fee40c25a" />

7. 点击弹出的端口号地址后跳转到对应的 web 页面地址，进入 sun-panel 首页，展示如下
<img width="3104" height="2134" alt="image" src="https://github.com/user-attachments/assets/4bf82ea3-0a1f-4433-b3e8-bb7dd516cb55" />

8. 或者也可以手动访问地址：`http://服务器IP:3002`，默认账号密码信息为： `admin@sun.cc` / `12345678`，点击登录面板
<img width="3118" height="2150" alt="image" src="https://github.com/user-attachments/assets/b87584d8-6ddd-4731-ab65-9444432c32c7" />

9. 登录之后首先在设置中修改账号和密码并重新完成登录

之后便可以添加并管理 NAS 中的项目信息了，后续可以在当前面板中实现统一管理。


### 常用功能

#### 修改密码

登录后台（左侧菜单 → 设置 → 账户），改掉默认密码。

或者用命令行重置：

```bash
docker exec sun-panel /app/sun-panel -password-reset
```

#### 添加导航链接

后台 → 图标管理 → 新增，填入：
- 名称（如"Jellyfin"）
- 内网地址（如 `http://192.168.1.100:8096`）
- 外网地址（如果有的话，如 `https://jellyfin.example.com`）
- 图标（可以直接搜索 Iconify 图标库）

分组可以按用途划分：影音、开发工具、智能家居、NAS 管理……

#### 内外网切换

Sun-Panel 支持为每个链接配置两套地址。面板右上角有切换按钮，在家里自动走内网地址，在外面走外网地址。不需要改配置，不需要两个导航页。


