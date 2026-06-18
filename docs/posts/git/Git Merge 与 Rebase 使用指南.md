# Git Merge 与 Rebase 使用指南

## 一、基本概念

### 1.1 分支回顾

在理解 merge 和 rebase 之前，先回顾一下 Git 的分支模型。Git 的分支本质上是一个指向某个 commit 的轻量级指针。随着新提交的产生，指针会自动向前移动。

```
          A---B---C  (feature)
         /
    D---E---F---G    (main)
```

上图表示 `main` 和 `feature` 两个分支从 `E` 点分叉后各自发展。此时如果你想把 `feature` 的工作合并回 `main`，就有两条路：`merge` 或 `rebase`。

---

## 二、Git Merge

### 2.1 命令语法

```bash
git merge <branch>
```

将 `<branch>` 的修改合并到当前所在的分支。

常用变体：

```bash
git merge <branch>              # 默认合并指定分支到当前分支，自动尝试 fast-forward
git merge --no-ff <branch>      # 强制生成合并提交（保留分支痕迹）
git merge --ff-only <branch>    # 仅允许 fast-forward，否则拒绝
git merge --squash <branch>     # 将对方分支的所有提交压缩为一个暂存变更
```

### 2.2 工作原理

Git merge 的合并策略取决于两个分支的拓扑关系：

**场景一：Fast-forward（快进）**

当当前分支是目标分支的直接祖先时，Git 会直接将指针向前移动，不会产生额外的 merge commit。

```
Before:
    A---B---C  (main)
             \
              D---E  (feature)

git checkout main && git merge feature

After:
    A---B---C---D---E  (main, feature)
```

**场景二：真正的三方合并（Three-way merge）**

当两个分支都有独立的新提交时，Git 会找到它们的最近公共祖先（base），然后基于三方生成一个新的 merge commit。

```
Before:
          A---B---C  (feature)
         /
    D---E---F---G    (main)

git checkout main && git merge feature

After:
          A---B---C  (feature)
         /         \
    D---E---F---G---H  (main)
                     (merge commit)
```

### 2.3 冲突处理

当两个分支修改了同一文件的相同区域时，Git 无法自动决定保留哪个版本，就会产生合并冲突（merge conflict）。

```bash
git merge feature
# Auto-merging app.js
# CONFLICT (content): Merge conflict in app.js
# Automatic merge failed; fix conflicts and then commit the result.
```

解决流程：

1. 打开冲突文件，找到 `<<<<<<<` / `=======` / `>>>>>>>` 标记
2. 手动编辑，决定保留哪些代码
3. `git add <file>` 标记为已解决
4. `git commit` 完成合并（或使用 `git merge --abort` 放弃合并）

### 2.4 Merge 的优势

- **保留完整历史**：合并提交记录了分支何时合并、合并了哪些提交
- **非破坏性操作**：不修改已有提交的 hash，不会影响其他人的本地仓库
- **安全协作**：多个开发者同时在同一分支工作时，merge 不会改变公共历史

### 2.5 Merge 的劣势

- **历史可能杂乱**：频繁 merge 会导致提交历史布满分叉和合并线，`git log` 难以阅读
- **merge commit 本身可能增加噪音**：如果团队不重视有意义的 merge commit message，历史记录中会充满无意义的 "Merge branch 'xxx'"

---

## 三、Git Rebase

### 3.1 命令语法

```bash
git rebase <base>
```

将当前分支的提交"搬运"到 `<base>` 之上，仿佛你是从那个点重新开始开发的一样。

常用变体：

```bash
git rebase <branch>             # 将当前分支变基到目标分支顶端
git rebase -i <commit>          # 交互式变基，可编辑/合并/重排/删除提交
git rebase --onto <newbase> <oldbase>  # 将某段提交搬到新的基座上
git rebase --abort              # 放弃进行中的变基操作
git rebase --continue           # 解决冲突后继续变基
```

### 3.2 工作原理

Rebase 的核心逻辑：

1. 找到当前分支与 `<base>` 的公共祖先
2. 将当前分支上从公共祖先之后的所有提交**暂存**起来
3. 将当前分支的指针重置到 `<base>` 的最新提交上
4. 逐个**重新应用**暂存的提交（每次应用都可能产生冲突）

```
Before:
          A---B---C  (feature)
         /
    D---E---F---G    (main)

git checkout feature && git rebase main

After:
                      A'---B'---C'  (feature)
                     /
    D---E---F---G    (main)
```

注意 `A'`、`B'`、`C'` 是全新的提交（新的 hash），尽管内容相同，但父提交变了。

### 3.3 交互式 Rebase（Interactive Rebase）

这是 rebase 最强大的用法之一：

```bash
git rebase -i HEAD~5   # 对最近 5 个提交进行交互式操作
```

会打开一个编辑器，类似：

```
pick abc1234 Fix login validation bug
pick def5678 Add user profile page
squash ghi9012 Typo fix in README
pick jkl3456 Refactor auth middleware
drop mno7890 WIP debug logging
```

你可以将每行的命令改为：

| 命令 | 含义 |
|------|------|
| `pick` | 保留该提交 |
| `reword` | 保留提交但修改 message |
| `edit` | 暂停在该提交，允许你修改内容 |
| `squash` / `fixup` | 合并到上一个提交（fixup 丢弃 message） |
| `drop` | 删除该提交 |
| `reorder` | 上下拖动行即可改变提交顺序 |

### 3.4 冲突处理

Rebase 的冲突处理与 merge 不同——**每个提交单独应用时都可能产生冲突**：

```bash
git rebase main
# ...
# CONFLICT (content): Merge conflict in app.js
# error: could not apply abc1234... Fix login validation
```

解决流程：

1. 解决冲突文件中的标记
2. `git add <file>`
3. `git rebase --continue`（**不要**用 `git commit`，那会产生额外的 merge commit）
4. 如果还有下一个提交，可能再次冲突，重复上述步骤
5. 如果要放弃：`git rebase --abort`

### 3.5 Rebase 的优势

- **历史极其干净**：提交历史呈线性，没有分叉和 merge commit
- `git log` 和 `git bisect` 的体验更好
- 适合在合并到主分支前**整理自己的提交**（修改 message、合并小提交、删除临时提交）

### 3.6 Rebase 的劣势

- **改变历史**：提交的 hash 全部改变，如果这些提交已经被推送到远程且其他人也在使用，rebase 后他们必须强制同步
- **冲突处理更繁琐**：每个提交单独应用时都可能冲突，而 merge 只需处理一次
- **丢失分支上下文**：rebase 后的提交看不出原来属于哪个分支开发

---

## 四、Merge vs Rebase 全面对比

| 维度 | Git Merge | Git Rebase |
|------|-----------|------------|
| **历史形状** | 保留分叉和合并提交，呈"菱形" | 线性历史，无分叉 |
| **提交 hash** | 不改变已有提交 | 改变被 rebase 的所有提交的 hash |
| **安全性** | 非破坏性，适合共享分支 | 破坏性，仅适用于本地/私有分支 |
| **冲突处理** | 一次性解决所有冲突 | 每个提交单独处理冲突 |
| **分支信息** | 保留分支来源信息 | 丢失分支分叉的上下文 |
| **merge commit** | 会产生（除非 fast-forward） | 不产生 |
| **适合场景** | 主分支合并、多人协作、发布分支 | 个人分支整理、合并前的历史清理 |
| **不适合** | 追求极简线性历史 | 已推送到远程的公共分支 |

---

## 五、最佳实践与团队协作规范

### 5.1 黄金法则

> **永远不要在公共分支上执行 rebase。**

如果你的分支已经推送到远程且其他同事也在使用，rebase 会改变提交历史，同事的本地仓库会与远程产生分歧，导致灾难性的强制推送需求。

### 5.2 推荐的团队工作流

```
1. 从 main 创建个人 feature 分支
2. 在 feature 分支上自由开发，可以随意提交（包括 WIP、fix typo 等）
3. 准备合并前，用 interactive rebase 整理提交：
   git checkout feature
   git rebase -i HEAD~N
4. 将整理好的 feature 变基到最新的 main 上：
   git rebase main
5. 推送 feature 分支，发起 Pull Request
6. 合并时使用 merge（或 squash merge）进入 main
```

### 5.3 何时用 Merge

- 将功能分支合并到 `main` / `develop` 等长期分支时
- 多人同时开发同一分支，需要保留各自独立的工作记录时
- 你不确定 rebase 是否安全时（merge 总是安全的）
- 希望保留"这个功能是什么时候通过哪个 PR 合并的"信息时

### 5.4 何时用 Rebase

- 合并到主分支前，整理自己 feature 分支的提交历史
- 你的本地分支落后于远程主分支，想"追上"最新进展（`git pull --rebase`）
- 将多个小提交（typo fix、debug log）合并为一个有意义的提交
- 你确定该分支只有自己在使用

### 5.5 `git pull --rebase` 替代普通 pull

普通 `git pull` 相当于 `git fetch` + `git merge`，当本地和远程都有新提交时会产生一个无意义的 merge commit。

```bash
# 替代方案
git pull --rebase
```

这相当于 `git fetch` + `git rebase`，将你的本地提交变基到远程最新提交之上，保持历史线性。

可以在全局配置中默认启用：

```bash
git config --global pull.rebase true
```

---

## 六、实用命令速查

### Merge 相关

```bash
git merge feature              # 合并 feature 到当前分支
git merge --no-ff feature      # 强制生成 merge commit
git merge --abort              # 取消正在进行的合并
git merge --squash feature     # 将 feature 的所有提交压缩为一个暂存变更
git log --merges               # 查看所有 merge commit
git log --graph --oneline      # 图形化查看分支合并历史
```

### Rebase 相关

```bash
git rebase main                # 将当前分支变基到 main
git rebase -i HEAD~5           # 交互式整理最近 5 个提交
git rebase --continue          # 解决冲突后继续
git rebase --abort             # 放弃变基
git rebase --skip              # 跳过当前冲突提交
git reflog                     # 查看操作历史（rebase 出错时的救命稻草）
```

### 恢复误操作

```bash
# Rebase 后后悔了，想恢复到 rebase 之前的状态
git reflog                     # 找到 rebase 之前的 HEAD（如 HEAD@{3}）
git reset --hard HEAD@{3}      # 恢复到 rebase 前

# 或者使用 ORIG_HEAD（Git 在 rebase 前自动保存的引用）
git reset --hard ORIG_HEAD
```

---

## 七、总结

Merge 和 Rebase 不是互斥的选择，而是**互补的工具**。优秀的 Git 工作流通常同时使用两者：

- **Rebase** 用于**本地整理**：在推送前清理提交历史，让每个提交都有独立的意义
- **Merge** 用于**远程合并**：将整理好的分支安全地合并到共享的主分支

掌握这两者的区别和适用场景，是 Git 使用从"会用"到"精通"的关键一步。
