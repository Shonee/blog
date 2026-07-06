---
title: Kafka 面试必知必会
date: 2026-07-07
category: java
tags:
  - 面试
---

# Kafka 面试必知必会 —— Java 开发工程师版

> 面向 Java 后端/大数据开发工程师的 Kafka 核心知识体系，覆盖原理、实战场景、推拉模型对比与高频面试题。
> 最后更新：2026-07-06

---

## 一、Kafka 核心架构

### 1.1 核心组件

```
Producer ──(Push)──> Broker ──(Partition/Replica)──> Log ──(Pull)──> Consumer Group ──> Consumer
                         │
                   Controller (KRaft/ZK)
```

| 组件 | 职责 |
|------|------|
| **Producer（生产者）** | 将记录流发布到 Topic，支持批量发送和压缩 |
| **Consumer（消费者）** | 订阅 Topic 并处理记录流，通过 Offset 区分已读消息，采用 Pull 模式主动拉取 |
| **Broker（代理节点）** | 接收消息、设置偏移量、落盘存储，响应消费者读取请求 |
| **Topic（主题）** | 消息的逻辑分类，类似数据库的表 |
| **Partition（分区）** | Topic 的物理拆分单元，是有序不可变记录序列，水平扩展和并发的基本单位 |
| **Replica（副本）** | 每个分区有多份副本，分为 Leader 和 Follower，防止数据丢失 |
| **Controller** | 负责 Broker 注册、分区 Leader 选举等集群管理 |
| **Zookeeper / KRaft** | 存放元数据、Controller 选举。3.0+ 使用 KRaft（基于 Raft）替代 Zookeeper |

### 1.2 Kafka 的消息模型

Kafka 的消息（Record）包含：
- **Key**：可选，用于分区路由
- **Value**：消息内容
- **Timestamp**：时间戳
- **Headers**：可选元数据

消息被持久化为**日志（Log）**，而非传统队列的"消费即删除"模型。消息保留直到达到保留策略（时间或大小）后才被清理。

### 1.3 AMQP vs Kafka 协议对比

| 维度 | RabbitMQ (AMQP) | Kafka |
|------|----------------|-------|
| 协议类型 | 通用消息协议 | 自定义二进制协议 |
| 消息模型 | 推模式（Broker → Consumer） | 拉模式（Consumer → Broker） |
| 消息生命周期 | ACK 后物理删除 | 持久化直到保留期结束 |
| 路由能力 | 极强（Exchange + Binding） | 简单（Topic + Partition + Key） |

---

## 二、Partition 分区机制

### 2.1 分区设计目的

- **水平扩展**：分区分布在集群不同节点上，便于扩容
- **并发读写**：以 Partition 为单位进行读写，提高并发度
- **容错隔离**：单分区故障不影响其他分区

### 2.2 生产者路由策略

| 策略 | 条件 | 行为 |
|------|------|------|
| **直接指定分区** | 明确指定 Partition 编号 | 直接发送到指定分区 |
| **Key Hash 取模** | 未指定 Partition 但有 Key | `hash(Key) % Partition数`，保证同 Key 消息进入同一分区 |
| **轮询/粘性分区** | 均无指定 | 轮询或 Sticky Partitioning 均匀分布到所有分区 |

### 2.3 消费者分区分配

一个 Consumer Group 内，**每个 Partition 只能被一个 Consumer 消费**。分配算法包括：

| 算法 | 说明 |
|------|------|
| **RangeAssignor** | 按字典序排序后均分，剩余分区从前向后分配 |
| **RoundRobinAssignor** | 轮询分配，更均匀 |
| **StickyAssignor** | 尽量保持原有分配，减少 Rebalance 时的分区迁移 |

---

## 三、副本机制（ISR / AR / OSR）

### 3.1 核心概念

| 角色 | 职责 |
|------|------|
| **Leader** | 负责对外提供读写服务 |
| **Follower** | 采用 Pull 方式被动同步 Leader 数据，不对外提供写服务（2.4+ 可提供有限读服务） |

### 3.2 副本集合

```
AR (Assigned Replicas)
├── ISR (In-Sync Replicas) ← 与 Leader 保持同步的活跃副本
└── OSR (Out-of-Sync Replicas) ← 滞后过多、未同步的副本
```

- **ISR**：与 Leader 保持同步的副本集合。若 Follower 落后过多或超时未请求复制，会被 Leader 移出 ISR
- **OSR**：滞后过多、未与 Leader 同步的副本

### 3.3 Leader 选举策略

- 优先从 **ISR** 中挑选新 Leader（数据一致性好）
- 若 ISR 为空，可配置 `unclean.leader.election`：
  - `true`：允许从 OSR 中选（**会丢数据**）
  - `false`：等待旧 Leader 恢复（**保证不丢数据，但可用性降低**）

### 3.4 LEO 与 HW

| 概念 | 含义 |
|------|------|
| **LEO（Log End Offset）** | 日志末端位移，下一条消息的偏移值 |
| **HW（High Watermark）** | 高水位。≤ HW 的消息被认为"已备份"，对消费者可见。HW ≤ LEO |
| **Leader Epoch** | 为解决高水位在 Leader 连续变更时导致的数据不一致而引入 |

```
消息序列：  [0] [1] [2] [3] [4] [5] [6] [7] ...
            ↑               ↑           ↑
            已提交          HW          LEO
         (消费者可见)    (分界线)    (下一条写入位置)
```

---

## 四、消息存储机制

### 4.1 存储结构

一个 Partition 由多个 **LogSegment** 组成，每个 Segment 包含：

| 文件 | 用途 |
|------|------|
| `.log` | 消息数据文件，顺序追加写入，文件名以该段第一条 message 的 offset 命名 |
| `.index` | 偏移量稀疏索引，快速定位消息物理位置 |
| `.timeindex` | 时间戳索引，根据时间戳查找对应偏移量 |

### 4.2 消息查找过程

以查找 Offset = 23 为例：
1. 通过跳跃表 `ConcurrentSkipListMap` 定位到对应的 `.index` 文件
2. 二分查找找到不大于 23 的最大索引项（如 Offset = 20）
3. 从 `.log` 文件的对应物理位置顺序扫描至 Offset = 23

### 4.3 Segment 切分条件

| 条件 | 配置参数 |
|------|---------|
| 大小超限 | `log.segment.bytes`（默认 1GB） |
| 时间超限 | `log.roll.ms`（默认 7 天） |
| 索引文件过大 | `log.index.size.max.bytes` |
| 偏移量溢出 | 追加消息偏移量差值 > `Integer.MAX_VALUE` |

### 4.4 日志清理策略

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| **删除（Delete）** | 按时间或大小删除过期数据 | 普通日志、事件流 |
| **压缩（Compaction）** | 只保留每个 Key 最后一个版本的数据 | 需要保留最新状态（如用户画像、配置变更） |

### 4.5 索引加载方式

`.index` 和 `.timeindex` 文件通过 **mmap（内存映射）** 加载到内存，使消费者和副本同步能够直接利用内存地址进行极速检索，免去常规文件读取的开销。

---

## 五、高吞吐的四大核心原因

### 5.1 顺序写磁盘

- 放弃低效的随机写，全面拥抱**顺序追加（Append-only）**
- 消除磁盘寻道瓶颈，磁头沿相同轨道顺序写入
- 磁盘顺序写的速度接近内存随机写（约 600MB/s vs 内存随机写 ~100ns）

### 5.2 页缓存（Page Cache）

- Kafka **不自建缓存**，将缓存管理交由操作系统 Page Cache
- **写入流程**：数据先写入 OS 页缓存（内存）→ 由内核异步持久化到磁盘
- **读取流程**：基于局部性原理，近期访问的数据块驻留内存，读取直接拦截于内存层
- 结合预读机制，极大缓解物理磁盘读写压力

```
Producer ──写入──> Page Cache (内存) ──异步刷盘──> Disk (.log 文件)
                       ↑
Consumer ──读取──> 命中 Page Cache (极快)
```

### 5.3 零拷贝（Zero Copy）

消除用户态与内核态之间的无效数据搬运：

| 技术 | 适用场景 | 原理 |
|------|---------|------|
| **mmap（内存映射）** | 索引文件的随机访问 | 把文件映射进进程地址空间，规避系统调用带来的额外复制 |
| **sendfile** | 网络发送场景 | 数据直接从文件描述符传输到网络套接字，**无需经过用户空间**，配合 DMA 直通网卡 |

**传统方式**（4 次拷贝 + 4 次上下文切换）：
```
磁盘 → 内核缓冲区 → 用户空间缓冲区 → Socket 缓冲区 → 网卡
```

**零拷贝方式**（2 次拷贝 + 2 次上下文切换）：
```
磁盘 → 内核缓冲区 ──DMA──> 网卡
```

### 5.4 批量处理与压缩

| 技术 | 原理 | 效果 |
|------|------|------|
| **批量发送** | 消息按 `batch.size` 或 `linger.ms` 合并后写入 Page Cache | 减少网络请求和磁盘 I/O 次数 |
| **消息压缩** | 支持 GZIP、Snappy、LZ4、ZSTD | 减少存储空间、网络带宽消耗和磁盘 I/O 压力 |

开启压缩后单机可达每秒 **2000 万条**消息级别。

---

## 六、消息可靠性保证

### 6.1 ACK 机制（acks 配置）

| 配置值 | 行为 | 可靠性 | 延迟 |
|--------|------|--------|------|
| `acks=0` | 异步发送，不等确认 | 最低，故障时易丢数据 | 最低 |
| `acks=1` | Leader 写入即确认 | 中等，Leader 宕机且未复制时会丢数据 | 中等 |
| `acks=-1 (all)` | 等待所有 ISR 副本确认 | 最高 | 最高 |

### 6.2 重试与幂等

| 机制 | 原理 |
|------|------|
| **retries** | 配置 `retries > 0` 自动重试，应对瞬时网络故障 |
| **幂等 Producer** | 为每个 Producer 分配唯一 PID，每个 PID 对每个 Topic-Partition 维护从 0 递增的 Sequence Number。Broker 通过 `<PID, Partition, SN>` 三元组去重 |
| **事务 API** | 保证跨分区、跨 Topic 的原子性写入，配合 `isolation.level=read_committed` |

### 6.3 Exactly-Once 语义

| 层面 | 实现方式 |
|------|---------|
| **Kafka 内部** | 幂等 Producer（单分区去重）+ 事务 API（跨分区原子写入） |
| **业务层** | MySQL 唯一键约束、Redis SETNX、布隆过滤器去重 |

### 6.4 消息丢失的三个环节及解决方案

| 丢失环节 | 原因 | 解决方案 |
|---------|------|---------|
| **生产者 → Broker** | 发送后未落盘 / Leader 宕机未同步 | `acks=all`；`retries > 0`；开启幂等 Producer |
| **Broker 存储** | Leader 宕机，Follower 未同步完成 | `min.insync.replicas >= 2`；关闭 `unclean.leader.election` |
| **Broker → 消费者** | 自动提交 Offset 后、业务处理前 Consumer 崩溃 | 关闭自动提交（`enable.auto.commit=false`），业务完成后手动提交 |

---

## 七、Consumer Group 与 Rebalance

### 7.1 核心规则

- 一个 Consumer Group 内，**每个 Partition 只能被一个 Consumer 消费**
- 不同 Consumer Group 之间互不影响，可独立消费同一 Topic

### 7.2 触发 Rebalance 的条件

| 条件 | 说明 |
|------|------|
| 组成员变化 | Consumer 主动离开或崩溃被动剔除（心跳超时） |
| 订阅主题变化 | Topic 数量增减 |
| 分区数变化 | Topic 的 Partition 数量变化 |

### 7.3 Rebalance 的痛点与调优

Rebalance 会导致消费组**短暂不可用**（数分钟至数小时），严重影响 TPS。关键调优参数：

```properties
session.timeout.ms=6000        # 会话超时时间（默认 10s）
heartbeat.interval.ms=2000     # 心跳频率（session.timeout 的 1/3）
max.poll.interval.ms=300000    # poll 间隔上限（5 分钟）
max.poll.records=500           # 单次 poll 最大记录数
```

**活锁预防**：若 `max.poll.interval.ms` 超时未 Poll，消费者将主动离开消费组，以便其他 Consumer 接管。

---

## 八、消息顺序性保证

### 8.1 Kafka 的顺序性模型

- **分区内有序**：Kafka 只保证单个 Partition 内的消息有序
- **全局有序**：需将 Topic 设为单 Partition + 单 Consumer + 单线程（吞吐量极低，不推荐）

### 8.2 局部有序实现方案

```
生产者端：
  同一订单的消息 → hash(orderId) % N → 同一 Partition

消费者端：
  单 Consumer 接收 → 按 Key 分发到内存 Queue → 工作线程池顺序处理
```

| 方案 | 原理 | 适用场景 |
|------|------|---------|
| **Key Hash 路由** | 同 Key 消息路由到同一 Partition | 订单状态、用户行为 |
| **单分区单消费者** | 每个 Partition 分配一个 Consumer | 严格顺序要求 |
| **内存队列分发** | 单 Consumer 按 Key 分发到内部内存队列 | 兼顾顺序和吞吐 |

---

## 九、推拉模型深度对比

### 9.1 讨论范围

推拉模式**特指 Consumer 与 Broker 之间的交互**。Producer → Broker 默认是推模式（Producer 主动推送）。

### 9.2 推模式（Push）

**原理**：Broker 主动将消息推送给 Consumer，Consumer 被动接收。

```
Producer ──Push──> Broker ──Push──> Consumer
                        ↑
                 Broker 维护
                 Consumer 状态
```

**优点**：
- 消息实时性高，Broker 接收完消息后立刻推送
- Consumer 使用简单，只需注册监听等待消息
- 天然支持优先级队列和严格发送顺序

**缺点**：
- 推送速率难以适应消费速率，生产速率 > 消费速率时 Consumer 容易"爆仓"
- Broker 复杂度高，需维护每个 Consumer 的状态来动态调整推送速率
- 不同 Consumer 消费能力不同，Broker 难以平衡

**代表**：RabbitMQ、ActiveMQ

### 9.3 拉模式（Pull）

**原理**：Consumer 主动向 Broker 请求拉取消息，Broker 被动响应。

```
Producer ──Push──> Broker <──Pull── Consumer
                        ↑
                 Broker 保持轻量
                 无需维护 Consumer 状态
```

**优点**：
- Consumer 掌握主动权，可根据自身能力控制拉取频率和批量大小
- Broker 保持轻量级，无需维护 Consumer 状态
- 适合批量处理，Broker 可根据请求参数合理缓存并批量发送
- 消息可回溯，消费者可调整 Offset 重新消费历史数据

**缺点**：
- 消息延迟：Consumer 不断轮询，降低频率会导致延迟
- 无效请求（忙等）：长时间无新消息时拉取请求浪费资源

**代表**：Kafka、RocketMQ

### 9.4 推 vs 拉 对比总览

| 维度 | 推模式 | 拉模式 |
|------|--------|--------|
| **主动权** | Broker | Consumer |
| **实时性** | 极高 | 取决于轮询频率 |
| **Broker 复杂度** | 高（需维护 Consumer 状态） | 低（无状态） |
| **Consumer 复杂度** | 低（被动接收） | 中（需主动拉取） |
| **批量处理** | 困难 | 天然支持 |
| **消息回溯** | 不支持（ACK 后删除） | 支持（调整 Offset） |
| **流控** | Broker 控制（可能不准确） | Consumer 自行控制（精准） |
| **适用场景** | 低延迟、中小规模业务系统 | 高吞吐、大数据、日志场景 |

### 9.5 Kafka 为什么选择拉模式

| 原因 | 说明 |
|------|------|
| **存储使命** | Broker 核心使命是"接收并安全保存消息"，不应过度耦合下游消费者状态 |
| **保护中心节点** | 消费端通常因业务逻辑处理较慢而成为瓶颈，让 Consumer 按需拉取避免 Broker 被拖累 |
| **高吞吐需求** | 拉模式更适合批量处理，结合磁盘顺序读写和零拷贝技术实现百万级吞吐 |
| **消息回溯** | 拉模式天然支持调整 Offset 重新消费历史数据 |

### 9.6 RabbitMQ 如何实现推模式

RabbitMQ 基于 AMQP 协议，采用推送模型：

```
Producer → Exchange → Queue → Consumer (被动接收)
                  ↑
            Binding + RoutingKey
```

- Exchange 接收消息后根据路由规则转发到绑定的 Queue
- Queue 将消息主动推送给注册的 Consumer
- Consumer 处理完成后发送 ACK，Queue 物理删除消息
- 支持优先队列和严格的发送顺序

### 9.7 RocketMQ 长轮询拉取模式

RocketMQ 的长轮询完美结合了"推模式的低延迟"和"拉模式的低 Broker 压力"：

**Broker 端处理逻辑**：

```
Consumer 发起拉取请求
    │
    ├── 有消息 → 立即返回消息
    │
    └── 无消息 → 挂起请求（默认 30s）
                   │
                   ├── 定时检查（每 5s）→ 有新消息 → 返回
                   │
                   └── 实时唤醒（新消息到达）→ 立即返回（毫秒级）
```

**效果**：无消息时请求保持连接不断，一旦有新消息到达，Broker 在毫秒级内响应，彻底解决传统短轮询的延迟和无效请求问题。

**Consumer 端实现（PushConsumer 本质是拉模式）**：
1. `RebalanceService` 线程进行负载均衡，为每个队列生成 `pullRequest`
2. `PullMessageService` 线程不断从队列中获取请求，向 Broker 发起拉取

---

## 十、Kafka vs RabbitMQ 详细对比

### 10.1 架构差异

| 维度 | Kafka | RabbitMQ |
|------|-------|----------|
| **定位** | 分布式事件流平台，数据管道 | 通用消息代理，端到端传输 |
| **开发语言** | Scala/Java | Erlang |
| **协议** | 自定义 TCP 二进制协议 | AMQP（兼容 MQTT、STOMP） |
| **架构隐喻** | "图书馆"：消息持久化为日志，消费者自行取阅 | "邮局"：消息经路由后推送，确认后删除 |
| **核心组件** | Broker、Topic、Partition、KRaft | Exchange、Queue、Binding、RoutingKey |
| **消息模型** | 拉模式（Consumer 主动拉取） | 推模式（Broker 主动推送） |
| **消息持久化** | 消息作为日志持久化直到保留期结束，可重放 | ACK 后物理删除，不可回溯 |
| **优先级** | 不支持 | 支持优先队列 |

### 10.2 性能差异

| 维度 | Kafka | RabbitMQ |
|------|-------|----------|
| **吞吐量** | 百万级消息/秒 | 万级 QPS（单节点数千条/s） |
| **延迟** | 毫秒级（长轮询优化后接近实时） | 微秒级（推模式天然低延迟） |
| **消息大小** | 默认 1MB，可调大 | 默认 128MB |
| **并发连接** | 数千 | 数万 |

### 10.3 可靠性差异

| 维度 | Kafka | RabbitMQ |
|------|-------|----------|
| **消息存储** | 直接落盘 + Replica 副本容灾 | 内存缓存 + Mirror 镜像机制 |
| **确认机制** | acks=0/1/-1 三级可选 | Confirm + 持久化 + 手动 ACK |
| **事务消息** | 支持（事务 API） | 支持（AMQP 本地事务，可能阻塞） |
| **消息回溯** | 支持（调整 Offset） | 不支持（ACK 后删除） |
| **数据丢失风险** | acks=-1 + ISR 机制下极低 | 持久化 + 镜像集群下极低 |

### 10.4 运维差异

| 维度 | Kafka | RabbitMQ |
|------|-------|----------|
| **部署复杂度** | 较高（需配置 Zookeeper/KRaft） | 较低（开箱即用） |
| **监控** | 需额外工具（JMX、Prometheus） | 自带 Web 管理面板 |
| **扩容** | 分区级别扩容，数据需迁移 | 镜像队列全量复制，网络开销大 |
| **社区生态** | 非常丰富（大数据生态核心） | 成熟（插件生态丰富） |

### 10.5 选型建议

| 场景 | 推荐 | 原因 |
|------|------|------|
| 日志采集与分析 | **Kafka** | 高吞吐、消息可回溯、大数据生态集成 |
| 实时流处理 | **Kafka** | Kafka Streams、Flink/Spark 天然对接 |
| 业务系统（订单、支付） | **RabbitMQ** | 路由灵活、延迟低、可靠性高 |
| 中小规模项目 | **RabbitMQ** | 开箱即用、运维简单 |
| 需要消息回溯/重放 | **Kafka** | 消息持久化到保留期结束 |
| 需要复杂路由规则 | **RabbitMQ** | Direct/Fanout/Topic/Headers 四种交换机 |
| 高吞吐 + 事务消息 | **RocketMQ** | 原生事务消息、Java 生态友好 |

---

## 十一、实际项目应用场景

### 11.1 日志采集与分析

```
业务服务 → Logstash/Filebeat → Kafka Topic → ElasticSearch → Kibana
                                   ↓
                              Flink/Spark → 离线数仓
```

- 统一收集 Web/数据库等海量服务日志
- 客户端支持批量提交和消息压缩，对生产者性能几乎无感知
- 无缝对接 Hadoop（离线）和 Storm/Spark（在线）

### 11.2 流处理（推荐数据流）

```
用户点击流 → Kafka → Flink 实时计算 → 数据湖 → 机器学习模型迭代
```

- 充当流处理引擎的数据枢纽，实时过滤与聚合用户行为数据
- 生态对接：Storm、Samza、Spark、Blink、StreamCompute

### 11.3 CDC（变更数据捕获）

```
源系统事务日志 → Kafka Connect (Source) → Kafka → Kafka Connect (Sink) → ES/Redis/HBase
```

- 将数据库增量变更转化为数据流
- 用于缓存刷新、异构数据同步或备份
- Debezium 是最常用的 CDC Source Connector

### 11.4 系统监控与报警

```
采集 Agent → Kafka → Flink 聚合计算 → 监控报警平台
```

- 集中传输服务器 CPU、内存、网络等硬件指标
- 实时聚合计算，触发报警规则

### 11.5 事件溯源

- 在微服务间记录关键业务状态变更（订单创建、支付等）
- 事件持久化存储，系统故障时可重放历史消息恢复状态
- 支持审计回滚

### 11.6 异步解耦与削峰填谷

| 场景 | Kafka 方案 |
|------|-----------|
| **秒杀削峰** | 瞬时请求写入 Kafka，消费者按固定速率处理 |
| **订单异步处理** | 下单后写入 Kafka，库存/通知/积分服务异步消费 |
| **数据中转枢纽** | "一次采集，多端分发"：同一份数据被多个下游系统同时消费 |

### 11.7 网站活动跟踪

- 实时收集用户注册、登录、充值、支付等行为数据
- 按 Topic 分类，分流至实时监控、实时处理引擎或离线数仓

---

## 十二、Kafka Connect 与 Kafka Streams

### 12.1 Kafka Connect

用于将 Kafka 与外部系统进行数据集成：

| 类型 | 说明 | 典型应用 |
|------|------|---------|
| **Source Connector** | 从外部系统导入数据到 Kafka | Debezium (CDC)、JDBC Source |
| **Sink Connector** | 从 Kafka 导出数据到外部系统 | ES Sink、HDFS Sink、JDBC Sink |

### 12.2 Kafka Streams

属于 Kafka 生态的流处理库：
- 可在应用中直接消费 Kafka Topic 并进行实时计算
- 与 Flink、Storm、Spark Streaming 等外置引擎互补
- 适用于轻量级流处理需求

---

## 十三、Spring Boot 集成最佳实践

### 13.1 基础配置

```yaml
spring:
  kafka:
    bootstrap-servers: broker1:9092,broker2:9092,broker3:9092
    producer:
      acks: all                    # 等待所有 ISR 确认
      retries: 3                   # 重试次数
      batch-size: 16384            # 批量大小 16KB
      buffer-memory: 33554432      # 缓冲区 32MB
      linger-ms: 10                # 延迟 10ms 凑批
      compression-type: lz4        # 压缩算法
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.apache.kafka.common.serialization.StringSerializer
      # 幂等 Producer
      properties:
        enable.idempotence: true
        max.in.flight.requests.per.connection: 5
    consumer:
      group-id: my-consumer-group
      enable-auto-commit: false    # 关闭自动提交
      auto-offset-reset: earliest  # 从最早消息开始消费
      max-poll-records: 500        # 单次 poll 最大记录数
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
    listener:
      ack-mode: manual             # 手动 ACK
      concurrency: 3               # 消费者线程数
```

### 13.2 生产者示例

```java
@Component
public class OrderProducer {
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    public void sendOrderMessage(String orderId, String message) {
        // 以 orderId 为 Key，保证同一订单的消息进入同一分区
        CompletableFuture<SendResult<String, String>> future =
            kafkaTemplate.send("order-topic", orderId, message);

        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("消息发送失败: orderId={}", orderId, ex);
                // 记录到补偿表，定时任务重发
            } else {
                log.info("消息发送成功: topic={}, partition={}, offset={}",
                    result.getRecordMetadata().topic(),
                    result.getRecordMetadata().partition(),
                    result.getRecordMetadata().offset());
            }
        });
    }
}
```

### 13.3 消费者示例

```java
@Component
public class OrderConsumer {

    @KafkaListener(topics = "order-topic", groupId = "order-consumer-group")
    public void handleOrderMessage(ConsumerRecord<String, String> record,
                                    Acknowledgment acknowledgment) {
        String key = record.key();
        String value = record.value();
        String messageId = record.headers().lastHeader("messageId") != null ?
            new String(record.headers().lastHeader("messageId").value()) : UUID.randomUUID().toString();

        try {
            // 1. 幂等性检查
            Boolean isNew = redisTemplate.opsForValue()
                .setIfAbsent("kafka:processed:" + messageId, "1", Duration.ofHours(24));
            if (Boolean.FALSE.equals(isNew)) {
                log.info("重复消息，跳过: {}", messageId);
                acknowledgment.acknowledge();
                return;
            }

            // 2. 业务逻辑
            processOrder(key, value);

            // 3. 手动提交 Offset
            acknowledgment.acknowledge();

        } catch (Exception e) {
            log.error("消费失败: messageId={}", messageId, e);
            // 不提交 Offset，触发重试或死信
            throw new RuntimeException(e);
        }
    }
}
```

### 13.4 死信队列配置

```java
@Configuration
public class KafkaDLQConfig {

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, String> kafkaListenerContainerFactory(
            ConsumerFactory<String, String> consumerFactory) {

        ConcurrentKafkaListenerContainerFactory<String, String> factory =
            new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory);
        factory.setConcurrency(3);
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL);

        // 死信队列：消费失败 3 次后转发到 .DLT 主题
        DeadLetterPublishingRecoverer recoverer =
            new DeadLetterPublishingRecoverer(kafkaTemplate());
        DefaultErrorHandler errorHandler = new DefaultErrorHandler(
            recoverer, new FixedBackOff(1000L, 3));  // 间隔 1s，最多重试 3 次
        factory.setCommonErrorHandler(errorHandler);

        return factory;
    }
}
```

---

## 十四、生产环境配置与调优

### 14.1 Broker 关键配置

```properties
# 副本与可靠性
default.replication.factor=3          # 默认副本数
min.insync.replicas=2                 # 最少同步副本数
unclean.leader.election.enable=false  # 禁止从 OSR 选举 Leader

# 日志保留
log.retention.hours=168               # 保留 7 天
log.retention.bytes=10737418240       # 单分区最大 10GB
log.segment.bytes=1073741824          # Segment 大小 1GB

# 性能调优
num.io.threads=8                      # IO 线程数（建议 = 磁盘数）
num.network.threads=3                 # 网络线程数
socket.send.buffer.bytes=102400       # Socket 发送缓冲区
socket.receive.buffer.bytes=102400    # Socket 接收缓冲区

# 消息大小限制
message.max.bytes=1048576             # 单条消息最大 1MB
replica.fetch.max.bytes=1048576       # 副本拉取最大 1MB
```

### 14.2 生产者调优

```properties
acks=all                              # 所有 ISR 确认
retries=3                             # 重试 3 次
batch.size=16384                      # 批量大小 16KB
linger.ms=10                          # 延迟 10ms 凑批
compression.type=lz4                  # LZ4 压缩
buffer.memory=33554432                # 缓冲区 32MB
enable.idempotence=true               # 幂等 Producer
max.in.flight.requests.per.connection=5  # 幂等模式下最大 5
```

### 14.3 消费者调优

```properties
fetch.min.bytes=1                     # 最小拉取字节数
fetch.max.wait.ms=500                 # 最大等待时间 500ms
max.partition.fetch.bytes=1048576     # 单分区最大拉取 1MB
max.poll.records=500                  # 单次 poll 最大记录数
session.timeout.ms=10000              # 会话超时 10s
heartbeat.interval.ms=3000            # 心跳间隔 3s
max.poll.interval.ms=300000           # poll 间隔上限 5 分钟
```

### 14.4 关键监控指标

| 指标 | 含义 | 告警阈值参考 |
|------|------|-------------|
| `ConsumerLag` | 消费者落后的消息数 | 持续增长需关注 |
| `UnderReplicatedPartitions` | 未完全复制的分区数 | > 0 需关注 |
| `OfflinePartitionsCount` | 离线分区数 | > 0 严重告警 |
| `ActiveControllerCount` | 活跃 Controller 数 | != 1 严重告警 |
| `IsrShrinksPerSec` | ISR 收缩速率 | 频繁收缩需关注 |
| `BytesInPerSec` | 入站字节速率 | 异常波动 |
| `BytesOutPerSec` | 出站字节速率 | 异常波动 |
| `RequestHandlerAvgIdlePercent` | 请求处理线程空闲率 | < 30% 需扩容 |

---

## 十五、常见故障排查

### 15.1 消息积压

| 排查步骤 | 说明 |
|---------|------|
| 1. 检查 Consumer Lag | `kafka-consumer-groups.sh --describe` 查看落后量 |
| 2. 检查消费者状态 | 消费者是否在线、Rebalance 是否频繁 |
| 3. 检查消费速率 | 消费逻辑是否有外部依赖超时、数据库慢查询 |
| 4. 扩容消费者 | 增加消费者实例（不超过 Partition 数） |
| 5. 调大 poll 批量 | `max.poll.records` 调大，减少拉取次数 |
| 6. 优化消费逻辑 | 异步化、缓存、减少同步操作 |
| 7. 紧急处理 | 临时分流到多 Partition 的新 Topic，10 倍消费者并行处理 |

### 15.2 频繁 Rebalance

| 原因 | 解决方案 |
|------|---------|
| 心跳超时 | 增大 `session.timeout.ms`，调高 `heartbeat.interval.ms` |
| poll 超时 | 增大 `max.poll.interval.ms`，减小 `max.poll.records` |
| 消费者频繁重启 | 检查应用稳定性，避免 OOM 等导致进程退出 |

### 15.3 消息丢失

| 环节 | 排查方法 |
|------|---------|
| 生产者 | 检查 `acks` 配置是否为 `all`；检查 `retries` 和幂等配置 |
| Broker | 检查 `min.insync.replicas` 是否 >= 2；检查 ISR 状态 |
| 消费者 | 检查 `enable.auto.commit` 是否为 `false`；检查手动提交逻辑 |

### 15.4 磁盘空间不足

| 原因 | 解决方案 |
|------|---------|
| 日志保留时间过长 | 调整 `log.retention.hours` 和 `log.retention.bytes` |
| Segment 过大 | 调整 `log.segment.bytes` |
| 压缩策略未开启 | 对可压缩 Topic 开启 `log.cleanup.policy=compact` |

### 15.5 消费延迟高

| 原因 | 解决方案 |
|------|---------|
| Consumer 处理慢 | 优化消费逻辑，增加并发消费者 |
| 网络延迟 | 检查网络连通性，调整 `fetch.max.wait.ms` |
| Broker 负载高 | 监控 CPU/内存/磁盘 IO，扩容节点 |
| 分区数不足 | 增加 Partition 数，提高并发度 |

---

## 十六、高频面试题精选

### Q1：Kafka 为什么这么快？

A：四大核心技术：
1. **顺序写磁盘**：Append-only 追加写入，消除寻道瓶颈
2. **页缓存（Page Cache）**：数据先写入 OS 内存缓存，异步刷盘，读写都命中内存
3. **零拷贝（sendfile/mmap）**：数据直接从内核空间发送到网卡，避免用户态拷贝
4. **批量处理 + 压缩**：多条消息合并发送，支持 LZ4/Snappy 等压缩算法

### Q2：Kafka 如何保证消息不丢失？

A：三个环节：
- **生产端**：`acks=all` 等待所有 ISR 确认；`retries > 0` 自动重试；开启幂等 Producer
- **Broker 端**：`min.insync.replicas >= 2`；关闭 `unclean.leader.election`
- **消费端**：关闭自动提交 Offset，业务处理完成后手动提交

### Q3：Kafka 如何保证消息顺序性？

A：Kafka 只保证单 Partition 内有序。通过将同一业务 Key（如 orderId）的消息路由到同一 Partition，并分配给同一 Consumer 顺序处理来实现局部有序。全局有序需要单 Partition + 单 Consumer，不推荐。

### Q4：Kafka 的 ISR 机制是什么？

A：ISR（In-Sync Replicas）是与 Leader 保持同步的副本集合。Follower 如果落后过多或超时未请求复制，会被移出 ISR。Leader 选举优先从 ISR 中挑选，保证数据一致性。OSR 是滞后副本，ISR 为空时可配置是否允许从 OSR 选举（会丢数据）。

### Q5：Kafka 的 Rebalance 是什么？有什么影响？

A：Rebalance 是消费组内消费者重新分配 Partition 的过程，触发条件包括成员变化、订阅主题变化、分区数变化。Rebalance 期间消费组短暂不可用，可能导致消息处理延迟。可通过调整 `session.timeout.ms`、`heartbeat.interval.ms`、`max.poll.interval.ms` 来优化。

### Q6：Kafka 的 push 和 pull 模式有什么区别？

A：Kafka 采用 pull 模式，Consumer 主动向 Broker 拉取消息。优势在于 Consumer 可根据自身能力控制拉取频率和批量大小，Broker 保持轻量无状态。push 模式（如 RabbitMQ）实时性更高但 Broker 复杂度高。RocketMQ 的长轮询结合了两者优势。

### Q7：Kafka 和 RabbitMQ 有什么区别？怎么选？

A：Kafka 是分布式事件流平台，拉模式，百万级吞吐，消息可回溯，适合大数据和日志场景。RabbitMQ 是通用消息代理，推模式，微秒级延迟，路由灵活，适合业务系统。业务系统选 RabbitMQ，大数据选 Kafka，需要事务消息选 RocketMQ。

### Q8：Kafka 的 Exactly-Once 语义如何实现？

A：Kafka 内部通过幂等 Producer（PID + Sequence Number 去重）保证单分区写入不重复，通过事务 API 保证跨分区原子写入。业务层通过 MySQL 唯一键、Redis SETNX 或布隆过滤器实现消费端去重。

### Q9：Kafka 消息积压了怎么办？

A：首先用 `kafka-consumer-groups.sh` 检查 Consumer Lag；扩容消费者实例（不超过 Partition 数）；调大 `max.poll.records`；优化消费逻辑；严重积压时临时分流到新 Topic + 多倍消费者并行处理。

### Q10：Kafka 的高水位（HW）是什么？

A：HW（High Watermark）是 Kafka 中用于标识"已备份"消息的边界。小于等于 HW 的消息被认为已复制到所有 ISR 副本，对消费者可见。HW 永远不会大于 LEO（Log End Offset）。Leader Epoch 是为解决高水位在 Leader 连续变更时导致的数据不一致而引入的机制。

---

## 十七、知识体系总览

```
Kafka 面试必知必会
├── 一、核心架构
│   ├── Producer / Consumer / Broker / Topic / Partition / Replica
│   ├── Controller 与 KRaft
│   └── AMQP vs Kafka 协议
├── 二、Partition 分区机制
│   ├── 分区设计目的
│   ├── 生产者路由策略
│   └── 消费者分区分配
├── 三、副本机制
│   ├── Leader / Follower / ISR / AR / OSR
│   ├── Leader 选举策略
│   └── LEO 与 HW
├── 四、消息存储机制
│   ├── Segment + Index 结构
│   ├── 消息查找过程
│   ├── Segment 切分条件
│   └── 日志清理策略
├── 五、高吞吐四大原因
│   ├── 顺序写磁盘
│   ├── 页缓存 Page Cache
│   ├── 零拷贝 sendfile/mmap
│   └── 批量处理与压缩
├── 六、消息可靠性保证
│   ├── acks / retries / 幂等 Producer
│   ├── Exactly-Once 语义
│   └── 消息丢失三环节及解决方案
├── 七、Consumer Group 与 Rebalance
├── 八、消息顺序性保证
├── 九、推拉模型深度对比
│   ├── 推模式 vs 拉模式
│   ├── Kafka 为什么选拉模式
│   ├── RabbitMQ 推模式实现
│   └── RocketMQ 长轮询
├── 十、Kafka vs RabbitMQ 详细对比
│   ├── 架构 / 性能 / 可靠性 / 运维
│   └── 选型建议
├── 十一、实际项目应用场景
│   ├── 日志采集 / 流处理 / CDC
│   ├── 监控报警 / 事件溯源
│   └── 异步解耦 / 削峰填谷
├── 十二、Kafka Connect 与 Streams
├── 十三、Spring Boot 集成
├── 十四、生产环境配置与调优
├── 十五、常见故障排查
└── 十六、高频面试题精选
```

---

## 参考资料

- [这些年背过的面试题——Kafka 篇 - 阿里云](https://developer.aliyun.com/article/1485711)
- [40 道精选 Kafka 面试题 - 二哥的 Java 进阶之路](https://javabetter.cn/interview/kafka-40.html)
- [Kafka 消息队列专题 - JavaGuide](https://javaguide.cn/high-performance/message-queue/)
- [Kafka 存储引擎性能揭秘：页缓存与零拷贝 - 腾讯云](https://cloud.tencent.com/developer/article/2594883)
- [Kafka 基于顺序写零拷贝页缓存的高性能原理 - 阿里云](https://developer.aliyun.com/article/1638751)
- [消息队列之推还是拉，RocketMQ 和 Kafka 是如何做的 - 阿里云](https://developer.aliyun.com/article/915978)
- [Kafka 和 RabbitMQ 之间有何区别 - AWS](https://aws.amazon.com/cn/compare/the-difference-between-rabbitmq-and-kafka/)
- [Kafka 对比超详细 Kafka RabbitMQ RocketMQ 的区别 - 腾讯云](https://cloud.tencent.com/developer/article/2442460)
- [Kafka 在分布式系统中的 7 大应用场景 - 博客园](https://www.cnblogs.com/waynaqua/p/17790101.html)
- [数据集成与实时处理核心应用场景 - 阿里云](https://help.aliyun.com/zh/apsaramq-for-kafka/cloud-message-queue-for-kafka/product-overview/use-scenarios)
- [Kafka 消息可靠性保障 - CSDN](https://blog.csdn.net/canjun_wen/article/details/155887327)
- [深入解析 Apache Kafka：从核心原理到实战进阶指南 - 知乎](https://zhuanlan.zhihu.com/p/2018743570501247015)
