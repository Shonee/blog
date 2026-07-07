---
title: MySQL 面试必知必会
date: 2026-07-07
category: java
tags:
  - 面试
---

# MySQL 面试必知必会

> 面向 5 年 Java 开发工程师的 MySQL 深度学习与面试文档，涵盖原理、用法、实战场景、常见问题及解决方案。

---

## 一、MySQL 架构概述

### 1.1 四层架构

```
+-----------------------------------------------------------+
|                    客户端应用层                              |
+-----------------------------------------------------------+
                            |
+-----------------------------------------------------------+
|                    连接层 (Connection)                      |
|  - 连接管理、权限验证、连接池                                 |
+-----------------------------------------------------------+
                            |
+-----------------------------------------------------------+
|                    服务层 (Server)                          |
|  - 查询缓存 → 解析器 → 预处理器 → 优化器 → 执行器             |
+-----------------------------------------------------------+
                            |
+-----------------------------------------------------------+
|                    存储引擎层                                |
|  - InnoDB (默认) | MyISAM | Memory | Archive               |
+-----------------------------------------------------------+
                            |
+-----------------------------------------------------------+
|                    存储层 (文件系统)                          |
|  - 数据文件、索引文件、日志文件                                |
+-----------------------------------------------------------+
```

### 1.2 SQL 执行流程

```
客户端发送 SQL
    → 连接验证
    → 查询缓存 (MySQL 8.0 已移除)
    → 词法分析 + 语法分析 → AST (抽象语法树)
    → 语义分析 (表/列是否存在、权限校验)
    → 查询优化器生成执行计划 (选择索引、连接顺序)
    → 执行器调用存储引擎
    → 返回结果集
```

---

## 二、存储引擎对比

### 2.1 InnoDB vs MyISAM

| 特性 | InnoDB | MyISAM |
|------|--------|--------|
| 事务支持 | ✅ 支持 | ❌ 不支持 |
| 行级锁 | ✅ 基于索引的行锁 | ❌ 仅表锁 |
| 外键约束 | ✅ 支持 | ❌ 不支持 |
| 崩溃恢复 | ✅ Redo Log 自动恢复 | ❌ 需手动 repair |
| MVCC | ✅ 支持 | ❌ 不支持 |
| 聚簇索引 | ✅ 有 | ❌ 无 |
| 全文索引 | ✅ MySQL 5.6+ | ✅ 支持 |
| COUNT(*) | 慢 (需遍历) | 快 (维护计数器) |
| 适用场景 | OLTP、高并发 | OLAP、读多写少 |

### 2.2 InnoDB 核心文件

```
数据目录/
├── ibdata1           # 共享表空间 (undo log、系统表)
├── ib_logfile0       # Redo Log 文件 0
├── ib_logfile1       # Redo Log 文件 1
├── db_name/
│   ├── table_name.ibd    # 独立表空间 (数据 + 索引)
│   └── table_name.frm    # 表结构定义 (MySQL 8.0 改为 .sdi)
```

### 2.3 InnoDB 核心组件

```
+--------------------------------------------------+
|                  InnoDB 内存结构                   |
|  ┌─────────────────┐  ┌──────────────────────┐   |
|  │   Buffer Pool   │  │   Log Buffer         │   |
|  │  (数据页+索引页)  │  │  (Redo Log 缓冲区)    │   |
|  └─────────────────┘  └──────────────────────┘   |
|  ┌─────────────────┐  ┌──────────────────────┐   |
|  │  Change Buffer  │  │  Adaptive Hash Index  │   |
|  │  (二级索引变更)   │  │  (自适应哈希索引)      │   |
|  └─────────────────┘  └──────────────────────┘   |
+--------------------------------------------------+
                         |
                    Checkpoint
                         ↓
+--------------------------------------------------+
|                  InnoDB 磁盘结构                   |
|  ┌─────────────┐ ┌───────────┐ ┌──────────────┐ |
|  │  数据文件    │ │ Redo Log  │ │   Undo Log   │ |
|  │  (.ibd)     │ │           │ │  (回滚+MVCC) │ |
|  └─────────────┘ └───────────┘ └──────────────┘ |
|  ┌─────────────┐ ┌───────────────────────────┐   |
|  │  Binlog     │ │  Double Write Buffer      │   |
|  │  (归档日志)  │ │  (双写缓冲，防部分页写失败)  │   |
|  └─────────────┘ └───────────────────────────┘   |
+--------------------------------------------------+
```

---

## 三、B+ 树索引原理

### 3.1 为什么选择 B+ 树

| 数据结构 | 查询效率 | 范围查询 | 排序 | 内存友好度 |
|---------|---------|---------|------|-----------|
| Hash | O(1) | ❌ 不支持 | ❌ 无序 | 高 |
| 二叉搜索树 | O(logN) | 低效 | 部分支持 | 低 |
| 红黑树 | O(logN) | 低效 | 部分支持 | 低 |
| B-Tree | O(logN) | 支持 | 支持 | 中 |
| **B+ Tree** | **O(logN)** | **高效** | **高效** | **高** |

### 3.2 B+ 树结构

```
         [非叶子节点: 仅存键值，用于导航]
              ┌─────┬─────┬─────┐
              │ 15  │ 28  │ 42  │
              └──┬──┴──┬──┴──┬──┘
           ┌─────┘     │     └─────┐
           ↓           ↓           ↓
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ 3│7│12  │ │ 18│22│25│ │ 33│38│40 │
    └──────────┘ └──────────┘ └──────────┘
         ↓            ↓            ↓
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ 3│7│12  │ │ 18│22│25│ │ 33│38│40 │  ← 叶子节点：数据+双向链表
    └──────────┘ └──────────┘ └──────────┘
           ←─────────→  ←─────────→
              [叶子节点间双向链表 → 高效范围查询]
```

**B+ 树优势：**
1. **磁盘 IO 少**：非叶子节点不存数据，一页(16KB)可存更多键值，树高通常 3~4 层
2. **范围查询高效**：叶子节点通过双向链表连接，范围扫描只需遍历链表
3. **查询稳定**：所有查询都走到叶子节点，性能一致

### 3.3 聚簇索引 vs 二级索引

```
┌─────────────────────────────────────┐
│         聚簇索引 (主键索引)           │
│                                     │
│  B+ 树叶子节点 = 完整数据行           │
│  InnoDB 表数据按主键顺序物理存储       │
│  主键选择：自增ID > UUID (避免页分裂)  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         二级索引 (辅助索引)           │
│                                     │
│  B+ 树叶子节点 = 主键值              │
│  查询非索引列需 "回表"：              │
│  二级索引找到主键 → 聚簇索引查完整行   │
└─────────────────────────────────────┘
```

**回表示例：**

```sql
-- 表结构
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(100),
    age INT,
    INDEX idx_name (name)
);

-- 使用二级索引查询，需回表
SELECT * FROM users WHERE name = '张三';
-- 执行过程：idx_name 找到主键 → 聚簇索引查完整行

-- 覆盖索引查询，无需回表
SELECT name, id FROM users WHERE name = '张三';
-- 执行过程：idx_name 直接包含 name 和 id，无需回表
```

---

## 四、事务与 ACID

### 4.1 ACID 特性

| 特性 | 含义 | 实现机制 | 破坏后果 |
|------|------|---------|---------|
| **A**tomicity 原子性 | 事务要么全做，要么全不做 | Undo Log (回滚日志) | 部分操作生效，数据不一致 |
| **C**onsistency 一致性 | 事务前后数据从一个一致态到另一个一致态 | A+I+D 共同保证 | 约束破坏、数据矛盾 |
| **I**solation 隔离性 | 并发事务互不干扰 | 锁 + MVCC | 脏读/不可重复读/幻读 |
| **D**urability 持久性 | 提交后数据永久保存 | Redo Log (重做日志) | 宕机后数据丢失 |

### 4.2 四种隔离级别

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 性能 | 加锁策略 |
|---------|------|-----------|------|------|---------|
| READ UNCOMMITTED | ✅ 可能 | ✅ 可能 | ✅ 可能 | 最高 | 不加锁 |
| READ COMMITTED | ❌ 避免 | ✅ 可能 | ✅ 可能 | 较高 | 每次读创建新 ReadView |
| **REPEATABLE READ** | ❌ 避免 | ❌ 避免 | ⚠️ 部分避免 | 中等 | 首次读创建 ReadView |
| SERIALIZABLE | ❌ 避免 | ❌ 避免 | ❌ 避免 | 最低 | 读加共享锁，写加排他锁 |

**三种读问题：**

```sql
-- 脏读：读到其他事务未提交的数据
-- Session A                    Session B
BEGIN;
                                BEGIN;
                                UPDATE users SET age=30 WHERE id=1;
SELECT age FROM users WHERE id=1; -- 读到 30 (未提交)
                                ROLLBACK; -- 回滚了
-- Session A 读到的 30 是脏数据

-- 不可重复读：同一事务内多次读取结果不同
-- Session A                    Session B
BEGIN;
SELECT age FROM users WHERE id=1; -- 读到 25
                                UPDATE users SET age=30 WHERE id=1;
                                COMMIT;
SELECT age FROM users WHERE id=1; -- 读到 30 (不同！)

-- 幻读：同一事务内范围查询出现新行
-- Session A                    Session B
BEGIN;
SELECT * FROM users WHERE age > 20; -- 3 行
                                INSERT INTO users VALUES(2, '李四', 25);
                                COMMIT;
SELECT * FROM users WHERE age > 20; -- 4 行 (多了李四！)
```

---

## 五、MVCC 多版本并发控制

### 5.1 核心思想

MVCC 通过保存数据的多个历史版本，让读操作不阻塞写操作，写操作不阻塞读操作，实现高并发下的数据一致性。

### 5.2 三大核心组件

```
┌─────────────────────────────────────────────┐
│              隐藏字段 (每行数据)               │
│  DB_TRX_ID   : 最近修改该行的事务ID (6字节)    │
│  DB_ROLL_PTR : 回滚指针，指向 undo log (7字节) │
│  DB_ROW_ID   : 隐藏自增行ID (无主键时)        │
└─────────────────────────────────────────────┘
                      |
                      ↓
┌─────────────────────────────────────────────┐
│              Undo Log 版本链                  │
│                                             │
│  当前版本 ──→ 历史版本1 ──→ 历史版本2 ──→ ...  │
│  (DB_TRX_ID=100)  (TRX_ID=80)  (TRX_ID=50)  │
│  (DB_ROLL_PTR)    (ROLL_PTR)    (ROLL_PTR)   │
└─────────────────────────────────────────────┘
                      |
                      ↓
┌─────────────────────────────────────────────┐
│              ReadView (读视图)               │
│                                             │
│  creator_trx_id : 创建该 ReadView 的事务ID   │
│  trx_ids        : 创建时活跃事务ID列表        │
│  up_limit_id    : trx_ids 中最小值           │
│  low_limit_id   : 系统下一个分配的事务ID      │
└─────────────────────────────────────────────┘
```

### 5.3 可见性判断算法

```
function isVisible(row_trx_id, readView):
    if row_trx_id == readView.creator_trx_id:
        return true          // 自己修改的，可见

    if row_trx_id < readView.up_limit_id:
        return true          // 事务ID小于最小活跃ID，已提交，可见

    if row_trx_id >= readView.low_limit_id:
        return false         // 事务ID大于等于下一个分配ID，未来事务，不可见

    if row_trx_id in readView.trx_ids:
        return false         // 在活跃事务列表中，未提交，不可见

    return true              // 不在活跃列表中，已提交，可见
```

### 5.4 RC vs RR 的本质区别

```
READ COMMITTED:
  每次 SELECT 都创建新的 ReadView
  → 能看到其他事务已提交的最新数据
  → 解决了脏读，但存在不可重复读

REPEATABLE READ:
  只在事务首次 SELECT 时创建 ReadView，后续复用
  → 整个事务期间看到的数据版本一致
  → 解决了脏读和不可重复读
```

---

## 六、MySQL 锁机制

### 6.1 锁的分类维度

```
按粒度分：
  ├── 全局锁：LOCK INSTANCE FOR BACKUP (全库只读)
  ├── 表级锁：表锁、元数据锁 (MDL)、意向锁
  ├── 页级锁：BDB 引擎，介于表锁和行锁之间
  └── 行级锁：记录锁、间隙锁、临键锁、插入意向锁

按模式分：
  ├── 共享锁 (S锁 / 读锁)：允许并发读
  └── 排他锁 (X锁 / 写锁)：阻塞其他读写

按思想分：
  ├── 悲观锁：SELECT ... FOR UPDATE / LOCK IN SHARE MODE
  └── 乐观锁：版本号机制 (version 字段)
```

### 6.2 InnoDB 行锁详解

> **核心原则**：InnoDB 的行锁是加在索引上的，不是加在数据行上的。如果查询没有走索引，会退化为表锁。

```
┌──────────────────────────────────────────────┐
│  记录锁 (Record Lock)                         │
│  锁定索引上的单条记录                           │
│  SELECT * FROM t WHERE id = 1 FOR UPDATE;     │
│  → 锁住 id=1 这一条索引记录                    │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  间隙锁 (Gap Lock)                            │
│  锁定索引记录之间的间隙，防止幻读插入             │
│  索引值：10, 20, 30                            │
│  间隙：(-∞,10) (10,20) (20,30) (30,+∞)        │
│  SELECT * FROM t WHERE id = 15 FOR UPDATE;    │
│  → 锁住 (10, 20) 间隙                         │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  临键锁 (Next-Key Lock) = 记录锁 + 间隙锁      │
│  左开右闭区间，InnoDB 默认行锁算法               │
│  SELECT * FROM t WHERE id > 10 FOR UPDATE;    │
│  → 锁住 (10, 20], (20, 30], (30, +∞)          │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  插入意向锁 (Insert Intention Lock)            │
│  特殊的间隙锁，允许不同事务向同一间隙插入不同行    │
│  间隙 (10, 20)：                               │
│  事务A 插入 12 → 获取 (10, 20) 的插入意向锁     │
│  事务B 插入 15 → 也可以获取，不冲突              │
└──────────────────────────────────────────────┘
```

### 6.3 锁兼容性矩阵

| 请求\已持有 | S (共享) | X (排他) | IS (意向共享) | IX (意向排他) |
|------------|---------|---------|-------------|-------------|
| S (共享) | ✅ 兼容 | ❌ 冲突 | ✅ 兼容 | ❌ 冲突 |
| X (排他) | ❌ 冲突 | ❌ 冲突 | ❌ 冲突 | ❌ 冲突 |
| IS (意向共享) | ✅ 兼容 | ❌ 冲突 | ✅ 兼容 | ✅ 兼容 |
| IX (意向排他) | ❌ 冲突 | ❌ 冲突 | ✅ 兼容 | ✅ 兼容 |

### 6.4 不同 SQL 的加锁分析

```sql
-- 1. 主键等值查询 (Record Lock)
SELECT * FROM t WHERE id = 1 FOR UPDATE;
-- 锁：id=1 的记录锁

-- 2. 主键范围查询 (Next-Key Lock)
SELECT * FROM t WHERE id > 10 AND id < 20 FOR UPDATE;
-- 锁：(10, 15], (15, 20) 的临键锁

-- 3. 唯一索引等值查询 (Record Lock)
SELECT * FROM t WHERE unique_col = 'abc' FOR UPDATE;
-- 锁：唯一索引记录锁 (无间隙锁，因为值唯一)

-- 4. 普通索引等值查询 (Next-Key Lock + Gap Lock)
SELECT * FROM t WHERE normal_idx = 10 FOR UPDATE;
-- 锁：索引记录 + 前后间隙 (Next-Key Lock)
-- 原因：普通索引可能有多条相同值，需锁间隙防插入

-- 5. 无索引条件查询 (表锁！)
SELECT * FROM t WHERE no_idx_col = 'abc' FOR UPDATE;
-- 锁：全表扫描，锁住所有行 (退化为表锁)
-- ⚠️ 生产环境绝对避免！
```

### 6.5 死锁排查

```sql
-- 查看当前锁等待
SELECT * FROM information_schema.INNODB_LOCKS;
SELECT * FROM information_schema.INNODB_LOCK_WAITS;

-- 查看最近一次死锁信息
SHOW ENGINE INNODB STATUS;

-- 开启死锁日志
SET GLOBAL innodb_print_all_deadlocks = ON;

-- 设置锁等待超时 (默认 50 秒)
SET GLOBAL innodb_lock_wait_timeout = 10;

-- 手动杀会话
SHOW PROCESSLIST;
KILL <process_id>;
```

**常见死锁场景及预防：**

| 场景 | 原因 | 预防方案 |
|------|------|---------|
| 交叉更新 | A 锁 1 等 2，B 锁 2 等 1 | 统一访问顺序 |
| 范围查询交叉 | A 锁 (10,20)，B 锁 (15,25) | 缩小范围，减少间隙锁 |
| 批量操作 | 大批量 INSERT/UPDATE 锁冲突 | 分批处理，控制事务大小 |

---

## 七、索引设计最佳实践

### 7.1 索引设计原则

```
1. 最左前缀原则
   联合索引 (a, b, c)：
   ✅ WHERE a=1
   ✅ WHERE a=1 AND b=2
   ✅ WHERE a=1 AND b=2 AND c=3
   ❌ WHERE b=2
   ❌ WHERE b=2 AND c=3
   ⚠️ WHERE a=1 AND c=3  → 仅用到 a 的索引

2. 选择性原则
   选择性 = COUNT(DISTINCT col) / COUNT(*)
   性别 (男/女) → 选择性 0.5 → 不适合建索引
   手机号 → 选择性接近 1 → 适合建索引

3. 覆盖索引优先
   查询列尽量包含在索引中，避免回表

4. 避免冗余索引
   已有 (a, b) 不需要再建 (a)
```

### 7.2 索引下推 (Index Condition Pushdown, ICP)

```sql
-- MySQL 5.6+ 引入
-- 存储引擎层过滤数据，减少回表次数

CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    status VARCHAR(20),
    amount DECIMAL(10,2),
    INDEX idx_user_status (user_id, status)
);

-- 查询
SELECT * FROM orders WHERE user_id > 100 AND status = 'PAID';

-- 无 ICP：
-- 1. 索引扫描 user_id > 100 的所有记录
-- 2. 全部回表取完整行
-- 3. Server 层过滤 status = 'PAID'

-- 有 ICP：
-- 1. 索引扫描 user_id > 100
-- 2. 存储引擎层直接检查索引中的 status 字段
-- 3. 仅对 status='PAID' 的记录回表
-- → 大幅减少 IO
```

### 7.3 索引失效的 8 大场景

```sql
-- 1. 违反最左前缀
-- 索引 (a, b, c)
SELECT * FROM t WHERE b = 1 AND c = 2;  -- ❌ 索引失效

-- 2. 对索引列使用函数/运算
SELECT * FROM t WHERE YEAR(create_time) = 2024;  -- ❌
SELECT * FROM t WHERE create_time >= '2024-01-01' AND create_time < '2025-01-01';  -- ✅

-- 3. 隐式类型转换
-- phone 是 VARCHAR
SELECT * FROM t WHERE phone = 13800138000;  -- ❌ 数字转字符串
SELECT * FROM t WHERE phone = '13800138000';  -- ✅

-- 4. LIKE 以 % 开头
SELECT * FROM t WHERE name LIKE '%张';  -- ❌
SELECT * FROM t WHERE name LIKE '张%';  -- ✅

-- 5. OR 条件中有非索引列
-- 只有 name 有索引
SELECT * FROM t WHERE name = '张三' OR age = 20;  -- ❌ 全表扫描
-- 改：UNION ALL
SELECT * FROM t WHERE name = '张三'
UNION ALL
SELECT * FROM t WHERE age = 20;

-- 6. NOT IN / NOT EXISTS 数据量大时
-- 优化器可能放弃索引

-- 7. IS NULL / IS NOT NULL
-- 当 NULL 值占比高时，优化器可能选择全表扫描

-- 8. 优化器认为全表扫描更快
-- 当查询结果占总行数比例很大 (> 20~30%) 时
-- 优化器放弃索引，选择全表扫描
```

---

## 八、查询优化实战

### 8.1 EXPLAIN 分析

```sql
EXPLAIN SELECT * FROM orders WHERE user_id = 100 AND status = 'PAID';

-- 关键字段解读
```

| 字段 | 含义 | 关注点 |
|------|------|--------|
| type | 访问类型 | ref > range > index > ALL (从优到差) |
| possible_keys | 可能使用的索引 | 为空说明无可用索引 |
| key | 实际使用的索引 | NULL 表示未使用索引 |
| key_len | 索引使用字节数 | 越小越好，联合索引可判断用了几列 |
| rows | 预估扫描行数 | 越小越好 |
| Extra | 额外信息 | Using index(覆盖)✅ Using filesort⚠️ Using temporary❌ |

**type 访问类型详解：**

```
system   → 系统表，只有一行
const    → 主键/唯一索引等值查询，最多一行
eq_ref   → JOIN 中驱动表每行在被驱动表匹配一行 (主键/唯一索引)
ref      → 普通索引等值查询
range    → 索引范围扫描
index    → 全索引扫描
ALL      → 全表扫描 ⚠️
```

### 8.2 慢查询日志

```sql
-- 开启慢查询日志
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;  -- 超过 1 秒记录
SET GLOBAL log_queries_not_using_indexes = ON;  -- 记录未使用索引的查询

-- 查看慢查询配置
SHOW VARIABLES LIKE 'slow_query%';
SHOW VARIABLES LIKE 'long_query_time';

-- 分析慢查询日志
-- 工具：mysqldumpslow / pt-query-digest
mysqldumpslow -s c -t 10 /var/log/mysql/slow.log  # 按次数排序，取前10
pt-query-digest /var/log/mysql/slow.log           # 更强大的分析工具
```

### 8.3 常见慢查询优化

```sql
-- 1. 分页优化：避免大偏移量 LIMIT
-- ❌ 慢
SELECT * FROM orders ORDER BY id LIMIT 1000000, 20;
-- 扫描 1000020 行，丢弃前 1000000 行

-- ✅ 快：延迟关联
SELECT o.* FROM orders o
INNER JOIN (SELECT id FROM orders ORDER BY id LIMIT 1000000, 20) t
ON o.id = t.id;

-- ✅ 快：游标分页 (记住上次最后一条 ID)
SELECT * FROM orders WHERE id > 1000000 ORDER BY id LIMIT 20;

-- 2. COUNT(*) 优化
-- ❌ 大表慢
SELECT COUNT(*) FROM orders WHERE status = 'PAID';

-- ✅ 近似值 (允许误差)
SELECT COUNT(*) FROM orders;  -- InnoDB 优化
EXPLAIN SELECT COUNT(*) FROM orders WHERE status = 'PAID';  -- rows 近似值

-- 3. JOIN 优化：小表驱动大表
-- ✅ 小结果集驱动大结果集
SELECT * FROM orders o
INNER JOIN users u ON o.user_id = u.id
WHERE o.status = 'PAID';

-- 确保被驱动表的 JOIN 字段有索引

-- 4. 子查询优化：改写为 JOIN
-- ❌ 相关子查询，每行执行一次
SELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE status = 'VIP');

-- ✅ 改写为 JOIN
SELECT o.* FROM orders o
INNER JOIN users u ON o.user_id = u.id
WHERE u.status = 'VIP';

-- 5. ORDER BY 优化
-- ✅ 利用索引排序，避免 filesort
-- 有索引 (user_id, create_time)
SELECT * FROM orders WHERE user_id = 100 ORDER BY create_time;
-- 利用索引有序性，无需额外排序
```

---

## 九、MySQL 日志系统

### 9.1 三大核心日志

```
┌───────────────────────────────────────────────┐
│              Redo Log (重做日志)                │
│                                               │
│  层级：InnoDB 引擎层                            │
│  内容：物理日志，记录"在某个数据页上做了什么修改"   │
│  作用：崩溃恢复 (Crash Recovery)                │
│  写入：WAL (Write-Ahead Logging) 先写日志再写磁盘 │
│  结构：循环写 (固定大小，首尾相连)                 │
│                                               │
│  ┌─────────────────────────────────┐          │
│  │ write pos →     ← checkpoint   │          │
│  │ [可写区域]        [待刷盘区域]    │          │
│  └─────────────────────────────────┘          │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│              Undo Log (回滚日志)                │
│                                               │
│  层级：InnoDB 引擎层                            │
│  内容：逻辑日志，记录反向操作                     │
│  作用：事务回滚 + MVCC 多版本读取                 │
│  示例：INSERT → DELETE, UPDATE 记录旧值           │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│              Binlog (归档日志)                  │
│                                               │
│  层级：MySQL Server 层                          │
│  内容：逻辑日志，记录所有 DDL + DML 语句           │
│  作用：主从复制 + 数据恢复                        │
│  格式：STATEMENT / ROW / MIXED                  │
│  写入：追加写 (不会覆盖)                         │
└───────────────────────────────────────────────┘
```

### 9.2 两阶段提交 (保证 Redo Log 和 Binlog 一致)

```
事务提交过程：

1. Prepare 阶段
   └→ InnoDB 将 Redo Log 写入磁盘，标记为 Prepare 状态

2. Commit 阶段
   └→ MySQL Server 将 Binlog 写入磁盘
   └→ InnoDB 将 Redo Log 标记为 Commit 状态

崩溃恢复时：
- Redo Log = Commit → 提交事务
- Redo Log = Prepare + Binlog 完整 → 提交事务
- Redo Log = Prepare + Binlog 不完整 → 回滚事务
```

---

## 十、主从复制与读写分离

### 10.1 主从复制原理

```
┌─────────────────────┐        ┌─────────────────────┐
│     Master (主库)     │        │     Slave (从库)     │
│                     │        │                     │
│  写操作 ──→ Binlog  │        │  IO Thread          │
│             │       │        │    ↓                │
│             └───────┼────────→ 读取 Binlog          │
│                     │        │    ↓                │
│                     │        │  Relay Log (中继日志) │
│                     │        │    ↓                │
│                     │        │  SQL Thread          │
│                     │        │    ↓                │
│                     │        │  重放 SQL 到从库      │
│                     │        │                     │
└─────────────────────┘        └─────────────────────┘
```

### 10.2 三种复制模式

| 模式 | 说明 | 一致性 | 性能 |
|------|------|--------|------|
| 异步复制 | 主库不等从库确认就返回 | 弱 | 最高 |
| 半同步复制 | 至少一个从库收到 Binlog 才返回 | 较强 | 中等 |
| 全同步复制 | 所有从库都执行完才返回 | 强 | 最低 |

### 10.3 主从延迟问题

```
问题：主库写入后，从库尚未同步，读从库得到旧数据

解决方案：
1. 强制走主库：写后立即读的场景，直接读主库
2. 延迟容忍：对一致性要求不高的场景，接受短暂延迟
3. 并行复制：MySQL 5.7+ 支持基于 LOGICAL_CLOCK 的并行复制
4. 半同步复制：确保至少一个从库已同步
```

### 10.4 读写分离架构

```
                    ┌──────────────┐
                    │   应用层      │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │  中间件/Proxy │
                    │ (MyCat /     │
                    │  ShardingSphere)│
                    └──┬─────┬─────┘
                       │     │
              ┌────────┘     └────────┐
              ↓                       ↓
       ┌─────────────┐         ┌─────────────┐
       │   Master    │         │   Slave 1   │
       │   (读写)     │         │   (只读)     │
       └──────┬──────┘         └─────────────┘
              │                       ↑
              │                ┌─────────────┐
              └───────────────→│   Slave 2   │
                 复制          │   (只读)     │
                              └─────────────┘
```

---

## 十一、分库分表

### 11.1 何时需要分库分表

```
单表行数超过 500万~1000万 行 → 考虑分表
单库容量超过 500GB → 考虑分库
单表查询响应 > 1s → 考虑分表
单机 QPS > 5000 → 考虑分库
```

### 11.2 垂直拆分

```
垂直分库：按业务拆分
  用户库、订单库、商品库

垂直分表：大字段拆分
  主表 (id, name, status) + 扩展表 (id, detail, content)
  减少单行大小，提高缓存命中率
```

### 11.3 水平拆分

```
水平分表：同一库内，将一张大表拆成多张结构相同的小表
  orders_0, orders_1, ..., orders_15
  分片键：user_id % 16

水平分库：多个库，每个库存放部分数据
  db_0 存 user_id % 4 == 0 的数据
  db_1 存 user_id % 4 == 1 的数据
```

### 11.4 分片策略

| 策略 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| Hash 取模 | shard = key % N | 数据分布均匀 | 扩容需数据迁移 |
| 范围分片 | ID 1~1000万→shard1 | 扩容方便，加新分片即可 | 数据热点 |
| 时间分片 | 按月/年分表 | 历史数据易归档 | 跨片查询多 |

### 11.5 分库分表带来的问题

```
1. 分布式 ID
   方案：UUID、雪花算法 (Snowflake)、号段模式、Redis INCR

2. 跨片 JOIN
   方案：应用层组装、宽表冗余、数据中台

3. 跨片分页/排序
   方案：二次排序 (各分片取 TOP N，合并后排序)
   问题：深度分页性能差

4. 数据迁移与扩容
   方案：一致性哈希、翻倍扩容法
```

---

## 十二、连接池配置与优化

### 12.1 HikariCP 推荐配置

```yaml
spring:
  datasource:
    hikari:
      # 连接池大小 (建议值：CPU核心数 * 2 + 有效磁盘数)
      maximum-pool-size: 20
      minimum-idle: 5
      # 连接超时 (毫秒)
      connection-timeout: 30000
      # 空闲连接存活时间 (毫秒，默认 10 分钟)
      idle-timeout: 600000
      # 连接最大存活时间 (毫秒，建议比 MySQL wait_timeout 小)
      max-lifetime: 1800000
      # 连接验证
      connection-test-query: SELECT 1
      # 连接池名称
      pool-name: HikariCP
```

### 12.2 连接池大小计算

```
经验公式：
  connections = (core_count * 2) + effective_spindle_count

  示例：4 核 SSD
  connections = (4 * 2) + 1 = 9

实际情况：
  需压测确定，关注：
  - 数据库最大连接数 (max_connections)
  - 应用并发请求数
  - 事务平均耗时
```

### 12.3 连接池常见问题

```
1. 连接池耗尽
   现象：Connection is not available, request timed out
   原因：慢查询占用连接、连接泄漏、池大小不足
   排查：
   - 检查慢查询日志
   - 检查应用是否关闭了连接 (try-with-resources)
   - 监控活跃连接数

2. 连接失效
   现象：Communications link failure
   原因：MySQL 主动断开 (wait_timeout 到期)、网络问题
   解决：配置连接验证 (connection-test-query)

3. 连接泄漏
   原因：代码中未关闭连接
   解决：
   - 使用 try-with-resources
   - HikariCP 开启 leakDetectionThreshold
   - 代码审查确保所有连接都被关闭
```

---

## 十三、MySQL 与 Java 集成

### 13.1 MyBatis 最佳实践

```java
// 1. 参数化查询，防 SQL 注入
@Select("SELECT * FROM users WHERE id = #{id}")
User findById(@Param("id") Long id);

// 2. 动态 SQL
@SelectProvider(type = UserSqlProvider.class, method = "buildSelect")
List<User> search(UserQuery query);

// 3. 批量操作 (减少网络往返)
@Insert("<script>" +
    "INSERT INTO users (name, email) VALUES " +
    "<foreach collection='users' item='user' separator=','>" +
    "(#{user.name}, #{user.email})" +
    "</foreach>" +
    "</script>")
int batchInsert(@Param("users") List<User> users);

// 4. 分页 (PageHelper)
PageHelper.startPage(pageNum, pageSize);
List<User> users = userMapper.selectByCondition(query);
PageInfo<User> pageInfo = new PageInfo<>(users);

// 5. 一级缓存 (SqlSession 级，默认开启)
// 6. 二级缓存 (Mapper 级，需手动开启，分布式环境慎用)
```

### 13.2 Spring Data JPA 最佳实践

```java
// 1. 使用 @EntityGraph 解决 N+1 问题
@EntityGraph(attributePaths = {"orders", "orders.items"})
@Query("SELECT u FROM User u WHERE u.id = :id")
User findByIdWithOrders(@Param("id") Long id);

// 2. 投影查询，减少数据传输
@Query("SELECT new com.example.UserDTO(u.id, u.name) FROM User u WHERE u.status = :status")
List<UserDTO> findActiveUsers(@Param("status") String status);

// 3. 分页排序
Page<User> findByStatus(String status, Pageable pageable);

// 4. 批量保存 (需开启 batch)
spring.jpa.properties.hibernate.jdbc.batch_size=50
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true

// 5. 只读事务
@Transactional(readOnly = true)
public List<User> listUsers() { ... }
```

### 13.3 防 SQL 注入

```
安全写法：
  MyBatis: 使用 #{param} (预编译)
  JPA: 使用 :param 或 ?1 (预编译)
  JDBC: PreparedStatement

危险写法：
  MyBatis: 使用 ${param} (字符串拼接，❌)
  JDBC: Statement + 字符串拼接 (❌)

特殊情况：
  动态表名/列名只能用 ${}，需在代码层白名单校验
```

---

## 十四、高并发场景实战

### 14.1 电商订单系统

```sql
-- 表设计
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,           -- 雪花算法 ID
    order_no VARCHAR(32) UNIQUE,     -- 业务订单号
    user_id BIGINT NOT NULL,
    status TINYINT NOT NULL DEFAULT 0,  -- 0:待支付 1:已支付 2:已发货
    total_amount DECIMAL(10,2) NOT NULL,
    create_time DATETIME NOT NULL,
    update_time DATETIME NOT NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_create_time (create_time),
    INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 高并发下单：乐观锁防超卖
UPDATE products
SET stock = stock - #{quantity},
    version = version + 1
WHERE id = #{productId}
  AND stock >= #{quantity}
  AND version = #{version};

-- 订单状态变更：悲观锁
SELECT * FROM orders WHERE order_no = #{orderNo} FOR UPDATE;
UPDATE orders SET status = 1 WHERE order_no = #{orderNo};
```

### 14.2 秒杀场景

```sql
-- 预扣减库存 (单行锁，串行化)
UPDATE seckill_products
SET stock = stock - 1
WHERE product_id = #{productId}
  AND stock > 0;

-- 优化方案：
-- 1. Redis 预扣减 → 异步写入 MySQL
-- 2. 限流：令牌桶 / 滑动窗口
-- 3. 队列削峰：请求入 MQ，消费端匀速处理
```

### 14.3 数据一致性保障

```
最终一致性方案：

1. 本地消息表
   业务操作 + 写入消息表 (同一事务)
   定时任务扫描消息表 → 发送到 MQ
   消费端处理 + 更新消息状态

2. 事务消息 (RocketMQ)
   半消息 → 执行业务 → 提交/回滚消息

3. Canal 订阅 Binlog
   监听 MySQL Binlog → 同步到 ES/Redis/MQ
```

---

## 十五、MySQL 调优清单

### 15.1 服务器参数调优

```ini
[mysqld]
# InnoDB 缓冲池 (建议物理内存的 60%~80%)
innodb_buffer_pool_size = 8G
innodb_buffer_pool_instances = 8

# Redo Log 配置
innodb_log_file_size = 512M
innodb_log_buffer_size = 16M

# IO 优化
innodb_flush_log_at_trx_commit = 1   # 1:每次提交刷盘(最安全) 2:每秒刷盘(高性能)
innodb_flush_method = O_DIRECT       # 避免双缓冲

# 连接数
max_connections = 2000
wait_timeout = 600
interactive_timeout = 600

# 慢查询
slow_query_log = 1
long_query_time = 1
log_queries_not_using_indexes = 1

# Binlog
sync_binlog = 1                      # 每次提交同步 Binlog
binlog_format = ROW                  # 行模式，主从安全
```

### 15.2 表设计优化

```
1. 字段类型尽量小：TINYINT < INT < BIGINT
2. 用 NOT NULL 替代 NULL (NULL 影响索引和比较)
3. 字符集统一 utf8mb4 (支持 emoji)
4. 时间用 DATETIME 或 TIMESTAMP (不用 VARCHAR)
5. 金额用 DECIMAL (不用 FLOAT/DOUBLE)
6. 大文本用 TEXT，不放在常用查询表中
7. 适当冗余，减少 JOIN (反范式)
```

---

## 十六、常见问题与解决方案

### 16.1 问题速查表

| 问题 | 现象 | 根因 | 解决方案 |
|------|------|------|---------|
| 慢查询 | 响应 > 1s | 缺索引/大表/复杂 SQL | EXPLAIN + 加索引 + 优化 SQL |
| 死锁 | Lock wait timeout exceeded | 交叉锁等待 | 统一访问顺序 + 缩小事务 |
| 连接耗尽 | Too many connections | 连接泄漏/池太小 | 修复泄漏 + 调大连接池 |
| 主从延迟 | 从库数据落后 | 复制延迟 | 半同步/并行复制/强制读主 |
| 索引失效 | type=ALL | 函数/OR/隐式转换 | 重写 SQL + 检查类型 |
| OOM | MySQL 被 Kill | buffer_pool 过大 | 调整内存参数 |
| 磁盘满 | No space left | 日志/Binlog 过大 | 清理 + 设置过期 |
| 页分裂 | 插入变慢 | UUID 主键无序 | 改用自增 ID / 雪花算法 |

### 16.2 线上问题排查流程

```
1. 发现问题
   └→ 监控告警 (CPU/内存/连接数/慢查询数)

2. 定位问题
   └→ SHOW PROCESSLIST;  -- 看当前执行的 SQL
   └→ SHOW ENGINE INNODB STATUS;  -- 看锁和事务
   └→ 慢查询日志分析
   └→ EXPLAIN 分析可疑 SQL

3. 紧急处理
   └→ KILL 慢查询会话
   └→ 临时扩容连接数
   └→ 切换主从 (主库故障时)

4. 根因修复
   └→ 优化 SQL / 加索引 / 调整参数 / 修复代码

5. 复盘
   └→ 记录问题、原因、改进措施
```

---

## 十七、面试高频 Q&A

### Q1: InnoDB 为什么用 B+ 树而不是 B 树或红黑树？

**A:**
- **B+ 树 vs B 树**：B+ 树非叶子节点不存数据，一页(16KB)能存更多键值，树更矮，磁盘 IO 更少；叶子节点双向链表连接，范围查询只需遍历链表，B 树需要中序遍历。
- **B+ 树 vs 红黑树**：红黑树是二叉树，数据量大时树高很高（1000万条约 23 层），磁盘 IO 次数多；B+ 树 3~4 层即可索引千万级数据。
- **B+ 树 vs Hash**：Hash 等值查询 O(1) 但完全不支持范围查询和排序。

### Q2: 说说 MVCC 的实现原理？

**A:**
MVCC 通过隐藏字段 + undo log 版本链 + ReadView 实现：
1. 每行数据有 `DB_TRX_ID`（最近修改的事务ID）和 `DB_ROLL_PTR`（指向 undo log 的指针）
2. 每次修改生成新版本，通过 `ROLL_PTR` 串成版本链
3. 读操作创建 ReadView，根据事务 ID 和活跃事务列表判断哪个版本可见
4. RC 每次读都创建新 ReadView，RR 只在首次读时创建

### Q3: MySQL 的事务隔离级别有哪些？默认是哪个？

**A:**
四种：READ UNCOMMITTED、READ COMMITTED、REPEATABLE READ（默认）、SERIALIZABLE。
RR 级别通过 MVCC 解决了脏读和不可重复读，通过 Next-Key Lock 部分解决了幻读。

### Q4: 什么情况下索引会失效？

**A:**
8 大场景：违反最左前缀、对索引列用函数/运算、隐式类型转换、LIKE 以 % 开头、OR 条件含非索引列、NOT IN 数据量大、IS NULL 占比高、优化器认为全表扫描更快。

### Q5: 如何定位和优化慢查询？

**A:**
1. 开启慢查询日志，用 `pt-query-digest` 分析
2. 对可疑 SQL 执行 `EXPLAIN`，关注 type、key、rows、Extra
3. 优化：加索引、避免回表、改写子查询为 JOIN、分页用延迟关联、利用索引排序避免 filesort

### Q6: MySQL 主从复制的原理？如何解决主从延迟？

**A:**
主库写 Binlog → 从库 IO Thread 拉取写入 Relay Log → SQL Thread 重放。
延迟解决：强制读主库、半同步复制、并行复制（MySQL 5.7+）、业务层容忍短暂不一致。

### Q7: 分库分表后如何处理分布式 ID 和跨片查询？

**A:**
分布式 ID：雪花算法（时间戳+机器ID+序列号）、号段模式、Redis INCR。
跨片查询：应用层组装、宽表冗余、数据中台；跨片分页用二次排序（各分片取 TOP N 合并）。

### Q8: 死锁怎么排查和预防？

**A:**
排查：`SHOW ENGINE INNODB STATUS` 查看死锁信息，开启 `innodb_print_all_deadlocks`。
预防：统一加锁顺序、缩小事务粒度、合理设计索引（避免全表锁）、设置 `innodb_lock_wait_timeout`。

### Q9: 说说 MySQL 的 Redo Log 和 Binlog 的区别？

**A:**

| 维度 | Redo Log | Binlog |
|------|----------|--------|
| 层级 | InnoDB 引擎层 | Server 层 |
| 内容 | 物理日志（数据页变更） | 逻辑日志（SQL 语句/行变更） |
| 用途 | 崩溃恢复 | 主从复制、数据恢复 |
| 写入 | 循环写 | 追加写 |
| 时机 | WAL（先写日志） | 事务提交时 |

两者通过两阶段提交保证一致性。

### Q10: 线上数据库 CPU 飙高怎么排查？

**A:**
1. `SHOW PROCESSLIST` 查看当前活跃 SQL
2. 找到慢查询，`EXPLAIN` 分析执行计划
3. 检查是否缺索引、是否有全表扫描
4. 检查是否有大量并发锁等待
5. 紧急处理：KILL 慢查询、临时加索引
6. 根因修复后观察 CPU 回落

---

## 十八、知识体系总览

```
MySQL 知识体系
├── 架构
│   ├── 四层架构 (连接→服务→引擎→存储)
│   ├── 存储引擎 (InnoDB / MyISAM)
│   └── SQL 执行流程
├── 索引
│   ├── B+ 树原理
│   ├── 聚簇索引 vs 二级索引
│   ├── 覆盖索引 / 索引下推
│   └── 索引失效 8 大场景
├── 事务
│   ├── ACID 特性
│   ├── 四种隔离级别
│   └── MVCC 实现
├── 锁
│   ├── 全局锁 / 表锁 / 行锁
│   ├── 记录锁 / 间隙锁 / 临键锁
│   └── 死锁排查
├── 日志
│   ├── Redo Log (崩溃恢复)
│   ├── Undo Log (回滚 + MVCC)
│   └── Binlog (主从复制)
├── 优化
│   ├── EXPLAIN 分析
│   ├── 慢查询优化
│   ├── 参数调优
│   └── 连接池配置
├── 高可用
│   ├── 主从复制
│   ├── 读写分离
│   └── 分库分表
└── 实战
    ├── Java 集成 (MyBatis / JPA)
    ├── 高并发场景
    ├── 数据一致性
    └── 问题排查
```

---

## 参考资源

- [MySQL 官方文档](https://dev.mysql.com/doc/refman/8.0/en/)
- [JavaGuide MySQL 专题](https://javaguide.cn/database/mysql/)
- [阿里云开发者社区 - MySQL 锁机制](https://developer.aliyun.com/article/1732873)
- [腾讯云 - MySQL 面试题精讲](https://cloud.tencent.com/developer/article/2595346)
- [腾讯云 - MySQL 十大慢查询优化实战](https://cloud.tencent.com/developer/article/2532699)
- [博客园 - MySQL 索引失效场景总结](https://www.cnblogs.com/wzh2010/p/18030898)
- [博客园 - InnoDB 常用锁总结](https://www.cnblogs.com/wzh2010/p/18030866)
- [博客园 - 高并发下的数据一致性保障](https://www.cnblogs.com/wzh2010/p/18031204)
- [腾讯云 - MySQL 连接池耗尽排查](https://cloud.tencent.com/developer/article/2595344)
- [51CTO - MySQL 锁机制入门指南](https://www.51cto.com/article/845016.html)
- [牛客网 - MySQL 面试题总结](https://www.nowcoder.com/discuss/353159158511902720)
- [CSDN - MySQL 面试题（最全）](https://blog.csdn.net/qq_44700578/article/details/139941002)

---

> **学习建议**：MySQL 是 Java 后端面试的重中之重。建议按照 "索引 → 事务 → 锁 → 日志 → 优化 → 架构" 的顺序深入学习，每个知识点都要能画出原理图、写出示例 SQL、说出实际项目中的应用场景。面试时善于将知识点串联起来回答（如：一个 UPDATE 语句的执行过程涉及了哪些日志、哪些锁），会比孤立回答更出彩。
