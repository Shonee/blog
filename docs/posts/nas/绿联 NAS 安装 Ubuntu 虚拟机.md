
### Ubuntu 系统下载
> Ubuntu 是世界上最受欢迎的 Linux 操作系统。

- 官方下载地址：[https://ubuntu.com/download](https://ubuntu.com/download)
- 中文官方下载地址：[https://cn.ubuntu.com/download](https://cn.ubuntu.com/download)
- 阿里云镜像下载地址（地址有问题）：[https://mirrors.aliyun.com/ubuntu-releases](https://mirrors.aliyun.com/ubuntu-releases/) 

Ubuntu 26.04 LTS，专为桌面 PC 和笔记本精心打造的 Ubuntu 长期支持（LTS）版本。LTS 意为 long-term support，26.04 LTS 将提供五年常规安全更新和维护，并可通过 Ubuntu Pro 延长至 15 年。
https://releases.ubuntu.com/26.04/ubuntu-26.04-desktop-amd64.iso  桌面系统图形化版本
https://releases.ubuntu.com/26.04/ubuntu-26.04-live-server-amd64.iso 服务器版本

可以直接在绿联 NAS 的下载中心将系统下载地址粘贴并完成下载，省得要先下载到本地后再上传至 NAS 。
<img width="2074" height="1538" alt="image" src="https://github.com/user-attachments/assets/5423285b-4b80-45be-9286-6cd5560743f1" />


### Ubuntu 系统安装

1. 导入 Ubuntu 系统镜像， 点击管理 - 镜像 - 添加镜像，选择下载好的 ubantu 镜像，等待系统镜像完成导入
   <img width="1622" height="640" alt="image" src="https://github.com/user-attachments/assets/ebc9f9ad-7767-410c-bbf5-bb5d59def11d" />

2. 新建 Ubuntu 系统镜像，点击新建，新建虚拟机
   <img width="1192" height="434" alt="image" src="https://github.com/user-attachments/assets/9c5a018b-3690-47e9-a97e-76d393316c99" />

3. 点击下一步，选择存放位置
   <img width="1200" height="562" alt="image" src="https://github.com/user-attachments/assets/2c868ce0-02a2-4f7c-9549-3f869e1295df" />

4. 虚拟机 Ubuntu 系统基础配置，选择系统类型为 Linux、CPU、内存按需分配，建议不低于 2核2G，磁盘建议不低于40G，网络选择路由器所在的 ip 地址段
   <img width="2354" height="1212" alt="image" src="https://github.com/user-attachments/assets/a788d365-92fc-4fae-ae3a-aef55448d119" />

5. 点击完成后 NAS 会自动进行 Ubuntu 系统的创建
6. 创建完成后，需要手动点击运行虚拟机
   <img width="2018" height="444" alt="image" src="https://github.com/user-attachments/assets/f45ccabd-f563-4576-afac-df9938db1528" />

7. 运行成功后，点击使用 VNC 链接访问虚拟机系统，进入系统安装页面，后续均是在命令行页面进行配置选择；回车键确认选择和进入下一页，esc 返回到上一个页面。
8. 选择系统语言，默认是英文，可以通过键盘上下箭头键选择其他语言，点击回车进入下一步
   <img width="2760" height="1442" alt="image" src="https://github.com/user-attachments/assets/948c3ce1-948a-46cc-abc2-128856f7e9c3" />

9. 选择键盘语言，默认英文配置即可，点击回车进入下一步
   <img width="2700" height="1968" alt="image" src="https://github.com/user-attachments/assets/cd144562-e31a-42dc-b70d-be1f9974cac2" />

10. Ubuntu 系统安装的类型选择，使用默认的系统配置即可，点击回车进入下一步
    <img width="2768" height="1932" alt="image" src="https://github.com/user-attachments/assets/523d7a86-aa16-4c73-ba24-b67e4b8c68ca" />

11. 虚拟机网络配置设置，使用默认配置即可，点击回车进入下一步
    <img width="2626" height="1930" alt="image" src="https://github.com/user-attachments/assets/3e7fb6fc-3f34-4ffa-8ecf-168601403a20" />

12. 系统代理地址配置，默认为空，先不填写，点击回车进入下一步
    
13. 测试网络访问联通性，等待测试完成输出内容后（显示 Reading package lists），即可继续回车进入下一步
    <img width="2556" height="1924" alt="image" src="https://github.com/user-attachments/assets/c2db4b75-daae-4514-9d35-ed1a6f6f1cf4" />

14. 系统存储自定义配置，依然使用默认配置即可，使用下键移动光标至 Done，点击回车进入下一步
    
15. 存储配置一览，继续点击回车进入下一步
    <img width="2542" height="1934" alt="image" src="https://github.com/user-attachments/assets/3b1f8168-ba2d-4a42-8a74-c55ef1fd103f" />

16. 点击后展示弹窗内容，在弹窗汇总移动光标至 Continue，点击回车继续下一步
    <img width="2462" height="1924" alt="image" src="https://github.com/user-attachments/assets/85407945-fc75-4c77-a6c4-a02781b8a53a" />

17. 进入账户信息页面，需要创建用户账户信息，补充用户账户和密码等信息后回车进入下一步
    <img width="2598" height="956" alt="image" src="https://github.com/user-attachments/assets/7476aed2-1bbc-4517-a54a-b1dd18fc548b" />

18. 升级页面，提示是否要升级到 Ubuntu Pro，注意不要升级，确认选择了 Skip for now，然后光标在 Continue 上，点击回车进入下一步
    <img width="2516" height="1938" alt="image" src="https://github.com/user-attachments/assets/90743c81-614a-4057-baa9-b2aea403beef" />

19. SSH 配置，需要手动选择 Install OpenSSH Server，然后光标移动到 Done，回车进入下一步
    <img width="2564" height="1926" alt="image" src="https://github.com/user-attachments/assets/3706d5d0-630d-43de-94bb-e92b4754d1d1" />

20. 系统功能自定义安装配置，默认不做任何选择，将光标移动至 Done，点击回车进入下一步
    <img width="2574" height="1914" alt="image" src="https://github.com/user-attachments/assets/382f2978-d578-41a2-a736-830627a8b24e" />

21. 开始根据配置安装 Ubuntu 系统，当选项框出现 Reboot Now 后，光标移动到这个选项然后回车，系统开始重启
    <img width="2612" height="1918" alt="image" src="https://github.com/user-attachments/assets/6dcff921-b753-418b-b7f6-95fdf8c9e197" />

    <img width="2526" height="1920" alt="image" src="https://github.com/user-attachments/assets/57630a67-87e1-4f24-95c8-112c89ca5928" />

22. 等待系统重启完成后，如果展示如下内容，则回车继续执行
    <img width="2494" height="1230" alt="image" src="https://github.com/user-attachments/assets/d41961e1-1eed-477e-bfb3-38cc3def5d0f" />

23. 执行完成后会出现如下的登录页面，先输入账户名称回车；提示输入密码，则输入密码后回车就可以登录 Ubuntu 系统了。
    <img width="2484" height="1418" alt="image" src="https://github.com/user-attachments/assets/1b49744c-82a2-4098-a46e-23c5c262a948" />

24. 如下图显示 Welcome to Ubuntu 则说明登录成功，可以执行相关命令操作。
    <img width="1952" height="1526" alt="image" src="https://github.com/user-attachments/assets/8ea1092d-7156-4d8d-bc0e-c83648964a34" />



### Ubuntu 系统使用
#### 基础命令
```bash
# 查看 ip 地址信息
ip addr


# 远程连接 执行后输入密码
ssh ubuntu@192.168.8.33

```


### Ubuntu 系统使用远程 SSH 登录
在绿联NAS的虚拟机中安装Ubuntu系统，可通过SSH（命令行）或远程桌面（图形界面）进行远程登录。您需要在绿联虚拟机后台获取分配的IP地址，并在Ubuntu系统中开启相应的服务。

####  获取Ubuntu虚拟机IP
1. 登录绿联NAS的 UGOS Pro 系统，进入 **虚拟机** 管理界面。
2. 启动您的 Ubuntu 虚拟机，通过虚拟机控制台（VNC）进入系统。
3. 打开终端，输入命令 `ip a` 或 `ifconfig`，记下虚拟机的 **局域网IP地址**（例如：\(192.168.10.100\)）。
```bash
# ubuntu 系统
ip addr

# linux
ifconfig
```

#### SSH 远程登录（命令行）
```bash
# **Ubuntu端**：确保虚拟机中安装并开启了SSH服务。
sudo apt update
sudo apt install openssh-server
sudo systemctl enable ssh
sudo systemctl start ssh

# 查看 ssh 状态
sudo systemctl status ssh

# 检查 Ubuntu 防火墙状态
sudo ufw allow 22/tcp
sudo ufw enable

# **电脑端**：在 Windows 电脑上打开命令提示符（cmd）或使用终端软件（如 [PuTTY](https://www.putty.org/) 或 [MobaXterm](https://mobaxterm.mobatek.net/)），输入以下命令：
ssh your_ubuntu_username@your_ubuntu_ip
ssh ubuntu@192.168.8.33
```

#### ssh: connect to host 192.168.8.24 port 22: Connection refused 
Connection refused 这个错误非常明确，它表示你的网络是通的（能到达目标 IP），但 192.168.8.24 的 22 端口主动拒绝了连接。

这通常不是网络故障，而是目标服务器本身的问题。结合你之前对这台机器进行的大量折腾（磁盘爆满、pyenv 重编、各种依赖修复），极有可能是 SSH 服务崩溃或未启动。可以按以下优先级排查：
1. 登录控制台或虚拟机，确认 ip 地址是否正确，有时候可能 ip 发生了动态变化
2. 检查 SSH 服务状态（最常见原因），通过控制台 VNC、串口或物理显示器登录到机器
```bash
# 查看 sshd 服务状态
systemctl status sshd   # CentOS/RHEL
systemctl status ssh    # Ubuntu/Debian

# 如果显示 inactive/dead/failed，尝试启动并查看报错
sudo systemctl restart sshd
journalctl -xeu sshd --no-pager | tail -30
```
3.  检查防火墙 / TCP Wrappers，如果服务正常且端口监听正确，可能是被拦截了
```bash
# 检查 iptables/nftables 是否有 DROP/REJECT 规则
sudo iptables -L -n | grep 22
sudo nft list ruleset | grep 22

# 检查 TCP Wrappers（老系统常见）
cat /etc/hosts.deny | grep sshd
cat /etc/hosts.allow | grep sshd
```



### Ubuntu 系统安装复制工具
绿联NAS的虚拟机网页控制台（VNC）目前尚未原生支持与宿主机跨屏复制粘贴文本。若需在Ubuntu虚拟机中传输文本，需要通过安装虚拟机增强工具并使用“远程桌面（RDP/VNC）”软件，或者使用浏览器网页版剪贴板中转来实现。

**安装增强工具**：在Ubuntu虚拟机内打开终端，输入以下命令安装剪贴板支持包，并重启虚拟机：
```bash
sudo apt update
sudo apt install open-vm-tools open-vm-tools-desktop
sudo reboot
```


### Ubuntu 系统安装 OpenClaw
```bash
# 安装最新版openclaw
curl -fsSL https://gh-proxy.com/https://raw.githubusercontent.com/Daiyimo/openclaw-setup-Ubuntu/main/scripts/setup.sh | sudo bash
```



### 参考文档
 [绿联NAS搭建ubuntu虚拟机安装宝塔面板保姆级教程 - WordPress极简博客](https://www.wpon.cn/38460.html) 
 
 [绿联NAS如何创建虚拟机？](https://www.ugnas.com/tutorial-detail/id-59.html) 
 [在绿联云NAS上安装Ubuntu虚拟机 | InsectMk的个人空间](https://insectmk.cn/posts/3047c294/) 
 [(99+ 封私信 / 1 条消息) 安装 Ubuntu Server 24.04 LTS 图文教程 - 知乎](https://zhuanlan.zhihu.com/p/698434939) 
 [绿联NAS私有云社区【养虾活动】虚拟机快速安装openclaw教程 - 更懂你的数据中心](https://club.ugnas.com/thread-3184-1-1.html) 
  [绿联NAS私有云社区虚拟机 - 更懂你的数据中心](https://club.ugnas.com/forum-71-1.html) 
   [绿联NAS私有云社区【实用教程】一招搞定虚拟机远程访问——Lucky端口转发+绿联原生远程访问 - 更懂你的数据中心](https://club.ugnas.com/forum.php?mod=viewthread&tid=2695&highlight=%E8%99%9A%E6%8B%9F%E6%9C%BA) 
[绿联NAS通过虚拟机安装debian12 - 记录,分享 - 子夜松声](https://xyzbz.cn/archives/1402/) 
 [在绿联云NAS上安装Ubuntu虚拟机 | InsectMk的个人空间](https://insectmk.cn/posts/3047c294/) 
