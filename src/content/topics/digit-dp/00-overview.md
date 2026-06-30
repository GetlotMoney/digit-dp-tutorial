# 数位DP

数位 DP（Digit DP）是一类专门处理**「区间 $[L, R]$ 内满足某种数字特征的数有多少个」**这类计数问题的算法技巧。它的核心思路是：把一个数的每一位看成一个独立的「位置」，从高位到低位逐位填数，在填数过程中用若干状态变量记录约束条件（是否还贴着上界、前导零是否仍在等），最终通过记忆化搜索汇总方案数。

数位 DP 的典型问题包括：统计区间内含特定数字的数的个数、不含相邻重复数字的数的个数、各位数字之和满足某条件的数的个数等。只要问题可以转化为「对十进制表示的每一位做决策」，都可以考虑数位 DP。

<!--DEMO:filldigits-->

---

## 核心思想

### 逐位填数

给定上限 $N$（设其十进制表示为 $d_{k-1}d_{k-2}\dots d_0$，共 $k$ 位），我们从最高位 $d_{k-1}$ 开始，依次决定每一位填什么数字。设当前正在填第 $pos$ 位，已经决策了 $pos+1 \sim k-1$ 位。

每填一位数字 $dig$，有如下转移：

$$
f(pos+1, \text{新状态}) \;\mathrel{+}= \;f(pos, \text{当前状态})
$$

### 两个关键标志

**1. limit（上界限制）**

当且仅当我们之前填的每一位都与 $N$ 的对应位完全相同（即一直在「贴着上界走」），当前位才受到上限限制——最多只能填到 $d_{pos}$。一旦在更高位填了一个比 $d_{pos}$ 小的数字，后面的位就可以自由选择 $0\sim 9$。

$$
\text{limit} = \begin{cases} 1, & \text{前面每一位都贴着上界} \\ 0, & \text{已经在某高位脱离了上界} \end{cases}
$$

**2. lead0（前导零标志）**

当高位连续填 0 时，这些 0 不属于真正的数字——它们是「占位的前导零」。`lead0` 标志用于区分「正在填前导零」和「真正的数字 0」。这个标志对以下场景至关重要：

- 不含某数字的计数问题（前导零不应被当作数字 0 来判断）
- 各位数字之和等与「实际位数」相关的统计

<!--DEMO:prefixsum-->

### 前缀和转化

数位 DP 通常解决的是「统计 $[0, N]$ 内满足条件的数的个数」，而题目要求的是 $[L, R]$ 区间。利用前缀和思想：

$$
\text{ans}(L, R) = \text{count}(R) - \text{count}(L - 1)
$$

其中 $\text{count}(N)$ 表示 $[0, N]$ 中满足条件的数的个数。

### 记忆化搜索

由于「已经脱离上界」后的状态与 $N$ 无关，大量子问题会被重复计算。用一个 `memo` 数组缓存这些状态，就能将指数级的搜索剪到多项式级别。

以统计 $[0, N]$ 中不含数字 4 的数为例，状态为 `(pos, limit, lead0)`。当 `limit == false` 且 `lead0 == false` 时，$(pos, false, false)$ 这个状态与 $N$ 无关，可以记忆化。状态数为 $O(k \times 2 \times 2)$，每次转移枚举 $0\sim 9$，总复杂度 $O(k \times 2 \times 2 \times 10)$，非常高效。

---

## 模板代码

下面给出数位 DP 的通用 C++ 记忆化搜索模板，以「统计 $[0, N]$ 中不含某特定数字 `bad` 的数的个数」为例：

<!--DEMO:memtree-->

```cpp
#include <bits/stdc++.h>
using namespace std;

// 统计 [0, N] 中不含数字 bad 的数的个数
long long count(long long N, int bad) {
    if (N < 0) return 0;
    // 拆分 N 的每一位到数组，digits[0] 为最低位
    vector<int> digits;
    long long tmp = N;
    if (tmp == 0) digits.push_back(0);
    while (tmp > 0) {
        digits.push_back(tmp % 10);
        tmp /= 10;
    }
    reverse(digits.begin(), digits.end()); // 翻转为高位在前
    int k = digits.size();

    // memo[pos][limit]：已经处理了前 pos 位，当前 limit 状态下的方案数
    // 注意：当 limit == true 时结果依赖上界，不能记忆化
    //       所以只需对 limit == false 的情况缓存
    vector<long long> memo(k, -1); // 只缓存 limit==false 的状态

    // dfs 返回从第 pos 位开始填数的方案数
    // limit：前面是否一直贴着上界
    // lead0：前面是否全是前导零
    function<long long(int, bool, bool)> dfs = [&](int pos, bool limit, bool lead0) -> long long {
        if (pos == k) {
            // 填完了所有位，合法方案返回 1
            // （若 lead0==true 说明整个数是 0，视题意可能需要排除）
            return 1;
        }

        // 仅当 limit==false && lead0==false 时可以记忆化
        if (!limit && !lead0 && memo[pos] != -1) return memo[pos];

        int up = limit ? digits[pos] : 9; // 当前位上限
        long long res = 0;

        for (int dig = 0; dig <= up; dig++) {
            if (!lead0 && dig == bad) continue; // 跳过坏数字（前导零不算）
            res += dfs(
                pos + 1,
                limit && (dig == up),  // 新的 limit
                lead0 && (dig == 0)    // 新的 lead0
            );
        }

        if (!limit && !lead0) memo[pos] = res;
        return res;
    };

    return dfs(0, true, true);
}

// 主函数：计算 [L, R] 中不含数字 bad 的数的个数
int main() {
    long long L, R;
    int bad;
    scanf("%lld %lld %d", &L, &R, &bad);
    printf("%lld\n", count(R, bad) - count(L - 1, bad));
    return 0;
}
```

**模板要点速查：**

| 部分 | 说明 |
|------|------|
| `digits` 数组 | 将上限 $N$ 拆为每一位，高位在前 |
| `limit` 标志 | `true` 时当前位上限为 $d_{pos}$；`false` 时上限为 9 |
| `lead0` 标志 | `true` 表示前面全填了 0（即还没开始填有效数字） |
| `memo[pos]` | 只缓存 `limit==false && lead0==false` 的状态 |
| 前缀和转化 | `count(R) - count(L-1)` 得到区间答案 |

---

## 例题详解

### 例题 1：LeetCode 3753 统计波动数的个数（困难）

<!--DEMO:waviness-->

**题意：** 统计区间 $[L, R]$ 中「波动数」的个数。波动数的定义：一个正整数，从左到右看，它的数字呈交替上升和下降的趋势。形式化地说，对于数的十进制表示 $d_1 d_2 \dots d_k$（$k \ge 2$），存在某个 $i$，使得 $d_1 < d_2 < \dots < d_i > d_{i+1} > \dots > d_k$（先上升再下降），或者 $d_1 > d_2 > \dots > d_i < d_{i+1} < \dots < d_k$（先下降再上升）。

**思路：** 这是数位 DP 的典型进阶问题。除了 `pos`、`limit`、`lead0` 三个基础状态外，还需要记录额外信息来判断最终是否构成波动数。关键观察是：我们需要记录**相邻位的大小关系**（上升/下降/未定）以及当前的「趋势方向」。

状态设计：

- `pos`：当前填到第几位
- `limit`：是否贴着上界
- `lead0`：前导零标志
- `inc`：当前趋势（-1=未定, 0=下降中, 1=上升中）
- `last`：上一位填的数字

在 DFS 填完所有位后，检查趋势是否发生过变化（即同时出现过上升和下降），若是则为波动数。

<!--DEMO:fullproblem-->

```cpp
#include <bits/stdc++.h>
using namespace std;

// 统计 [0, N] 中波动数的个数
long long count(long long N) {
    if (N < 0) return 0;
    vector<int> digits;
    long long tmp = N;
    if (tmp == 0) digits.push_back(0);
    while (tmp > 0) { digits.push_back(tmp % 10); tmp /= 10; }
    reverse(digits.begin(), digits.end());
    int k = digits.size();

    // 状态：(pos, last, inc, seen_up, seen_down, limit, lead0)
    // 当 limit==false && lead0==false 时可记忆化
    // last: 上一位数字 (0~9)
    // inc: 当前趋势 (-1=未定, 0=下降, 1=上升)
    // seen_up / seen_down: 是否已经出现过上升/下降
    // 将后5维压缩进 memo 数组
    map<tuple<int,int,int,bool,bool>, long long> memo;

    function<long long(int,int,int,bool,bool,bool,bool)> dfs =
        [&](int pos, int last, int inc, bool seen_up, bool seen_down,
            bool limit, bool lead0) -> long long {
        if (pos == k) {
            // 填完所有位，检查是否满足波动数定义
            // 需要至少 2 位，且同时出现过上升和下降
            return (seen_up && seen_down) ? 1 : 0;
        }

        if (!limit && !lead0) {
            auto key = make_tuple(pos, last, inc, seen_up, seen_down);
            if (memo.count(key)) return memo[key];
        }

        int up = limit ? digits[pos] : 9;
        long long res = 0;

        for (int dig = 0; dig <= up; dig++) {
            if (lead0 && dig == 0) {
                // 还在前导零阶段，趋势未定
                res += dfs(pos + 1, last, -1, false, false,
                           limit && (dig == up), true);
            } else if (lead0) {
                // 刚开始填第一个有效数字
                res += dfs(pos + 1, dig, -1, false, false,
                           limit && (dig == up), false);
            } else {
                // 已有至少一位，更新趋势
                int new_inc = inc;
                bool new_up = seen_up, new_down = seen_down;
                if (dig > last) {
                    new_inc = 1; new_up = true;
                } else if (dig < last) {
                    new_inc = 0; new_down = true;
                }
                // dig == last 时保持原趋势，不影响
                res += dfs(pos + 1, dig, new_inc, new_up, new_down,
                           limit && (dig == up), false);
            }
        }

        if (!limit && !lead0) {
            memo[make_tuple(pos, last, inc, seen_up, seen_down)] = res;
        }
        return res;
    };

    return dfs(0, 0, -1, false, false, true, true);
}

int main() {
    long long L, R;
    scanf("%lld %lld", &L, &R);
    printf("%lld\n", count(R) - count(L - 1));
    return 0;
}
```

---

## 练习题单

| # | 平台 | 题号/名称 | 难度 | 关键词 |
|---|------|----------|------|--------|
| 1 | 洛谷 | P2602 [ZJOI2010] 数字计数 | 入门 | 统计每个数字出现次数 |
| 2 | 洛谷 | P2657 [SCOI2009] windy 数 | 入门 | 不含前导零、相邻差 $\ge 2$ |
| 3 | LeetCode | 233 数字 1 的个数 | 入门 | 逐位统计 |
| 4 | LeetCode | 902 最大为 N 的数字组合 | 进阶 | 给定数字集合 + 记忆化 |
| 5 | 洛谷 | P4127 [AHOI2009] 同类分布 | 进阶 | 各位数字之和整除该数本身 |
| 6 | LeetCode | 3753 统计波动数 | 进阶 | 趋势状态 + 前缀和转化 |
| 7 | Codeforces | 55D Beautiful numbers | 综合 | 各位数字 LCM 整除该数 |
| 8 | 洛谷 | P3286 [SCOI2014] 方伯伯的商场 | 综合 | 枚举进位点 + 多维状态 |

---

## 常见错误

**1. 忘记 `lead0` 标志导致前导零被当成有效数字**

例如「不含数字 0 的数的个数」，如果不在 `lead0` 为 `true` 时跳过对数字 0 的判断，会把前导零误认为真正的数字 0，导致少计。规则：`lead0 == true` 时的 0 不是有效数字，不应参与任何约束判断。

**2. `memo` 数组维度不够——把 `limit==true` 的状态也缓存了**

当 `limit==true` 时，当前状态依赖上界 $N$，不同的 $N$ 会产生不同结果。只能对 `limit==false`（已脱离上界）的状态记忆化，否则下次查询不同的 $N$ 时会返回错误结果。

**3. 前缀和转化时忘记处理 $L=0$ 的边界**

$\text{count}(L-1)$ 当 $L=0$ 时变成 $\text{count}(-1)$，必须在 `count` 函数开头检查 $N < 0$ 并返回 0，否则数组拆分出错。

**4. 状态设计不完整导致多计或漏计**

常见的遗漏：忘记传递上一位的值（需要「相邻位关系」的问题）、忘记区分前导零和有效 0（需要统计「实际位数」的问题）。设计状态时列出「哪些信息会影响后续决策」，逐一确认是否已包含在状态中。

**5. 长度不够——`int` 溢出**

区间 $[1, R]$ 中最多有 $R$ 个数，当 $R \le 10^{18}$ 时结果可能超过 `int` 范围。方案数相关的变量一律用 `long long`。

---

## 延伸阅读

- OI Wiki - 数位 DP：https://oi-wiki.org/dp/digit/
- OI Wiki - 记忆化搜索：https://oi-wiki.org/search/memorization/
- LeetCode 数位 DP 专题：https://leetcode.cn/tag/digit-dp/
- 《算法竞赛进阶指南》第 5 章 · 数位 DP
- 洛谷 数位 DP 题单：https://www.luogu.com.cn/training/list?keyword=%E6%95%B0%E4%BD%8DDP
