---
tags: [教程, OpenClaw, 卸载, CLI工具]
created: 2026-06-16
updated: 2026-06-16
aliases: [OpenClaw完全卸载指南, OpenClaw卸载步骤]
---

# OpenClaw 完全卸载教程

> **核心原则**: 遵循 **先停服务 → 再卸程序 → 最后清理残留** 的顺序,确保后台守护进程(如 Gateway)和本地配置文件被彻底移除。

## 📋 卸载前准备

在开始卸载前,请确认:
- ✅ 已备份重要的工作区文件(如果后续需要恢复)
- ✅ 记录了自定义配置路径(如有修改过 `OPENCLAW_CONFIG_PATH`)
- ✅ 关闭所有正在使用 OpenClaw 的终端窗口

---

## 🔧 第一步:停止并卸载 Gateway 服务

**重要**: 在删除主程序前,必须先关闭后台运行的 Gateway 服务,否则文件会被占用导致删除失败。

### 方式一:CLI 仍已安装(推荐)

在终端中依次运行以下命令:

```bash
# 1. 停止 Gateway 网关服务
openclaw gateway stop

# 2. 卸载 Gateway 网关服务(自动处理 launchd/systemd/schtasks)
openclaw gateway uninstall
```

### 方式二:CLI 已删除但服务仍在运行(手动移除)

#### macOS (launchd)

```bash
# 检查并移除服务
launchctl list | grep openclaw
launchctl remove ai.openclaw.gateway

# 如果有旧版标签也一并清理
launchctl remove bot.molt.gateway
launchctl remove com.openclaw.*

# 删除 plist 文件
rm -f ~/Library/LaunchAgents/ai.openclaw.gateway.plist
rm -f ~/Library/LaunchAgents/bot.molt.*.plist
rm -f ~/Library/LaunchAgents/com.openclaw.*.plist
```

#### Linux (systemd 用户单元)

```bash
# 停止并禁用服务
systemctl --user stop openclaw-gateway.service
systemctl --user disable openclaw-gateway.service

# 删除单元文件
rm -f ~/.config/systemd/user/openclaw-gateway*.service
systemctl --user daemon-reload
```

#### Windows (计划任务)

```powershell
# 在 PowerShell 中执行
Get-ScheduledTask -TaskName "OpenClaw Gateway*" | Unregister-ScheduledTask -Confirm:$false

# 删除任务脚本
Remove-Item "$env:USERPROFILE\.openclaw\gateway.cmd" -Force -ErrorAction SilentlyContinue
```

---

## 🗑️ 第二步:卸载 CLI 程序主体

根据你当初的安装方式,选择对应的卸载命令:

### npm 安装
```bash
npm rm -g openclaw
```

### pnpm 安装
```bash
pnpm remove -g openclaw
```

### bun 安装
```bash
bun remove -g openclaw
```

### macOS App 安装
如果你通过 `.dmg` 安装了 macOS 应用:
1. 打开「访达」→「应用程序」
2. 找到 **OpenClaw** 应用
3. 拖拽到废纸篓并清空

### 源码检出(git clone)安装
```bash
# 先完成第一步的服务卸载
# 然后删除仓库目录
rm -rf /path/to/openclaw-repo
```

---

## 🧹 第三步:清理本地配置与缓存目录

主程序删除后,需要手动删除 OpenClaw 生成的配置、缓存和记忆数据。

### macOS / Linux

```bash
# 删除默认状态目录
rm -rf ~/.openclaw

# 如果使用过 profile(--profile / OPENCLAW_PROFILE),清理所有相关目录
rm -rf ~/.openclaw-*

# 删除自定义配置路径(如果设置过 OPENCLAW_CONFIG_PATH)
# 示例:如果你的配置在其他位置
# rm -f /custom/path/to/openclaw-config.json
```

### Windows

1. 打开文件资源管理器
2. 在地址栏输入 `%USERPROFILE%` 并回车
3. 找到并删除 `.openclaw` 文件夹
4. 如果存在 `.openclaw-*` 文件夹也一并删除

### 历史版本残留清理

如果你之前安装过早期版本(Clawdbot 或 MoltBot),建议一并清理:

```bash
# macOS / Linux
rm -rf ~/.clawdbot
rm -rf ~/.moltbot

# Windows: 在 %USERPROFILE% 目录下查找并删除 .clawdbot 和 .moltbot 文件夹
```

---

## 🔒 第四步:安全收尾(可选但重要)

为了确保账号绝对安全,建议完成以下操作:

### 1. 撤销第三方授权

前往你曾授权给 OpenClaw 的平台,在应用的"授权/连接"设置中移除 OpenClaw 访问权限:

- **Google**: [Google 账号安全设置](https://myaccount.google.com/permissions) → 找到 OpenClaw → 移除访问权限
- **GitHub**: [GitHub Settings → Applications](https://github.com/settings/applications) → 找到 OpenClaw → Revoke
- **Notion**: [Notion Connections](https://www.notion.so/my-integrations) → 找到 OpenClaw → Remove
- **其他平台**: 登录对应平台 → 设置 → 应用授权/连接管理 → 移除 OpenClaw

### 2. 轮换 API 密钥

如果你在 OpenClaw 中配置过以下 API Key,建议登录相关后台重新生成(轮换)密钥:

- **OpenAI**: [API Keys 管理](https://platform.openai.com/api-keys) → 删除旧密钥 → 创建新密钥
- **Anthropic Claude**: [API Keys 管理](https://console.anthropic.com/account/keys) → 删除旧密钥 → 创建新密钥
- **DeepSeek**: 登录 DeepSeek 控制台 → API 密钥管理 → 轮换密钥
- **云服务厂商**(AWS/Azure/GCP 等): 登录对应云平台 → IAM/凭证管理 → 轮换相关密钥

> ⚠️ **注意**: 轮换密钥后,记得更新其他使用该密钥的应用配置。

---

## ✅ 验证卸载完成

执行以下检查确认卸载彻底:

```bash
# 1. 确认命令不可用
which openclaw  # 应返回空或 "not found"

# 2. 确认服务未运行
# macOS
launchctl list | grep openclaw  # 应无输出

# Linux
systemctl --user status openclaw-gateway  # 应显示 "Unit not found"

# 3. 确认配置目录已删除
ls -la ~/.openclaw  # 应返回 "No such file or directory"
```

---

## 🆘 常见问题

### Q: 卸载后重新安装会出现问题吗?
A: 不会。按照本教程完整卸载后,可以干净地重新安装。

### Q: 我只想重置配置,不想完全卸载怎么办?
A: 只需执行**第三步**,删除 `~/.openclaw` 目录即可重置所有配置和数据,保留 CLI 程序。

### Q: Gateway 服务无法停止怎么办?
A: 
- macOS: `sudo launchctl kill SIGKILL $(launchctl list | grep openclaw | awk '{print $1}')`
- Linux: `kill -9 $(pgrep -f openclaw-gateway)`
- Windows: 任务管理器 → 详细信息 → 结束 `node.exe` 进程(确认是 OpenClaw 相关的)

### Q: 如何确认没有残留进程?
```bash
# macOS / Linux
ps aux | grep openclaw  # 应无相关进程

# Windows PowerShell
Get-Process | Where-Object {$_.ProcessName -like "*openclaw*"}
```

---

## 📚 参考资源

- [OpenClaw 官方卸载指南(英文)](https://docs.openclaw.ai/install/uninstall)
- [OpenClaw 官方卸载指南(中文)](https://docs.openclaw.ai/zh-CN/install/uninstall)

---

> 💡 **提示**: 如果你将来需要重新安装 OpenClaw,可以参考官方安装文档或使用 `https://openclaw.ai/install.sh` 一键安装脚本。
