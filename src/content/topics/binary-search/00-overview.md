# 二分查找与二分答案

二分（Binary Search）是最基础也最高效的搜索策略之一。它的核心思想非常简单：**每次砍掉一半搜索空间**。在长度为 $n$ 的有序序列中，二分只需 $O(\log n)$ 次比较就能定位目标，远胜线性扫描的 $O(n)$。

但二分的威力远不止"在有序数组里找数"。竞赛中大量问题可以转化为**判定问题**——给定一个候选答案，判断它是否可行——然后在答案空间上二分。这就是"二分答案"，也叫"二分 + check"。掌握这个范式，你会发现很多看似复杂的最优化问题都能优雅地拆解。

**什么时候该想到二分？**

- 序列有序（升序或降序）→ 直接在序列上二分
- 问题具有**单调性**：当 $x$ 可行时，所有 $\leq x$（或 $\geq x$）的值也可行 → 在答案空间上二分
- 求"最大值的最小"或"最小值的最大" → 二分答案的经典信号

<!--DEMO:binary-search-visual-->

---

## 核心思想

### 1. 整数二分

整数二分的关键是维护一个闭区间 $[l, r]$，其中**答案一定落在这个区间内**。每轮取中点 $\text{mid} = \lfloor(l + r) / 2\rfloor$，根据某种**判定条件**将区间缩小一半。

根据判定条件方向的不同，整数二分有两种模板：

**模板一：寻找左边界（第一个满足条件的位置）**

- 若 `check(mid)` 为真，答案在 $[l, \text{mid}]$ 中，令 $r = \text{mid}$
- 否则答案在 $[\text{mid}+1, r]$ 中，令 $l = \text{mid}+1$
- 循环条件：`while (l < r)`

**模板二：寻找右边界（最后一个满足条件的位置）**

- 若 `check(mid)` 为真，答案在 $[\text{mid}, r]$ 中，令 $l = \text{mid}$
- 否则答案在 $[l, \text{mid}-1]$ 中，令 $r = \text{mid}-1$
- 循环条件：`while (l < r)`
- 取中点时需用上取整：$\text{mid} = \lfloor(l + r + 1) / 2\rfloor$，否则当 $l + 1 = r$ 时会死循环

<!--DEMO:binary-search-interval-->

### 2. 浮点二分

当答案是实数时，二分的写法更简单——不需要担心整数边界和取整问题。直接设定一个精度 $\varepsilon$，当区间长度 $r - l < \varepsilon$ 时停止。

浮点二分常用于求解方程的根、计算几何中的精度问题等。注意精度 $\varepsilon$ 通常取 $10^{-7}$ 或 $10^{-8}$，再小可能受浮点误差影响。

### 3. 二分答案

这是竞赛中最实用的技巧。核心套路是：

1. **确定答案的范围** $[L, R]$——通常根据题意给出数据范围
2. **设计 check 函数**：给定候选答案 $x$，判断 $x$ 是否可行
3. **利用单调性**：如果 $x$ 可行，那么更优（或更劣）的方向上所有值也可行，搜索空间减半
4. **二分缩小范围**，直到 $l = r$，即找到答案

最常见的两类问题：

- **最大化最小值**：二分答案 $x$，check 是否所有分组的最小值 $\geq x$
- **最小化最大值**：二分答案 $x$，check 是否所有分组的最大值 $\leq x$

两者本质相同——找到满足某个约束的边界值。

---

## 模板代码

### 整数二分模板

```cpp
// 整数二分：找第一个满足 check 的位置
// 单调性：满足条件的形成 [true, true, ..., true, false, ..., false]
// 答案是第一个 true 的下标
int binarySearchLeft(int lo, int hi) {
    int l = lo, r = hi; // 闭区间 [l, r]，答案一定在其中
    while (l < r) {
        int mid = l + (r - l) / 2; // 防溢出
        if (check(mid)) {
            r = mid;     // mid 满足，答案可能是 mid 或更左
        } else {
            l = mid + 1; // mid 不满足，答案一定在 mid 右边
        }
    }
    return l; // l == r，即为答案
}

// 整数二分：找最后一个满足 check 的位置
// 单调性：[false, ..., false, true, true, ..., true]
// 答案是最后一个 true 的下标
int binarySearchRight(int lo, int hi) {
    int l = lo, r = hi;
    while (l < r) {
        int mid = l + (r - l + 1) / 2; // 上取整，防止死循环！
        if (check(mid)) {
            l = mid;     // mid 满足，答案可能是 mid 或更右
        } else {
            r = mid - 1; // mid 不满足，答案一定在 mid 左边
        }
    }
    return l;
}
```

### 浮点二分模板

```cpp
// 浮点二分：求解单调函数 f(x) = 0 的根
// 要求 f(lo) 和 f(hi) 异号
double binarySearchDouble(double lo, double hi) {
    const double eps = 1e-8; // 精度
    while (hi - lo > eps) {
        double mid = (lo + hi) / 2.0;
        if (f(mid) > 0) {  // 根据实际方程调整判断方向
            hi = mid;
        } else {
            lo = mid;
        }
    }
    return lo; // 返回近似解
}
```

### 二分答案模板（以"最大化最小值"为例）

```cpp
// 例：将 n 个物品分成 m 组，最大化每组和的最小值
// check(x)：能否将物品分成 m 组，使每组和 >= x
bool check(long long x) {
    int groups = 1;          // 至少一组
    long long curSum = 0;
    for (int i = 0; i < n; i++) {
        if (curSum + a[i] >= x) {
            // 当前组已满（达到 x），开启新组
            groups++;
            curSum = a[i];
        } else {
            curSum += a[i]; // 继续往当前组塞
        }
    }
    return groups >= m; // 能分出 >= m 组，说明 x 偏小
}

// 二分答案
long long l = 1, r = totalSum; // 答案范围
while (l < r) {
    long long mid = l + (r - l + 1) / 2;
    if (check(mid)) {
        l = mid;   // mid 可行，尝试更大的
    } else {
        r = mid - 1; // mid 不可行，缩小
    }
}
// l 即为最大化后的最小值
```

> **提示**：竞赛中用 `l + (r - l) / 2` 代替 `(l + r) / 2` 防止整数溢出，这是一个好习惯。

---

## 例题详解

### 例题 1：洛谷 P2249 - 查找

**题意**：给定 $n$ 个**升序排列**的整数和 $m$ 个查询，对每个查询输出目标值**第一次出现的位置**（从 1 开始编号），不存在输出 -1。

**分析**：有序序列中找第一个等于 $x$ 的位置，是整数二分的经典应用。用"找左边界"的模板即可——我们二分第一个 $\geq x$ 的位置，然后检查该位置是否恰好等于 $x$。

```cpp
#include <bits/stdc++.h>
using namespace std;

int a[1000005];

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;
    for (int i = 0; i < n; i++) cin >> a[i];

    while (m--) {
        int x;
        cin >> x;
        // 找第一个 >= x 的位置（左边界）
        int l = 0, r = n - 1;
        while (l < r) {
            int mid = l + (r - l) / 2;
            if (a[mid] >= x) {
                r = mid;
            } else {
                l = mid + 1;
            }
        }
        // 检查找到的位置是否等于 x
        if (a[l] == x) {
            cout << l + 1 << " "; // 1-indexed
        } else {
            cout << -1 << " ";
        }
    }
    return 0;
}
```

**复杂度**：每个查询 $O(\log n)$，总计 $O(m \log n)$。

### 例题 2：洛谷 P1873 - 砍树

**题意**：有 $n$ 棵树，第 $i$ 棵高度为 $h_i$。有一台锯子可以设定切割高度 $H$，所有高于 $H$ 的部分会被切下。要求切下的木材总长度至少为 $m$，求能设定的最大 $H$。

**分析**：典型的**最小化最大值 / 二分答案**。$H$ 越大，切下的木材越少；$H$ 越小，切下越多。这个单调性正是二分的前提。

- 答案范围：$H \in [0, \max(h_i)]$
- check 函数：设定切割高度 $x$，计算 $\sum_{i=1}^n \max(0, h_i - x)$，判断是否 $\geq m$

```cpp
#include <bits/stdc++.h>
using namespace std;

int h[1000005];
int n;
long long m;

// check：设定切割高度 x，切下的木材是否 >= m
bool check(int x) {
    long long total = 0;
    for (int i = 0; i < n; i++) {
        if (h[i] > x) total += h[i] - x;
    }
    return total >= m;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> m;
    int maxH = 0;
    for (int i = 0; i < n; i++) {
        cin >> h[i];
        maxH = max(maxH, h[i]);
    }

    // 二分最大的 H，使得切下的木材 >= m
    int l = 0, r = maxH;
    while (l < r) {
        int mid = l + (r - l + 1) / 2; // 找右边界，上取整
        if (check(mid)) {
            l = mid;     // mid 可行，尝试更大的 H
        } else {
            r = mid - 1; // mid 太高了，切的不够
        }
    }
    cout << l << endl;
    return 0;
}
```

**复杂度**：$O(n \log(\max h_i))$，对于 $n = 10^6, h_i \leq 10^9$ 轻松通过。

---

## 练习题单

| # | 平台 | 题号/名称 | 难度 | 关键点 |
|---|------|-----------|------|--------|
| 1 | 洛谷 | P2249 查找 | 入门 | 整数二分找左边界 |
| 2 | LeetCode | 704. Binary Search | 入门 | 标准整数二分 |
| 3 | LeetCode | 35. Search Insert Position | 入门 | 二分找插入位置 |
| 4 | 洛谷 | P1873 砍树 | 进阶 | 二分答案，最大化切割高度 |
| 5 | 洛谷 | P1824 进击的奶牛 | 进阶 | 最大化最小距离，经典二分答案 |
| 6 | Codeforces | 702C - Cellular Network | 进阶 | 二分答案 + 贪心 check |
| 7 | LeetCode | 410. Split Array Largest Sum | 综合 | 最小化最大值，二分答案 |
| 8 | 洛谷 | P3853 路标设置 | 综合 | 最小化最大间距，二分答案 |

---

## 常见错误

### 1. 取中点时整数溢出

```cpp
// 错误写法：l + r 可能溢出 int 范围
int mid = (l + r) / 2;

// 正确写法：
int mid = l + (r - l) / 2;
```

当 $l, r$ 接近 `INT_MAX` 时，`l + r` 会溢出。始终使用 `l + (r - l) / 2`。

### 2. 模板二忘记上取整

```cpp
// 找右边界时，如果用下取整：
int mid = l + (r - l) / 2;
// 当 l = 5, r = 6 时，mid = 5
// 若 check(5) 为 true，则 l = mid = 5
// 下一轮 l = 5, r = 6，mid = 5，无限循环！

// 正确写法：找右边界时必须上取整
int mid = l + (r - l + 1) / 2;
```

这是一个极其常见的死循环错误。记住：**找左边界用下取整，找右边界用上取整**。

### 3. 边界设置错误

```cpp
// 错误：答案可能是 0 但 l 从 1 开始
int l = 1, r = n;

// 正确：根据题目确定答案的完整范围
int l = 0, r = n; // 或其他合理范围
```

二分前必须确认答案的范围 $[l, r]$ 完全覆盖所有可能的答案，否则可能漏掉正确解。

### 4. 浮点二分精度问题

```cpp
// 错误：精度设太小，或者循环次数不够
while (l < r) { ... } // 浮点数永远不相等，会死循环！

// 正确：用精度控制
while (r - l > 1e-8) { ... }
```

浮点数不能用 `l < r` 作为循环条件，因为浮点运算的精度有限，两个实数可能永远不相等。用 `r - l > eps` 来控制。

### 5. check 函数的单调性搞反

```cpp
// 如果二分"最小化最大值"，check 应该判断"最大值 <= x"
// 如果二分"最大化最小值"，check 应该判断"最小值 >= x"
// 方向搞反会导致二分收敛到错误的结果
```

写 check 函数前，先在纸上画出"候选答案 vs. 可行性"的单调关系图，确认方向再写代码。

---

## 延伸阅读

- [OI Wiki - 二分](https://oi-wiki.org/basic/binary/)：系统讲解整数二分、浮点二分、三分搜索
- [OI Wiki - 二分答案](https://oi-wiki.org/basic/binary/#_6)：二分答案的经典模型与例题
- [LeetCode Binary Search 题单](https://leetcode.cn/tag/binary-search/)：按难度递进的练习题集合
- cppreference [std::lower_bound / std::upper_bound](https://en.cppreference.com/w/cpp/algorithm/lower_bound)：C++ 标准库中的二分实现
