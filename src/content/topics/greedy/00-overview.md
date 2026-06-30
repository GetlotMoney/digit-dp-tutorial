# 贪心算法

贪心算法（Greedy Algorithm）是一种在每一步选择中都采取**当前最优**决策的算法策略。它不考虑全局，只关注眼前利益，并期望通过一系列局部最优选择得到全局最优解。贪心算法适用于具有**贪心选择性质**和**最优子结构**的问题，通常时间复杂度较低、代码简洁，是竞赛中的高频考点。

---

## 核心思想

贪心的核心可以概括为两个关键词：**贪心选择性质**和**最优子结构**。

- **贪心选择性质**：存在一种策略，使得每一步做出的局部最优选择最终导向全局最优解。
- **最优子结构**：问题的最优解包含子问题的最优解。

要证明一个贪心策略是正确的，常用方法有两种：

### 交换论证（Exchange Argument）

交换论证是最经典的贪心正确性证明方法。思路如下：

1. 假设存在一个最优解 $O$ 与我们的贪心解 $G$ 不同。
2. 找到 $O$ 与 $G$ 的第一个不同之处。
3. 把 $O$ 中的选择「交换」成 $G$ 的选择，证明交换后解不会变差。
4. 重复此过程，最终 $O$ 可以变成 $G$，说明 $G$ 也是最优的。

### 贪心策略的选择

面对一个问题，如何确定贪心策略？常见思路包括：

- **按某个维度排序**：如按结束时间、性价比、单位重量价值等排序后逐个决策。
- **优先队列维护**：用堆维护当前可选集合，每次取出最优元素。
- **增量构造**：从空集出发，每次添加一个使目标函数增量最大的元素。

> 经验法则：如果一个问题有多种候选策略（如按开始时间 vs 按结束时间 vs 按区间长度），不要猜测——对每种策略构造反例，只保留无法被反例击败的那个。

---

## 模板代码

贪心没有统一模板，但大部分贪心题都可以归结为「排序 + 逐个决策」的模式。以下是区间调度问题的模板框架：

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Interval {
    int l, r; // 左端点、右端点
    // 可按需添加其他字段（权值等）
};

// 贪心模板：区间调度
// 核心思路：按右端点排序，每次选结束最早的区间
int greedy_schedule(vector<Interval>& intervals) {
    // 1. 按贪心关键字排序（这里是右端点）
    sort(intervals.begin(), intervals.end(),
         [](const Interval& a, const Interval& b) {
             return a.r < b.r;
         });

    int cnt = 0;          // 已选区间数量
    int last_end = -1e9;  // 上一个被选区间的右端点

    // 2. 逐个考察，贪心决策
    for (auto& itv : intervals) {
        if (itv.l >= last_end) {  // 与上一个不重叠
            cnt++;
            last_end = itv.r;     // 更新右端点
        }
    }
    return cnt;
}
```

对于带权区间调度（Weighted Interval Scheduling），贪心不适用，需要动态规划。这也提醒我们：**贪心不是万能的，要先验证问题是否满足贪心选择性质**。

---

## 例题详解

### 例题 1：活动选择问题

**题目描述**：给定 $n$ 个活动，每个活动有开始时间 $s_i$ 和结束时间 $f_i$。一个主持人同一时间只能参加一个活动，求最多能参加多少个活动。

**来源**：经典问题，[洛谷 P1803](https://www.luogu.com.cn/problem/P1803)（凌乱的yyy）是其简化版。

**贪心策略**：按结束时间从小到大排序，每次选结束最早且不与已选活动冲突的活动。

**正确性证明（交换论证）**：假设最优解 $O$ 的第一个活动不是结束最早的活动 $a_1$，而是某个活动 $a_k$（$f_k > f_1$）。将 $a_k$ 替换为 $a_1$，由于 $f_1 < f_k$，剩余时间更多，不会减少可选活动数。因此贪心解最优。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<pair<int,int>> act(n); // {结束时间, 开始时间}
    for (int i = 0; i < n; i++) {
        cin >> act[i].second >> act[i].first;
    }
    // 按结束时间排序
    sort(act.begin(), act.end());

    int cnt = 0, last = -1;
    for (auto& [end, start] : act) {
        if (start >= last) {
            cnt++;
            last = end;
        }
    }
    cout << cnt << endl;
    return 0;
}
```

时间复杂度：$O(n \log n)$（排序），空间复杂度：$O(1)$（不含输入存储）。

### 例题 2：哈夫曼编码

**题目描述**：给定 $n$ 个字符及其出现频率，构造一棵二叉树使得带权路径长度 $\sum_{i=1}^{n} w_i \cdot l_i$ 最小，其中 $w_i$ 为频率，$l_i$ 为编码长度。

**贪心策略**：每次从当前所有节点中选取频率最小的两个合并为一个新节点，新节点的频率为两者之和，放回集合继续操作。这正是**优先队列（小顶堆）**的经典应用。

**正确性直觉**：频率最低的字符应该在树的最深层（编码最长），这样加权和最小。合并两个最小频率节点不会使任何高频节点下移。

```cpp
#include <bits/stdc++.h>
using namespace std;

// 哈夫曼树求最小带权路径长度
long long huffman(vector<int>& freq) {
    // 用小顶堆维护所有节点
    priority_queue<long long, vector<long long>, greater<long long>> pq;
    for (int f : freq) pq.push(f);

    long long total = 0;
    while (pq.size() > 1) {
        // 取出频率最小的两个
        long long a = pq.top(); pq.pop();
        long long b = pq.top(); pq.pop();
        long long merged = a + b;
        total += merged;    // 合并代价
        pq.push(merged);    // 新节点放回
    }
    return total;
}

int main() {
    int n;
    cin >> n;
    vector<int> freq(n);
    for (int i = 0; i < n; i++) cin >> freq[i];
    cout << huffman(freq) << endl;
    return 0;
}
```

时间复杂度：$O(n \log n)$，空间复杂度：$O(n)$。

<!--DEMO:huffman-tree:interactive huffman tree construction from frequency table-->

---

## 练习题单

| 平台 | 题号 / 名称 | 难度 | 要点 |
|------|-------------|------|------|
| 洛谷 | P1803 凌乱的yyy | 入门 | 区间调度，按右端点排序 |
| 洛谷 | P1020 导弹拦截 | 进阶 | 贪心 + 最长不上升子序列（耐心排序） |
| 洛谷 | P1090 合并果子 | 入门 | 哈夫曼思想，小顶堆 |
| LeetCode | 435 Non-overlapping Intervals | 进阶 | 区间调度变体，删除最少区间 |
| LeetCode | 452 Minimum Number of Arrows | 进阶 | 区间交集贪心 |
| LeetCode | 763 Partition Labels | 综合 | 记录字符最后出现位置，贪心分割 |
| Codeforces | 1132C - Painting the Fence | 综合 | 前缀和 + 贪心枚举 |
| Codeforces | 1607D - Blue-Red Permutation | 进阶 | 分类贪心，按颜色分配 |

---

## 常见错误

### 1. 贪心策略没有严格证明就使用

**错误**：看到题目感觉"好像可以贪心"就直接写，没有验证。

**正确做法**：用交换论证或反证法确认贪心策略正确。构造几个小数据手动验证；如果找不到反例，再尝试证明。实在无法证明时，考虑是否需要动态规划。

### 2. 排序关键字选错

**错误**：区间问题按开始时间排序而不是按结束时间排序，导致不是最优。

**正确做法**：不同排序方式会得到不同结果。对每种可能的排序关键字，尝试构造反例（如两个区间选择不同排序后答案不同），保留无法被反例击败的那个。

### 3. 忘记处理边界条件

**错误**：`>=` 和 `>` 混用，比如活动选择中 `start > last` 和 `start >= last` 的语义区别。

**正确做法**：明确题目要求——"不重叠"是指端点可以相接还是必须严格分离。根据题意选择正确的比较符号。

### 4. 把需要 DP 的问题当成贪心

**错误**：带权区间调度、背包问题等使用贪心（如按性价比排序）。

**正确做法**：如果每个选择会影响后续选择的可行集，且不能通过简单的排序消除这种依赖，通常需要 DP。一个简单判断：**如果贪心可以被反例击败，就换 DP**。

### 5. 优先队列方向搞反

**错误**：哈夫曼编码中使用大顶堆（`priority_queue<int>`）而非小顶堆。

**正确做法**：注意 C++ 的 `priority_queue` 默认是大顶堆。需要小顶堆时写 `priority_queue<int, vector<int>, greater<int>>`。

---

## 延伸阅读

- [OI Wiki - 贪心](https://oi-wiki.org/basic/greedy/)：贪心的理论基础与更多竞赛例题。
- [OI Wiki - 哈夫曼树](https://oi-wiki.org/ds/huffman-tree/)：哈夫曼编码的详细推导与变体。
- 《算法导论》第 16 章：贪心算法的完整理论框架，包含活动选择、哈夫曼编码、最小生成树等经典证明。
- [LeetCode Greedy 题单](https://leetcode.cn/tag/greedy/)：按难度分类的在线练习。
