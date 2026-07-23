

# 如何使用 Codex + GPT Pro

> 最佳食用指南：下载此文档，喂给你的agent（codex，claude code，qoder）或者大模型（web chatgpt，Qwen）然后让它根据此文档step by step的指导你进行操作。

> **2026-07-10 更新：重新评估 Apple 付款路线。iPhone 若直接跳网页 Apple Pay，Apple 礼品卡余额不能按 App Store 内购方式使用；无海外银行卡时改走 Android + Google Play。**

## 0. 最速路线：安卓机 + giffgaff eSIM + Google Play 付款

如果你愿意为这件事单独准备一台设备，最快的一条路是：**买一台支持 eSIM、Google Play、Google 服务框架的安卓机，用公司网络加速完成注册和付款，用 giffgaff eSIM 解决后续手机验证。**

按这个顺序做：

1.  准备一台安卓机，提前确认三件事：支持内置 eSIM、不是锁网机、能正常使用 Google Play 和 Google 服务框架。
    
2.  在这台手机上安装阿里郎；把手机带到公司，接入公司的网络加速 / 跨境访问环境（如果你自己有梯子也可以用自己的梯子）。
    
3.  注册或登录 giffgaff，选择 eSIM，按 giffgaff App 里的步骤安装并激活；激活后先确认能收到短信。
    
4.  注册一个新的美区 Google 账号，不要折腾自己的国区主账号；在这台安卓机的 Google Play 里登录它。
    
5.  在 Google Play 里搜索并安装官方 ChatGPT App，确认发布方是 OpenAI。
    
6.  打开 ChatGPT App，用这个美区 Google 账号注册或登录 ChatGPT / OpenAI 账号。
    
7.  在 Google Play 里绑定可用的支付方式，然后在 ChatGPT App 里订阅 Plus / Pro。
    
8.  回到网页端确认 GPT 订阅已经生效，再登录 Codex。
    
9.  Codex 如果弹手机验证，就用这台手机上的 giffgaff eSIM 号码收验证码。
    

这条路线的核心是：**同一台安卓机同时承担 Google Play 安装、Google Play 付款、giffgaff eSIM 收码三件事；同一个美区 Google 账号贯穿 ChatGPT App 登录和付款；公司网络只负责让注册、登录、付款链路能顺利打开。**

注意两点：

*   买手机前先确认它真支持内置 eSIM，外置 eSIM 卡套或转接方案不要作为首选。
    
*   Google Play 国家/地区和付款资料可能需要时间生效，也不适合反复切换；小白建议直接新建美区 Google 账号。
    

## 1. 这篇能解决什么

这篇主要解决从 0 到能在阿里环境里稳定使用 Codex + GPT Pro 的基础问题：

*   怎么注册 GPT / OpenAI 账号。
    
*   Google / Apple 美区账号怎么选。
    
*   手机验证怎么准备。
    
*   GPT Plus / Pro 怎么买。
    
*   阿里环境下网络怎么处理。
    
*   Codex 怎么登录。
    
*   GPT 账单怎么找，用于报销。
    
*   怎么减少后续反复手机验证。
    

这篇不解决：

*   公司内部安全审批问题，使用前请按本部门要求确认。
    
*   海外手机号、礼品卡、PayPal、信用卡等具体购买渠道。
    
*   所有国产安卓手机的 Google 框架安装教程，不同机型差异太大；本文只告诉你怎么让大模型按你的机型一步步带。
    
*   Codex 的具体使用教程，比如怎么写代码、怎么 review、怎么跑测试。
    
*   绕过公司安全策略或处理敏感数据的问题。
    

## 1.1 先看整体路线

不需要一开始就把所有东西都准备好。按下面顺序往前走，走到哪一步缺东西，再跳到对应章节处理。

| 顺序 | 要做什么 | 看哪里 |
| --- | --- | --- |
| 1 | 先把 GPT / OpenAI 账号注册出来 | 第 2 节 |
| 2 | 如果遇到手机验证，需要国外手机号或 WhatsApp | 第 3 节 |
| 3 | 需要 Plus / Pro 时，如何处理付款渠道 | 第 4 节 |
| 4 | 如何让自己的网络可以使用 GPT 和 Codex | 第 5 节 |
| 5 | Codex 登录可能遇到的问题 | 第 7 节 |
| 6 | 账单和高级安全 | 第 6、8 节 |

## 1.2 最推荐路线

不知道怎么选的话，按这个来：

| 你的情况 | 推荐路线 |
| --- | --- |
| 愿意为了最快跑通单独买设备 | 第 0 节：安卓机 + giffgaff eSIM + Google Play 付款 |
| 有 iPhone，只需要下载和登录 ChatGPT | 美区 Apple 账号可以用于下载；付款前必须先看最终跳转页面 |
| 有能正常用 Google Play 的安卓机 | 美区 Google 账号 + Google Play 付款 |
| 有朋友的美国信用卡 | 直接用美国信用卡支付 |
| 只有国产安卓，且没有 Google Play | 优先借一台能正常使用 Google Play 的安卓机；不要把 Apple 礼品卡当默认兜底 |
| 只是公司内使用 Codex | 先用阿里郎网络加速 / 跨境访问，不要先折腾 VPS |
| 想在公司、家里、手机都稳定使用 | 再考虑美宅 VPS + sing-box + Proxifier |

**最省心路线：能正常使用 Google Play 的安卓机 + 美区 Google 账号 + Google Play 付款。**

**重要更新：目前已有大量账号在 iPhone 内点击升级后，不再进入 Apple App Store 的订阅确认页，而是直接跳到网页 Apple Pay。Apple Pay 与 Apple 礼品卡兑换后的 Apple Account 余额不是同一条付款链路；一旦直接跳 Apple Pay，不要继续购买或充值礼品卡。没有美国信用卡时，直接改走 Android + Google Play 路线。**

## 1.3 遇到看不懂的页面，直接问大模型

这篇文档默认读者不一定是程序员。遇到注册、支付、手机设置、代理配置这类页面看不懂时，不要硬猜，**截图问大模型**是最稳的。

建议每次问的时候带上：

*   你正在做哪一步，比如“注册 Google 美区账号”。
    
*   你用的设备，比如“iPhone / 小米 / Mac / Windows”。
    
*   当前页面截图。
    
*   你想达成的目标，比如“我要安装 ChatGPT App 并通过 Google Play 付款”。
    
*   让它一次只给下一步，不要一次给十几步。
    
*   如果页面、价格、政策可能已经变化，记得开启网络搜索。
    

可以直接复制这个模板：

```text
我现在在做【这里写当前步骤】，目标是【这里写目标】。
我的设备是【这里写设备和系统】，当前页面见截图。
请你不要一次说太多，只告诉我下一步应该点哪里、填什么、要注意什么。
如果有风险或我可能点错的地方，请提前提醒我。



```

不要发给大模型的信息：

*   验证码。
    
*   信用卡完整卡号、CVV、安全码。
    
*   公司账号密码。
    
*   API key、Token、Cookie。
    
*   内部系统截图、客户数据、生产数据。
    
*   VPS 密码原文。可以让大模型教你怎么配置，但密码自己在终端里输入。
    

## 2. 账号准备和 GPT 注册

这里有两个概念，先分清楚：

*   **Google / Apple 美区账号**：主要用于 Google Play / App Store 下载 ChatGPT App。Google Play 账号还可以承担 Google Play 付款；Apple 账号能否使用礼品卡余额付款，必须以最终是否进入 Apple App Store 订阅确认页为准，不能只看设备或下载账号。
    
*   **GPT / OpenAI 账号**：真正登录 GPT 网页端、ChatGPT App、Codex 的账号。
    

推荐顺序是：

1.  先准备 Google / Apple 美区账号。
    
2.  再打开 [https://chatgpt.com/](https://chatgpt.com/) 注册 GPT / OpenAI 账号。
    
3.  注册 GPT 账号时，选择用 Google / Apple 账号登录注册，后面支付和 App 使用会更顺。
    

GPT / OpenAI 账号可以用：

*   **Continue with Google：前提是先准备好 Google 美区账号，不要使用 Google 国区账号。**
    
*   **Continue with Apple：前提是先准备好 Apple 美区账号，不要使用 Apple 国区账号。**
    
*   邮箱注册。
    

注册登录方式可以按自己的常用账号选择；但购买路线不必和主力设备绑定。付款优先 Android + Google Play。iPhone 用户即使使用 Apple 登录，只要升级时直接跳 Apple Pay，也应改用安卓设备登录同一个 GPT 账号完成购买。

### 2.1 注册 Google 美区账号

如果后面准备走 Android + Google Play 付款路线，建议准备一个美区 Google 账号。注册过程中页面如果和本文不一样，按第 1.3 节截图问大模型。

> **注意：小白建议新注册美区 Google 账号，不要反复切自己的主账号地区。**

这里只处理账号准备：

1.  打开阿里郎网络加速或跨境访问。
    
2.  注册一个新的 Google 账号：[https://www.google.com](https://www.google.com)。
    
3.  地区选择美国。
    
4.  在 Android 手机上登录这个 Google 账号。
    
5.  打开 Google Play，确认可以搜索 ChatGPT App。
    

注意：

*   **国产安卓不一定可以直接使用 Google Play，可能需要 Google 服务框架。嫌麻烦时，优先借一台能正常使用 Google Play 的安卓机，不要默认改走 Apple 礼品卡路线。**
    
*   Google Play 国家/地区和付款资料有关，切换后可能需要等待生效。
    

国内安卓手机没有 Google Play 的提示：

*   有 iPhone 的话，可以先用美区 Apple 账号下载和登录 ChatGPT；但付款前必须判断是 Apple App Store 内购还是网页 Apple Pay。若直接跳 Apple Pay，改走安卓路线。
    
*   有原生支持 Google Play 的 Android 设备，直接用那台手机。
    
*   借一台能正常使用 Google Play 的 Android 手机完成订阅。
    
*   最后再考虑给当前国内安卓手机安装 Google 服务框架（询问你的大模型）。
    

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KpVjxrMqDQ/img/cba5c8b8-9716-40d7-9208-90222c5719cb.png)

### 2.2 注册 Apple 美区账号（主要用于下载，不再默认推荐付款）

如果需要在 iPhone 上下载 ChatGPT App，可以准备一个美区 Apple 账号。注册过程中页面如果和本文不一样，按第 1.3 节截图问大模型。

**不要因为已经准备了美区 Apple 账号，就提前购买 Apple 礼品卡。目前不少账号点击升级后会直接跳网页 Apple Pay；这种页面不能按 App Store 礼品卡余额路线处理。先看到最终支付页，再决定是否充值。**

> **注意：小白建议单独注册美区 Apple 账号，不要直接折腾自己的国区主账号。**

这里只处理账号准备：

1.  新注册一个 Apple 账号，不要直接折腾自己的国区主账号。
    
2.  注册时地区选择 United States。
    
3.  在 App Store 登录这个美区 Apple 账号。
    
4.  搜索并安装 ChatGPT App。
    

注意：

*   **切换 iPhone 美区账号的时候，切换 App Store 的账号，不要切换系统设置里的 iCloud 主账号。**
    
*   **Apple 账号地区可以切换，但会涉及余额、订阅、付款方式等问题，小白更建议单独注册美区账号。**
    

### 2.3 注册 GPT / OpenAI 账号

准备好 Google / Apple 美区账号之后，再注册 GPT / OpenAI 账号。

1.  打开阿里郎网络加速或者跨境访问。
    
2.  访问 [https://chatgpt.com/](https://chatgpt.com/)。
    
3.  选择登录 / 注册。
    
4.  如果你准备走 Google 路线，选择 **Continue with Google**。
    
5.  如果你准备走 Apple 路线，选择 **Continue with Apple**。
    
6.  后续登录 GPT、ChatGPT App、Codex 时，尽量一直使用同一种登录方式。
    

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KpVjxrMqDQ/img/0c044051-3b21-46ec-a462-a82c4cfcd83c.png)

> **注意：不要今天用 Google 登录，明天用 Apple 登录，后天又用邮箱登录。** 登录方式混乱时，很容易以为自己账号丢了，其实可能是登录到了另一个 GPT 账号。

账号注册做到这里算成功：

*   GPT 网页端能登录。
    
*   手机 App 能登录同一个 GPT 账号。
    
*   对应的美区 Google / Apple 账号能正常安装 ChatGPT App；付款通道另行按最终页面判断。
    
*   知道自己后续登录 GPT / Codex 应该继续用 Google、Apple 还是邮箱。
    

### 2.4 登录与订阅账号注意事项

在大陆设备上使用美区 Apple 账号下载 ChatGPT App，通常不影响 App 的安装和登录；但**下载账号、GPT 登录账号、最终付款通道是三件不同的事**。最终能不能使用 Apple 礼品卡余额，只看点击升级后进入了哪一种付款页面。

**重要：近期实际反馈中，已有大量账号在 iPhone 内点击升级后，直接跳到 ChatGPT 网页结算和 Apple Pay，而不是 Apple App Store 的订阅确认页。出现这种情况时，Apple 礼品卡兑换得到的 Apple Account 余额不能被当作 Apple Pay 银行卡使用。没有美国信用卡或其他可用 Wallet 卡片的用户，只能改走 Android + Google Play 路线。**

按页面判断：

*   **Apple App Store 内购页**：页面明确显示 Apple 订阅确认信息，购买后可以在 iPhone「设置 → Apple 账号 → 订阅」里管理。只有这种情况下，才有可能按 Apple Account 余额 / 礼品卡路线付款；仍应先确认页面实际显示的付款来源。Apple 官方也提示，部分订阅可能不会从 Apple Account 余额扣款。
    
*   **网页 Apple Pay 页**：页面进入 Safari 或 ChatGPT 网页结算，出现 Apple Pay 按钮、Wallet 卡片选择器、账单地址等字段。这是网页支付，不是 App Store 内购；不要指望它消耗 Apple 礼品卡余额。
    

[OpenAI 官方 iOS 订阅说明](https://help.openai.com/en/articles/7905739-chatgpt-ios-app-upgrading-to-a-paid-subscription)仍提供 iOS App 内购买 Plus 的入口，但也明确写明：**Free 直接升级 Pro 必须走网页端。** 实际账号可能因为地区、版本、账户资格或灰度策略显示不同入口，因此本文以你最终看到的页面为准。

建议操作顺序：

1.  先登录 ChatGPT App，点击升级，观察最终页面；不要提前购买礼品卡。
    
2.  如果进入 Apple App Store 订阅确认页，再检查当前「媒体与购买项目 / Media & Purchases」账号和付款来源。
    
3.  如果直接进入网页 Apple Pay，立即停止 Apple 礼品卡方案；没有可用海外银行卡时，使用同一个 GPT 账号登录安卓 ChatGPT App，通过 Google Play 完成订阅。
    
4.  如果已经充值了 Apple 礼品卡，也不要继续追加余额；这些余额仍可用于其他符合条件的 App Store 内容，但不保证能用于当前 ChatGPT 订阅。
    

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KpVjxrMqDQ/img/f46bc04a-1d44-4ebb-a00c-c8a764b75474.png)

## 3. 手机验证

**Codex 登录有时会触发手机验证，所以建议准备一个长期可控的海外手机号；如果页面支持 WhatsApp 验证，也可以准备长期可控的 WhatsApp 账号。不要把它当成一次性注册材料，后面复验时还可能用到。**

可选方式：

*   英国 giffgaff 手机卡，我自己用的是这个，适合长期保号。现在 giffgaff 可以切换或使用 eSIM；如果你有支持内置 eSIM 的手机，优先走 eSIM，少等一张实体卡。购买渠道请自行判断风险。
    
*   [giffgaff 官方 eSIM 说明](https://help.giffgaff.com/en/articles/261570-switching-to-an-esim-with-giffgaff)里的核心要求是：手机硬件支持内置 eSIM、未锁网，并且能运行最新版 giffgaff App。具体型号支持情况会变化，买手机或开通前以 giffgaff App 和官网识别结果为准。
    
*   部分东南亚地区可以用 WhatsApp 验证，比如稳定的印尼 WhatsApp 账号。购买渠道自行判断风险；购买时尽量买老号，也可以考虑自己注册然后养号。
    

> **不要用一次性接码平台。** 后面再次验证时容易拿不回账号。

**giffgaff 注意事项：**

1.  如果走 eSIM，先确认手机支持内置 eSIM、未锁网，并能安装最新版 giffgaff App；激活后先测试能不能收短信。
    
2.  如果走实体卡，现在购买渠道不太稳定，请自行判断风险。
    
3.  实体卡到了之后插到备用机上，关闭流量。
    
4.  如果不会激活或看不懂页面，按第 1.3 节截图问大模型。
    
5.  注意保号。giffgaff 需要定期有一次活动，我自己是定了三个月一次的闹钟，给自己的国内手机发一条短信即可。
    

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KpVjxrMqDQ/img/7dc95445-f79a-432b-90a9-37c28f59bbac.png)

手机验证做到这里算成功：

*   GPT / Codex 弹手机验证时能收到验证码。
    
*   这个号码后续还能继续使用。
    
*   已经设置保号提醒，不会几个月后号码失效。
    

## 4. 购买 GPT Pro

> **注意：现在 GPT 有一定风控，新号可能需要先购买 Plus，正常使用一段时间后再看 Pro 入口；具体资格、价格和档位以当前 ChatGPT 页面为准。**

支付方式优先级：

1.  美国信用卡。
    
2.  Android + Google Play 付款。
    
3.  网页端当前实际提供的可用支付方式。
    
4.  Apple App Store 内购：仅限页面明确进入 Apple 的订阅确认页，并且付款来源显示可用；不要预先假定礼品卡余额一定能扣。
    
5.  PayPal / Link / Stripe：以网页端当前实际显示为准，通常需要手机号或账单信息，可以先处理第 3 节的手机号。
    
6.  Apple Pay 只是 Wallet 中银行卡等支付方式的快捷结算入口，不等于 Apple Account 礼品卡余额。若 iPhone 直接跳 Apple Pay，而你又没有可用的海外银行卡，直接走 Android + Google Play。
    
7.  注意：用某种方式购买完 Pro / Plus 之后通常不能立刻切换到第二种支付方式，需要等第一种方式的订阅时间到期。
    

### 4.1 Android + Google Play 付款

适合主力安卓用户：

1.  Android 手机上安装 ChatGPT App。
    
2.  手机上安装并配置 Google Play 和付款资料。
    
3.  把自己的 Visa 卡绑定到对应的 Google 付款资料。
    
4.  打开 ChatGPT App，登录自己的 GPT 账号。
    
5.  在 App 里购买 Plus 或 Pro。
    
6.  购买成功后，回到网页端确认订阅状态。
    

**这条路的好处是后续续费、取消订阅、付款记录都比较好查。**

### 4.2 Apple 路线：先辨别 App Store 内购还是网页 Apple Pay

**不要先买礼品卡。先点一次升级，看最终页面。当前大量账号只能直接进入网页 Apple Pay；一旦出现 Apple Pay 按钮或 Wallet 卡片选择器，就说明这不是 Apple App Store 礼品卡余额路线。没有美国信用卡时，直接改走 Android + Google Play。**

具体判断和处理：

1.  使用第 2.2 节准备好的美区 Apple 账号下载 ChatGPT App，并登录需要订阅的 GPT 账号。
    
2.  点击升级：
    
    *   如果进入 **Apple App Store 订阅确认页**，可以继续检查 Apple 账号、订阅价格和付款来源。只有页面明确显示可以使用 Apple Account 余额时，才考虑充值礼品卡。
        
    *   如果进入 **ChatGPT 网页结算 + Apple Pay**，立即停止。这种 Apple Pay 通常选择的是 Wallet 中的银行卡，不等于 Apple Gift Card / Apple Account 余额。
        
3.  [Apple 官方支付方式说明](https://support.apple.com/en-us/111741)将 Apple Account 余额和 Apple Pay 分别列为不同的付款方式；[Apple 礼品卡和账户余额限制说明](https://support.apple.com/en-us/118245)还提示，部分订阅可能不会从余额扣款。因此，即使 Apple 账号里有礼品卡余额，也不能据此保证 ChatGPT 会使用它。
    
4.  [OpenAI 官方 iOS 订阅说明](https://help.openai.com/en/articles/7905739-chatgpt-ios-app-upgrading-to-a-paid-subscription)：iOS App 可以提供 Plus 的 Apple 订阅确认页；但从 Free 直接升级到 Pro 必须走网页端。目标是 Pro 时，不要把 Apple 礼品卡当主路径。
    
5.  对没有美国信用卡的用户：只要 iPhone 最终直接跳 Apple Pay，就使用 Android + Google Play 路线。可以在安卓 App 登录同一个 GPT 账号购买，成功后再回 iPhone、网页端和 Codex 使用。
    
6.  购买成功后，确认网页端和 App 都显示相同订阅状态，避免在 Apple、Google Play 和网页重复订阅。
    

### 4.3 购买提示：如果新号不能买 Pro

**新号可能不会立刻出现 Pro 购买入口。** 可以先买 Plus，用一段时间后再看 Pro 入口是否开放；具体资格和档位以当前 ChatGPT 页面为准。

建议：

*   先确保 Plus 可以正常使用。
    
*   每天正常使用 GPT，不要频繁切换网络环境。
    
*   大概一周后再看 Pro 入口。
    
*   如果网页端没有入口，可以同时看 ChatGPT App 里的订阅入口。
    

### 4.4 购买提示：地址、邮编、电话怎么填

支付过程中经常会出现 Billing Address / Address / ZIP Code / Phone 这些字段，小白最容易卡在这里。

字段大概含义：

*   `Address / Street`：街道地址。
    
*   `City`：城市。
    
*   `State`：州。
    
*   `ZIP Code / Postal Code`：邮编。
    
*   `Phone`：手机号。
    
*   `Billing Address`：账单地址，通常要和付款方式能对上。
    

如果你不知道当前页面应该填什么，按第 1.3 节截图问大模型。提问时可以这样说：

```text
我现在在填写 GPT / Apple / Google Play 的付款地址页面。
我的支付方式是【美国信用卡 / Google Play / Apple 礼品卡 / PayPal / Link】。
请解释每个字段是什么意思，并告诉我哪些信息应该向持卡人或支付账号确认。
如果可以，告诉我一些免税地区的例子。

```

购买做到这里算成功：

*   网页端能看到 Plus / Pro 订阅状态。
    
*   手机 App 里也能看到订阅生效。
    
*   能找到付款记录，后续可以用于报销。
    

## 5. 网络环境

> **安全提醒：使用之前请和本部门的安全沟通，防止出现合规问题。**

### 5.1 默认方案：阿里郎网络加速 / 跨境访问

**大部分人到这里就够了。**

现在阿里郎网络加速和跨境访问，大多数情况下都可以支持 GPT 网页端和 Codex 登录使用。**如果没有额外稳定性需求，不需要折腾 VPS、sing-box、Proxifier。**

[《阿里郎自动跨境访问灰度用户操作手册》](https://alidocs.dingtalk.com/i/nodes/P7QG4Yx2Jpx4OolYCBBNAoG9J9dEq3XD)

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KpVjxrMqDQ/img/22670d7b-8f53-47c6-ac8c-d5ac5a1417a3.png)

默认使用方式：

1.  打开阿里郎网络加速或跨境访问。
    
2.  访问 [https://chatgpt.com/](https://chatgpt.com/)，确认 GPT 网页端可用。
    
3.  按第 7 节的登录指南配置 Codex。
    
4.  **如果网页端和 Codex 都能正常登录，就不要继续折腾网络。**
    

### 5.2 内部独立 IP 访问

如果你所在组织提供内部独立 IP 访问，可以按内部流程申请；**没有这类权限可以直接跳过本节。**

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KpVjxrMqDQ/img/4ac3fdf9-65d3-4e1b-a104-e893a8c23e3c.png)

### 5.3 进阶方案：美宅 VPS

**进阶方案，可跳过至第 6 节。** 下面这部分只适合两类人：

*   对阿里郎网络加速的稳定性不满意。
    
*   希望在公司电脑、家里电脑、手机上都保持同一个稳定网络出口。
    

我自己的方案：

*   voyracloud 美宅 VPS：[https://www.voyracloud.com/residential-ip-vps](https://www.voyracloud.com/residential-ip-vps)
    
*   sing-box：[https://github.com/sagernet/sing-box](https://github.com/sagernet/sing-box)
    
*   Proxifier：[https://www.proxifier.com/](https://www.proxifier.com/)
    

用法是把本机 Codex、网页 GPT、家里机器的 Codex 网络和手机 ChatGPT App 的网络都走同一个美宅 VPS。

大致流程：

1.  购买一台 Residential IP VPS，配置不需要高。[https://www.voyracloud.com/residential-ip-vps](https://www.voyracloud.com/residential-ip-vps)
    
2.  拿到 VPS 的 IP、用户名、SSH 密钥或密码。
    
3.  在 VPS 上安装 sing-box 做转发。
    
4.  在本机配置本地代理。
    
5.  用 Proxifier 把 Codex 流量转到本地代理，再转发到 VPS。
    
6.  如果不想用 Proxifier，也可以让大模型帮你写脚本，手动把 Codex 流量转发到 VPS。
    

不会配置时，不要自己硬改配置文件。把 VPS 系统、IP、SSH 用户名、你本机系统，以及当前报错截图发给大模型，让它一次只带你做下一步。

voyracloud 不贵，带宽不高，但给 Codex 用够了。**建议所有常用机器都走同一个美宅 VPS，保持网络环境一致，这样有助于减少反复触发验证的概率。**

验证方式：

1.  浏览器打开 GPT，确认能正常访问。
    
2.  浏览器搜索 `what is my ip`，确认出口 IP 是 VPS。
    
3.  Codex 登录时不再反复跳验证或登录失败。
    

**如果浏览器正常、Codex 不正常，通常是 Proxifier 规则没有覆盖 Codex 进程。**

网络做到这里算成功：

*   GPT 网页端能稳定打开。
    
*   Codex 能完成登录。
    

## 6. 报销

[《报销政策》](https://alidocs.dingtalk.com/i/nodes/Qnp9zOoBVBDEydnQULM60Xrl81DK0g6l?traceId=0b0b63b117811446766773828d0706)

**最好安装 ai coding trace，这样报销更有保证：**

```bash
npx -y --registry=https://registry.anpm.alibaba-inc.com @ali/ai-coding-trace@latest --workId=你的工号

```

网页端订阅的账单查看路径：

1.  打开 GPT 网页端。
    
2.  进入账号设置或订阅管理。
    
3.  找到 Billing / 账单。
    
4.  点击账单记录。
    

如果你是通过 Apple App Store 或 Google Play 订阅，发票和取消订阅通常要回到对应的 Apple 账号或 Google Play 订阅记录里找，不一定在网页端 Billing 里完整展示。

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KpVjxrMqDQ/img/f75990c0-8715-43b3-93a8-ee4b9bff0a4a.png)

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KpVjxrMqDQ/img/3713f462-81be-4810-996a-fca873026a2f.png)

## 7. Codex 阿里环境登录

Codex 官方支持两种 OpenAI 登录方式：**Sign in with ChatGPT** 和 **API key**。如果你是为了使用 Plus / Pro 里的 Codex 额度，优先用 Sign in with ChatGPT；CLI、IDE 扩展和桌面 App 都会打开浏览器完成登录，登录信息会缓存在本机。具体机制可以看 [Codex Authentication](https://developers.openai.com/codex/auth)。

在阿里环境里，如果浏览器能打开 GPT 但 Codex 登录失败，常见原因是登录链路或本地回调没有完整走到网络规则里。当前阿里郎网络规则可能没有覆盖 `auth0.com`，所以 Codex 登录可能需要额外处理，可以直接参考：

[codex登陆401错误网络配置指南](https://alidocs.dingtalk.com/i/nodes/XPwkYGxZV347LdvpH3PgdOlzJAgozOKL)

如果你是在远程机或无浏览器环境登录，也可以尝试 Codex CLI 的设备码登录：

```bash
codex login --device-auth


```

## 8. 绑定验证器和开启高级安全

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KpVjxrMqDQ/img/59c2ee99-77c6-41e0-b188-951880c6524f.png)

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KpVjxrMqDQ/img/5a0d09c5-1629-4e78-a3ec-e7e6042c5579.png)

> 建议开启验证器 / MFA。它能提高账号安全，也有助于减少高风险登录复验，但不能保证以后完全不会再弹手机验证；手机号或长期可控的验证方式仍然要保留。

## 9. 卡住了先看这里

| 问题 | 先看哪里 |
| --- | --- |
| 不知道选 Google 还是 Apple | 看第 1.2 节；付款默认优先 Android + Google Play |
| GPT 网页端打不开 | 先开阿里郎网络加速 / 跨境访问 |
| 注册页面看不懂 | 按第 1.3 节截图问大模型 |
| 国产安卓没有 Google Play | 看第 2.1 节，优先借一台能正常使用 Google Play 的安卓机 |
| 收不到手机验证码 | 看第 3 节，优先实体 SIM / 长期可控账号 |
| 买不到 Pro | 看第 4.3 节，先 Plus 用一段时间 |
| iPhone 点击升级后直接跳 Apple Pay，礼品卡余额无法使用 | **停止 Apple 路线，看第 2.4、4.2 节；没有海外银行卡时改走 Android + Google Play** |
| 网页 GPT 能用，Codex 登录麻烦 | 看第 7 节，重点是 `auth0.com` |
| Codex 走不到代理 | 看第 5.3 节，检查 Proxifier 是否命中 Codex 进程 |
| 找不到账单 | 看第 6 节，到网页端 Billing / 账单里找 |
| 后续反复手机验证 | 看第 8 节，绑定验证器 / MFA，并保留长期可控验证方式 |

## 10. 附录：工具推荐

### 10.1 查询 Codex 使用额度重置小技巧

打开你的 Codex，输入以下内容：

```text
用我本机 Codex 凭证查一下 rate-limit reset credits：
读取 ~/.codex/auth.json 里的 tokens.access_token，请求
https://chatgpt.com/backend-api/wham/rate-limit-reset-credits

要求：
1. 不要打印 access_token、refresh_token、cookie 或完整唯一 ID
2. 只汇总 available_count、每个 credit 的 status/title/
granted_at/expires_at
3. 把 granted_at/expires_at 从 UTC 转成上海时间
4. 如果 401，说明是凭证失效或没带对 Authorization header


```

注意：`~/.codex/auth.json` 里是登录凭证，等同于敏感信息。只让 Codex 在本机读取和汇总，不要把文件内容、token、cookie 贴到群里或文档里。

或者直接使用skill：a1 skill install codex-reset-credits --agent codex --global

### 10.2 桌面状态监控

如果你同时跑多个 Agent，或者你就是想在 Codex 后台运行的时候监控它的进度，可以试试这个桌面状态监控工具：

*   clawd-on-desk：[https://github.com/rullerzhou-afk/clawd-on-desk/blob/main/README.zh-CN.md](https://github.com/rullerzhou-afk/clawd-on-desk/blob/main/README.zh-CN.md)
    

它是一个桌面小组件，可以监控多种 Agent 的运行状态。

非工作态：

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KpVjxrMqDQ/img/b60fa6c3-6795-4b06-98e4-b38495d4bb5e.png)

工作态：

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KpVjxrMqDQ/img/f98c4bb1-de9f-490a-9e4d-5d8b1e5459ec.png)

支持多种 Agent 的监控：

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn45KpVjxrMqDQ/img/864356d8-3a83-4236-954c-223e4b54e23c.png)

### 10.3 常用 Codex Skill

我平时在 Codex 里常用这些 Skill：

*   new-chat-ready：[https://open.aone.alibaba-inc.com/skill/new-chat-ready](https://open.aone.alibaba-inc.com/skill/new-chat-ready)
    
    用来做新对话交接和上下文恢复。长任务做到一半、对话快撑爆、或者想把当前进度交给另一个 Agent 时，它可以整理出可继续执行的 handoff 和下一轮 prompt。
    
*   codemap：[https://open.aone.alibaba-inc.com/skill/codemap](https://open.aone.alibaba-inc.com/skill/codemap)
    
    用来快速摸清陌生代码库。它不会写一篇很长的人类架构文档，而是给 Agent 生成“应该先看哪里、关键链路在哪里、改动可能影响哪里”的代码地形图。
    
*   sdd-riper-one-light：[https://open.aone.alibaba-inc.com/skill/sdd-riper-one-light](https://open.aone.alibaba-inc.com/skill/sdd-riper-one-light)
    

用来给日常编码任务加一层轻量 Harness。它会要求 Agent 先复述目标、给 checkpoint、做验证和回写，但不会把小任务搞成很重的流程。

### 10.4 系统提示词示例

我的系统提示词：

```markdown
# Global AGENTS

默认用中文交流。

## Skill 路由

- `codemap`：进入陌生代码库、遗留系统、大模块、跨仓任务，或用户要求 `create_codemap` / `MAP` / 项目总图 / 功能地形图时使用；产物面向 agent，不写成人类架构长文。
- `sdd-riper-one-light`：中等及以上代码任务使用；简单问答、低风险文案、单点机械修改可跳过。
- `new-chat-ready`：用户表达要 new chat、换对话、handoff、resume pack、上下文压缩、无缝续接时使用；自动整理当前状态、可落盘交接文档，并生成新对话可直接粘贴的 prompt。

## 默认边界

- 主 Codex 会话始终是 owner / decider / implementer / verifier。
- 项目可以同时拥有 feature 级 spec/handoff 和 project 级知识入口（如根目录 `PROJECT_KNOWLEDGE.md`、`PROJECT_MEMORY.md`、`PROJECT_SPEC.md`，或项目 `AGENTS.md` 指向的等价文件）。进入项目、new chat 恢复、debug 或跨任务决策时，优先检查项目 `AGENTS.md` 是否索引了这类 project 级文件；不要只在 `docs/features/` 或单次 handoff 里找长期规则。
- 不要把 `.agent-memory/`、本地 SQLite、Milvus Lite db、trace / episode / candidate / asset 运行数据提交到业务仓库。
- 不要提交 `.env`、API key、token 或其他本地凭据。
- 不主动改动 `.gitignore`，包括主动恢复 `.gitignore`；提交和暂存文件时忠实遵守仓库现有 `.gitignore`。

详细流程以对应 skill 的 `SKILL.md` 为准，避免把长策略常驻进默认 prompt。



```

### 10.5 Harness 文章

如果你想进一步理解我为什么这样使用 Codex，可以看这篇文章：

*   Code is cheap. Don't write any.：[https://ata.atatech.org/articles/11020639205](https://ata.atatech.org/articles/11020639205)
    

这篇文章不是一篇普通的 AI Coding 工具介绍，而是在认真讨论一个变化：当代码生成本身变得越来越便宜时，程序员的核心能力会从“亲手写代码”迁移到“定义目标、切任务包、设边界、看 checkpoint、做验收、控风险”。

文章中间提出了一套 Harness 方法：**人定方向，模型推进**。它不是让人完全退出，也不是把每一步都写死，而是让人把控制点上移到目标、边界、checkpoint、证据和风险通道。里面两个核心概念很值得看：

*   **水流理论**：不要把模型当成打字员，而是让它像水一样在边界内自己找路；人负责修堤坝、看水闸、留安全通道。
    
*   **最小混沌单元**：每次交给模型的任务要小到可检查、失败可局部回炉，又要大到模型有自主设计、实现、修复、验证的空间。
