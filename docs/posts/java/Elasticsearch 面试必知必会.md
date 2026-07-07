---
title: Elasticsearch 面试必知必会
date: 2026-07-07
category: java
tags:
  - 面试
---

# Elasticsearch 面试必知必会 —— Java 开发工程师版

> 面向 Java 后端开发工程师的 Elasticsearch 核心知识体系，覆盖原理、查询 DSL、性能调优与高频面试题。
> 最后更新：2026-07-07

---

## 一、Elasticsearch 核心概念

### 1.1 ES 与关系型数据库对比

| Elasticsearch | 关系型数据库 | 说明 |
|--------------|-------------|------|
| **Index（索引）** | Database（数据库） | 数据的逻辑容器 |
| **Type（类型）** | Table（表） | 7.x 已废弃，一个 Index 只能有一个 Type（`_doc`） |
| **Document（文档）** | Row（行） | JSON 格式的数据单元 |
| **Field（字段）** | Column（列） | 文档中的属性 |
| **Mapping（映射）** | Schema（模式） | 定义字段类型和索引方式 |
| **Shard（分片）** | - | 数据的水平拆分单元 |
| **Replica（副本）** | - | 分片的冗余拷贝 |

### 1.2 集群角色

| 角色 | 职责 |
|------|------|
| **Master Node** | 管理集群元数据（创建/删除索引、分片分配），轻量级操作 |
| **Data Node** | 存储数据，执行 CRUD、搜索、聚合 |
| **Ingest Node** | 数据预处理（Pipeline），在写入前转换数据 |
| **Coordinating Node** | 接收请求，分发到数据节点，汇总结果（所有节点默认都是协调节点） |

### 1.3 核心组件

```
Client ──HTTP REST──> Coordinating Node ──Scatter──> Data Node (Shard 0)
                                                 ──> Data Node (Shard 1)
                                                 ──> Data Node (Shard 2)
                       <──Gather──  汇总排序  <──
```

| 组件 | 说明 |
|------|------|
| **Cluster** | 由一个或多个节点组成的集群，共享相同的 `cluster.name` |
| **Node** | 集群中的单个服务器实例 |
| **Shard** | 索引的水平拆分单元，每个分片是一个独立的 Lucene 索引 |
| **Replica** | 主分片的拷贝，提供高可用和读扩展 |
| **Segment** | Lucene 底层的不可变数据文件，写入后不修改，通过合并优化 |

---

## 二、倒排索引原理

### 2.1 正向索引 vs 倒排索引

| 类型 | 原理 | 适用场景 |
|------|------|---------|
| **正向索引** | 通过文档 ID → 文档内容 | 已知 ID 查文档 |
| **倒排索引** | 通过关键词 → 包含该词的文档列表 | 全文搜索 |

### 2.2 倒排索引三层结构

```
用户查询 "Elasticsearch 性能优化"
         │
         ▼ 分词
    ┌─────────────────────────────────────────┐
    │  Term Index（FST 前缀树，常驻内存）        │
    │  快速定位 Term Dictionary 中的偏移量       │
    └──────────────────┬──────────────────────┘
                       ▼
    ┌─────────────────────────────────────────┐
    │  Term Dictionary（词典，磁盘有序存储）      │
    │  存储所有去重后的 Term 及其元数据            │
    └──────────────────┬──────────────────────┘
                       ▼
    ┌─────────────────────────────────────────┐
    │  Posting List（倒排列表）                  │
    │  包含 Doc ID 列表 + 词频(TF) + 位置(Position) │
    │  + 偏移量(Offset)                        │
    └─────────────────────────────────────────┘
```

### 2.3 核心组件详解

| 组件 | 数据结构 | 存储位置 | 作用 |
|------|---------|---------|------|
| **Term Index** | FST（Finite State Transducer） | 内存 | 前缀树压缩，极速定位词典偏移量 |
| **Term Dictionary** | 有序字典 | 磁盘（mmap） | 存储所有 Term 及其元数据 |
| **Posting List** | Roaring Bitmap + Skip List | 磁盘 | 存储文档 ID 列表，支持快速交集/并集 |

### 2.4 搜索过程

以查询 `"Elasticsearch 性能"` 为例：

1. **分词**：`"Elasticsearch 性能"` → `["elasticsearch", "性能"]`
2. **查 Term Index**：通过 FST 在内存中快速定位 `"elasticsearch"` 和 `"性能"` 在词典中的偏移量
3. **查 Term Dictionary**：根据偏移量读取词典，获取 Posting List 指针
4. **查 Posting List**：读取两个 Term 的文档 ID 列表
5. **求交集**：使用 Roaring Bitmap 高效计算两个列表的交集
6. **评分排序**：对交集文档计算 BM25 相关性评分，排序返回

---

## 三、分片与副本

### 3.1 分片（Shard）

- 每个索引被拆分为多个分片，分布在不同的数据节点上
- 每个分片是一个独立的 Lucene 索引，包含完整的索引结构
- **分片数在创建索引时确定，之后不可修改**（需 Reindex）

### 3.2 副本（Replica）

- 每个主分片可以有零个或多个副本
- 副本提供**高可用**（主分片故障时副本接管）和**读扩展**（搜索请求可路由到副本）
- 副本不会与主分片分配在同一节点上

### 3.3 分片分配示例

```
3 主分片 + 1 副本 = 6 个分片实例

Node A:  Shard 0 (Primary)    Shard 1 (Replica)
Node B:  Shard 1 (Primary)    Shard 2 (Replica)
Node C:  Shard 2 (Primary)    Shard 0 (Replica)
```

### 3.4 分片数量建议

| 数据量 | 主分片数 | 单分片大小 |
|--------|---------|-----------|
| < 10GB | 1 | - |
| 10~50GB | 2~3 | 20~50GB |
| 50~500GB | 5~10 | 20~50GB |
| > 500GB | 10~50 | 20~50GB |

**经验法则**：单分片大小控制在 **20~50GB**，最大不超过 **50GB**。

---

## 四、写入流程

### 4.1 完整写入链路

```
Client
  │
  ▼
Coordinating Node ──路由──> Primary Shard (Data Node)
                               │
                               ├── 1. 写入 In-Memory Buffer
                               ├── 2. 同步写入 Translog（防止断电丢失）
                               ├── 3. 转发到 Replica Shard（并行写入）
                               │       Replica 写入成功，返回 Primary
                               ├── 4. Primary 返回 Coordinating Node
                               └── 5. Coordinating Node 返回 Client
```

### 4.2 Refresh（近实时搜索）

| 步骤 | 说明 | 时间 |
|------|------|------|
| 写入 In-Memory Buffer | 数据先进入内存缓冲区 | 即时 |
| **Refresh** | 内存缓冲区生成新的 Segment（内存），可被搜索 | 默认 **1 秒** |
| Flush（Translog 清空）| Segment 写入磁盘，清空 Translog | 默认 30 分钟或 Translog 达到 512MB |

**近实时**：Refresh 使 ES 实现"秒级"搜索延迟，写入后最多 1 秒即可被搜索到。

### 4.3 Segment 合并

- Segment 是不可变的，删除/更新实际上是标记旧文档为删除 + 写入新文档
- 后台线程定期合并小 Segment 为大 Segment，物理删除标记的文档
- 合并减少 Segment 数量，提升搜索性能

### 4.4 写入优化参数

```json
// 批量写入时临时调整
PUT /my_index/_settings
{
  "refresh_interval": "-1",       // 关闭自动 Refresh
  "number_of_replicas": 0         // 临时去掉副本
}

// 写入完成后恢复
PUT /my_index/_settings
{
  "refresh_interval": "1s",
  "number_of_replicas": 1
}
```

---

## 五、读取流程

### 5.1 完整读取链路

```
Client ──查询请求──> Coordinating Node
                         │
                    ┌────┴────┐
                    │ Scatter │  广播查询到所有相关分片
                    └────┬────┘
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    Shard 0         Shard 1         Shard 2
    本地排序          本地排序          本地排序
    返回 Top N        返回 Top N        返回 Top N
         │               │               │
         └───────────────┼───────────────┘
                    ┌────┴────┐
                    │ Gather  │  汇总所有分片结果
                    │ 全局排序 │  取最终 Top N
                    └────┬────┘
                         ▼
                    返回给 Client
```

### 5.2 两种搜索模式

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| **query_then_fetch** | 先从各分片获取文档 ID 和评分，汇总排序后再去分片获取完整文档 | 默认模式，大多数场景 |
| **dfs_query_then_fetch** | 先收集全局 Term 统计信息，再执行查询，评分更准确 | 数据量小、对评分精度要求高 |

---

## 六、查询 DSL 核心

### 6.1 Query Context vs Filter Context

| 维度 | Query Context | Filter Context |
|------|--------------|---------------|
| **评分** | 计算相关性评分 | 仅判断是否匹配（二元结果） |
| **缓存** | 无缓存 | 支持 Filter Cache（bitset） |
| **性能** | 较慢 | 显著更快（缓存命中可达 85%+） |
| **适用** | 全文搜索、需要排序 | 状态过滤、枚举值、范围过滤 |

**最佳实践**：将过滤条件放在 `bool` 查询的 `filter` 子句中，享受缓存加速。

### 6.2 核心查询类型

#### match（全文匹配）

```json
{
  "query": {
    "match": {
      "title": {
        "query": "Elasticsearch 性能优化",
        "operator": "and"
      }
    }
  }
}
```

- 对查询文本进行分词，匹配包含任意分词结果的文档
- `operator: "and"` 要求所有分词都匹配
- 变体：`match_phrase`（短语顺序匹配）、`multi_match`（跨多字段）

#### term（精确匹配）

```json
{
  "query": {
    "term": {
      "status": "published"
    }
  }
}
```

- 不分词，直接精确匹配（适用于 `keyword`、数值、日期类型）
- 性能比 `match` 高约 **3 倍**（绕过分析阶段）

#### bool（组合查询）

```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "title": "Elasticsearch" } }
      ],
      "filter": [
        { "term": { "status": "published" } },
        { "range": { "date": { "gte": "2025-01-01" } } }
      ],
      "should": [
        { "match": { "tags": "性能" } }
      ],
      "must_not": [
        { "term": { "deleted": true } }
      ]
    }
  }
}
```

| 子句 | 作用 | 评分 | 缓存 |
|------|------|------|------|
| `must` | 必须满足（AND） | 是 | 否 |
| `should` | 可选满足（OR），提高评分 | 是 | 否 |
| `filter` | 必须满足（AND），不评分 | 否 | **是** |
| `must_not` | 必须不满足（NOT），不评分 | 否 | **是** |

#### range（范围查询）

```json
{
  "query": {
    "range": {
      "price": { "gte": 100, "lte": 500 }
    }
  }
}
```

#### wildcard / fuzzy

| 查询 | 说明 | 注意事项 |
|------|------|---------|
| **wildcard** | 通配符（`*` 任意字符，`?` 单字符） | **禁止前缀通配符**（如 `*phone`），会全索引扫描 |
| **fuzzy** | 模糊匹配（基于编辑距离） | 适合用户输入容错，性能一般 |

### 6.3 相关性评分（BM25）

ES 7.x+ 默认使用 **BM25** 算法替代旧的 TF-IDF：

| 因子 | 说明 |
|------|------|
| **TF（词频）** | BM25 使用饱和函数，重复堆砌关键词收益递减（参数 `k1` 控制饱和度） |
| **IDF（逆文档频率）** | 稀有词汇权重更高，常见词（"的"、"是"）权重低 |
| **文档长度归一化** | 参数 `b` 控制，防止长文档天然获得更高分数 |

**评分调试**：查询中添加 `"explain": true` 可查看详细评分过程（生产环境禁用，性能损耗大）。

**自定义评分**：使用 `function_score` 查询

```json
{
  "query": {
    "function_score": {
      "query": { "match": { "title": "Elasticsearch" } },
      "functions": [
        { "field_value_factor": { "field": "sales", "modifier": "log1p" } },
        { "gauss": { "date": { "origin": "now", "scale": "7d" } } }
      ],
      "boost_mode": "multiply"
    }
  }
}
```

---

## 七、深度分页问题

### 7.1 问题本质

```
from: 10000, size: 20
    │
    ▼
协调节点需从每个分片获取 10020 条记录
    │
    ▼
汇总所有分片结果后全局排序，跳过前 10000 条
    │
    ▼
内存和计算资源极大浪费，延迟从毫秒级升至秒级
```

### 7.2 三种分页方案

| 方案 | 原理 | 适用场景 | 限制 |
|------|------|---------|------|
| **from + size** | 标准分页 | 浅层分页（前几百页） | `from > 10000` 报错（`max_result_window`） |
| **Scroll API** | 维护一致性快照，游标遍历 | 大批量数据导出 | 不适合实时搜索，7.x 后推荐 search_after |
| **search_after** | 基于上一页最后一条的排序值分页 | 深层翻页、实时滚动 | 只能向后翻，不能跳页 |

### 7.3 search_after 示例

```json
// 第一页
GET /orders/_search
{
  "size": 20,
  "sort": [
    { "created_at": "desc" },
    { "_id": "asc" }
  ]
}

// 后续页：使用上一页最后一条的 sort 值
GET /orders/_search
{
  "size": 20,
  "search_after": ["2025-06-01T10:00:00Z", "order_12345"],
  "sort": [
    { "created_at": "desc" },
    { "_id": "asc" }
  ]
}
```

**优化效果**：深分页延迟从 4000ms 降至 800ms。

---

## 八、聚合分析

### 8.1 三种聚合类型

| 类型 | 说明 | 示例 |
|------|------|------|
| **Metrics Aggregation** | 计算指标值 | `avg`、`sum`、`min`、`max`、`stats`、`cardinality` |
| **Bucket Aggregation** | 按条件分组 | `terms`、`date_histogram`、`range`、`filters` |
| **Pipeline Aggregation** | 对其他聚合结果再聚合 | `derivative`、`moving_avg`、`cumulative_sum` |

### 8.2 聚合示例

```json
GET /orders/_search
{
  "size": 0,
  "aggs": {
    "by_category": {
      "terms": { "field": "category.keyword", "size": 10 },
      "aggs": {
        "avg_price": { "avg": { "field": "price" } },
        "total_sales": { "sum": { "field": "sales" } }
      }
    },
    "by_month": {
      "date_histogram": {
        "field": "created_at",
        "calendar_interval": "month"
      }
    }
  }
}
```

### 8.3 聚合优化

| 优化策略 | 说明 |
|---------|------|
| **shard_size** | 控制每个分片的采样精度，提升高基数字段聚合准确性 |
| **execution_hint: map** | 对数值范围聚合强制使用内存哈希计算 |
| **预计算** | 写入时预计算聚合结果存储为冗余字段，以空间换时间 |
| **外部缓存** | 高频聚合结果放入 Redis 缓存 |

---

## 九、Mapping 设计

### 9.1 核心字段类型

| 类型 | 说明 | 适用场景 |
|------|------|---------|
| **keyword** | 不分词，精确匹配 | ID、状态、枚举值 |
| **text** | 分词，全文搜索 | 文章标题、描述 |
| **integer / long** | 数值类型 | 数量、价格 |
| **date** | 日期类型 | 时间戳 |
| **boolean** | 布尔类型 | 开关状态 |
| **nested** | 嵌套对象（独立文档） | 对象数组（需保持内部对象独立性） |
| **object** | 内部对象（扁平化） | 简单嵌套结构 |

### 9.2 双类型字段（Multi-Field）

```json
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "ik_max_word",
        "search_analyzer": "ik_smart",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      }
    }
  }
}
```

- `title`（text）用于全文搜索
- `title.keyword`（keyword）用于排序和聚合

### 9.3 Mapping 优化建议

| 优化项 | 说明 |
|--------|------|
| **精确字段用 keyword** | 不需要分词的字段（状态、ID）设为 `keyword` |
| **关闭 norms** | 不需要评分的字段设置 `"norms": false`，节省堆内存 |
| **禁用索引** | 仅展示不需要搜索的字段设置 `"index": false` |
| **ignore_above** | 限制 keyword 字段最大长度（如 256） |
| **关闭 _source** | 极端性能场景可关闭（不推荐，影响 Reindex） |

---

## 十、集群管理与高可用

### 10.1 集群健康状态

| 状态 | 含义 |
|------|------|
| **Green** | 所有主分片和副本分片均正常分配 |
| **Yellow** | 所有主分片正常，但有副本分片未分配 |
| **Red** | 有主分片未分配，部分数据不可用 |

### 10.2 脑裂问题

**原因**：网络分区导致集群中出现两个以上 Master 节点，各自独立处理写入，数据不一致。

**预防措施**：

| 版本 | 措施 |
|------|------|
| **ES 7.x 之前** | 设置 `discovery.zen.minimum_master_nodes` = `(master_eligible_nodes / 2) + 1` |
| **ES 7.x+** | 引入基于投票配置的自动仲裁机制，默认已大幅降低脑裂风险 |
| **通用** | 专用 Master 节点至少 3 个，与 Data 节点分离 |

### 10.3 节点角色分离（生产推荐）

```
Master Node (3个)  ── 轻量级集群管理
Data Node (N个)    ── 数据存储与搜索
Ingest Node        ── 数据预处理
Coordinating Node  ── 请求路由与结果汇总（专用）
```

### 10.4 分片分配策略

```json
// 索引级别：指定分片和副本数
PUT /my_index
{
  "settings": {
    "number_of_shards": 5,
    "number_of_replicas": 1
  }
}

// 磁盘水位线
cluster.routing.allocation.disk.watermark.low: 85%      // 停止分配新分片
cluster.routing.allocation.disk.watermark.high: 90%     // 迁移分片
cluster.routing.allocation.disk.watermark.flood_stage: 95%  // 索引只读
```

---

## 十一、性能优化

### 11.1 查询优化

| 优化项 | 说明 |
|--------|------|
| **精确匹配优先** | 用 `term` 代替 `match` 查询精确值（性能提升 3 倍） |
| **禁止前缀通配符** | 用 `edge_ngram` 分词器替代 `*keyword` 查询 |
| **_source 过滤** | 限制返回字段，减少网络传输 |
| **Filter 代替 Query** | 过滤条件放 `filter` 子句，享受缓存 |
| **routing** | 通过 routing 参数将请求路由到特定分片，减少散射 |
| **timeout + terminate_after** | 设置超时和每分片收集文档数上限 |

### 11.2 索引优化

| 优化项 | 说明 | 推荐值 |
|--------|------|--------|
| **Refresh Interval** | 非实时场景调大 | `30s` 甚至 `-1`（批量导入时） |
| **Translog 持久化** | 允许一定数据丢失风险换取性能 | `async` |
| **Merge Policy** | 控制 Segment 合并策略 | 默认即可，大批量写入时可调大 |
| **Index Sorting** | 对常用范围查询字段做物理排序 | 加速磁盘读取 |

### 11.3 JVM 调优

| 参数 | 说明 |
|------|------|
| **堆内存** | 不超过 **32GB**（保持 Compressed Oops 生效），不超过物理内存的 50% |
| **内存锁定** | `bootstrap.memory_lock: true`，防止 JVM 内存被交换到磁盘 |
| **GC 策略** | 使用 **G1GC** 垃圾收集器 |
| **OS swappiness** | `vm.swappiness = 1`（最小化 swap 使用） |
| **max_map_count** | `vm.max_map_count = 262144` |

### 11.4 冷热分离架构

```
Hot Node（SSD）  ── 近期数据，高频读写
Warm Node（HDD） ── 历史数据，低频读取
Cold Node        ── 归档数据，极少访问

ILM（Index Lifecycle Management）自动迁移：
  Hot → Warm → Cold → Delete
```

### 11.5 优化效果参考（电商案例）

| 指标 | 优化前 | 优化后 | 提升倍数 |
|------|--------|--------|---------|
| 平均响应时间 | 3200ms | 280ms | 11.4x |
| P99 延迟 | 5000ms | 600ms | 8.3x |
| QPS | 15 | 180 | 12x |

---

## 十二、ES 与 MySQL 数据同步

### 12.1 四种同步方案

| 方案 | 原理 | 实时性 | 侵入性 |
|------|------|--------|--------|
| **Canal 监听 Binlog** | 监听 MySQL binlog 变更事件，实时同步到 ES | 高（秒级） | 无侵入 |
| **Logstash JDBC Input** | 定时轮询 MySQL 增量数据写入 ES | 中（分钟级） | 低侵入 |
| **应用层双写** | 业务代码同时写入 MySQL 和 ES | 高 | 高侵入，一致性难保证 |
| **MQ 异步同步** | 业务写入 MySQL 后发 MQ，消费者同步到 ES | 中（秒级） | 低侵入 |

### 12.2 推荐方案：Canal + MQ + ES

```
MySQL ──binlog──> Canal ──消息──> Kafka ──消费──> ES
```

- Canal 伪装为 MySQL Slave，实时获取 binlog 变更
- 通过 Kafka 解耦，保证消息可靠
- 消费者同步到 ES，支持重试和死信队列

---

## 十三、Spring Data Elasticsearch 集成

### 13.1 依赖引入

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-elasticsearch</artifactId>
</dependency>
```

### 13.2 实体类定义

```java
@Document(indexName = "products")
public class Product {
    @Id
    private String id;

    @Field(type = FieldType.Text, analyzer = "ik_max_word", searchAnalyzer = "ik_smart")
    private String name;

    @Field(type = FieldType.Keyword)
    private String category;

    @Field(type = FieldType.Double)
    private Double price;

    @Field(type = FieldType.Date, format = DateFormat.date_time)
    private LocalDateTime createdAt;
}
```

### 13.3 Repository 接口

```java
public interface ProductRepository extends ElasticsearchRepository<Product, String> {
    List<Product> findByName(String name);

    @Query("{\"bool\": {\"must\": [{\"match\": {\"name\": \"?0\"}}], \"filter\": [{\"term\": {\"category\": \"?1\"}}]}}")
    List<Product> searchByNameAndCategory(String name, String category);
}
```

### 13.4 RestHighLevelClient（复杂查询）

```java
@Service
public class ProductSearchService {
    @Autowired
    private RestHighLevelClient client;

    public SearchResponse search(String keyword, String category, int from, int size) throws IOException {
        SearchRequest request = new SearchRequest("products");
        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();

        BoolQueryBuilder boolQuery = QueryBuilders.boolQuery()
            .must(QueryBuilders.matchQuery("name", keyword))
            .filter(QueryBuilders.termQuery("category", category));

        sourceBuilder.query(boolQuery)
            .from(from).size(size)
            .highlighter(new HighlightBuilder()
                .field("name")
                .preTags("<em>")
                .postTags("</em>"));

        request.source(sourceBuilder);
        return client.search(request, RequestOptions.DEFAULT);
    }
}
```

---

## 十四、常见故障排查

### 14.1 Yellow 状态

| 原因 | 排查 | 解决 |
|------|------|------|
| 副本未分配 | `GET /_cluster/allocation/explain` | 增加数据节点、调整副本数 |
| 磁盘空间不足 | 检查 `disk.watermark` 阈值 | 清理磁盘或扩容 |
| 节点离线 | `GET /_cat/nodes?v` | 恢复节点连接 |

### 14.2 Red 状态

| 原因 | 排查 | 解决 |
|------|------|------|
| 主分片未分配 | `GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason` | 检查节点健康、修复磁盘 |
| 磁盘阈值触发 | `cluster.routing.allocation.disk.watermark` | 清理空间或调整阈值 |
| 分片损坏 | 查看 ES 日志 | 从副本恢复或使用 `reroute` 手动分配 |

### 14.3 慢查询排查

| 工具 | 用法 |
|------|------|
| **Profile API** | `GET /index/_search/profile` 解剖查询执行阶段，定位慢组件 |
| **慢查询日志** | `index.search.slowlog.threshold.query.warn: 10s` |
| **Task API** | `GET /_tasks` 查看正在执行的长任务 |

### 14.4 内存溢出（OOM）

| 原因 | 解决方案 |
|------|---------|
| 堆内存过大 | 确保不超过 32GB，启用 Compressed Oops |
| Swap 导致 GC 停顿 | `bootstrap.memory_lock: true` |
| 大聚合查询 | 优化聚合逻辑，使用 `shard_size` 限制 |
| 深度分页 | 改用 `search_after` |

---

## 十五、高频面试题精选

### Q1：Elasticsearch 为什么这么快？

A：核心技术包括：倒排索引（FST + Posting List 实现极速关键词定位）、近实时搜索（Refresh 机制，1 秒延迟）、分布式搜索（Scatter-Gather 并行查询多分片）、Filter Cache（过滤条件缓存复用）、MMap 将索引文件映射到内存。

### Q2：什么是倒排索引？和正向索引有什么区别？

A：正向索引是通过文档 ID 查内容，倒排索引是通过关键词查包含该词的文档列表。倒排索引由三部分组成：Term Index（FST 前缀树，常驻内存）、Term Dictionary（词典，磁盘有序存储）、Posting List（倒排列表，存储文档 ID + 词频 + 位置）。

### Q3：ES 的写入流程是怎样的？

A：写入链路为：Coordinating Node → 路由到 Primary Shard → 写入 In-Memory Buffer + Translog → 转发到 Replica Shard → 返回成功。之后每秒 Refresh 生成 Segment（可搜索），定期 Flush 将 Segment 持久化到磁盘。

### Q4：ES 如何实现近实时搜索？

A：通过 Refresh 机制，默认每 1 秒将 In-Memory Buffer 中的数据生成新的 Segment（内存中），此时即可被搜索。Refresh 不等于 Flush（Flush 是写入磁盘），因此是"近实时"而非"实时"。

### Q5：ES 深度分页有什么问题？怎么解决？

A：`from: 10000, size: 20` 时，协调节点需从每个分片获取 10020 条记录后全局排序，内存和计算开销极大。解决方案：浅层分页用 `from+size`，深层翻页用 `search_after`（基于上一页最后一条的排序值），大批量导出用 Scroll API。

### Q6：Query Context 和 Filter Context 有什么区别？

A：Query Context 计算相关性评分，无缓存，适合全文搜索；Filter Context 仅判断是否匹配，支持缓存（Filter Cache），性能显著更快。过滤条件应放在 `bool` 查询的 `filter` 子句中享受缓存。

### Q7：ES 集群的 Yellow 和 Red 状态分别表示什么？

A：Yellow 表示所有主分片正常但副本分片未分配（数据可用但无冗余）；Red 表示有主分片未分配（部分数据不可用）。排查使用 `GET /_cluster/allocation/explain` 和 `GET /_cat/shards?v`。

### Q8：ES 如何防止脑裂？

A：ES 7.x 之前设置 `discovery.zen.minimum_master_nodes = (master_eligible_nodes / 2) + 1`；ES 7.x+ 引入基于投票配置的自动仲裁机制，默认已大幅降低脑裂风险。生产环境建议专用 Master 节点至少 3 个。

### Q9：BM25 和 TF-IDF 有什么区别？

A：BM25 是 ES 7.x+ 默认的评分算法，相比 TF-IDF 的优势在于：词频使用饱和函数（重复堆砌收益递减，参数 k1 控制）、文档长度归一化（参数 b 控制）。BM25 在处理长文档和高词频场景下表现更稳定。

### Q10：ES 与 MySQL 数据如何同步？

A：推荐方案是 Canal 监听 MySQL binlog → 发送到 Kafka → 消费者同步到 ES。优势是实时性高（秒级）、对业务无侵入。其他方案包括 Logstash JDBC 定时轮询、应用层双写（不推荐）、MQ 异步同步。

---

## 十六、知识体系总览

```
Elasticsearch 面试必知必会
├── 一、核心概念
│   ├── ES vs 关系型数据库
│   ├── 集群角色（Master/Data/Ingest/Coordinating）
│   └── 核心组件（Cluster/Node/Shard/Replica/Segment）
├── 二、倒排索引原理
│   ├── Term Index（FST）/ Term Dictionary / Posting List
│   └── 搜索过程（分词→查词典→求交集→评分排序）
├── 三、分片与副本
│   ├── 分片分配策略
│   └── 分片数量建议
├── 四、写入流程
│   ├── In-Memory Buffer → Translog → Refresh → Flush
│   ├── Segment 合并机制
│   └── 写入优化参数
├── 五、读取流程
│   ├── Scatter-Gather 模式
│   └── query_then_fetch vs dfs_query_then_fetch
├── 六、查询 DSL 核心
│   ├── Query Context vs Filter Context
│   ├── match / term / bool / range / wildcard / fuzzy
│   └── BM25 评分算法与 function_score
├── 七、深度分页问题
│   ├── from+size / Scroll / search_after
│   └── 优化方案
├── 八、聚合分析
│   ├── Metrics / Bucket / Pipeline
│   └── 聚合优化策略
├── 九、Mapping 设计
│   ├── 核心字段类型
│   ├── 双类型字段（Multi-Field）
│   └── Mapping 优化建议
├── 十、集群管理与高可用
│   ├── 健康状态（Green/Yellow/Red）
│   ├── 脑裂预防
│   └── 节点角色分离
├── 十一、性能优化
│   ├── 查询优化 / 索引优化 / JVM 调优
│   └── 冷热分离架构
├── 十二、ES 与 MySQL 数据同步
├── 十三、Spring Data Elasticsearch 集成
├── 十四、常见故障排查
└── 十五、高频面试题精选
```

---

## 参考资料

- [Elasticsearch 面试总结 - 钝悟](https://dunwu.github.io/db-tutorial/pages/0cb563/)
- [Elasticsearch 面试宝典 - CSDN](https://blog.csdn.net/mss359681091/article/details/145864241)
- [ElasticSearch 搜索引擎常见面试题 - LeetCode](https://leetcode.cn/discuss/post/860271/elasticsearchsou-suo-yin-qing-chang-jian-di91/)
- [110 道 Elasticsearch 面试题及答案 - 知乎](https://zhuanlan.zhihu.com/p/440566474)
- [Elasticsearch 常见面试题 - 腾讯云](https://cloud.tencent.com/developer/article/2373045)
- [Elasticsearch 面试精讲：全文搜索与相关性评分 - CSDN](https://blog.csdn.net/qq_qingtian/article/details/151184773)
- [Elasticsearch 深度搜索与查询 DSL 实战 - 腾讯云](https://cloud.tencent.com/developer/article/2615508)
- [Elasticsearch 查询性能深度优化指南 - 博客园](https://www.cnblogs.com/ljbguanli/p/19728826)
- [Elasticsearch 查询性能优化：从 3 秒到 300ms - 阿里云](https://developer.aliyun.com/article/1673848)
- [从 10 分钟到秒级！解决 ES 分页查询性能瓶颈 - DBAplus](https://dbaplus.cn/news-73-6670-1.html)
- [Elasticsearch 功能列表 - Elastic 官方](https://www.elastic.co/cn/elasticsearch/features)
