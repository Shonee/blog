---
title: Redis 面试必知必会
date: 2026-07-07
category: java
tags:
  - 面试
---

# Redis 面试必知必会 —— Java 开发工程师版

> 面向 Java 后端/全栈开发工程师的 Redis 核心知识体系，覆盖原理、实战与高频面试题。
> 最后更新：2026-07-06

---

## 一、Redis 为什么快？—— 线程模型与 IO 多路复用

### 1.1 单线程模型的优势

Redis 核心命令处理采用**单线程模型**，高性能的原因在于：

- **纯内存操作**：所有读写在内存中完成，纳秒级响应
- **IO 多路复用**：利用 `epoll`（Linux）/ `kqueue`（macOS）在一个线程内同时处理成千上万个并发连接
- **零锁竞争**：不存在线程上下文切换、竞态条件和锁开销

### 1.2 IO 多路复用原理（epoll）

```
┌──────────────────────────────────────────────┐
│            IO 多路复用器 (epoll)               │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐     │
│  │ FD 1 │  │ FD 2 │  │ FD 3 │  │ FD N │     │
│  └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘     │
│     └──────────┴──────────┴──────────┘        │
│              就绪事件队列                       │
└──────────────────┬───────────────────────────┘
                   ▼
          ┌────────────────┐
          │  单线程事件循环  │
          │ 读→解析→执行→写  │
          └────────────────┘
```

- **事件驱动（回调）**：不遍历所有 FD，只处理活跃连接，时间复杂度 O(1)
- **红黑树管理 FD**：支持几乎无限的并发连接
- **减少内存拷贝**：初始化时仅拷贝一次 FD 集合

### 1.3 Redis 6.0 多线程演进

Redis 6.0 引入多线程 IO，但**命令执行仍然是单线程**：

| 阶段 | 线程模型 |
|------|---------|
| 网络数据读写 | 多线程并行 |
| 协议解析 | 多线程并行 |
| **命令执行** | **单线程（不变）** |

优势：网络吞吐量大幅提升，同时保持无锁、无竞态的核心简洁性。

### 1.4 高频面试题

**Q：Redis 单线程为什么还能处理高并发？**

A：Redis 的瓶颈通常是网络带宽和内存，而非 CPU。单线程避免了锁竞争和上下文切换开销，配合 IO 多路复用，一个线程即可处理数万并发连接。6.0 后网络 IO 也多线程化了，命令执行仍保持单线程以确保原子性。

---

## 二、核心数据结构与底层编码

### 2.1 五种基础数据类型

| 类型 | 常用命令 | 典型场景 |
|------|---------|---------|
| **String** | GET/SET/INCR/DECR | 缓存、计数器、分布式锁、Session 共享 |
| **Hash** | HGET/HSET/HGETALL | 对象属性存储（用户信息、商品详情） |
| **List** | LPUSH/RPUSH/LPOP/LRANGE | 消息队列、最新动态、文章列表 |
| **Set** | SADD/SMEMBERS/SINTER/SUNION | 标签系统、共同好友、抽奖去重 |
| **ZSet (Sorted Set)** | ZADD/ZRANGE/ZRANGEBYSCORE | 排行榜、延迟队列、带权重的优先队列 |

### 2.2 三种扩展类型

| 类型 | 用途 |
|------|------|
| **Bitmap** | 签到打卡、在线状态、布隆过滤器 |
| **HyperLogLog** | UV 统计（基数估算，误差约 0.81%，内存仅 12KB） |
| **GEO** | 地理位置计算（附近的人、距离排序） |

### 2.3 底层数据结构

Redis 的每种数据类型都由多种底层编码实现，根据数据量自动切换：

#### SDS（简单动态字符串）

String 类型的底层实现，相比 C 原生字符串：

- **预分配空间**：减少内存重分配次数
- **O(1) 获取长度**：记录 `len` 和 `free` 字段
- **二进制安全**：可存储任意数据（包括图片、序列化对象）
- **结构**：`struct sdshdr { int len; int free; char buf[]; }`

#### 跳表（Skip List）

ZSet 的核心底层结构，替代平衡树的优势：

- **实现简单**：比红黑树、AVL 树容易实现
- **范围查找高效**：天然支持 `ZRANGEBYSCORE` 等范围查询
- **插入/删除快**：平均 O(logN)，无需旋转操作

```
Level 3:  1 ───────────────────────────────> NIL
Level 2:  1 ──────── 4 ────────────────────> NIL
Level 1:  1 ── 2 ── 4 ── 5 ── 6 ── 8 ── 9 ─> NIL
Level 0:  1 ── 2 ── 3 ── 4 ── 5 ── 6 ── 7 ── 8 ── 9 ─> NIL
```

#### 压缩列表（ZipList）→ 快速列表（QuickList）

- **ZipList**：连续内存存储，适合小数据量，减少内存碎片
- **QuickList**（3.2+）：双向链表 + ZipList 的混合结构，兼顾插入效率和内存紧凑
- **ListPack**（7.0+）：替代 ZipList，解决连锁更新问题

#### 字典（Dict）

- Hash 类型的底层实现
- 采用渐进式 rehash：扩容时分批迁移数据，避免一次性阻塞

#### 整数集合（IntSet）

- Set 类型在元素全为整数且数量较少时使用
- 紧凑的连续内存数组，支持二分查找

### 2.4 编码自动转换规则

| 数据类型 | 小数据量编码 | 大数据量编码 |
|---------|-------------|-------------|
| String | embstr（≤44字节） | raw（SDS） |
| Hash | ziplist / listpack | hashtable |
| List | quicklist（ziplist+链表） | quicklist |
| Set | intset | hashtable |
| ZSet | ziplist / listpack | skiplist + hashtable |

---

## 三、持久化机制

### 3.1 RDB 快照

**原理**：`bgsave` 命令 fork 子进程，利用操作系统的 **COW（写时复制）** 技术，主进程继续处理请求，子进程将内存数据写入 RDB 文件。

**触发方式**：
- `save`：阻塞主进程（生产禁用）
- `bgsave`：后台执行（推荐）
- 配置规则自动触发：
  ```redis
  save 900 1       # 900秒内至少1个key修改
  save 300 10      # 300秒内至少10个key修改
  save 60 10000    # 60秒内至少10000个key修改
  ```

**COW 注意事项**：
- fork 操作本身是阻塞的（大内存实例 fork 耗时长）
- 高并发写入会导致大量内存页复制，产生额外内存开销
- **必须禁用 Linux THP（透明大页）**：默认 2MB 大页会使 COW 内存消耗最高放大 512 倍，极易引发 OOM

**缺点**：两次快照间隔期间的数据有丢失风险。

### 3.2 AOF 追加日志

**原理**：以命令日志形式记录每一次写操作。

**工作流程**：命令执行 → 追加至缓冲区 → `write` 写入内核缓存 → `fsync` 刷盘

**刷盘策略**：

| 策略 | 行为 | 数据安全 | 性能 |
|------|------|---------|------|
| `always` | 每次写命令立即刷盘 | 最高 | 最差 |
| `everysec` | 每秒刷盘一次（默认） | 较高（最多丢 ~2s 数据） | 较好 |
| `no` | 由操作系统决定 | 不可控 | 最好 |

**AOF 重写**：通过子进程读取当前内存状态生成新文件以压缩体积。配置阈值自动触发：
```redis
auto-aof-rewrite-percentage 100  # 增长超过100%触发
auto-aof-rewrite-min-size 64mb
```

**7.0 优化**：引入 "Multi-Part AOF"，将文件拆分为 BASE、INCR 和 HISTORY 三部分，消除重写期间的双写与内存缓冲开销。

### 3.3 混合持久化（4.0+）

重写时将内存快照以**二进制格式**写入文件头部，增量命令以**文本格式**追加至尾部。结合了 RDB 的快速恢复与 AOF 的数据安全性。

> **加载优先级**：若同时开启 RDB 和 AOF，重启时优先加载 AOF 以保证数据最完整。

### 3.4 生产选型建议

| 场景 | 推荐方案 |
|------|---------|
| 核心业务 | 混合持久化模式 |
| 纯缓存场景 | 关闭持久化或仅用低频 RDB |
| 主从架构 | 主节点关闭持久化，从节点开启 AOF |

**核心监控指标**：
- `rdb_last_cow_size`：COW 内存开销
- `aof_delayed_fsync`：主线程阻塞次数
- `mem_fragmentation_ratio`：内存碎片率

---

## 四、主从复制

### 4.1 核心标识

- **replid（Replication ID）**：数据集的唯一标记，Master 拥有唯一 replid，Slave 继承
- **offset（偏移量）**：记录在 `repl_backlog` 中的数据偏移量，用于判断数据新旧

### 4.2 全量同步

**触发时机**：Slave 首次连接 / replid 不一致 / 断开过久导致 offset 数据被覆盖

**流程**：
1. Master 执行 `bgsave` 生成 RDB 发送给 Slave
2. Slave 清空本地数据并加载 RDB
3. Master 将生成 RDB 期间的新命令记录在 `repl_backlog` 并持续发送给 Slave

### 4.3 增量同步

基于 `repl_backlog`（一个固定大小的**环形数组**）：

1. Slave 提交自己的 offset
2. Master 获取该 offset 之后的命令发送给 Slave
3. 若环形数组写满覆盖了 Slave 尚未备份的数据，则退化为全量同步

### 4.4 优化建议

- 开启无磁盘复制：`repl-diskless-sync yes`，避免全量同步时的磁盘 IO
- 适当增大 `repl_backlog` 大小（默认 1MB），避免短暂宕机引发全量同步
- 过多 Slave 时采用**主-从-从链式结构**减轻 Master 压力

---

## 五、哨兵机制（Sentinel）

### 5.1 监控原理

Sentinel 每秒向实例发送 `ping`：

- **主观下线（SDOWN）**：单个 Sentinel 发现实例超时未响应
- **客观下线（ODOWN）**：超过 `quorum` 个 Sentinel 认为该实例下线（建议 quorum > Sentinel 总数 / 2）

### 5.2 故障恢复 —— 选举新 Master

优先级排序规则：
1. 排除断开时间过长的 Slave
2. `slave-priority` 值越小优先级越高（0 表示永不参与）
3. `offset` 值越大，数据越新，优先级越高
4. 运行 ID 越小优先级越高

### 5.3 切换流程

```
1. Sentinel 向备选 Slave 发送 slaveof no one → 提升为 Master
2. Sentinel 向其他 Slave 发送 slaveof 新MasterIP 端口
3. 将故障节点标记为 Slave，待其恢复后自动加入集群
```

### 5.4 脑裂问题

当 Master 与 Sentinel 之间网络分区时，Sentinel 可能选举出新 Master，导致出现两个 Master 同时接收写入，数据不一致。

**预防措施**：
```redis
min-replicas-to-write 1    # 至少有1个从节点正常同步才允许写入
min-replicas-max-lag 10    # 从节点延迟不超过10秒
```

---

## 六、Redis Cluster 分片集群

### 6.1 哈希插槽（Hash Slot）

集群将数据映射到 **0~16383 共 16384 个插槽**：

- **路由算法**：`CRC16(key) % 16384`
- **Hash Tag**：若 Key 包含 `{}`（如 `{user:1001}.name`），仅对 `{}` 内内容计算 Hash，可将同类数据强制路由到同一实例

### 6.2 集群通信 —— Gossip 协议

节点间通过 Gossip 协议交换状态信息：
- **PING/PONG**：心跳检测
- **MEET**：新节点加入
- **FAIL**：标记节点故障

### 6.3 故障转移

1. Master 宕机被集群多数节点确认
2. 该 Master 的 Slave 发起选举
3. 获得多数 Master 投票后提升为新 Master
4. 旧 Master 重启后自动降级为 Slave

### 6.4 集群伸缩

```bash
# 添加节点
redis-cli --cluster add-node new_host:port existing_host:port

# 重新分片（迁移插槽）
redis-cli --cluster reshard host:port

# 删除节点
redis-cli --cluster del-node host:port node_id
```

---

## 七、缓存三大经典问题

### 7.1 缓存穿透

**定义**：查询**不存在**的数据，请求绕过缓存直达数据库。

**解决方案**：

| 方案 | 原理 | 优缺点 |
|------|------|--------|
| **缓存空对象** | 查询结果为空也缓存，设置短 TTL | 简单有效，但浪费内存 |
| **布隆过滤器** | 将所有合法 Key 加入过滤器，请求先查过滤器 | 存在误判率，不能删除 |
| **参数校验** | 在入口层拦截非法参数 | 基础防护 |

### 7.2 缓存击穿

**定义**：某个**热点 Key** 过期瞬间，大量并发请求同时打到数据库。

**解决方案**：

| 方案 | 原理 | 适用场景 |
|------|------|---------|
| **互斥锁（SETNX）** | 只允许一个线程重建缓存，其余等待 | 强一致性场景 |
| **逻辑过期** | 缓存不设置 TTL，由业务代码判断是否过期并异步更新 | 允许短暂不一致 |
| **TTL 加随机偏移** | 避免大量 Key 同时过期 | 基础防护 |

### 7.3 缓存雪崩

**定义**：**大量 Key 同时过期** 或 **Redis 服务宕机**，导致所有请求打到数据库。

**解决方案**：
- **高可用架构**：Sentinel / Cluster 保证 Redis 不宕机
- **TTL 随机化**：在基础过期时间上加随机偏移量，避免集中过期
- **限流降级**：熔断器（Sentinel/Hystrix）保护后端数据库
- **多级缓存**：本地缓存（Caffeine）+ Redis + 数据库

---

## 八、缓存与数据库双写一致性

### 8.1 常见方案对比

| 方案 | 原理 | 一致性 | 复杂度 |
|------|------|--------|--------|
| **Cache Aside（旁路缓存）** | 读：先缓存，miss 则查 DB 并回填；写：先更新 DB，再删缓存 | 较高 | 低 |
| **延迟双删** | 先删缓存 → 更新 DB → 延迟再删缓存 | 中等 | 中 |
| **先更新 DB 再删缓存** | 更新数据库后删除缓存 | 较高（极端情况仍有不一致） | 低 |
| **Canal + Binlog** | Canal 监听 MySQL binlog，异步更新缓存 | 高 | 高 |

### 8.2 Cache Aside 模式详解

这是业界最推荐的标准模式：

```
读取流程：
  1. 查缓存 → 命中则返回
  2. 未命中 → 查数据库 → 写入缓存 → 返回

写入流程：
  1. 更新数据库
  2. 删除缓存（而非更新缓存）
```

**为什么是删缓存而非更新缓存？**
- 避免并发写导致的脏数据
- 懒加载思想：下次读时再重建，减少无效写

### 8.3 Canal + Binlog 方案

```
┌──────────┐    binlog    ┌──────────┐    消息    ┌──────────┐
│  MySQL   │ ──────────> │  Canal   │ ────────> │  Redis   │
│  (主库)   │             │ (解析器)  │           │  (缓存)   │
└──────────┘             └──────────┘           └──────────┘
```

优势：数据一致性最好，业务代码无侵入
劣势：引入新中间件，运维复杂度增加

### 8.4 兜底策略

无论采用哪种方案，都应**为缓存设置 TTL 作为兜底**，即使删除失败，缓存也会在过期后自动更新。

---

## 九、分布式锁

### 9.1 基本实现（SET NX EX）

```redis
SET lock_key unique_value NX EX 30
```

- `NX`：不存在才设置（互斥）
- `EX 30`：设置过期时间（防死锁）
- `unique_value`：唯一标识（防误删）

**Lua 脚本安全释放锁**：
```lua
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
```

### 9.2 Redisson 分布式锁

**核心特性**：
- **看门狗（Watchdog）自动续期**：默认每 10s 续期一次，续到 30s
- **可重入锁**：同一线程可多次获取
- **RedLock 支持**：多节点分布式锁

```java
RLock lock = redisson.getLock("myLock");
try {
    lock.lock();
    // 业务逻辑
} finally {
    lock.unlock();
}
```

### 9.3 Redlock 算法

为了解决单 Master 锁在主从切换时丢失的问题：

1. 向 N 个独立的 Redis 节点依次请求加锁
2. 如果在超时时间内成功获取超过 N/2 + 1 个节点的锁，则认为加锁成功
3. 锁的有效时间 = 最小 TTL - 获取锁的总耗时

**争议**：Martin Kleppmann（分布式系统专家）指出 Redlock 在时钟跳跃、GC 停顿等场景下不安全。Antirez（Redis 作者）反驳认为在合理配置下是安全的。

### 9.4 Fencing Token 兜底方案

无论用什么分布式锁，都应配合 **Fencing Token**（单调递增的令牌）防止锁失效后的脏写：

```
1. 客户端 A 获取锁，获得 token = 33
2. 锁过期，客户端 B 获取锁，获得 token = 34
3. 客户端 A 带着 token=33 写数据库
4. 数据库检查：34 > 33，拒绝 A 的写入
```

---

## 十、过期策略与内存淘汰

### 10.1 过期键删除策略

Redis 采用**惰性删除 + 定期删除**的组合：

| 策略 | 原理 | 优缺点 |
|------|------|--------|
| **惰性删除** | 访问 Key 时检查是否过期 | 内存不友好，过期 Key 不被访问则一直占用 |
| **定期删除** | 每隔一段时间（`hz` 参数，默认 100ms）随机抽查一批 Key，删除过期的 | 平衡 CPU 和内存 |

### 10.2 内存淘汰策略（maxmemory-policy）

当内存达到 `maxmemory` 时触发淘汰：

| 策略 | 范围 | 说明 |
|------|------|------|
| `noeviction` | - | 不淘汰，写入报错（默认） |
| `allkeys-lru` | 所有 Key | 淘汰最近最少使用的（最常用） |
| `allkeys-lfu` | 所有 Key | 淘汰最不经常使用的（4.0+） |
| `allkeys-random` | 所有 Key | 随机淘汰 |
| `volatile-lru` | 设置了 TTL 的 Key | LRU 淘汰 |
| `volatile-lfu` | 设置了 TTL 的 Key | LFU 淘汰 |
| `volatile-random` | 设置了 TTL 的 Key | 随机淘汰 |
| `volatile-ttl` | 设置了 TTL 的 Key | 淘汰剩余 TTL 最短的 |

### 10.3 LRU vs LFU

- **LRU（Least Recently Used）**：Redis 采用**采样近似 LRU**，默认采样 5 个 Key（`maxmemory-samples 5`），淘汰其中最久未使用的
- **LFU（Least Frequently Used）**：使用**对数计数器**记录访问频率，避免计数器溢出，更能反映长期访问模式

**选型建议**：
- 偶发性热点数据 → LRU（避免长期低频数据占位）
- 稳定热点数据 → LFU（更精准识别高频 Key）

---

## 十一、事务、Lua 与 Pipeline

### 11.1 Redis 事务

```redis
MULTI          # 开始事务
SET key1 val1
SET key2 val2
EXEC           # 执行事务
```

**事务特性**：
- **不支持回滚**：命令执行出错时，其他命令仍会继续执行
- **原子性有限**：命令要么全部执行，要么全不执行（WATCH 被触发时），但不支持部分回滚
- **WATCH 乐观锁**：监视 Key，EXEC 时若被修改则事务失败

### 11.2 Lua 脚本

```redis
EVAL "return redis.call('set', KEYS[1], ARGV[1])" 1 mykey myvalue
```

**优势**：
- **原子执行**：整个脚本作为一个命令执行，不会被其他命令插入
- **减少网络开销**：多条命令一次网络往返
- **可复用**：`SCRIPT LOAD` + `EVALSHA` 避免重复传输脚本

**生产建议**：
- 脚本尽量简短，避免长时间阻塞
- 使用 `EVALSHA` 而非 `EVAL` 减少网络传输

### 11.3 Pipeline（管道）

```
客户端                     服务端
  |                          |
  |--- cmd1 ---|             |
  |--- cmd2 ---|             |
  |--- cmd3 ---|  ────────>  |
  |                          |  批量执行
  |<-- res1 ---|             |
  |<-- res2 ---|             |
  |<-- res3 ---|  <────────  |
```

- 将多条命令打包一次发送，减少 **RTT（往返时延）**
- 不保证原子性（与 Lua 的区别）
- 适合批量操作场景（如批量初始化数据）

### 11.4 三者对比

| 特性 | 事务 | Lua | Pipeline |
|------|------|-----|----------|
| 原子性 | 有限 | 完全 | 无 |
| 网络开销 | 多次 | 一次 | 一次 |
| 可编程性 | 低 | 高 | 低 |
| 回滚支持 | 不支持 | 不支持 | 不适用 |
| 推荐场景 | WATCH 乐观锁 | 复杂逻辑原子操作 | 批量命令加速 |

---

## 十二、大Key 与热Key 问题

### 12.1 大Key 问题

**定义**：
- String 类型 value 超过 **10MB**
- 集合类型（Set/ZSet/Hash）元素超过 **10万+**

**危害**：
- 阻塞 Redis 主线程（Redis 是单线程执行命令的）
- 导致其他请求超时
- 集群中造成节点负载与数据倾斜

**排查方法**：

| 方法 | 说明 |
|------|------|
| `redis-cli --bigkeys` | 全局扫描，找出每种数据结构的最大 Key |
| `MEMORY USAGE <key>` | 检查指定 Key 的内存占用（4.0+） |
| `redis-cli --memkeys` | 按内存排序列出所有 Key |
| **rdbtools** | 离线解析 RDB 快照文件分析 |
| **SCAN + 脚本** | 自定义脚本结合 SCAN 遍历统计 |

**解决方案**：
- **拆分**：按业务维度或时间范围拆分为多个小 Key
- **压缩**：使用 LZF 等压缩算法
- **替代存储**：大文件迁移到 MinIO/Ceph，Redis 仅存元数据引用
- **安全删除**：使用 `UNLINK` 代替 `DEL`（异步后台删除）

### 12.2 热Key 问题

**定义**：短时间内被**极高频率访问**的 Key（QPS 可达数万至百万级）

**发现方法**：

| 方法 | 说明 |
|------|------|
| `redis-cli --hotkeys` | 快速定位热 Key |
| `MONITOR` 命令 | 调试环境短暂开启（生产慎用，性能损耗大） |
| 客户端埋点 | 记录访问频次，结合 Prometheus 分析 |
| 代理层统计 | 在 Twemproxy/Codis 等代理层统计 |

**解决方案**：
- **本地缓存拦截**：应用层部署 Caffeine/Guava Cache
- **多副本分散**：热 Key 加不同后缀分散到多个分片
- **读写分离**：读流量引流至从节点
- **降级限流**：超限返回默认值/兜底数据

---

## 十三、高频应用场景速查

| 场景 | Redis 方案 | 关键命令/结构 |
|------|-----------|-------------|
| 排行榜 | ZSet | ZADD / ZRANGE / ZREVRANGE |
| 计数器 | String | INCR / DECR / INCRBY |
| 分布式锁 | String + Lua | SET NX EX + Lua 解锁 |
| 延迟队列 | ZSet（score = 执行时间戳） | ZADD / ZRANGEBYSCORE |
| 限流器 | String / Lua 脚本 | INCR + EXPIRE / 令牌桶算法 |
| 消息队列 | List | LPUSH + BRPOP（阻塞式） |
| Session 共享 | Hash / String | SET / GET |
| 共同好友 | Set | SINTER（交集） |
| 签到打卡 | Bitmap | SETBIT / GETBIT / BITCOUNT |
| UV 统计 | HyperLogLog | PFADD / PFCOUNT |
| 附近的人 | GEO | GEOADD / GEORADIUS / GEOSEARCH |
| 抽奖系统 | Set | SADD / SPOP / SRANDMEMBER |
| 布隆过滤器 | Bitmap / RedisBloom 模块 | 自定义 / BF.ADD |
| 限流（令牌桶） | Lua 脚本 | 原子化令牌桶算法 |

---

## 十四、生产环境配置与优化

### 14.1 内存配置

```redis
maxmemory 4gb                    # 必须设置，建议物理内存的 50%~70%
maxmemory-policy allkeys-lru     # 淘汰策略
maxmemory-samples 10             # LRU 采样数（默认5，高命中率可调10）
```

### 14.2 持久化配置

```redis
# RDB
save 900 1
save 300 10
rdbcompression no                # 压缩消耗CPU，建议关闭

# AOF
appendonly yes
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# 混合持久化（4.0+）
aof-use-rdb-preamble yes
```

### 14.3 安全与性能配置

```redis
# 懒删除（4.0+，避免大Key删除阻塞主线程）
lazyfree-lazy-eviction yes
lazyfree-lazy-expire yes
lazyfree-lazy-server-del yes

# 主从优化
repl-diskless-sync yes           # 无磁盘复制
repl-backlog-size 64mb           # 增大环形缓冲区
min-replicas-to-write 1          # 防脑裂
min-replicas-max-lag 10

# 网络
timeout 300                      # 空闲连接超时
tcp-keepalive 60                 # 心跳保活
hz 20                            # 高并发可调至20~50，禁止超过100
```

### 14.4 关键监控指标

| 指标 | 含义 | 告警阈值参考 |
|------|------|-------------|
| `used_memory` | 已用内存 | 接近 maxmemory 时告警 |
| `mem_fragmentation_ratio` | 内存碎片率 | > 1.5 需关注 |
| `connected_clients` | 连接数 | 接近 maxclients 时告警 |
| `blocked_clients` | 阻塞中的客户端 | > 0 需关注 |
| `rejected_connections` | 被拒绝的连接 | > 0 需扩容 |
| `keyspace_misses` / `keyspace_hits` | 缓存命中率 | < 90% 需优化 |
| `rdb_last_cow_size` | RDB COW 内存开销 | 异常增大需关注 |
| `aof_delayed_fsync` | AOF 阻塞次数 | > 0 需关注 |

---

## 十五、高频面试题精选

### Q1：Redis 为什么用跳表而不用红黑树实现 ZSet？

A：跳表实现简单、代码可读性高；范围查找天然高效（链表遍历即可）；插入删除不需要旋转操作；并发友好（未来可扩展为无锁结构）。红黑树虽然最坏情况更优，但范围查找需要中序遍历，实现复杂度高。

### Q2：Redis 如何保证缓存与数据库的一致性？

A：推荐使用 Cache Aside 模式（先更新 DB，再删缓存），配合 TTL 兜底。对一致性要求极高的场景可引入 Canal 监听 Binlog 异步更新缓存。延迟双删可作为补充但延迟时间难以精确把控。

### Q3：Redis 分布式锁如何防止死锁和误删？

A：死锁通过设置过期时间（EX）防止；误删通过唯一标识（UUID）+ Lua 脚本原子删除防止；锁续期通过 Redisson 看门狗机制实现。

### Q4：缓存穿透、击穿、雪崩的区别和解决方案？

A：穿透是查不存在的数据（布隆过滤器 + 缓存空对象）；击穿是热点 Key 过期（互斥锁 + 逻辑过期）；雪崩是大量 Key 同时过期或 Redis 宕机（TTL 随机化 + 高可用 + 限流降级）。

### Q5：Redis Cluster 如何分配数据？节点故障如何处理？

A：使用 CRC16 哈希算法将 Key 映射到 16384 个插槽，每个 Master 负责一部分插槽。节点故障时，Sentinel 或集群内部选举机制将 Slave 提升为 Master，旧节点恢复后自动降级为 Slave。

### Q6：Redis 持久化时 fork 子进程的原理是什么？有什么风险？

A：利用操作系统的 COW（写时复制）机制，fork 后父子进程共享内存页，仅当父进程写入时才复制对应页。风险在于高并发写入时 COW 内存开销大，必须禁用 Linux THP 防止内存放大。

### Q7：Redis 的 LRU 和 LFU 有什么区别？怎么选？

A：LRU 淘汰最近最少使用的（采样近似），LFU 淘汰最不经常使用的（对数计数器）。偶发性热点选 LRU，稳定热点选 LFU。Redis 的 LRU 不是真正的 LRU，而是采样近似，可通过增大 `maxmemory-samples` 提高精度。

### Q8：Pipeline 和 Lua 脚本有什么区别？

A：Pipeline 打包多条命令减少网络 RTT，但不保证原子性；Lua 脚本在服务端原子执行，保证原子性但需要编写脚本逻辑。批量操作选 Pipeline，需要原子性的复杂逻辑选 Lua。

### Q9：Redis 大Key 有什么危害？如何排查和处理？

A：大Key 会阻塞主线程导致其他请求超时，造成数据倾斜。排查用 `redis-cli --bigkeys`、`MEMORY USAGE` 或 rdbtools。处理方案包括拆分、压缩、迁移到其他存储、使用 `UNLINK` 异步删除。

### Q10：Redis 过期键的删除策略是什么？

A：惰性删除 + 定期删除的组合。惰性删除在访问 Key 时检查过期；定期删除每隔一段时间（默认 100ms）随机抽查一批 Key 删除过期的。两者互补，平衡 CPU 和内存开销。

---

## 十六、知识体系总览

```
Redis 面试必知必会
├── 一、线程模型与 IO 多路复用
│   ├── 单线程为什么快
│   ├── epoll 原理
│   └── 6.0 多线程演进
├── 二、数据结构与底层编码
│   ├── 5 种基础类型 + 3 种扩展类型
│   ├── SDS / 跳表 / ZipList / Dict / IntSet
│   └── 编码自动转换规则
├── 三、持久化机制
│   ├── RDB 快照（fork + COW）
│   ├── AOF 追加日志（三种刷盘策略）
│   └── 混合持久化 + 7.0 Multi-Part AOF
├── 四、主从复制
│   ├── 全量同步 / 增量同步
│   └── repl_backlog 环形数组
├── 五、哨兵机制
│   ├── 主观下线 / 客观下线
│   └── 故障恢复与脑裂预防
├── 六、Redis Cluster 分片集群
│   ├── 16384 哈希插槽
│   ├── Gossip 协议
│   └── 故障转移
├── 七、缓存三大问题
│   ├── 穿透（布隆过滤器）
│   ├── 击穿（互斥锁）
│   └── 雪崩（TTL 随机化 + 高可用）
├── 八、双写一致性
│   ├── Cache Aside 模式
│   ├── 延迟双删
│   └── Canal + Binlog
├── 九、分布式锁
│   ├── SET NX EX + Lua
│   ├── Redisson 看门狗
│   └── Redlock 与 Fencing Token
├── 十、过期策略与内存淘汰
│   ├── 惰性 + 定期删除
│   ├── 8 种淘汰策略
│   └── LRU vs LFU
├── 十一、事务 / Lua / Pipeline
│   ├── 事务局限性
│   ├── Lua 原子执行
│   └── Pipeline 减少 RTT
├── 十二、大Key 与热Key
│   ├── 排查方法
│   └── 解决方案
├── 十三、应用场景速查
├── 十四、生产配置与优化
└── 十五、高频面试题精选
```

---

## 参考资料

- [Redis 常见面试题 - JavaGuide](https://www.cnblogs.com/javaguide/p/redis-questions.html)
- [Redis 面试题 57 道 - 面渣逆袭](https://javabetter.cn/sidebar/sanfene/redis.html)
- [Redis 持久化机制详解 - JavaGuide](https://javaguide.cn/database/redis/redis-persistence.html)
- [Redis 过期删除策略和内存淘汰策略 - 小林coding](https://www.xiaolincoding.com/redis/module/strategy.html)
- [分布式锁实现方案详解 - JavaGuide](https://javaguide.cn/distributed-system/distributed-lock-implementations.html)
- [分布式缓存之 Redis 持久化、主从、哨兵、分片集群 - 阿里云](https://developer.aliyun.com/article/1400724)
- [Redis 缓存高频面试题深度剖析 - 腾讯云](https://cloud.tencent.com/developer/article/2304607)
- [Redis 过期键删除、内存淘汰、LRU/LFU 实现 - 阿里云](https://developer.aliyun.com/article/1732551)
- [万字详解 Redis 持久化机制 - 知乎](https://zhuanlan.zhihu.com/p/736006409)
