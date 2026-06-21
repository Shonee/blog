# DigitalPlat 免费域名注册

### 基本信息

官网地址：https://dash\.domain\.digitalplat\.org

账户信息：https://dash\.domain\.digitalplat\.org/auth/user/edit

域名管理：https://dash\.domain\.digitalplat\.org/panel/domains



### 登录注册

#### 注册

如果没有账号，我们需要先点击 sign up 注册一个账号，使用邮箱即可完成注册。

user name即用户名，实测填的Jacky无效，登录时自动填入邮箱，估计是让浏览器生成超强密码时顺带着改变为邮箱了却不自知，大家自测。

全名随便填，成功后会显示在个人资料，可以编辑应该可以修改。

美国号码和地址要借助地址生成器，百度一个就行，从最小的地址复制粘贴加英文逗号然后一个空格接着州，邮编，最后给它个United States。

信息填写完成后，点击提交，顺利的话页面会显示注册成功了，需要进行邮箱验证。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZDUzZTU5MDEwN2ZlY2Q3OTQyNzk3MDAzYWFkMzUxODFfOWY1Y2IxY2Q5YTZjMDI2MDc5M2ExYWNlYjFkMTYyNTdfSUQ6NzUzNDMwMDM0NzI1NTI5MTkzMl8xNzgyMDQ3Mzk2OjE3ODIxMzM3OTZfVjM)

登录注册使用的邮箱，一般在收件箱或者垃圾箱可以找到这封验证邮件，把 http 开头的这一大串字符复制粘贴到浏览器的地址栏打开，然后会再给你一个成功的显示。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NzY1ZTcyZjYwZjNkNTljNzMxNTM5NDljODI3ODY3OWRfMWRjZDdhMjgwZTZhMzQ4YjYzZDU3MGQ0ZTNmZjAwMDJfSUQ6NzUzNDMwMDU3ODc2MDIxMjQ4M18xNzgyMDQ3Mzk2OjE3ODIxMzM3OTZfVjM)

#### 登录

注册完成拥有账号后，可以再次打开 https://dash\.domain\.digitalplat\.org 登录页面，输入邮箱地址、密码登录。



#### Github 验证

首次登录时需要进行验证，选择 Github 验证，会跳转 Github 页面，登录后授权完成验证。



### 域名额度

#### 默认额度

新注册账号只有一个免费域名的额度，但，通过进入GitHub给这个项目点个星星，然后回来验证一下便可以多得一个额度，一共是两个额度。步骤严格按照指引1234来，从2开始，点击进去之后再行1步骤登录也是可以的，没有GitHub账号的要先注册一个，然后给这个项目一个授权就可以进来点星星了



#### 额度\+1

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MjI1NTBhYTA3NGJjY2M1NzJkYmE4OGUyMjJiZWIzYzVfMTBlMDZkZTdkODY2NzdlMzI4MjQzY2UzYWYyYTBjNTBfSUQ6NzUzNDMwMjE1MjA0NzgwNDQyMF8xNzgyMDQ3Mzk2OjE3ODIxMzM3OTZfVjM)

1. 访问 Github 开源项目：https://github\.com/DigitalPlatDev/FreeDomain

2. 点击右上角 Star，给个星星

3. 点击验证地址，校验是否点赞成功：https://dash\.domain\.digitalplat\.org/auth/kyc/github

4. 返回如下内容，表示点赞成功，再次检查就会发现额度\+1

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ODlkODQwOWFiYzhhNWVlOGNhOTE3ODM0NzhjMWIzNWRfOTMzODdjMmRhOWEzMDgxYTZiNDc5OTM4ZDc1MzhhNDJfSUQ6NzUzNDMwMjgyMzUxNTM1NzE4NV8xNzgyMDQ3Mzk2OjE3ODIxMzM3OTZfVjM)



### 域名管理

#### 域名注册

点击 Domain Register，进入域名注册页面，注册新的域名。

Domain name 域名前缀自己定一个容易记的就行，目前提供4个域名后缀，其中以org和io开头的是免费的，另外两个kg结尾的是收费的，选定后下面的小框框里打钩，然后就是check availability



#### 域名服务器配置

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=Yjg2M2VkNzIzM2MwZjYyNDI2MzlkOTJiNzY4YjU0ZTVfNjBjNTdiYmMyMWUxMjExMTI0ZjRmMzYxZjkzMmZjN2NfSUQ6NzUzNDMwNDkyMzc1Njc4OTc4OF8xNzgyMDQ3Mzk2OjE3ODIxMzM3OTZfVjM)

提交后检测域名可用，会进入服务器填写，可以配置为 cf 服务器，来统一管理域名。



1. 登录 cf，首页找到域，点击添加一个域

2. 输入 DigitalPlat 注册的域名，点击继续，跳转下一页

3. 选择 Free 计划，跳转后点击继续前往激活，生成 cf 配置提示到域名管理中配置 cf dns

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NDQ2NTI5Zjg2MDliZDA1MmM1NGEyNWQzYjU2OTgwMGVfNzAzODI1ODA3ODIyMTZhYmU0OTQ2MTU0NDEwNDI1ZDdfSUQ6NzUzNDMwNjQxNTU2Mzg2NjExM18xNzgyMDQ3Mzk2OjE3ODIxMzM3OTZfVjM)

4. 填写后点击提交完成域名注册。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NjdjYzVlOTU2NjgyMzY3ZjYwODdjMGE5MTg4ODZiOWRfMjQ4Y2UxYjM4NWFmNTcwZDBlYjY4MmQ0YTZkY2IwMjNfSUQ6NzUzNDMwODAxNTc2NjE1OTM3OV8xNzgyMDQ3Mzk2OjE3ODIxMzM3OTZfVjM)



#### 支付

us\.kg 域名需要支付来获取 key，否则无法完成域名注册，key 获取地址：https://key\.register\.us\.kg/

org 和 io 域名则不需要填 key，直接提交后注册成功。



#### cf 管理域名

配置完成后，在 cf 中可以立即检查域名服务器，检查成功后可以在域名管理中管理域名了。

跳转到域详情，点击SSL/TLS——边缘证书——状态由待验证转为有效，证明配置正确且已生效，这样就可以通过增加解析使用域名来访问设备了，跟1元的或者6元一年的域名使用方法一样。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NzM4ZjQ2NmJhODkzODA2MjUyMDE0ZGNmZWE0NTEyNDdfNmUxM2Q4NmQwMDA2MWFjZWQ2OGQ0OGEyZTJjMGY5OThfSUQ6NzUzNDMwOTE2MzAxNTQ3MTEyM18xNzgyMDQ3Mzk2OjE3ODIxMzM3OTZfVjM)



### 域名续期

域名永久免费，默认注册期限为一年（365天）。

距离到期日少于180天时，可以在域名管理中完成续期。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZmRkMTU3ZjE0OTAxYTc3MDRiZWNhY2Y4NzlkYjUzMmRfYWU2OGY3YTYwNGZkNzFjZDUxYWQ4ZWRlNGJiOTgzNzdfSUQ6NzUzNDMwOTUyNzUxMDgyNzAxMF8xNzgyMDQ3Mzk2OjE3ODIxMzM3OTZfVjM)



### 参考文档

[终于找到了，永久免费的她来了——DigitalPlat 免费新域名开注！\_网络存储\_什么值得买](https://post.smzdm.com/p/avd34w07/) 

美国手机号生成：https://www\.bmcx\.com/us\_\_phonegenerate/

美国地址生成：https://us\.chatgpt\.org\.uk/

https://ginvh09pnwq.feishu.cn/wiki/DGapwEYXNiR3BDkDmjQccN2pn0e



