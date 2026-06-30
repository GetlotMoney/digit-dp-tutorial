# 回溯与剪枝

回溯法（Backtracking）是暴力搜索的一种系统化框架：沿着一棵**隐式搜索树**逐层做选择，发现当前路径无法得到合法解时立刻「退回」上一步，换一个选项继续尝试。它几乎是组合搜索问题的通用解法——全排列、子集、组合、N 皇后、数独、图着色……都可以用同一个模板统一处理。

回溯的效率瓶颈在于搜索树的规模。**剪枝**就是在搜索过程中尽早判断「这条路不可能产生合法解」或「这条路不可能比已知最优解更好」，从而砍掉大量无用分支。好的剪枝往往能把指数级降到多项式可接受的范围。

本篇将介绍回溯的基本框架、两种关键剪枝策略，并通过经典例题演示完整编码过程。

---

## 核心思想

### 搜索树与决策

把每一步看作在搜索树上选一个子节点。以全排列为例：要在 $\{1, 2, 3\}$ 的所有排列中搜索，树的第 $i$ 层决定第 $i$ 个位置放什么数字。

- **根节点**：空排列，什么都没选。
- **每个节点**：代表一个「已做的选择序列」（路径），以及「还能做的选择」（候选集）。
- **叶节点**：所有位置都填满，得到一个完整排列。

### 回溯三步

在每个节点上，回溯的核心操作只有三步：

1. **做选择（Choose）**：从候选集中挑一个元素，加入当前路径。
2. **递归（Explore）**：进入下一层，继续搜索。
3. **撤销选择（Undo）**：递归返回后，把刚才加入的元素从路径中移除，恢复状态，以便尝试下一个候选。

这就是**深度优先遍历搜索树**的过程。撤销选择保证了每层的候选集在不同分支之间互不干扰。

### 两种剪枝

| 策略 | 判断时机 | 效果 |
|------|---------|------|
| **可行性剪枝** | 一旦发现当前路径已违反约束条件 | 立即返回，不继续往下搜 |
| **最优性剪枝** | 当前路径的「潜力上界」已无法超越已知最优解 | 立即返回，不继续往下搜 |

可行性剪枝在所有回溯问题中都可能出现；最优性剪枝主要用于求最优值的问题（最短路径、最大收益等）。

<!--DEMO:backtracking-tree-->

### 复杂度

回溯的最坏时间复杂度通常是 $O(b^d)$（$b$ 为平均分支数，$d$ 为搜索深度），实际复杂度取决于剪枝效果。没有剪枝时等价于枚举，有强力剪枝时可能降至可接受范围。

---

## 模板代码

下面是一个通用的回溯框架。`path` 记录当前路径，`candidates` 返回当前可选列表，`is_valid` 做可行性判断。不同的题目只需替换这三个部分。

```cpp
vector<int> path;          // 当前路径
vector<vector<int>> ans;   // 所有合法解

void backtrack(int start) {
    // ---- 终止条件：得到一个完整解 ----
    if (path 满足结束条件) {
        ans.push_back(path);
        return;
    }

    // ---- 枚举当前层的所有选择 ----
    for (int i = start; i < n; i++) {
        // 可行性剪枝：跳过不合法的选择
        if (!is_valid(i)) continue;

        // 1. 做选择
        path.push_back(candidates[i]);

        // 2. 递归进入下一层
        backtrack(i + 1);   // 或 backtrack(i)，取决于元素是否可重复使用

        // 3. 撤销选择
        path.pop_back();
    }
}
```

**子集、组合、排列**的区别仅在于递归入口和去重逻辑不同：

| 问题 | 起始搜索点 | 是否可重用 | 去重 |
|------|-----------|-----------|------|
| 子集 | `backtrack(0)` | 不重用 | 同层 `i > start && nums[i] == nums[i-1]` |
| 组合 | `backtrack(start)` | 不重用 | 同子集 |
| 排列 | `backtrack()` | 不重用 | 用 `used[]` 数组标记 |

---

## 例题详解

### 例题 1：全排列（LeetCode 46）

> 给定不含重复数字的数组 `nums`，返回其所有可能的全排列。

**思路**：排列需要按位置枚举，每层遍历所有未使用的数字，用 `used[]` 标记哪些数字已经在路径中。

```cpp
class Solution {
public:
    vector<vector<int>> ans;
    vector<int> path;
    vector<bool> used;

    void backtrack(vector<int>& nums) {
        // 路径长度 == 数组长度，找到一个排列
        if (path.size() == nums.size()) {
            ans.push_back(path);
            return;
        }
        for (int i = 0; i < (int)nums.size(); i++) {
            if (used[i]) continue;     // 可行性剪枝：已用过的数字不能再选
            used[i] = true;            // 做选择
            path.push_back(nums[i]);
            backtrack(nums);           // 递归
            path.pop_back();           // 撤销选择
            used[i] = false;
        }
    }

    vector<vector<int>> permute(vector<int>& nums) {
        used.assign(nums.size(), false);
        backtrack(nums);
        return ans;
    }
};
```

**复杂度**：时间 $O(n \cdot n!)$，空间 $O(n)$（递归栈深度）。

### 例题 2：N 皇后（LeetCode 51）

> 在 $n \times n$ 的棋盘上放置 $n$ 个皇后，使得它们互不攻击（任意两个皇后不在同行、同列、同对角线）。

**思路**：逐行放置皇后。每行选一个列位置，需要检查列、主对角线、副对角线是否冲突。用三个布尔数组 `col[]`、`dg[]`（主对角线）、`udg[]`（副对角线）记录已占有的列和对角线。

关键观察：对于 $n \times n$ 棋盘，主对角线编号可用 $i - j + n$（范围 $0 \sim 2n$），副对角线编号可用 $i + j$（范围 $0 \sim 2n$）。

```cpp
class Solution {
public:
    vector<vector<string>> ans;
    vector<string> board;
    vector<bool> col, dg, udg;  // 列、主对角线、副对角线

    void backtrack(int row, int n) {
        // 所有行都放完了，记录答案
        if (row == n) {
            ans.push_back(board);
            return;
        }
        for (int j = 0; j < n; j++) {
            // 可行性剪枝：列或对角线冲突，直接跳过
            if (col[j] || dg[row - j + n] || udg[row + j]) continue;

            // 做选择
            col[j] = dg[row - j + n] = udg[row + j] = true;
            board[row][j] = 'Q';

            backtrack(row + 1, n);  // 递归下一行

            // 撤销选择
            board[row][j] = '.';
            col[j] = dg[row - j + n] = udg[row + j] = false;
        }
    }

    vector<vector<string>> solveNQueens(int n) {
        col.assign(n, false);
        dg.assign(2 * n, false);
        udg.assign(2 * n, false);
        board.assign(n, string(n, '.'));
        backtrack(0, n);
        return ans;
    }
};
```

**复杂度**：理论上 $O(n^n)$，但列/对角线剪枝使实际运行远小于此。经典实现可在 $n=9$ 以内秒出。

<!--DEMO:nqueens-demo-->

---

## 练习题单

| 平台 | 题号 / 题名 | 难度 |
|------|------------|------|
| LeetCode | 46. 全排列 | 入门 |
| LeetCode | 78. 子集 | 入门 |
| LeetCode | 39. 组合总和 | 入门 |
| 洛谷 | P1706 全排列问题 | 入门 |
| LeetCode | 51. N 皇后 | 进阶 |
| 洛谷 | P1219 八皇后 | 进阶 |
| LeetCode | 37. 解数独 | 综合 |
| Codeforces | 489C Given Length and Sum of Digits... | 综合 |

> **刷题建议**：先把全排列和子集各写一遍，体会 `used[]` 和 `start` 参数的区别；再做 N 皇后，掌握用布尔数组加速冲突判断的技巧；最后挑战解数独等复杂剪枝题。

---

## 常见错误

**1. 忘记撤销选择（状态恢复）**

做选择后递归，递归返回后必须撤销。漏掉撤销会导致同一层后面的分支读到脏状态。这是新手最常犯的错误。检查方法：确保每处 `push_back` 后面都有对应的 `pop_back`。

**2. 排列与组合的去重逻辑混用**

排列用 `used[]` 数组标记已选元素；组合/子集用 `start` 参数保证只选后面的元素。两者不能互换——用 `start` 做排列会漏解，用 `used[]` 做组合会重复。

**3. 排序去重时漏写排序**

含重复元素的子集（LeetCode 90）需要**先排序**，然后在同层用 `nums[i] == nums[i-1] && i > start` 跳过重复。忘记排序会导致去重判断失效，产生重复子集。

**4. 剪枝条件写反或写错位置**

可行性剪枝应放在「做选择之前」——如果已知某个选择不合法，就不该进入递归。写在递归内部会导致多走一层无用栈。

**5. 收集答案时拷贝遗漏**

`ans.push_back(path)` 调用的是拷贝构造，这一步本身没问题。但如果 `path` 存的是指针或引用（例如二维数组的某一行），要注意拷贝的深度。

---

## 延伸阅读

- [OI Wiki - 搜索](https://oi-wiki.org/search/)：搜索算法总览，含回溯、迭代加深、IDA* 等。
- [OI Wiki - 剪枝](https://oi-wiki.org/search/pruning/)：更多剪枝策略与例题。
- [LeetCode 回溯专题](https://leetcode.cn/tag/backtracking/)：系统化练习题单。
- 《算法竞赛进阶指南》第 0x50 节「搜索」：回溯与剪枝的竞赛视角讲解。
