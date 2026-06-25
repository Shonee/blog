# Codex 与 Claude 账号注册指南

## 一、通用前置准备

### 1.1 阿里郎网络加速 / VPN

阿里郎方式1：如果灰度了自动跨境访问功能（[《阿里郎自动跨境访问灰度用户操作手册》](https://alidocs.dingtalk.com/i/nodes/P7QG4Yx2Jpx4OolYCBBNAoG9J9dEq3XD?utm_scene=team_space&utm_medium=dingdoc_doc_plugin_card&utm_source=dingdoc_doc)），打开对应按钮：

阿里郎方式2：网络加速-设置-网络设置-选择美国服务器-开启网络加速：

两个平台均需海外 IP 访问。推荐使用 **美国节点**（注册时 IP 地区需与后续操作一致）：

*   注册全程保持同一国家/地区 IP，不要频繁切换
    
*   建议使用「干净」IP（非数据中心 IP、非共享出口），保证IP不要经常漂移
    
*   注册完成后使用时也尽量保持一致的地区
    

### 1.2 海外邮箱

国内邮箱（QQ、163、新浪等）在注册时大概率被拦截或要求额外验证（不建议）。

| 推荐邮箱 | 说明 |
| --- | --- |
| **Gmail** | 首选，与 Google 账号体系互通，注册 Claude 时可直接 "Continue with Google" |
| **Outlook / Hotmail** | 微软邮箱，注册 OpenAI 时可用 |
| **Proton Mail** | 隐私邮箱，OpenAI 官方推荐用于注册 ChatGPT |

### 1.3 美区 Google 账号（核心资产）

美区 Google 账号是两个平台注册的关键基础设施。

#### 注册方法

**方法 A：自行注册（免费）**

1.  连接 **美国 VPN 节点**
    
2.  打开 `https://accounts.google.com\`
    
3.  页面语言切换为 **English (United States)**
    
4.  点击 "Create account" → "For my personal use"
    
5.  填写姓名、生日、性别
    
6.  创建 Gmail 邮箱地址和密码
    
7.  **手机号验证**：可尝试跳过（部分情况下 Google 允许跳过），或使用方法 B/C 的手机号
    
8.  完成验证即可
    

**方法 B：使用接码平台获取美国手机号**

当 Google 要求手机号验证时，可使用接码平台：

*   **Hero SMS**（hero-sms.com）：SMS-Activate 原班团队迁移的新平台，支持 200+ 国家，支持支付宝/加密货币充值，收不到自动退款
    
*   价格：美国号码约 1-5 元人民币/次
    

**方法 C：闲鱼代注册**

*   在闲鱼搜索「美区 Google 账号代注册」
    
*   价格：通常 **10-20 元**
    
*   注意：选择信誉好的卖家，注册完成后立即修改密码和绑定辅助邮箱
    

#### 注意事项

*   注册 Google 账号时，浏览器语言建议切换为英文
    
*   注册成功后，绑定一个辅助邮箱（可用国内邮箱）以防丢失
    
*   开启两步验证（2FA），使用 Authenticator App 而非短信
    

---

## 二、Claude（Anthropic）注册

### 2.1 注册流程

**Claude 的风控较为严格**，是目前两个平台中注册难度较高的。

1.  **连接美国 VPN**，打开 `https://claude.ai\`
    
2.  点击 **"Continue with Google"**（推荐，比邮箱注册更快捷）
    
    *   授权你的美区 Google 账号
        
    *   部分账号通过此方式可跳过手机号验证
        
3.  或使用邮箱注册：
    
    *   输入 Gmail / Outlook 邮箱
        
    *   收取验证码完成邮箱验证
        
4.  **手机号验证**（大概率触发）：
    
    *   必须使用**国外手机号**，中国大陆手机号不被接受
        
    *   选择与当前 VPN IP 一致的国家（如美国）
        
    *   通过接码平台获取临时号码接收验证码
        
5.  填写姓名，完成注册
    

### 2.2 高成功率技巧

根据社区实测（300+ 次经验）：

*   **反向选择策略**：在选择服务时，不要选 "Claude"，而是选择其他服务（如 YouTube），并选择非美国地区（如英国/日本），这样注册的是普通 Google 账号而非专门针对 Claude 的账号，风控更宽松
    
*   **邮箱/IP/手机号地区一致性**：三者地区需匹配，否则易触发风控
    
*   **使用英区/日区号码**：部分用户反馈英区（+44）或日区（+81）号码比美区号码通过率更高
    
*   **浏览器环境**：使用 Chrome 浏览器，清除 Cookie 后注册
    
*   **失败重试**：如果注册被拒，更换 IP 节点和手机号后重试，不要在同一 IP 上反复尝试
    

### 2.3 Claude Pro 订阅方式

参考[《claude/codex购买+稳定代理方式》](https://alidocs.dingtalk.com/i/nodes/oP0MALyR8kzGnoOwFKvp74wDJ3bzYmDO)

---

## 三、Codex（OpenAI）注册

### 3.1 注册流程

**Codex 的风控相对宽松**，注册流程比 Claude 简单。

> Codex 是 OpenAI 的编码智能体产品，包含 CLI、网页版、IDE 插件和桌面 App。**使用 Codex 需要 ChatGPT Plus 及以上付费会员**（Plus $20/月、Pro $200/月等）。

1.  **连接美国 VPN**，打开 `https://chat.openai.com\`
    
2.  点击 **"Sign up"**
    
3.  选择注册方式：
    
    *   **Google 账号登录**（推荐）：授权美区 Google 账号，通常可跳过手机号验证
        
    *   **Microsoft 账号登录**：同样较为顺畅
        
    *   **邮箱注册**：需使用海外邮箱（Gmail/Outlook/Proton），国内邮箱可能要求额外验证
        
4.  如触发手机号验证：
    
    *   使用接码平台获取国外号码
        
    *   OpenAI 对手机号的验证相对 Claude 宽松
        
5.  完成验证即注册成功
    

### 3.2 使用 Codex

注册 OpenAI 账号后，需要付费才能使用 Codex：

**方式一：ChatGPT Plus 订阅（$20/月）**

*   在 ChatGPT 设置中升级 Plus
    
*   支付方式同 Claude Pro  参考[《claude/codex购买+稳定代理方式》](https://alidocs.dingtalk.com/i/nodes/oP0MALyR8kzGnoOwFKvp74wDJ3bzYmDO)
    
*   升级后网页版会出现 Codex 入口
    

**方式二：Codex CLI 安装**

```bash
# 确保 Node.js ≥ 22
node -v

# 一行命令安装
npm i -g @openai/codex

# 启动（会用浏览器登录你的 ChatGPT 账号）
codex

```

**方式三：Codex macOS 桌面 App**

*   前往 `developers.openai.com/codex` 下载 .dmg
    
*   使用 ChatGPT 账号登录即可
    

**方式四：IDE 插件**

*   在 VS Code / Cursor 中搜索 "OpenAI Codex" 扩展安装
    
*   支持通过 ChatGPT 账号直接登录，无需 API Key
    

### 3.3 注意事项

*   OpenAI 目前**不再严格要求国外手机号**，使用 Google/Microsoft 账号登录通常可跳过
    
*   国内邮箱（QQ、163 等）**不能**用于注册
    
*   免费 OpenAI 账号**无法使用 Codex**，必须有 Plus/Pro/Business/Edu 订阅
    
*   OpenAI 的风控比 Claude 宽松，但仍需注意 IP 一致性
    

---

## 四、常见问题

**Q: 没有美国手机号能注册吗？** A: Claude 大概率需要，Codex 通过 Google/Microsoft 登录通常可跳过。接码平台成本仅几元。

**Q: 国内银行卡能付费订阅吗？** A: 不能。需要虚拟信用卡或通过第三方代充或苹果/谷歌平台购买，推荐是参考购买文档使用苹果礼品卡/谷歌paly进行支付。

**Q: 注册后被封号怎么办？** A: Claude 封号申诉成功率低。建议注册后固定 IP、避免异常操作。Codex 相对宽松，但仍需注意。

**Q: 美区 Google 账号注册后安全吗？** A: 注册后建议立即修改密码、绑定辅助邮箱、开启 2FA，即可安全使用。

**Q: 两个平台可以共用一个 Google 账号吗？** A: 可以，建议共用一个高质量的美区 Google 账号作为统一入口。
