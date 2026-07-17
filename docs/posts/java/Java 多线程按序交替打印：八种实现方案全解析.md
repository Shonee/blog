---
tags:
  - Java
  - 并发编程
  - 多线程
  - 面试题
created: 2026-07-17
---

# Java 多线程按序交替打印：八种实现方案全解析

## 一、问题定义

经典面试题 [LeetCode 1115. 交替打印 FooBar](https://leetcode.cn/problems/print-foobar-alternately/)：给定一个整数 `n` 和两个方法 `foo()` 与 `bar()`，分别由两个不同线程调用。要求两个线程严格交替执行，最终输出 `n` 次 `"foobar"`。

```java
class FooBar {
    public void foo(Runnable printFoo) throws InterruptedException { /* 打印 "foo" */ }
    public void bar(Runnable printBar) throws InterruptedException { /* 打印 "bar" */ }
}
```

这个问题的本质是**线程间协作**——两个线程需要按照确定的顺序轮流执行，而非单纯的互斥访问。它考察的是对 Java 并发原语（锁、信号量、条件变量、屏障等）的理解深度和运用能力。

以下将从最朴素的方案逐步递进，覆盖八种实现方式，每种方案对应一种核心并发机制。

---

## 二、八种实现方案

### 方案一：synchronized + wait/notify（手厥阴心包经）

这是最经典的线程通信方式，也是面试中最常考的基础方案。

**核心原理：** 利用对象监视器（Monitor）的 `wait()` / `notifyAll()` 机制实现线程间等待-通知。线程在不满足条件时调用 `wait()` 进入等待集合，执行完毕后调用 `notifyAll()` 唤醒所有等待线程重新竞争锁。

```java
class FooBar3 {
    private int n;
    // 标志位，true 执行 printFoo，false 执行 printBar
    private volatile boolean type = true;
    private final Object foo = new Object(); // 锁对象

    public FooBar3(int n) {
        this.n = n;
    }

    public void foo(Runnable printFoo) throws InterruptedException {
        for (int i = 0; i < n; i++) {
            synchronized (foo) {
                while (!type) {           // 防御虚假唤醒，必须用 while 而非 if
                    foo.wait();
                }
                printFoo.run();           // 打印 "foo"
                type = false;             // 翻转标志位，轮到 bar 执行
                foo.notifyAll();          // 唤醒所有等待线程
            }
        }
    }

    public void bar(Runnable printBar) throws InterruptedException {
        for (int i = 0; i < n; i++) {
            synchronized (foo) {
                while (type) {
                    foo.wait();
                }
                printBar.run();           // 打印 "bar"
                type = true;              // 翻转标志位，轮到 foo 执行
                foo.notifyAll();          // 唤醒所有等待线程
            }
        }
    }
}
```

**关键细节：**

- **必须用 `while` 而非 `if` 做条件判断。** 这是因为线程可能因"虚假唤醒"（spurious wakeup）而被意外唤醒，此时条件仍不满足，若不重新检查就会破坏交替顺序。这在《Java 并发编程实战》和 Javadoc 中均有明确说明。
- `notifyAll()` 会唤醒该对象监视器上的**所有**等待线程。在仅有两个线程的场景下，这等价于 `notify()`，但存在不必要的上下文切换开销。如果扩展到多线程（如三个线程交替打印 ABC），`notifyAll()` 会唤醒所有线程竞争，效率更低。

**适用场景：** 教学中最经典的线程通信模式，面试必考；实际项目中适合简单的生产者-消费者模型。

---

### 方案二：ReentrantLock + Condition（手少阳三焦经）

对 `synchronized + wait/notify` 的精确升级版，核心改进在于**精准唤醒**。

**核心原理：** `ReentrantLock` 可以创建多个独立的 `Condition` 对象，每个 `Condition` 维护自己的等待队列。通过为每个线程分配独立的 `Condition`，可以实现"只唤醒对方线程"，避免无关线程被唤醒后的无效竞争。

```java
class FooBar4 {
    private int n;
    Lock lock = new ReentrantLock(true);        // 公平锁
    private final Condition foo = lock.newCondition();
    volatile boolean flag = true;

    public FooBar4(int n) {
        this.n = n;
    }

    public void foo(Runnable printFoo) throws InterruptedException {
        for (int i = 0; i < n; i++) {
            lock.lock();
            try {
                while (!flag) {
                    foo.await();               // 条件不满足，在 foo 条件队列上等待
                }
                printFoo.run();
                flag = false;
                foo.signal();                  // 精准唤醒同一 Condition 上的等待线程
            } finally {
                lock.unlock();                 // 必须在 finally 中释放锁！
            }
        }
    }

    public void bar(Runnable printBar) throws InterruptedException {
        for (int i = 0; i < n; i++) {
            lock.lock();
            try {
                while (flag) {
                    foo.await();
                }
                printBar.run();
                flag = true;
                foo.signal();
            } finally {
                lock.unlock();
            }
        }
    }
}
```

**关键细节：**

- **`unlock()` 必须放在 `finally` 块中。** 如果 `printFoo.run()` 或 `await()` 抛出异常导致锁未释放，就会造成死锁。这是 `ReentrantLock` 相比 `synchronized` 的最大风险——`synchronized` 在方法退出时会自动释放锁。
- 上述代码中两个方法共用同一个 `Condition foo`，实际上等价于 `wait/notify` 的效果。更优的做法是为 foo 和 bar 分别创建独立的 `Condition`，在 foo 完成后 `signal` bar 的 Condition，实现真正的精准唤醒：

```java
// 优化版：双 Condition 精准唤醒
class FooBar4Optimized {
    private int n;
    Lock lock = new ReentrantLock();
    Condition fooCondition = lock.newCondition();
    Condition barCondition = lock.newCondition();
    boolean flag = true;

    public FooBar4Optimized(int n) { this.n = n; }

    public void foo(Runnable printFoo) throws InterruptedException {
        for (int i = 0; i < n; i++) {
            lock.lock();
            try {
                while (!flag) fooCondition.await();
                printFoo.run();
                flag = false;
                barCondition.signal();     // 精准唤醒 bar 线程
            } finally {
                lock.unlock();
            }
        }
    }

    public void bar(Runnable printBar) throws InterruptedException {
        for (int i = 0; i < n; i++) {
            lock.lock();
            try {
                while (flag) barCondition.await();
                printBar.run();
                flag = true;
                fooCondition.signal();     // 精准唤醒 foo 线程
            } finally {
                lock.unlock();
            }
        }
    }
}
```

**适用场景：** 需要精准控制唤醒目标的多线程协作场景，特别是三个及以上线程交替执行时优势明显。

---

### 方案三：Semaphore 信号量（手太阳小肠经）

最简洁、最直观的方案，天然适合"接力"式的顺序控制。

**核心原理：** `Semaphore` 维护一组许可证（permit）。线程调用 `acquire()` 获取许可证，若可用数量为 0 则阻塞；调用 `release()` 归还许可证。通过为两个线程分别初始化不同数量的许可证（1 和 0），天然形成"你先我后"的执行顺序。

```java
class FooBar2 {
    private int n;
    private Semaphore foo = new Semaphore(1);  // foo 线程初始有 1 个许可，可以先执行
    private Semaphore bar = new Semaphore(0);  // bar 线程初始无许可，必须等待

    public FooBar2(int n) {
        this.n = n;
    }

    public void foo(Runnable printFoo) throws InterruptedException {
        for (int i = 0; i < n; i++) {
            foo.acquire();          // 获取 foo 的许可（第一轮有 1 个，之后由 bar 释放）
            printFoo.run();
            bar.release();          // 释放 bar 的许可，允许 bar 线程执行
        }
    }

    public void bar(Runnable printBar) throws InterruptedException {
        for (int i = 0; i < n; i++) {
            bar.acquire();          // 获取 bar 的许可（由 foo 释放后才能获取到）
            printBar.run();
            foo.release();          // 释放 foo 的许可，允许 foo 线程执行下一轮
        }
    }
}
```

**关键细节：**

- 代码极其简洁，没有任何 `while` 循环、`flag` 标志位或显式锁，执行顺序完全由信号量的许可证流转来控制。
- `Semaphore` 的底层实现基于 AQS（AbstractQueuedSynchronizer），与 `ReentrantLock` 同源，性能可靠。
- 扩展到多线程交替打印 ABC 也很自然：创建三个 Semaphore，初始许可分别为 1、0、0，每个线程完成后释放下一个线程的信号量即可。

**适用场景：** 需要控制并发数量或实现"接力式"执行顺序的场景。也是限流、资源池等场景的首选工具。

---

### 方案四：BlockingQueue 阻塞队列（手太阴肺经）

利用阻塞队列"空时阻塞取、满时阻塞放"的特性，巧妙实现线程间的交替控制。

**核心原理：** 创建两个容量为 1 的 `LinkedBlockingQueue`，利用 `put()` 在队列满时阻塞、`take()` 在队列空时阻塞的特性，形成天然的交替执行节奏。这本质上是**生产者-消费者模型**的一种变体。

```java
class FooBar {
    private int n;
    private BlockingQueue<Integer> bar = new LinkedBlockingQueue<>(1);
    private BlockingQueue<Integer> foo = new LinkedBlockingQueue<>(1);

    public FooBar(int n) {
        this.n = n;
    }

    public void foo(Runnable printFoo) throws InterruptedException {
        for (int i = 0; i < n; i++) {
            foo.put(i);             // 向 foo 队列放入元素（队列容量 1，第一轮直接成功）
            printFoo.run();         // 打印 "foo"
            bar.put(i);             // 向 bar 队列放入元素，解除 bar 线程的 take 阻塞
        }
    }

    public void bar(Runnable printBar) throws InterruptedException {
        for (int i = 0; i < n; i++) {
            bar.take();             // 从 bar 队列取元素（等待 foo 放入后才能取到）
            printBar.run();         // 打印 "bar"
            foo.take();             // 从 foo 队列取元素，腾出空间让 foo 线程下一轮 put 成功
        }
    }
}
```

**关键细节：**

- `foo.put(i)` 和 `foo.take()` 的配合精妙：foo 线程第一轮 `put` 成功后队列满，下一轮 `put` 会阻塞，直到 bar 线程执行 `take()` 腾出空间。这就自然形成了交替节奏。
- 代码中没有显式的锁、标志位或条件变量，所有的同步逻辑都被队列的阻塞语义隐式承载。
- 注意：队列中流转的 `Integer` 值本身没有业务意义，纯粹用作"令牌"来控制执行顺序。

**适用场景：** 天然契合生产者-消费者模型。在消息队列、任务分发等场景中广泛使用。

---

### 方案五：CyclicBarrier + volatile（手阳明大肠经）

利用循环屏障的同步等待能力，配合标志位控制执行先后。

**核心原理：** `CyclicBarrier` 让一组线程在屏障点互相等待，直到所有线程都到达后才一起放行。配合一个 `volatile` 标志位决定谁先执行，屏障则保证两个线程每轮都"对齐"一次。

```java
class FooBar6 {
    private int n;
    CyclicBarrier cb = new CyclicBarrier(2);   // 屏障值为 2，等待两个线程都到达
    volatile boolean fin = true;                // true 表示 foo 先执行

    public FooBar6(int n) {
        this.n = n;
    }

    public void foo(Runnable printFoo) throws InterruptedException {
        for (int i = 0; i < n; i++) {
            while (!fin);                       // 自旋等待轮到自己
            printFoo.run();
            fin = false;                        // 执行完毕，翻转标志
            try {
                cb.await();                     // 到达屏障，等待 bar 也到达
            } catch (BrokenBarrierException e) {}
        }
    }

    public void bar(Runnable printBar) throws InterruptedException {
        for (int i = 0; i < n; i++) {
            try {
                cb.await();                     // 先到达屏障等待 foo
            } catch (BrokenBarrierException e) {}
            printBar.run();
            fin = true;                         // 执行完毕，翻转标志
        }
    }
}
```

**关键细节：**

- `CyclicBarrier` 的 `await()` 会阻塞线程，直到参与的线程数达到构造参数（这里是 2），然后所有线程一起放行。
- 这种方案中 `while(!fin)` 是一个**忙等待**（busy-wait），会消耗 CPU 资源。在高竞争场景下效率不高。
- `CyclicBarrier` 可以被重置重复使用（这也是"Cyclic"的含义），适合多轮循环场景。

**适用场景：** 需要多个线程在某个阶段同步汇合的场景，如并行计算的分阶段汇总、多线程数据准备后统一启动。单纯做交替打印并非其最佳用法。

---

### 方案六：volatile + Thread.yield 自旋（手少阴心经）

最朴素的方案，不依赖任何并发工具类，纯粹靠"让出 CPU"来实现交替。

**核心原理：** 使用一个 `volatile` 变量作为"令牌"，持有令牌的线程执行，不持有的线程调用 `Thread.yield()` 让出 CPU 时间片，然后立刻重新检查。

```java
class FooBar5 {
    private int n;
    volatile boolean permitFoo = true;       // true 时 foo 执行，false 时 bar 执行

    public FooBar5(int n) {
        this.n = n;
    }

    public void foo(Runnable printFoo) throws InterruptedException {
        for (int i = 0; i < n; ) {
            if (permitFoo) {
                printFoo.run();
                i++;                          // 注意：只在成功执行后才递增 i
                permitFoo = false;
            } else {
                Thread.yield();               // 不是自己的回合，让出 CPU
            }
        }
    }

    public void bar(Runnable printBar) throws InterruptedException {
        for (int i = 0; i < n; ) {
            if (!permitFoo) {
                printBar.run();
                i++;
                permitFoo = true;
            } else {
                Thread.yield();
            }
        }
    }
}
```

**关键细节：**

- `volatile` 保证了 `permitFoo` 的修改对另一个线程**立即可见**（通过内存屏障禁止 CPU 缓存优化）。
- `Thread.yield()` 只是**建议**当前线程让出 CPU，但 JVM 和操作系统**完全可以忽略这个建议**。在某些平台上，yield 可能毫无效果。
- 循环变量 `i` 的递增放在 `if` 内部而非 `for` 的增量表达式中，这是一个重要的设计：只有线程真正执行了打印才计数，避免空转消耗循环次数。

**致命缺陷：** 这是一种**忙等待**（busy-wait / spin-wait）模式。当线程不是自己的回合时，它在不断地"检查 → yield → 再检查"，虽然 yield 会让出一次 CPU，但很快又会重新竞争，造成大量 CPU 空转。在高并发或 `n` 很大的场景下，CPU 利用率会飙升。

**适用场景：** 仅适用于理解并发原理的教学演示。**不推荐在任何生产代码中使用。**

---

### 方案七：LockSupport park/unpark

底层线程控制工具，不依赖锁机制，直接操控线程的暂停与恢复。

**核心原理：** `LockSupport` 是 `java.util.concurrent.locks` 包中的底层工具类，基于 `Unsafe` 实现。`park()` 阻塞当前线程，`unpark(Thread t)` 唤醒指定线程。它维护一个"许可"机制——如果先调用 `unpark()`，后续第一次 `park()` 不会阻塞，而是消费掉这个许可。

```java
class FooBarLockSupport {
    private int n;
    volatile Thread fooThread;
    volatile Thread barThread;

    public FooBarLockSupport(int n, Thread fooThread, Thread barThread) {
        this.n = n;
        this.fooThread = fooThread;           // 构造时传入线程引用，避免运行时竞态
        this.barThread = barThread;
    }

    public void foo(Runnable printFoo) throws InterruptedException {
        for (int i = 0; i < n; i++) {
            printFoo.run();
            LockSupport.unpark(barThread);     // 唤醒 bar 线程
            LockSupport.park();                // 阻塞自己
        }
    }

    public void bar(Runnable printBar) throws InterruptedException {
        for (int i = 0; i < n; i++) {
            LockSupport.park();                // 先阻塞，等待 foo 唤醒
            printBar.run();
            LockSupport.unpark(fooThread);     // 唤醒 foo 线程
        }
    }
}
```

使用时需要在启动线程前传入引用：

```java
FooBarLockSupport fb = new FooBarLockSupport(n, null, null);
Thread t1 = new Thread(() -> fb.foo(printFoo));
Thread t2 = new Thread(() -> fb.bar(printBar));
fb.fooThread = t1;
fb.barThread = t2;
t1.start();
t2.start();
```

**关键细节：**

- `LockSupport` 的 `unpark()` 可以先于 `park()` 调用——这与 `wait/notify` 不同（`notify` 如果在 `wait` 之前调用会被丢失）。这意味着 `LockSupport` 对调用顺序不敏感，更加健壮。
- `park()` 和 `unpark()` 可以精准控制目标线程，不需要共享锁对象或条件变量。
- **必须在线程启动前设置好线程引用。** 如果在 `foo()` / `bar()` 方法内部通过 `Thread.currentThread()` 赋值，存在竞态条件：foo 线程打印完毕后调用 `unpark(barThread)` 时，bar 线程可能尚未启动，`barThread` 仍为 `null`，`unpark(null)` 是空操作，之后 bar 启动并 `park()` 将永久阻塞——导致死锁。
- **风险：** `LockSupport` 不响应 `interrupt()`（除非使用 `parkNanos` 等特殊变体），在需要中断线程的场景下不够灵活。

**适用场景：** 底层框架（如 AQS、ForkJoinPool）的内部实现。`ReentrantLock` 和 `Semaphore` 底层都是基于 `LockSupport` 构建的。

---

### 方案八：AtomicInteger + CAS 自旋

无锁方案，利用硬件级别的原子操作实现状态同步。

**核心原理：** `AtomicInteger` 的 `compareAndSet()`（CAS）操作由 CPU 指令直接保证原子性。线程通过 CAS 安全地更新共享状态，不满足条件时自旋等待。

```java
class FooBarCAS {
    private int n;
    AtomicInteger state = new AtomicInteger(0);

    public FooBarCAS(int n) {
        this.n = n;
    }

    public void foo(Runnable printFoo) throws InterruptedException {
        for (int i = 0; i < n; i++) {
            while (state.get() % 2 != 0) {
                Thread.onSpinWait();         // Java 9+ 提示 CPU 这是自旋等待
            }
            printFoo.run();
            state.incrementAndGet();         // CAS 原子递增
        }
    }

    public void bar(Runnable printBar) throws InterruptedException {
        for (int i = 0; i < n; i++) {
            while (state.get() % 2 != 1) {
                Thread.onSpinWait();
            }
            printBar.run();
            state.incrementAndGet();
        }
    }
}
```

**关键细节：**

- 这是一种**无锁**（lock-free）实现，不存在线程挂起和恢复的开销，在低竞争场景下性能很好。
- 但本质上仍是**忙等待**，在高竞争或 `n` 很大时会浪费大量 CPU 周期。
- `Thread.onSpinWait()`（Java 9 引入）向 CPU 发出"自旋等待"提示，在某些架构（如 x86 的 PAUSE 指令）上可以降低功耗和内存总线争用。
- 注意：这里用 `state.get() % 2` 判断轮到谁执行，而非用 `i * 2` 来匹配具体轮次。这使得逻辑更简洁，但如果需要扩展到更多线程，只需改模数和目标值即可。

**适用场景：** 极低延迟要求且竞争不激烈的场景，如无锁队列、高性能计数器。

---

## 三、方案对比总览

| 方案 | 核心机制 | 是否阻塞 | 精准唤醒 | 代码复杂度 | CPU 消耗 | 推荐程度 |
|------|----------|----------|----------|------------|----------|----------|
| synchronized + wait/notify | 对象监视器 | 是 | 否（notifyAll） | 低 | 低 | 面试首选 |
| ReentrantLock + Condition | 可重入锁 + 条件队列 | 是 | 是 | 中 | 低 | 多场景推荐 |
| Semaphore | AQS 信号量 | 是 | 是（一对一传递） | 低 | 低 | 最简洁优雅 |
| BlockingQueue | 阻塞队列 | 是 | 隐式 | 低 | 低 | 生产者-消费者场景 |
| CyclicBarrier + volatile | 循环屏障 | 是 | 否 | 中 | 中（含忙等待） | 特定同步场景 |
| volatile + yield | 自旋 + 礼让 | 否 | — | 低 | **高** | 仅教学演示 |
| LockSupport | 底层 park/unpark | 是 | 是 | 中 | 低 | 框架底层实现 |
| AtomicInteger + CAS | 无锁 CAS | 否 | — | 低 | **高** | 低竞争高性能场景 |

---

## 四、核心并发原语深度对比

### 4.1 synchronized vs ReentrantLock

两者在 JDK 6 之后性能差距已经大幅缩小（JDK 6 引入了偏向锁、轻量级锁、锁升级等优化），但在功能上有本质区别：

- **自动释放：** `synchronized` 在方法返回或异常时自动释放锁；`ReentrantLock` 必须在 `finally` 中手动 `unlock()`。
- **条件队列：** `synchronized` 只有一个隐式条件队列（`wait/notify`）；`ReentrantLock` 可以创建任意数量的 `Condition`，实现精准唤醒。
- **中断响应：** `ReentrantLock.lockInterruptibly()` 可以在等待锁时响应中断；`synchronized` 在等待获取锁时不可中断。
- **公平性：** `ReentrantLock(true)` 可以创建公平锁，保证先等待先获取；`synchronized` 只能是非公平锁。

### 4.2 wait/notify vs Condition vs Semaphore

- `wait/notify` 是最原始的方案，配合 `synchronized` 使用，但只能广播唤醒。
- `Condition` 是 `wait/notify` 的精确升级版，每个 Condition 独立维护等待队列。
- `Semaphore` 则是完全不同的思路——它不关心"谁在等待"，而是通过许可证的流转来控制执行权限，代码最简洁。

### 4.3 阻塞式 vs 自旋式

所有方案可以分为两大类：

- **阻塞式**（synchronized、ReentrantLock、Semaphore、BlockingQueue、LockSupport）：线程在条件不满足时被挂起，不消耗 CPU。适合大部分场景。
- **自旋式**（volatile+yield、AtomicInteger+CAS）：线程不断循环检查条件，消耗 CPU。仅在预期等待时间极短（纳秒级）时才有优势，因为避免了线程挂起和恢复的开销。

---

## 五、面试考察要点

**1. 虚假唤醒防御**

条件判断必须使用 `while` 而非 `if`。这是面试中最常被追问的细节。原因：操作系统或 JVM 可能在没有 `notify` 的情况下唤醒等待线程（虚假唤醒），如果只用 `if`，线程醒来后不会重新检查条件就直接执行，破坏交替顺序。

**2. 锁的安全释放**

使用 `ReentrantLock` 时，`unlock()` 必须在 `finally` 块中。面试官会追问"如果忘记 finally 会怎样"——答案是：一旦 `await()` 或业务代码抛出异常，锁永远不会释放，后续所有线程永久死锁。

**3. notifyAll vs signal**

理解 `notifyAll()` 唤醒所有等待线程带来的上下文切换开销，以及 `Condition.signal()` 精准唤醒的性能优势。在多线程交替打印 ABC 的场景中，`notifyAll()` 会唤醒三个线程中的两个（只有一个是正确的），而双 Condition 方案只唤醒目标线程。

**4. Semaphore 的许可证流转**

面试官可能会问"为什么 foo 的初始许可是 1 而 bar 是 0"。这是因为需要保证 foo 先执行——foo 持有许可可以直接 acquire 成功，而 bar 必须等 foo release 后才能获取许可。

**5. volatile 的可见性保证**

`volatile` 保证变量的**可见性**（写入后立即对其他线程可见）和**有序性**（禁止指令重排序），但**不保证原子性**。这就是为什么 AtomicInteger 方案虽然用了原子变量，仍然需要自旋等待——`get()` 和 `compareAndSet()` 的组合不是原子的。

---

## 六、扩展：从两线程到多线程

将交替打印从两个线程扩展到三个线程（交替打印 ABC），各方案的适配难度不同：

- **Semaphore：** 创建三个信号量，初始许可为 1/0/0，每个线程完成后释放下一个线程的信号量。改动量最小。
- **ReentrantLock + Condition：** 创建三个 Condition，每个线程在自己的 Condition 上等待，完成后 signal 下一个线程的 Condition。精准高效。
- **synchronized + wait/notify：** 状态变量改为 `state % 3`，`notifyAll()` 唤醒所有线程竞争。可用但效率低（每次唤醒两个无关线程）。
- **LockSupport：** 需要持有所有线程的引用，管理复杂度上升。

以 Semaphore 为例，三线程交替打印的代码如下：

```java
class PrintABC {
    private Semaphore a = new Semaphore(1);
    private Semaphore b = new Semaphore(0);
    private Semaphore c = new Semaphore(0);
    private int rounds;

    public PrintABC(int rounds) { this.rounds = rounds; }

    public void printA() throws InterruptedException {
        for (int i = 0; i < rounds; i++) {
            a.acquire(); System.out.print("A"); b.release();
        }
    }
    public void printB() throws InterruptedException {
        for (int i = 0; i < rounds; i++) {
            b.acquire(); System.out.print("B"); c.release();
        }
    }
    public void printC() throws InterruptedException {
        for (int i = 0; i < rounds; i++) {
            c.acquire(); System.out.print("C"); a.release();
        }
    }
}
```

### 6.1 通用化：外层 for 循环 + 数组化并发原语

三线程的例子已经能看出规律，但当线程数继续增加（比如 26 个线程交替打印 A-Z），手写 26 个方法显然不现实。核心思路是：**将所有线程共享的状态和并发原语放进数组，用一个外层 for 循环动态创建 N 个线程，每个线程执行相同的通用逻辑，仅通过 `threadIndex` 区分身份。**

这背后有一个统一的抽象模型：

```
共享状态: state (初始为 0)
每个线程的行为:
  循环 rounds 轮:
    等待 state % N == threadIndex     // 轮到自己
    执行业务逻辑 (打印)
    state++                           // 交给下一个人
    通知/传递执行权给 (threadIndex + 1) % N
```

不同并发原语只是"等待"和"通知"的具体实现不同。下面展示三种主流方案的 N 线程通用写法。

#### Semaphore 数组版（推荐）

```java
class PrintNTokens {
    private final int n;          // 线程数
    private final int rounds;     // 每线程打印轮数
    private final Semaphore[] semaphores;

    public PrintNTokens(int n, int rounds) {
        this.n = n;
        this.rounds = rounds;
        this.semaphores = new Semaphore[n];
        // 第一个线程初始有许可，其余为 0
        for (int i = 0; i < n; i++) {
            semaphores[i] = new Semaphore(i == 0 ? 1 : 0);
        }
    }

    /**
     * 通用打印方法：所有线程共享同一份代码
     * @param threadIndex 当前线程编号 (0 ~ n-1)
     * @param token       当前线程负责打印的内容
     */
    public void print(int threadIndex, String token) throws InterruptedException {
        for (int r = 0; r < rounds; r++) {
            semaphores[threadIndex].acquire();      // 等待轮到自己
            System.out.print(token);                // 执行业务逻辑
            semaphores[(threadIndex + 1) % n].release(); // 传递执行权给下一个
        }
    }
}
```

启动线程的外层 for 循环：

```java
int n = 5;        // 5 个线程交替打印
int rounds = 10;  // 每个线程打印 10 轮
PrintNTokens printer = new PrintNTokens(n, rounds);
String[] tokens = {"A", "B", "C", "D", "E"};

Thread[] threads = new Thread[n];
for (int i = 0; i < n; i++) {
    final int index = i;
    threads[i] = new Thread(() -> {
        try {
            printer.print(index, tokens[index]);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    });
    threads[i].start();
}

// 等待所有线程完成
for (Thread t : threads) {
    t.join();
}
```

这段代码的关键在于：所有线程执行**完全相同的方法体**，仅靠 `threadIndex` 参数决定"我是谁、我等哪个信号量、我完成后把许可给谁"。添加或删除线程只需改 `n` 和 `tokens` 数组，无需修改任何同步逻辑。

#### ReentrantLock + Condition 数组版

```java
class PrintNWithCondition {
    private final int n;
    private final int rounds;
    private final Lock lock = new ReentrantLock();
    private final Condition[] conditions;
    private int state = 0;

    public PrintNWithCondition(int n, int rounds) {
        this.n = n;
        this.rounds = rounds;
        this.conditions = new Condition[n];
        for (int i = 0; i < n; i++) {
            conditions[i] = lock.newCondition();
        }
    }

    public void print(int threadIndex, String token) throws InterruptedException {
        for (int r = 0; r < rounds; r++) {
            lock.lock();
            try {
                // 不是自己的回合，在自己的 Condition 上等待
                while (state % n != threadIndex) {
                    conditions[threadIndex].await();
                }
                System.out.print(token);
                state++;
                // 精准唤醒下一个线程
                conditions[(threadIndex + 1) % n].signal();
            } finally {
                lock.unlock();
            }
        }
    }
}
```

这是 N 线程场景下的**最优解**：每个线程只在属于自己的 Condition 上等待，完成后精准 signal 下一个线程的 Condition，没有任何多余的线程被唤醒。对比 `synchronized + notifyAll()` 方案（每次唤醒 N-1 个无关线程），Condition 数组版在高线程数下优势巨大。

#### synchronized + wait/notify 通用版

```java
class PrintNWithSync {
    private final int n;
    private final int rounds;
    private int state = 0;
    private final Object lock = new Object();

    public PrintNWithSync(int n, int rounds) {
        this.n = n;
        this.rounds = rounds;
    }

    public void print(int threadIndex, String token) throws InterruptedException {
        for (int r = 0; r < rounds; r++) {
            synchronized (lock) {
                while (state % n != threadIndex) {
                    lock.wait();
                }
                System.out.print(token);
                state++;
                lock.notifyAll();   // 唤醒所有线程重新竞争
            }
        }
    }
}
```

代码最简洁，但 `notifyAll()` 每次唤醒 N-1 个无关线程，它们醒来后发现 `state % n != threadIndex` 又会重新 `wait()`。当 N 较大时（比如 N=26），每次打印都会造成 25 次无效的线程唤醒和上下文切换，性能较差。

### 6.2 三种通用方案对比

| 特性 | Semaphore 数组 | Condition 数组 | synchronized + notifyAll |
|------|---------------|---------------|--------------------------|
| 唤醒精度 | 一对一传递 | 精准 signal | 广播唤醒所有 |
| 无效唤醒次数 | 0 | 0 | N-1 次/轮 |
| 代码可读性 | 最好 | 好 | 最简洁 |
| 锁管理 | 无需手动管理 | 需 finally unlock | 自动释放 |
| 扩展难度 | O(1) 改动 | O(1) 改动 | O(1) 改动 |
| 高 N 值性能 | 优 | 优 | 差 |

**选择建议：** N <= 3 时三种方案均可；N 较大时首选 Semaphore 数组或 Condition 数组，避免 `notifyAll()` 的广播风暴。

### 6.3 外层 for 循环的核心价值

外层 for 循环不仅仅是一个"启动线程的技巧"，它体现了并发编程中一个重要的设计思想——**将线程的"身份"参数化**。

传统做法中，每个线程是一个独立的方法（`foo()`、`bar()`、`printA()`、`printB()`……），线程越多，代码膨胀越严重。而参数化之后：

- **一个方法服务所有线程：** `print(threadIndex, token)` 是所有线程的统一入口。
- **数组取代硬编码：** 信号量、条件变量、线程引用都存于数组中，通过下标索引访问，天然支持任意 N。
- **启动逻辑与业务逻辑分离：** 外层 for 循环只负责创建和启动线程，`print()` 方法只关心"等待-执行-交接"的业务逻辑，职责清晰。

这种模式在生产中也很常见：线程池的任务分发、MapReduce 的 Worker 启动、流水线（pipeline）的多阶段并行处理，本质上都是"外层循环创建 N 个 Worker + 每个 Worker 根据自己的 ID 执行通用逻辑"。

---

## 七、总结

Java 多线程交替打印问题的八种实现方案，本质上对应了 Java 并发包中的八种核心同步机制。从工程实践的角度看：

- **面试回答首选** `synchronized + wait/notify`（考察基本功）和 `Semaphore`（考察对 JUC 工具类的掌握）；
- **实际项目推荐** `Semaphore`（代码最简洁）或 `ReentrantLock + Condition`（多场景适用）；
- **理解底层原理** 关注 `LockSupport`（所有 JUC 锁的基石）和 `AtomicInteger + CAS`（无锁编程入门）；
- **不推荐使用** `volatile + yield`（CPU 空转严重），但理解其原理有助于认识"为什么需要阻塞机制"。

每种方案都有其最佳适用场景，关键在于理解底层原语的工作原理，而非死记代码模板。

---

## 参考资料

- [LeetCode 1115. 交替打印 FooBar](https://leetcode.cn/problems/print-foobar-alternately/solutions/)
- [Java 多线程：交替打印 FooBar — CSDN](https://blog.csdn.net/qq_44709990/article/details/120925996)
- [面试官：请用五种方法实现多线程交替打印问题 — 知乎](https://zhuanlan.zhihu.com/p/370130458)
- [多线程知识：三个线程如何交替打印 ABC 循环 100 次 — 腾讯云](https://cloud.tencent.com/developer/article/2300487)
- [JUC 并发编程经典面试题：两个线程交替打印 — CSDN](https://blog.csdn.net/qq_45702045/article/details/140069259)
- [多线程顺序执行与交替打印的五种方案 — 腾讯云](https://cloud.tencent.com/developer/article/1736172)
- [Print FooBar Alternately — algo.monster](https://algo.monster/liteproblems/1115)
- [LeetCode Concurrency: Print FooBar Alternately Solution](https://distinguisheddeveloper.wordpress.com/2020/09/20/leetcode-concurrency-print-foobar-alternately-solution/)
