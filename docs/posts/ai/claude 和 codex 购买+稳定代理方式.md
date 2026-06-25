---
title: claude/codex购买+稳定代理方式
date: 2026-06-25
category: ai
tags:
  - claude
  - codex
---


# claude/codex购买+稳定代理方式

# 一.购买方式

   因为Claude官网购买需要美国银行卡+住址+身份验证，这个方式基本不可行。目前对于我们比较简单的方式有两种：**美区 Apple ID + 礼品卡**/**Google Play 美区账号，**且方便报销，不过会有25%的平台费（比如100$套餐需要付125$）

## 方案 A：美区 Apple ID + 礼品卡（推荐 iOS 用户）

这是目前最稳定、成功率最高的方案，适合 iPhone/iPad/Mac 用户。

### 1. 准备工作

*   **美区 Apple ID**：如果你没有，需要注册一个地区设置为“美国”的 Apple ID。
    
    *   _注意_：建议使用独立的邮箱注册，不要使用中国区 ID 切换地区（可能导致原有订阅冲突或数据丢失）。
        
*   **美区 App Store 礼品卡**：通过正规渠道（如支付宝内的“出境易”、亚马逊美国官网、或可靠的第三方平台）购买美元面值的礼品卡（Gift Card）。
    

### 2. 操作步骤

1.  **登录美区 ID**：在设备的 App Store 中退出当前中国区 ID，登录美区 Apple ID。
    
2.  **兑换礼品卡**：打开 App Store，点击右上角头像，选择“Redeem Gift Card or Code”（兑换礼品卡或代码），输入礼品卡代码充值。余额会显示在账户中。
    
3.  **下载 Claude App**：在 App Store 搜索 "Claude" 并下载官方应用。
    
4.  **发起订阅**：
    
    *   打开 Claude App，登录你的 Anthropic 账号。
        
    *   点击升级到 Pro 版。
        
    *   系统会自动调用 Apple ID 的支付方式。由于账户内有美元余额，会优先扣除余额。
        
5.  **完成支付**：确认支付即可。订阅成功后，Web 端和所有客户端的 Pro 权益会同步生效。
    

### 3. 注意事项

*   **税费问题**：美国部分州（如加州、纽约州）会对数字商品征收消费a税。建议在注册美区 ID 时，地址填写**免税州**（如俄勒冈州 Oregon、特拉华州 Delaware、蒙大拿州 Montana 等），这样可以节省约 6%-10% 的费用。
    
*   **自动续费**：Apple 订阅默认自动续费。若余额不足，会尝试从绑定的其他支付方式扣款。若希望手动控制，可在每次续费前充值，或在订阅管理中关闭自动续费（但需注意关闭后可能影响权益连续性）。
    

---

## 方案 B：Google Play 美区账号（推荐 Android 用户）

[https://ata.atatech.org/articles/11020606833: https://ata.atatech.org/articles/11020606833](https://ata.atatech.org/articles/11020606833)

Android 用户主要通过 Google Play 商店进行订阅。此方案对网络环境和账号纯净度要求较高。

### 1. 准备工作

*   **美区 Google 账号**：注册或拥有一个地区设置为“美国”的 Google 账号。
    
*   **网络环境**：需要稳定的、IP 地址为美国的网络环境（科学上网工具）。
    
*   **支付方式**：
    
    *   **方式一（礼品卡）**：购买美区 Google Play 礼品卡并充值到账号余额。
        
    *   **方式二（外币信用卡）**：绑定一张 Visa 或 Mastercard 信用卡（部分国内发行的双币/全币种卡有机会通过，但失败率较高；推荐使用 Depay/Dupay 等虚拟卡或境外实体卡）。
        

### 2. 操作步骤

1.  **切换账号与环境**：
    
    *   确保手机网络节点为美国。
        
    *   在 Google Play 商店中切换到美区 Google 账号。
        
    *   _关键步骤_：首次切换时，可能需要清除 Google Play 商店的缓存和数据，以确保商店界面切换为美区（显示美元价格）。
        
2.  **充值/绑卡**：
    
    *   **若用礼品卡**：访问 `play.google.com/redeem` 或在 Play 商店内兑换礼品卡，确保余额充足。
        
    *   **若用信用卡**：在 Play 商店的“付款方式”中添加信用卡。系统可能会要求填写美国账单地址（建议使用免税州地址）。
        
3.  **下载与订阅**：
    
    *   在 Play 商店搜索 "Claude" 并安装。
        
    *   打开 App，登录账号并选择升级 Pro。
        
    *   在支付页面选择已充值的余额或绑定的信用卡完成支付。
        

### 3. 注意事项与风险

*   **风控严格**：Google Play 的风控比 Apple 更严格。如果检测到 IP 地址与账号地区不符，或支付行为异常，可能会触发风控导致支付失败甚至封号。务必保持 IP 稳定。
    
*   **礼品卡支付的局限性**：虽然 Google Play 余额理论上可以支付订阅，但部分新账号或低频账号在首次订阅时，系统可能强制要求绑定一张信用卡进行身份验证（即使不扣款）。如果遇到这种情况，纯礼品卡方案可能无法通过，需准备一张外币卡。
    
*   **地址一致性**：填写的账单地址必须与 Google 账号设置的地区一致，且最好与该地区的邮编对应。
    

---

# 二、稳定代理方式

  套餐购买完成后在稳定网络环境下使用阿里郎+proxifier/clash进行代理，亲测很稳定，目前账号使用两个半月一切正常。

4.18更新：IT提供了代理灰度新方案，让阿里郎代理外部AI服务更稳定，使用该灰度功能就无需再配合Proxifier/Clash使用[《阿里郎跨境加速灰度用户操作手册》](https://alidocs.dingtalk.com/i/nodes/P7QG4Yx2Jpx4OolYCBBNAoG9J9dEq3XD?utm_source=im&utm_scene=team_space&iframeQuery=utm_medium%3Dim_card%26utm_source%3Dim&cid=52416197432&utm_medium=im_card&corpId=dingd8e1123006514592&spm=4a1a7f8b.7a3457a8.0.0.5d467946bfGb1Z)

## 阿里郎配置：

设置-网络设置-VPN服务器选择加州


   勾选电脑休眠时保持VPN连接


 由于阿里郎加速只提供 socks5 代理， claude code cli 原生不支持 socks5 代理，所以有以下两种方式，将阿里郎加速给 claude code cli

## 方式 1：申请阿里郎跨境灰度加速功能

[《阿里郎跨境加速灰度用户操作手册》](https://alidocs.dingtalk.com/i/nodes/P7QG4Yx2Jpx4OolYCBBNAoG9J9dEq3XD?utm_source=im&utm_scene=team_space&iframeQuery=utm_medium%3Dim_card%26utm_source%3Dim&cid=52416197432&utm_medium=im_card&corpId=dingd8e1123006514592&spm=4a1a7f8b.7a3457a8.0.0.5d467946bfGb1Z)

**注意vpn服务器的选择**


## 方式 2：Proxifier配置

Proxifier-Rules-新增一条规则如下：

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/2M9qP5jKvBwXmO01/img/7a9b193f-3650-4219-a570-954bd1b136f5.png)

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/2M9qP5jKvBwXmO01/img/ccaf4132-0c68-44e5-8336-e0adb04376f7.png)

Target Hosts:

```plaintext
*.anthropic.com;claude.ai;*.claude.com;platform.claude.com;*.claude.ai;*.claude.com;anthropic.com
```

## 方式 3：Clash 代理

[https://github.com/clash-verge-rev/clash-verge-rev/releases](https://github.com/clash-verge-rev/clash-verge-rev/releases)

下载 clash verge 软件，导入 clash.yml 配置，选择公司代理

[请至钉钉文档查看附件《clash.yml》。](https://alidocs.dingtalk.com/i/nodes/oP0MALyR8kzGnoOwFKvp74wDJ3bzYmDO?iframeQuery=anchorId%3DX02mo2dnf3lfmuf6vvhp9r)

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/2M9qP5jKvBwXmO01/img/eae50430-976b-4eb6-b27b-db0fb8640d3c.png)

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/2M9qP5jKvBwXmO01/img/f87fc5c2-fc27-4b68-b5e4-bb66a88864b6.png)

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/2M9qP5jKvBwXmO01/img/4ee2d355-2f59-43b9-ac41-5d100098d621.png)

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/2M9qP5jKvBwXmO01/img/fa262e75-3c01-46a4-bca7-1a528fc631b0.png)

在 ~/.zshrc 中增加以下函数，source ~/.zshrc之后，运行 claude 会自动开代理

```shell
# Proxy Plugin for claude code
# Description: Easy proxy management for terminal with NO_PROXY support

# 默认代理配置 (匹配 Clash 端口 7078)
PROXY_HTTP="http://127.0.0.1:7897"

# 免代理配置：包含本地、局域网以及公司内网域名
# 注意：多个域名用逗号分隔，部分工具不支持通配符 *，所以同时写上 .domain.com
LOCAL_NO_PROXY="localhost,127.0.0.1,::1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,100.64.0.0/10"
COMPANY_NO_PROXY="amap.com,.amap.com,amap.test,.amap.test,alibaba-inc.com,.alibaba-inc.com,alibaba.net,.alibaba.net,aliyun.com,.aliyun.com,alipay.com,.alipay.com,antgroup-inc.com,.antgroup-inc.com,cainiao.com,.cainiao.com,dingtalk.com,.dingtalk.com"
export DEFAULT_NO_PROXY="$LOCAL_NO_PROXY,$COMPANY_NO_PROXY"

# 开启代理
proxy_on() {
    export http_proxy=$PROXY_HTTP
    export https_proxy=$PROXY_HTTP
    export all_proxy=$PROXY_HTTP
    export HTTP_PROXY=$PROXY_HTTP
    export HTTPS_PROXY=$PROXY_HTTP
    export ALL_PROXY=$PROXY_HTTP
    
    # 设置免代理名单
    export no_proxy=$DEFAULT_NO_PROXY
    export NO_PROXY=$DEFAULT_NO_PROXY

    echo "✔ 代理已开启"
    echo "  HTTP/HTTPS: $PROXY_HTTP"
    echo "  NO_PROXY:   已排除公司内网及本地地址"
}

# 关闭代理
proxy_off() {
    unset http_proxy https_proxy all_proxy HTTP_PROXY HTTPS_PROXY ALL_PROXY no_proxy NO_PROXY
    echo "✘ 代理已关闭"
}

# ── claude 启动包装（自动开代理）────────────────────────
claude() {
    [ -z "$http_proxy" ] && proxy_on
    command claude --dangerously-skip-permissions --allow-dangerously-skip-permissions "$@"
}

```

claude code statusline 查看用量

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/2M9qP5jKvBwXmO01/img/288af67a-1fd8-45da-8cd8-549b9f9e04a0.png)

保存下面的 statusline-command.sh 放到~/.claude 目录，chmod +x statusline-command.sh 

```shell
#!/bin/bash
# Two-line statusline with visual context progress bar
#
# Line 1: Model, folder, branch
# Line 2: Progress bar, context %, cost, duration
#
# Context % uses Claude Code's pre-calculated remaining_percentage,
# which accounts for compaction reserves. 100% = compaction fires.

# Read stdin (Claude Code passes JSON data via stdin)
stdin_data=$(cat)

# Single jq call - extract all values at once
# Prefer pre-calculated remaining_percentage (100 - remaining = used toward compact)
# Fall back to manual calc from raw tokens if not available
IFS=$'\t' read -r current_dir model_name cost lines_added lines_removed duration_ms ctx_used cache_pct < <(
    echo "$stdin_data" | jq -r '[
        .workspace.current_dir // "unknown",
        .model.display_name // "Unknown",
        (try (.cost.total_cost_usd // 0 | . * 100 | floor / 100) catch 0),
        (.cost.total_lines_added // 0),
        (.cost.total_lines_removed // 0),
        (.cost.total_duration_ms // 0),
        (try (
            if (.context_window.remaining_percentage // null) != null then
                100 - (.context_window.remaining_percentage | floor)
            elif (.context_window.context_window_size // 0) > 0 then
                (((.context_window.current_usage.input_tokens // 0) +
                  (.context_window.current_usage.cache_creation_input_tokens // 0) +
                  (.context_window.current_usage.cache_read_input_tokens // 0)) * 100 /
                 .context_window.context_window_size) | floor
            else "null" end
        ) catch "null"),
        (try (
            (.context_window.current_usage // {}) |
            if (.input_tokens // 0) + (.cache_read_input_tokens // 0) > 0 then
                ((.cache_read_input_tokens // 0) * 100 /
                 ((.input_tokens // 0) + (.cache_read_input_tokens // 0))) | floor
            else 0 end
        ) catch 0)
    ] | @tsv'
)

# Bash-level fallback: if jq crashed entirely, extract fields individually
if [ -z "$current_dir" ] && [ -z "$model_name" ]; then
    current_dir=$(echo "$stdin_data" | jq -r '.workspace.current_dir // .cwd // "unknown"' 2>/dev/null)
    model_name=$(echo "$stdin_data" | jq -r '.model.display_name // "Unknown"' 2>/dev/null)
    cost=$(echo "$stdin_data" | jq -r '(.cost.total_cost_usd // 0)' 2>/dev/null)
    lines_added=$(echo "$stdin_data" | jq -r '(.cost.total_lines_added // 0)' 2>/dev/null)
    lines_removed=$(echo "$stdin_data" | jq -r '(.cost.total_lines_removed // 0)' 2>/dev/null)
    duration_ms=$(echo "$stdin_data" | jq -r '(.cost.total_duration_ms // 0)' 2>/dev/null)
    ctx_used=""
    cache_pct="0"
    : "${current_dir:=unknown}"
    : "${model_name:=Unknown}"
    : "${cost:=0}"
    : "${lines_added:=0}"
    : "${lines_removed:=0}"
    : "${duration_ms:=0}"
fi

# Git info
if cd "$current_dir" 2>/dev/null; then
    git_branch=$(git -c core.useBuiltinFSMonitor=false branch --show-current 2>/dev/null)
    git_root=$(git -c core.useBuiltinFSMonitor=false rev-parse --show-toplevel 2>/dev/null)
fi

# Build repo path display (folder name only for brevity)
if [ -n "$git_root" ]; then
    repo_name=$(basename "$git_root")
    if [ "$current_dir" = "$git_root" ]; then
        folder_name="$repo_name"
    else
        folder_name=$(basename "$current_dir")
    fi
else
    folder_name=$(basename "$current_dir")
fi

# Generate visual progress bar for context usage
progress_bar=""
bar_width=12

if [ -n "$ctx_used" ] && [ "$ctx_used" != "null" ]; then
    filled=$((ctx_used * bar_width / 100))
    empty=$((bar_width - filled))

    if [ "$ctx_used" -lt 50 ]; then
        bar_color='\033[32m'  # Green (0-49%)
    elif [ "$ctx_used" -lt 80 ]; then
        bar_color='\033[33m'  # Yellow (50-79%)
    else
        bar_color='\033[31m'  # Red (80-100%)
    fi

    progress_bar="${bar_color}"
    for ((i=0; i<filled; i++)); do
        progress_bar="${progress_bar}█"
    done
    progress_bar="${progress_bar}\033[2m"
    for ((i=0; i<empty; i++)); do
        progress_bar="${progress_bar}⣿"
    done
    progress_bar="${progress_bar}\033[0m"

    ctx_pct="${ctx_used}%"
else
    ctx_pct=""
fi

# Session time (human-readable)
if [ "$duration_ms" -gt 0 ] 2>/dev/null; then
    total_sec=$((duration_ms / 1000))
    hours=$((total_sec / 3600))
    minutes=$(((total_sec % 3600) / 60))
    seconds=$((total_sec % 60))
    if [ "$hours" -gt 0 ]; then
        session_time="${hours}h ${minutes}m"
    elif [ "$minutes" -gt 0 ]; then
        session_time="${minutes}m ${seconds}s"
    else
        session_time="${seconds}s"
    fi
else
    session_time=""
fi

# Separator
SEP='\033[2m│\033[0m'

# Get short model name (e.g., "Opus" instead of "Claude 3.5 Opus")
short_model=$(echo "$model_name" | sed -E 's/Claude [0-9.]+ //; s/^Claude //')

# LINE 1: [Model] folder | branch
line1=$(printf '\033[37m[%s]\033[0m' "$short_model")
line1="$line1 $(printf '\033[94m📁 %s\033[0m' "$folder_name")"
if [ -n "$git_branch" ]; then
    line1="$line1 $(printf '%b \033[96m🌿 %s\033[0m' "$SEP" "$git_branch")"
fi

# LINE 2: Progress bar | Context % | cost | duration
line2=""
if [ -n "$progress_bar" ]; then
    line2=$(printf '%b' "$progress_bar")
fi
if [ -n "$ctx_pct" ]; then
    if [ -n "$line2" ]; then
        line2="$line2 $(printf '\033[37m%s\033[0m' "$ctx_pct")"
    else
        line2=$(printf '\033[37m%s\033[0m' "$ctx_pct")
    fi
fi
if [ -n "$line2" ]; then
    line2="$line2 $(printf '%b \033[33m$%s\033[0m' "$SEP" "$cost")"
else
    line2=$(printf '\033[33m$%s\033[0m' "$cost")
fi
if [ -n "$session_time" ]; then
    line2="$line2 $(printf '%b \033[36m⏱ %s\033[0m' "$SEP" "$session_time")"
fi
if [ "$cache_pct" -gt 0 ] 2>/dev/null; then
    line2="$line2 $(printf ' \033[2m↻%s%%\033[0m' "$cache_pct")"
fi

printf '%b\n\n%b' "$line1" "$line2"

# LINE 3: Rate limit usage (only shown when data is available)
five_pct=$(echo "$stdin_data" | jq -r '.rate_limits.five_hour.used_percentage // empty' 2>/dev/null)
week_pct=$(echo "$stdin_data" | jq -r '.rate_limits.seven_day.used_percentage // empty' 2>/dev/null)

line3=""
if [ -n "$five_pct" ]; then
    five_fmt=$(printf '%.0f' "$five_pct")
    if [ "$five_fmt" -ge 80 ] 2>/dev/null; then
        rate_color='\033[31m'
    elif [ "$five_fmt" -ge 50 ] 2>/dev/null; then
        rate_color='\033[33m'
    else
        rate_color='\033[32m'
    fi
    line3=$(printf '%b5h: %s%%%b' "$rate_color" "$five_fmt" '\033[0m')
fi
if [ -n "$week_pct" ]; then
    week_fmt=$(printf '%.0f' "$week_pct")
    if [ "$week_fmt" -ge 80 ] 2>/dev/null; then
        week_color='\033[31m'
    elif [ "$week_fmt" -ge 50 ] 2>/dev/null; then
        week_color='\033[33m'
    else
        week_color='\033[32m'
    fi
    week_str=$(printf '%b7d: %s%%%b' "$week_color" "$week_fmt" '\033[0m')
    if [ -n "$line3" ]; then
        line3="$line3 $(printf '%b' "$SEP") $week_str"
    else
        line3="$week_str"
    fi
fi

if [ -n "$line3" ]; then
    printf '\n%b' "$line3"
fi
```

在 ~/.claude/settings.json 增加一个配置:

```shell
"statusLine": {
  "type": "command",
  "command": "bash ~/.claude/statusline-command.sh"
}
```

养号经验：注册完账号，先用两天，再充 20 刀 pro，用两三天，充 125 刀 max

使用经验：不要担心封号，大胆用

codex方式同claude，风控相对claude更松，更容易注册，封号概率较低。                                                  

附：[《Codex 与 Claude 账号注册指南》](https://alidocs.dingtalk.com/i/nodes/QG53mjyd800agdlKHgXQzqnZ86zbX04v)
