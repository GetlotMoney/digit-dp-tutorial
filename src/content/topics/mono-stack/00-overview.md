# 单调栈与单调队列

单调栈和单调队列是竞赛中极为常用的数据结构。它们的核心思想非常朴素：**维护一个栈（或队列）中元素的单调性**，从而在 $O(n)$ 的时间内高效地解决"下一个更大/更小元素"、"滑动窗口最值"等看似需要 $O(n^2)$ 暴力的问题。掌握单调栈与单调队列，能让你在面对涉及"左右两侧第一个满足某条件的元素"类问题时迅速找到切入点。

<!--DEMO:mono-stack-visual-->

---

## 核心思想

### 单调栈

单调栈就是一个**栈内元素保持单调递增（或递减）**的栈。以"找每个元素右边第一个比它大的元素"为例：

- 从右往左遍历数组。
- 对于当前元素 $a[i]$，不断弹出栈顶比 $a[i]$ 小（或等于）的元素——因为它们对 $a[i]$ 来说不可能成为答案。
- 弹完后，如果栈非空，栈顶就是 $a[i]$ 右边第一个比它大的元素。
- 将 $a[i]$ 入栈。

**为什么是 $O(n)$？** 每个元素最多入栈一次、出栈一次，总操作次数为 $2n$，均摊 $O(1)$。

用一个例子来演示：数组 $[2, 1, 2, 4, 3]$，求每个位置右边第一个更大的元素。

```
从右往左扫描：
i=4, a[4]=3 → 栈空，无答案 → push(3)   栈: [3]
i=3, a[3]=4 → 弹出 3（3<4），栈空，无答案 → push(4)   栈: [4]
i=2, a[2]=2 → 栈顶 4>2，答案=4 → push(2)   栈: [4,2]
i=1, a[1]=1 → 栈顶 2>1，答案=2 → push(1)   栈: [4,2,1]
i=0, a[0]=2 → 弹出 1（1<2），栈顶 2=2 继续弹出（找更大而非更大等于），栈顶 4>2，答案=4 → push(2)   栈: [4,2]
结果: [4, 2, 4, -1, -1]
```

### 单调队列

单调队列与单调栈原理相同，只是数据结构从栈变成了**双端队列（deque）**，用于维护滑动窗口内的最值。

对于滑动窗口大小为 $k$ 的最大值问题：

- 队列中存储的是**下标**，对应的值保持单调递减。
- 每次有新元素入队时，从队尾弹出所有值小于等于新元素的元素。
- 每次检查队头下标是否已滑出窗口（下标 $< i - k + 1$），若是则弹出。
- 队头始终是当前窗口的最大值。

### 适用场景总结

| 问题类型 | 数据结构 | 时间复杂度 |
|---------|---------|-----------|
| 每个元素左/右边第一个更大/更小元素 | 单调栈 | $O(n)$ |
| 滑动窗口最大/最小值 | 单调队列 | $O(n)$ |
| 柱状图最大矩形 | 单调栈 | $O(n)$ |
| 接雨水 | 单调栈或双指针 | $O(n)$ |

---

## 模板代码

### 单调栈模板

以下模板求每个元素**右边第一个更大的元素**，不存在则为 $-1$。栈内存下标，保证元素值单调递减。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    scanf("%d", &n);
    vector<int> a(n), ans(n, -1);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);

    stack<int> stk; // 单调递减栈（栈底到栈顶递减）
    for (int i = 0; i < n; i++) {
        // 当前元素 a[i] 比栈顶大，说明 a[i] 就是栈顶元素的答案
        while (!stk.empty() && a[stk.top()] < a[i]) {
            ans[stk.top()] = a[i]; // 栈顶元素右边第一个更大的是 a[i]
            stk.pop();
        }
        stk.push(i);
    }

    for (int i = 0; i < n; i++)
        printf("%d%c", ans[i], " \n"[i == n - 1]);
    return 0;
}
```

> 如果要求左边第一个更大的元素，只需把遍历顺序改为从右到左即可。

### 单调队列模板

以下模板求滑动窗口大小为 $k$ 时**每个窗口的最小值**。队列存下标，对应值单调递增。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, k;
    scanf("%d%d", &n, &k);
    vector<int> a(n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);

    deque<int> dq; // 单调递增队列（队头到队尾递增），存下标
    for (int i = 0; i < n; i++) {
        // 弹出已滑出窗口的元素
        while (!dq.empty() && dq.front() < i - k + 1)
            dq.pop_front();
        // 从队尾弹出所有 >= a[i] 的元素，保持单调递增
        while (!dq.empty() && a[dq.back()] >= a[i])
            dq.pop_back();
        dq.push_back(i);
        // 窗口形成后输出答案
        if (i >= k - 1)
            printf("%d ", a[dq.front()]);
    }
    puts("");
    return 0;
}
```

<!--DEMO:sliding-window-visual-->

---

## 例题详解

### 例题 1：LeetCode 496 下一个更大元素 I

**题意：** 给定两个没有重复元素的数组 `nums1` 和 `nums2`，其中 `nums1` 是 `nums2` 的子集。对 `nums1` 中的每个元素，找出它在 `nums2` 中右边第一个更大的元素。如果不存在则返回 $-1$。$nums2$ 长度 $\le 1000$。

**思路：** 先对 `nums2` 做一次单调栈，预处理出每个元素右边第一个更大的值，存入哈希表。然后对 `nums1` 中的每个元素查表即可。总时间 $O(|nums2|)$。

```cpp
class Solution {
public:
    vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {
        int n = nums2.size();
        unordered_map<int, int> mp; // val -> 右边第一个更大的值
        stack<int> stk; // 单调递减栈，存值

        for (int x : nums2) {
            while (!stk.empty() && stk.top() < x) {
                mp[stk.top()] = x; // x 是栈顶元素的答案
                stk.pop();
            }
            stk.push(x);
        }
        // 栈中剩余元素没有右边更大的元素

        vector<int> ans;
        for (int x : nums1)
            ans.push_back(mp.count(x) ? mp[x] : -1);
        return ans;
    }
};
```

### 例题 2：洛谷 P1886 滑动窗口 / LeetCode 239 滑动窗口最大值

**题意：** 给定长度为 $n$ 的数组和窗口大小 $k$，输出每个滑动窗口中的最大值和最小值。$n \le 10^6$。

**思路：** 经典单调队列。分别维护一个单调递减队列（求最大值）和一个单调递增队列（求最小值）。每个元素入队出队各一次，总时间 $O(n)$。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, k;
    scanf("%d%d", &n, &k);
    vector<int> a(n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);

    // 求每个窗口最小值：单调递增队列
    deque<int> dq_min;
    for (int i = 0; i < n; i++) {
        while (!dq_min.empty() && dq_min.front() < i - k + 1)
            dq_min.pop_front();
        while (!dq_min.empty() && a[dq_min.back()] >= a[i])
            dq_min.pop_back();
        dq_min.push_back(i);
        if (i >= k - 1) printf("%d ", a[dq_min.front()]);
    }
    puts("");

    // 求每个窗口最大值：单调递减队列
    deque<int> dq_max;
    for (int i = 0; i < n; i++) {
        while (!dq_max.empty() && dq_max.front() < i - k + 1)
            dq_max.pop_front();
        while (!dq_max.empty() && a[dq_max.back()] <= a[i])
            dq_max.pop_back();
        dq_max.push_back(i);
        if (i >= k - 1) printf("%d ", a[dq_max.front()]);
    }
    puts("");

    return 0;
}
```

---

## 练习题单

| # | 平台 | 题号/名称 | 难度 | 关键词 |
|---|------|----------|------|--------|
| 1 | LeetCode | 496 下一个更大元素 I | 入门 | 单调栈 + 哈希表 |
| 2 | LeetCode | 503 下一个更大元素 II | 入门 | 单调栈 + 循环数组 |
| 3 | LeetCode | 239 滑动窗口最大值 | 入门 | 单调队列模板 |
| 4 | 洛谷 | P5788 【模板】单调栈 | 进阶 | 单调栈模板题 |
| 5 | 洛谷 | P1886 滑动窗口 | 进阶 | 单调队列双端最值 |
| 6 | LeetCode | 84 柱状图中最大的矩形 | 综合 | 单调栈经典应用 |
| 7 | LeetCode | 42 接雨水 | 综合 | 单调栈 / 双指针 |
| 8 | Codeforces | 1157C2 Increasing Subsequence | 进阶 | 贪心 + 双端队列 |

---

## 常见错误

**1. 混淆栈的方向：遍历方向和比较方向不匹配**

"求右边第一个更大的元素"从左往右遍历，"求左边第一个更大的元素"从右往左遍历。如果方向搞反，栈中残留的元素对应的答案就会出错。建议在纸上画一个简单例子手动模拟。

**2. 单调队列忘记检查队头是否滑出窗口**

单调队列中元素不会自动过期，必须在每次操作前检查 `dq.front() < i - k + 1` 并弹出。遗漏这一步会导致队头元素已经是窗口外的"僵尸值"。

**3. 存下标 vs 存值搞混**

单调栈和单调队列推荐**存下标**而非存值。存下标的好处是：(1) 可以算出元素与答案的距离（如宽度）；(2) 单调队列可以通过下标判断元素是否过期。存值则需要额外维护这些信息。

**4. 边界条件：相等元素的处理**

"右边第一个**严格**更大的元素"和"右边第一个**大于等于**的元素"在相等元素上的行为完全不同。代码中 `<` 和 `<=` 的选择需要仔细对照题意。一个常见的做法是：找严格更大用 `<`，找大于等于用 `<=`。

**5. 栈为空时的处理**

当栈/队列为空时，说明当前元素在该方向上没有满足条件的元素，答案应设为 $-1$（或题目规定的默认值）。不要忘记初始化答案数组的默认值。

---

## 延伸阅读

- [OI Wiki - 单调栈](https://oi-wiki.org/ds/monotonous-stack/) — 单调栈的系统讲解与更多例题
- [OI Wiki - 单调队列](https://oi-wiki.org/ds/monotonous-queue/) — 单调队列及其在 DP 优化中的应用
- [OI Wiki - ST 表](https://oi-wiki.org/ds/sparse-table/) — 如果不需要滑动窗口，静态区间最值可用 ST 表 $O(1)$ 查询
- [LeetCode 单调栈题单](https://leetcode.cn/tag/monotonic-stack/problemset/) — 按难度排列的单调栈练习
