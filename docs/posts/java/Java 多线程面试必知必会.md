---
title: Java 多线程面试必知必会
date: 2026-07-07
category: java
tags:
  - 面试
---

# Java 多线程面试必知必会

> 面向 Java 后端开发工程师的并发编程核心知识体系，覆盖线程模型、锁机制、JMM、线程池与高频面试题。
> 最后更新：2026-07-07

---

## 一、线程基础

### 1.1 线程创建方式

| 方式 | 说明 | 推荐度 |
|------|------|--------|
| **继承 Thread 类** | 重写 `run()` 方法 | 不推荐（Java 单继承局限） |
| **实现 Runnable 接口** | 实现 `run()` 方法，避免单继承局限 | 推荐 |
| **实现 Callable 接口** | 实现 `call()` 方法，**有返回值**，可抛异常 | 需要返回值时推荐 |
| **线程池** | 通过 `ThreadPoolExecutor` 提交任务 | **生产环境最佳实践** |

### 1.2 线程状态（6 种）

```
NEW ──start()──> RUNNABLE ──获取锁失败──> BLOCKED
                   │                        │
                   ├──wait()/join()──> WAITING│
                   │                   │     │
                   ├──sleep(t)/wait(t)─> TIMED_WAITING
                   │                         │
                   └──run()完成──> TERMINATED
```

| 状态 | 含义 |
|------|------|
| **NEW** | 线程已创建但尚未调用 `start()` |
| **RUNNABLE** | 已启动，包含就绪和运行中两种子状态 |
| **BLOCKED** | 等待获取锁（如进入 synchronized 代码块） |
| **WAITING** | 无限期等待，需被 `notify()`/`notifyAll()` 唤醒 |
| **TIMED_WAITING** | 超时等待，时间到自动恢复 |
| **TERMINATED** | 线程执行完毕 |

### 1.3 wait() vs sleep() 对比

| 特性 | `wait()` | `sleep()` |
|------|----------|-----------|
| 所属类 | `Object` 类 | `Thread` 类 |
| 锁释放 | **主动释放** monitor 锁 | **不释放**锁 |
| 使用限制 | 必须在 `synchronized` 代码块内 | 无此要求 |
| 恢复方式 | 需 `notify()`/`notifyAll()` 或中断 | 时间到期自动恢复 |

---

## 二、JMM（Java Memory Model）

### 2.1 核心概念

```
线程 A                     线程 B
┌──────────┐             ┌──────────┐
│ 工作内存  │             │ 工作内存  │
│ (CPU缓存) │             │ (CPU缓存) │
└────┬─────┘             └────┬─────┘
     │  read/write            │  read/write
     ▼                        ▼
┌──────────────────────────────────┐
│          主内存（堆）              │
│    所有线程共享的变量存储区         │
└──────────────────────────────────┘
```

- **主内存**：所有线程共享的变量存储区（对应堆内存中的实例变量/静态变量）
- **工作内存**：每个线程私有的变量副本（对应 CPU 缓存）
- 线程对变量的操作必须在工作内存中进行，不能直接操作主内存

### 2.2 并发三大特性

| 特性 | 含义 | 保证手段 |
|------|------|----------|
| **原子性** | 操作不可被中断 | `synchronized`、`Lock`、`Atomic` 类 |
| **可见性** | 一个线程修改后其他线程立即可见 | `volatile`、`synchronized`、`final` |
| **有序性** | 程序执行顺序与代码顺序一致 | `volatile`（禁止指令重排）、`synchronized` |

### 2.3 happens-before 原则

如果操作 A happens-before 操作 B，则 A 的结果对 B 可见：

| 规则 | 说明 |
|------|------|
| 程序顺序规则 | 同一线程中，前一个操作 happens-before 后一个 |
| 监视器锁规则 | 解锁操作 happens-before 后续加锁操作 |
| volatile 规则 | 写操作 happens-before 后续读操作 |
| 线程启动规则 | `start()` happens-before 线程内操作 |
| 传递性 | A hb B，B hb C → A hb C |

---

## 三、synchronized 原理与锁升级

### 3.1 底层实现

- 基于对象头的 **Mark Word** 实现
- 同步代码块：通过 `monitorenter` / `monitorexit` 指令
- 同步方法：通过 `ACC_SYNCHRONIZED` 标志

### 3.2 锁升级（JDK 6 优化）

```
无锁状态 → 偏向锁 → 轻量级锁 → 重量级锁
（不可逆，只能升级不能降级）
```

| 锁类型 | 适用场景 | 原理 |
|--------|----------|------|
| **偏向锁** | 始终只有一个线程访问 | 将线程 ID 记录在 Mark Word，同一线程无需 CAS |
| **轻量级锁** | 存在少量竞争 | 线程通过 CAS 尝试将 Mark Word 替换为锁记录指针 |
| **重量级锁** | 竞争激烈 | 依赖操作系统 Monitor（mutex），线程挂起/唤醒开销大 |

### 3.3 锁优化策略

| 策略 | 说明 |
|------|------|
| **减少锁粒度** | 如 `ConcurrentHashMap` JDK 1.7 的 Segment 分段锁 |
| **锁粗化** | 将循环内加锁操作提取到循环外 |
| **锁消除** | JIT 编译器检测无竞争时删除锁 |
| **自适应自旋** | 根据历史成功率动态调整自旋次数 |

---

## 四、ReentrantLock vs synchronized

| 维度 | `synchronized` | `ReentrantLock` |
|------|----------------|-----------------|
| **层面** | JVM 关键字 | API 层面（`java.util.concurrent.locks`） |
| **释放锁** | 自动释放 | **必须手动 `unlock()`**（需配合 `try/finally`） |
| **可中断** | 不可中断 | 支持 `lockInterruptibly()` |
| **公平性** | 仅非公平锁 | 可选公平锁或非公平锁 |
| **条件变量** | 单一（`wait/notify`） | 支持多个 `Condition` |
| **底层实现** | Monitor + 锁升级 | CAS 自旋 + volatile |
| **可超时** | 不支持 | 支持 `tryLock(timeout)` |

### 4.1 公平锁 vs 非公平锁

| 特性 | 公平锁 | 非公平锁 |
|------|--------|---------|
| 获取顺序 | 遵循 FIFO 顺序 | 直接尝试获取，失败再排队 |
| 线程饥饿 | 不会饿死线程 | 可能导致饥饿 |
| 吞吐量 | 低（需维护队列） | 高 |
| 默认 | 否 | 是 |

### 4.2 使用示例

```java
ReentrantLock lock = new ReentrantLock();

try {
    lock.lock();
    // 业务逻辑
} finally {
    lock.unlock();  // 必须在 finally 中释放锁！
}

// 可中断获取锁
lock.lockInterruptibly();

// 尝试获取锁（非阻塞）
if (lock.tryLock()) {
    try {
        // 业务逻辑
    } finally {
        lock.unlock();
    }
}

// 超时获取锁
if (lock.tryLock(3, TimeUnit.SECONDS)) {
    try {
        // 业务逻辑
    } finally {
        lock.unlock();
    }
}
```

---

## 五、volatile 关键字

### 5.1 两大作用

| 作用 | 说明 |
|------|------|
| **保证可见性** | 写入后立即刷新到主内存，其他线程读取时强制从主内存加载 |
| **禁止指令重排** | 通过内存屏障（Memory Barrier）阻止编译器/CPU 对指令重新排序 |

### 5.2 不保证原子性

`i++` 等复合操作不是原子的，即使加了 `volatile` 也不行，需要 `AtomicInteger` 或 `synchronized`。

### 5.3 底层实现

汇编层面加入 **`lock` 前缀指令**（内存屏障）：
1. 确保指令重排不会跨越屏障
2. 强制将缓存修改立即写入主存
3. 写操作导致其他 CPU 缓存行失效（MESI 协议）

### 5.4 经典应用 —— 单例模式双重检查锁

```java
private volatile static Singleton instance = null;  // 必须加 volatile

public static Singleton getInstance() {
    if (instance == null) {                         // 第一次检查（无锁）
        synchronized (Singleton.class) {
            if (instance == null) {                 // 第二次检查（有锁）
                instance = new Singleton();
            }
        }
    }
    return instance;
}
```

**为什么必须加 volatile？** `new` 操作分三步：1.分配内存 → 2.初始化对象 → 3.引用赋值。无 volatile 时 2 和 3 可能重排，导致其他线程拿到**半初始化对象**。

---

## 六、CAS 原理与 ABA 问题

### 6.1 CAS（Compare And Swap）

无锁算法，涉及三个操作数：

```
CAS(V, A, B)：
  当且仅当 V == A 时，将 V 更新为 B
  否则自旋重试
```

| 优点 | 缺点 |
|------|------|
| 无锁操作，避免上下文切换开销 | ABA 问题 |
| 适合低竞争场景 | 高竞争时长时间自旋浪费 CPU |
| | 只能保证单个变量原子性 |

### 6.2 ABA 问题

值从 A 变为 B 再变回 A，CAS 误以为未变化。

**解决方案**：
- `AtomicStampedReference`：引入**版本号（stamp）**，每次修改版本号 +1
- `AtomicMarkableReference`：引入布尔标记位

```java
AtomicStampedReference<Integer> ref = new AtomicStampedReference<>(100, 1);
ref.compareAndSet(100, 200, 1, 2);  // 同时检查值和版本号
```

### 6.3 Atomic 原子类

| 类型 | 示例 |
|------|------|
| 基本类型 | `AtomicInteger`、`AtomicLong`、`AtomicBoolean` |
| 数组类型 | `AtomicIntegerArray`、`AtomicLongArray` |
| 引用类型 | `AtomicReference`、`AtomicStampedReference` |
| 字段更新器 | `AtomicIntegerFieldUpdater`、`AtomicLongFieldUpdater` |
| 累加器 | `LongAdder`、`DoubleAdder`（高并发下性能优于 AtomicLong） |

---

## 七、AQS（AbstractQueuedSynchronizer）

### 7.1 核心思想

AQS 是 Java 并发包的基石，解决两大问题：

| 问题 | 解决方案 |
|------|---------|
| 同步状态的原子性管理 | `volatile int state` 变量表示同步状态 |
| 线程阻塞/唤醒的队列管理 | CLH 变体的**双向虚拟队列**管理等待线程 |

```
资源空闲 → 当前线程获取资源
资源被占 → 线程封装为 Node 加入同步队列 → 自旋 + 阻塞等待
```

### 7.2 两种模式

| 模式 | 说明 | 典型实现 |
|------|------|---------|
| **独占模式** | 同一时刻只有一个线程持有资源 | `ReentrantLock` |
| **共享模式** | 多个线程可同时持有资源 | `Semaphore`、`CountDownLatch` |

### 7.3 基于 AQS 的并发工具

| 工具 | 模式 | 原理 |
|------|------|------|
| `ReentrantLock` | 独占 | state=0 未锁定，state>0 重入次数 |
| `CountDownLatch` | 共享 | state=倒计时数，countDown() 递减至 0 |
| `Semaphore` | 共享 | state=许可数，acquire() 递减，release() 递增 |
| `CyclicBarrier` | - | 组合 ReentrantLock + Condition 实现 |

---

## 八、线程池

### 8.1 七大核心参数

```java
public ThreadPoolExecutor(
    int corePoolSize,                    // 1. 核心线程数（长期存活）
    int maximumPoolSize,                 // 2. 最大线程数（核心+非核心）
    long keepAliveTime,                  // 3. 非核心线程空闲存活时间
    TimeUnit unit,                       // 4. 时间单位
    BlockingQueue<Runnable> workQueue,   // 5. 工作队列
    ThreadFactory threadFactory,         // 6. 线程工厂
    RejectedExecutionHandler handler     // 7. 拒绝策略
)
```

### 8.2 任务执行流程

```
任务提交
  ↓
① 当前线程数 < corePoolSize → 创建核心线程执行
  ↓ (核心线程已满)
② workQueue 未满 → 任务加入队列等待
  ↓ (队列已满)
③ 当前线程数 < maximumPoolSize → 创建非核心线程执行
  ↓ (线程数已达上限)
④ 触发 handler 拒绝策略
```

> 非核心线程空闲超过 `keepAliveTime` 会被销毁；核心线程默认不销毁（可通过 `allowCoreThreadTimeOut(true)` 允许超时销毁）。

### 8.3 四种拒绝策略

| 策略 | 行为 | 适用场景 |
|------|------|---------|
| **AbortPolicy**（默认） | 抛出 `RejectedExecutionException` | 核心业务，不能容忍丢失 |
| **CallerRunsPolicy** | 调用者线程直接执行该任务 | 零容忍丢失 + 流量控制 |
| **DiscardPolicy** | 静默丢弃任务 | 允许丢失的非核心业务 |
| **DiscardOldestPolicy** | 丢弃队列中最旧的任务 | 允许丢弃旧消息的场景 |

### 8.4 严禁使用 Executors 工厂类

| 工厂方法 | 风险 |
|----------|------|
| `newFixedThreadPool` | 无界队列（`LinkedBlockingQueue`），任务堆积 → **OOM** |
| `newSingleThreadExecutor` | 同上，无界队列 OOM |
| `newCachedThreadPool` | 最大线程数 `Integer.MAX_VALUE`，创建大量线程 → **OOM** |
| `newScheduledThreadPool` | 同上 |

### 8.5 线程数配置原则

| 任务类型 | 公式 | 示例（8 核 CPU） |
|----------|------|-----------------|
| **CPU 密集型** | `CPU核心数 + 1` | 9 个线程 |
| **IO 密集型** | `CPU核心数 * (1 + 等待时间/CPU时间)` | 16~24 个线程 |

### 8.6 生产环境最佳实践

```java
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    8,                                          // corePoolSize
    16,                                         // maximumPoolSize
    60, TimeUnit.SECONDS,                       // keepAliveTime
    new ArrayBlockingQueue<>(1000),              // 有界队列
    new ThreadFactory() {
        private final AtomicInteger counter = new AtomicInteger(1);
        @Override
        public Thread newThread(Runnable r) {
            Thread t = new Thread(r, "order-pool-" + counter.getAndIncrement());
            t.setDaemon(false);                 // 非守护线程
            return t;
        }
    },
    new ThreadPoolExecutor.CallerRunsPolicy()   // 拒绝策略
);
```

**关键实践**：
1. 使用**有界队列**（如 `ArrayBlockingQueue`）
2. **自定义线程工厂**，设置有意义的线程名
3. **不要设为守护线程**，避免 JVM 退出时任务被强制终止
4. **线程池隔离**：不同业务使用独立线程池，防止单一故障耗尽所有资源

### 8.7 正确关闭线程池

```java
executor.shutdown();                                // 平缓关闭
if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
    executor.shutdownNow();                         // 超时强制关闭
}
```

### 8.8 execute() vs submit()

| 方法 | 异常处理 |
|------|---------|
| `execute()` | 未捕获异常导致当前工作线程终止，线程池新建线程替代 |
| `submit()` | 异常封装在 `Future` 中，不会终止工作线程，必须调用 `Future.get()` 才能发现 |

---

## 九、并发工具类

### 9.1 CountDownLatch（倒计时器）

```java
// 主线程等待 N 个子线程完成
CountDownLatch latch = new CountDownLatch(5);

for (int i = 0; i < 5; i++) {
    executor.submit(() -> {
        try {
            // 业务逻辑
        } finally {
            latch.countDown();   // 完成一个，计数减 1
        }
    });
}

latch.await();   // 主线程阻塞，直到计数为 0
```

- **一次性**：计数到 0 后不可重置
- 适用场景：并行任务汇总、并发测试

### 9.2 CyclicBarrier（循环屏障）

```java
// N 个线程互相等待，到齐后一起执行
CyclicBarrier barrier = new CyclicBarrier(3, () -> {
    System.out.println("所有线程就绪，开始执行");
});

for (int i = 0; i < 3; i++) {
    executor.submit(() -> {
        // 准备工作
        barrier.await();   // 等待其他线程
        // 一起执行
    });
}
```

- **可循环**：到齐后可重置重新使用
- 适用场景：多线程计算数据最后合并

### 9.3 Semaphore（信号量）

```java
// 控制同时访问资源的线程数
Semaphore semaphore = new Semaphore(5);   // 最多 5 个线程同时访问

try {
    semaphore.acquire();    // 获取许可
    // 访问资源
} finally {
    semaphore.release();    // 释放许可
}
```

- 适用场景：限流、资源池（数据库连接池）

### 9.4 四大工具类对比

| 工具类 | 核心功能 | 是否可复用 |
|--------|---------|-----------|
| **CountDownLatch** | 一个/多个线程等待其他线程完成 | 否（一次性） |
| **CyclicBarrier** | 一组线程互相等待到同步点 | 是（可循环） |
| **Semaphore** | 控制同时访问资源的线程数 | 是 |
| **Exchanger** | 两个线程交换数据 | 是 |

---

## 十、ConcurrentHashMap 原理

### 10.1 JDK 1.7：Segment 分段锁

- 将数据分为多个 `Segment`（默认 16 个），每个 Segment 继承 `ReentrantLock`
- 不同 Segment 可并发访问，理论最大并发度 = Segment 数量

### 10.2 JDK 1.8+：CAS + synchronized

- **数据结构**：`Node` 数组 + 链表 + **红黑树**（链表长度 ≥ 8 且数组长度 ≥ 64 时转红黑树）
- **put 操作**：
  - 若桶为空 → CAS 插入
  - 若桶非空 → `synchronized` 锁住链表/红黑树的**头节点**
- **扩容**：多线程协助扩容，通过 `sizeCtl` 控制
- **size 计算**：使用 `baseCount` + `CounterCell` 数组（类似 `LongAdder` 分段计数）

### 10.3 与 Hashtable / synchronizedMap 对比

| 特性 | ConcurrentHashMap | Hashtable | synchronizedMap |
|------|-------------------|-----------|-----------------|
| 锁粒度 | 桶级别（JDK 8） | 全表锁 | 全表锁 |
| 并发度 | 高 | 低 | 低 |
| null 键值 | 不允许 | 允许 | 取决于底层 Map |

---

## 十一、ThreadLocal

### 11.1 原理

每个线程维护一个 `ThreadLocalMap`，Key 是 `ThreadLocal` 的**弱引用**，Value 是**强引用**。

```
Thread
  └── ThreadLocalMap
        └── Entry[] (Key: ThreadLocal 弱引用, Value: 强引用)
```

### 11.2 使用示例

```java
// 存储用户登录信息
ThreadLocal<User> userHolder = ThreadLocal.withInitial(() -> null);

// 设置
userHolder.set(currentUser);

// 获取
User user = userHolder.get();

// 必须手动移除，防止内存泄漏！
userHolder.remove();
```

### 11.3 内存泄漏问题

| 问题 | 原因 |
|------|------|
| Key 为弱引用 | `ThreadLocal` 被 GC 回收后 Key 变为 null |
| Value 为强引用 | Value 因强引用仍被持有，无法被 GC |
| 线程池场景 | 线程长期存活，Value 一直无法回收 |

**解决方案**：使用完毕后务必调用 `remove()` 方法。

### 11.4 InheritableThreadLocal

子线程可以继承父线程的 `ThreadLocal` 值。但**线程池场景下不适用**（线程是复用的），推荐使用 **TransmittableThreadLocal**（阿里开源）。

---

## 十二、CompletableFuture 异步编程

### 12.1 基本用法

```java
// 异步执行，无返回值
CompletableFuture.runAsync(() -> {
    // 异步任务
});

// 异步执行，有返回值
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    return "result";
});

// 获取结果（阻塞）
String result = future.get();

// 链式处理
future.thenApply(s -> s.toUpperCase())
      .thenAccept(s -> System.out.println(s))
      .exceptionally(e -> { log.error("error", e); return null; });
```

### 12.2 组合多个异步任务

| 方法 | 说明 |
|------|------|
| `thenCombine` | 两个任务都完成后，合并结果 |
| `thenAcceptBoth` | 两个任务都完成后，消费结果（无返回值） |
| `applyToEither` | 任一任务完成后，使用其结果 |
| `allOf` | 等待所有任务完成 |
| `anyOf` | 等待任一任务完成 |

```java
// 并行调用两个服务，合并结果
CompletableFuture<User> userFuture = CompletableFuture.supplyAsync(() -> userService.getUser(id));
CompletableFuture<List<Order>> orderFuture = CompletableFuture.supplyAsync(() -> orderService.getOrders(id));

CompletableFuture<UserProfile> profileFuture = userFuture.thenCombine(orderFuture, (user, orders) -> {
    return new UserProfile(user, orders);
});
```

---

## 十三、ForkJoinPool（分治任务）

### 13.1 原理

采用 **Work-Stealing**（工作窃取）算法：
- 每个工作线程维护一个双端队列
- 线程从自己队列的**头部**取任务执行
- 空闲线程从其他线程队列的**尾部**窃取任务

### 13.2 使用示例

```java
// 递归计算 1~n 的和
public class SumTask extends RecursiveTask<Long> {
    private static final int THRESHOLD = 1000;
    private final int[] array;
    private final int start, end;

    @Override
    protected Long compute() {
        if (end - start <= THRESHOLD) {
            // 小任务直接计算
            long sum = 0;
            for (int i = start; i < end; i++) sum += array[i];
            return sum;
        } else {
            // 大任务拆分
            int mid = (start + end) / 2;
            SumTask left = new SumTask(array, start, mid);
            SumTask right = new SumTask(array, mid, end);
            left.fork();   // 异步执行左半部分
            return right.compute() + left.join();   // 当前线程执行右半部分
        }
    }
}

ForkJoinPool pool = new ForkJoinPool();
long result = pool.invoke(new SumTask(array, 0, array.length));
```

---

## 十四、Virtual Thread（虚拟线程，Java 21+）

### 14.1 核心概念

| 特性 | 平台线程（传统） | 虚拟线程 |
|------|----------------|---------|
| 实现 | 1:1 映射 OS 线程 | M:N 映射，多路复用少量 OS 线程 |
| 创建成本 | 高（MB 级栈内存） | 极低（KB 级，堆内存分配） |
| 数量级 | 数千 | 数百万 |
| 适用场景 | CPU 密集型 | **IO 密集型** |

### 14.2 使用方式

```java
// 创建虚拟线程
Thread.startVirtualThread(() -> {
    // IO 操作
});

// 虚拟线程执行器
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> {
        // 任务
    });
}
```

### 14.3 注意事项

- **不要池化**虚拟线程（用完即弃）
- 避免 `synchronized` 和 native 方法中的长时间阻塞（会 pin 住载体线程）
- 推荐使用 `ReentrantLock` 替代 `synchronized`

---

## 十五、死锁、活锁与饥饿

### 15.1 死锁的四个必要条件

| 条件 | 说明 |
|------|------|
| **互斥** | 资源同一时刻只能被一个线程持有 |
| **占有并等待** | 线程持有资源的同时等待获取其他资源 |
| **不可抢占** | 资源只能由持有者主动释放 |
| **循环等待** | 线程之间形成环形等待链 |

### 15.2 死锁排查

```bash
# 1. 找到 Java 进程 PID
jps -l

# 2. 生成线程转储
jstack <PID> > thread_dump.txt

# 3. 搜索死锁信息
grep -i "deadlock" thread_dump.txt

# 或者使用 jconsole / jvisualvm 图形化工具检测
```

### 15.3 死锁预防

| 策略 | 方法 |
|------|------|
| **按顺序获取锁** | 所有线程按相同的顺序获取锁，打破循环等待 |
| **超时放弃** | `tryLock(timeout)` 超时后释放已持有的锁 |
| **减少锁粒度** | 缩小锁的作用范围，降低冲突概率 |
| **使用并发工具类** | 用 `ConcurrentHashMap` 等替代手动加锁 |

### 15.4 活锁 vs 饥饿

| 类型 | 含义 | 解决方案 |
|------|------|---------|
| **活锁** | 线程不断重试但始终无法获得资源（如都不断退让） | 引入随机退避时间 |
| **饥饿** | 低优先级线程长期无法获得资源 | 使用公平锁、提高优先级 |

---

## 十六、实际项目应用场景

### 16.1 并行调用多个外部服务

```java
// 并行调用用户服务、订单服务、推荐服务，合并结果
CompletableFuture<User> userFuture = CompletableFuture.supplyAsync(
    () -> userService.getUser(userId), executor);
CompletableFuture<List<Order>> orderFuture = CompletableFuture.supplyAsync(
    () -> orderService.getOrders(userId), executor);
CompletableFuture<List<Product>> recommendFuture = CompletableFuture.supplyAsync(
    () -> recommendService.getRecommendations(userId), executor);

CompletableFuture.allOf(userFuture, orderFuture, recommendFuture).join();

UserProfile profile = new UserProfile(
    userFuture.get(), orderFuture.get(), recommendFuture.get());
```

### 16.2 批量数据处理

```java
// 将 10 万条数据拆分为 10 批，每批 1 万条并行处理
List<List<Data>> batches = partition(dataList, 10000);
CountDownLatch latch = new CountDownLatch(batches.size());

for (List<Data> batch : batches) {
    executor.submit(() -> {
        try {
            processBatch(batch);
        } finally {
            latch.countDown();
        }
    });
}

latch.await();  // 等待所有批次处理完成
```

### 16.3 接口限流

```java
// 使用 Semaphore 限制接口最大并发数
Semaphore semaphore = new Semaphore(100);  // 最多 100 个并发

public Response handleRequest(Request request) {
    try {
        if (semaphore.tryAcquire(1, TimeUnit.SECONDS)) {
            try {
                return processRequest(request);
            } finally {
                semaphore.release();
            }
        } else {
            return Response.error("系统繁忙，请稍后重试");
        }
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return Response.error("系统异常");
    }
}
```

### 16.4 缓存预热

```java
// 系统启动时并行预热多个缓存
CompletableFuture<Void> cache1 = CompletableFuture.runAsync(() -> warmUpCache1());
CompletableFuture<Void> cache2 = CompletableFuture.runAsync(() -> warmUpCache2());
CompletableFuture<Void> cache3 = CompletableFuture.runAsync(() -> warmUpCache3());

CompletableFuture.allOf(cache1, cache2, cache3).join();
log.info("缓存预热完成");
```

---

## 十七、常见问题与解决方案

### 17.1 数据不一致

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 共享变量竞争 | 多线程同时修改同一变量 | `synchronized`、`Lock`、`Atomic` 类 |
| 非原子复合操作 | `i++`、`check-then-act` 非原子 | 加锁或使用 `ConcurrentHashMap.computeIfAbsent` |
| 可见性问题 | 一个线程修改后其他线程看不到旧值 | `volatile`、`synchronized` |

### 17.2 线程池 OOM

| 原因 | 解决方案 |
|------|---------|
| 无界队列堆积 | 使用有界队列（`ArrayBlockingQueue`） |
| 线程数无限创建 | 避免使用 `newCachedThreadPool`，手动创建线程池 |
| 任务处理过慢 | 设置合理超时时间，优化业务逻辑 |

### 17.3 线程池任务丢失

| 原因 | 解决方案 |
|------|---------|
| 拒绝策略静默丢弃 | 改用 `CallerRunsPolicy` 或自定义策略（记录日志+持久化） |
| `submit()` 未检查异常 | 调用 `Future.get()` 捕获异常 |
| JVM 退出时任务未完成 | 线程设为非守护线程，关闭时 `shutdown` + `awaitTermination` |

### 17.4 性能瓶颈

| 问题 | 解决方案 |
|------|---------|
| 锁竞争激烈 | 减小锁粒度、使用读写锁、CAS 无锁算法 |
| 上下文切换频繁 | 减少线程数、使用线程池、避免频繁创建/销毁线程 |
| IO 阻塞导致线程不足 | 使用异步 IO、CompletableFuture、虚拟线程（Java 21+） |

---

## 十八、高频面试题精选

### Q1：synchronized 和 ReentrantLock 有什么区别？

A：主要区别有七点：synchronized 是 JVM 关键字自动释放锁，ReentrantLock 是 API 层面必须手动 unlock；ReentrantLock 支持可中断、可超时、可公平锁；synchronized 基于 Monitor + 锁升级，ReentrantLock 基于 CAS + volatile；ReentrantLock 支持多个 Condition 条件变量。

### Q2：线程池的核心参数有哪些？执行流程是怎样的？

A：七大参数：corePoolSize（核心线程数）、maximumPoolSize（最大线程数）、keepAliveTime（非核心线程存活时间）、unit（时间单位）、workQueue（工作队列）、threadFactory（线程工厂）、handler（拒绝策略）。执行流程：先创建核心线程 → 核心线程满则入队列 → 队列满则创建非核心线程 → 都满则触发拒绝策略。

### Q3：volatile 的作用是什么？和 synchronized 有什么区别？

A：volatile 保证可见性和禁止指令重排，但不保证原子性；synchronized 保证原子性、可见性和有序性。volatile 适用于"一写多读"场景，synchronized 适用于"多写"场景。volatile 不会阻塞，synchronized 会阻塞。

### Q4：什么是 CAS？有什么缺点？

A：CAS（Compare And Swap）是无锁算法，当内存值等于期望值时更新为新值，否则自旋重试。缺点有：ABA 问题（用 AtomicStampedReference 解决）、高竞争时自旋浪费 CPU、只能保证单个变量原子性。

### Q5：ThreadLocal 是什么？有什么内存泄漏问题？

A：ThreadLocal 为每个线程提供独立的变量副本。内存泄漏原因：ThreadLocalMap 的 Key 是弱引用，GC 后 Key 变 null，但 Value 是强引用无法回收。线程池中线

程长期存活，Value 一直存在。解决方案：使用完毕后务必调用 `remove()`。

### Q6：死锁的四个必要条件是什么？怎么排查？

A：互斥、占有并等待、不可抢占、循环等待。排查方法：`jstack <PID>` 查看线程转储，搜索 "deadlock" 关键字；或使用 jconsole/jvisualvm 图形化工具检测。

### Q7：CountDownLatch 和 CyclicBarrier 有什么区别？

A：CountDownLatch 是一个或多个线程等待其他线程完成（一次性，不可重置）；CyclicBarrier 是一组线程互相等待到同步点后一起执行（可循环复用）。CountDownLatch 基于 AQS 共享模式，CyclicBarrier 基于 ReentrantLock + Condition。

### Q8：为什么不建议使用 Executors 创建线程池？

A：newFixedThreadPool 和 newSingleThreadExecutor 使用无界队列（LinkedBlockingQueue），任务堆积容易 OOM；newCachedThreadPool 和 newScheduledThreadPool 最大线程数为 Integer.MAX_VALUE，会创建大量线程导致 OOM。生产环境应手动创建 ThreadPoolExecutor，使用有界队列。

### Q9：ConcurrentHashMap 是怎么保证线程安全的？

A：JDK 1.8 采用 CAS + synchronized：空桶使用 CAS 插入，非空桶使用 synchronized 锁住链表/红黑树的头节点。相比 JDK 1.7 的 Segment 分段锁，锁粒度更细（桶级别），并发度更高。size 计算使用 baseCount + CounterCell 数组实现分段计数。

### Q10：Java 21 的虚拟线程是什么？和传统线程有什么区别？

A：虚拟线程是轻量级线程，M:N 映射到少量 OS 线程，创建成本极低（KB 级堆内存），可创建数百万个。传统线程是 1:1 映射 OS 线程，创建成本高（MB 级栈内存）。虚拟线程适合 IO 密集型场景，不适用于 CPU 密集型。不要池化虚拟线程，避免 synchronized 中的长时间阻塞。

---

## 十九、知识体系总览

```
Java 多线程面试必知必会
├── 一、线程基础
│   ├── 创建方式（Thread/Runnable/Callable/线程池）
│   ├── 线程状态（6 种）
│   └── wait() vs sleep()
├── 二、JMM
│   ├── 主内存 / 工作内存
│   ├── 原子性 / 可见性 / 有序性
│   └── happens-before 原则
├── 三、synchronized 原理
│   ├── Mark Word / monitorenter
│   ├── 锁升级（偏向→轻量→重量）
│   └── 锁优化策略
├── 四、ReentrantLock vs synchronized
│   ├── 公平锁 / 非公平锁
│   └── 使用示例
├── 五、volatile
│   ├── 可见性 / 禁止重排
│   ├── 不保证原子性
│   └── 双重检查锁单例
├── 六、CAS 与 ABA 问题
│   ├── CAS 原理
│   ├── ABA 解决方案
│   └── Atomic 原子类
├── 七、AQS
│   ├── state + CLH 队列
│   ├── 独占 / 共享模式
│   └── 基于 AQS 的工具类
├── 八、线程池
│   ├── 七大参数
│   ├── 执行流程
│   ├── 四种拒绝策略
│   ├── 严禁使用 Executors
│   └── 生产最佳实践
├── 九、并发工具类
│   ├── CountDownLatch / CyclicBarrier
│   ├── Semaphore / Exchanger
│   └── 对比与选型
├── 十、ConcurrentHashMap
│   ├── JDK 1.7 分段锁
│   └── JDK 1.8 CAS + synchronized
├── 十一、ThreadLocal
│   ├── 原理
│   └── 内存泄漏问题
├── 十二、CompletableFuture
│   ├── 基本用法
│   └── 组合多个异步任务
├── 十三、ForkJoinPool
│   ├── Work-Stealing 算法
│   └── RecursiveTask 示例
├── 十四、Virtual Thread（Java 21+）
├── 十五、死锁、活锁与饥饿
│   ├── 四个必要条件
│   ├── 排查方法
│   └── 预防策略
├── 十六、实际项目应用场景
│   ├── 并行调用 / 批量处理
│   ├── 接口限流 / 缓存预热
│   └── 更多场景
├── 十七、常见问题与解决方案
└── 十八、高频面试题精选
```

---

## 参考资料

- [Java 并发编程专题 - JavaGuide](https://javaguide.cn/java/concurrent/)
- [Java 面试题汇总：多线程、JUC、锁篇 - CSDN](https://blog.csdn.net/qq_40991313/article/details/129446871)
- [这些年背过的面试题——多线程篇 - 阿里云](https://developer.aliyun.com/article/1491362)
- [Java 并发编程：线程池核心 7 大参数、执行原理 - 阿里云](https://developer.aliyun.com/article/1735890)
- [Java 并发常见面试题总结 - JavaGuide](https://javaguide.cn/java/concurrent/java-concurrent-questions-03.html)
- [Java 多线程并发问题深度剖析与实战 - CSDN](https://blog.csdn.net/z45658/article/details/153117285)
- [Java 并发编程：死锁排查、线程安全问题定位 - 阿里云](https://developer.aliyun.com/article/1736314)
- [深度剖析：Java 并发三大量难题——死锁、活锁、饥饿全解 - 腾讯云](https://cloud.tencent.com/developer/article/2658350)
- [Java 面试之 CountDownLatch、CyclicBarrier、Semaphore - 知乎](https://zhuanlan.zhihu.com/p/633066922)
- [Java 并发工具类面试清单 - 博客园](https://www.cnblogs.com/gccbuaa/p/19203827)
- [10 万字 74 道 Java 多线程经典面试题 - 知乎](https://zhuanlan.zhihu.com/p/1908485718419961408)
- [多线程、线程池、内置锁面试题 - 博客园](https://www.cnblogs.com/crazymakercircle/p/13903850.html)
