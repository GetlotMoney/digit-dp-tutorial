# 6. 完整例题演示 · LeetCode 3753 范围内总波动值 II

**题目：** 给你两个整数 `num1` 和 `num2`，表示闭区间 `[num1, num2]`。一个数字的**波动值**定义为该数字中**峰**和**谷**的总数：若一个数位严格大于其两个相邻数位则为峰，严格小于则为谷；首尾两位不能是峰谷；少于 3 位的数字波动值为 0。返回区间内所有数字的波动值之和。约束 $1 \le num1 \le num2 \le 10^{15}$。

> **TIP 为什么是数位 DP：** 区间求和 + 上界到 $10^{15}$，枚举不可能。用 `f(num2) - f(num1-1)`，数位 DP 逐位填，额外状态维护「前两位数字」，即可统计。

## 6.1 波动值是什么 · 交互演示

先直观感受峰和谷。输入一个 3-6 位的数字，系统会标出哪些位是峰（红）、哪些是谷（蓝），并给出波动值。

<!--DEMO:waviness-->

## 6.2 解题思路

状态设计：`dfs(pos, limit, lead0, pre2, pre1)` 返回 `{个数, 波动值之和}`。

- `pre2, pre1`：已填的最后两位真实数字，用 `-1` 表示「尚无」。**前导零期间保持 -1，不把前导 0 塞进历史**，否则会把前导 0 误当成真数字位参与峰谷判定。
- 当填下当前位 `d` 且 `pre2 != -1` 时，说明 `pre1` 此刻有了左邻居 `pre2` 和右邻居 `d`，可以判定它是否为峰/谷：若 `pre2 < pre1 > d` 则 pre1 是峰（+1），若 `pre2 > pre1 < d` 则 pre1 是谷（+1）。
- **关键：统计「权值之和」时，这一步的贡献 add 必须乘以「剩余位能填出的数的个数」** —— 因为同一个 add 对应子树里所有数，不能只加一次。所以 dfs 要同时返回个数 cnt，转移时 `wsum += w + add * cnt`。
- 首尾两位天然不会被判为峰谷：首位由 `pre2 = -1` 跳过判定；末位填下时它成为 pre1，但之后没有下一位再填，不会再被判定。

> **WARN 踩坑提醒：** ① 前导零的 0 不能进 pre 历史；② 求和类数位 DP 的 add 要乘子树计数，这是和「计数类」数位 DP 最大的区别，漏乘会得到错误答案（本代码的早期版本就因此翻车）。

## 6.3 参考代码

```cpp
// LeetCode 3753 范围内总波动值 II
// f(n): [1, n] 内所有数字的波动值之和（返回 pair: {个数, 波动值之和}）
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef pair<ll,ll> pll;
ll a[20];
pll dp[20][2][2][11][11];     // {个数, 波动值之和}，pre2/pre1 映射 -1..9 -> 0..10
bool vis[20][2][2][11][11];

pll dfs(int pos, bool limit, bool lead0, int pre2, int pre1) {
    if (pos == -1) return {1, 0};            // 空数：1 个，波动 0
    int p2 = pre2 + 1, p1 = pre1 + 1;
    if (!limit && !lead0 && vis[pos][limit][lead0][p2][p1])
        return dp[pos][limit][lead0][p2][p1];
    int up = limit ? a[pos] : 9;
    ll cnt = 0, wsum = 0;
    for (int d = 0; d <= up; d++) {
        bool nlead = lead0 && (d == 0);
        int np2, np1; ll add = 0;
        if (nlead) {                         // 仍是前导零，pre 保持无效
            np2 = pre2; np1 = pre1;
        } else if (lead0 && !nlead) {        // 刚填第一个非零位，无左邻居
            np2 = -1; np1 = d;
        } else {                             // 正常：滑动窗口
            np2 = pre1; np1 = d;
            if (pre2 != -1) {                // pre1 有左右邻居，判定峰谷
                if (pre2 < pre1 && pre1 > d) add = 1;       // pre1 是峰
                else if (pre2 > pre1 && pre1 < d) add = 1;  // pre1 是谷
            }
        }
        auto [c, w] = dfs(pos - 1, limit && d == up, nlead, np2, np1);
        cnt += c;
        wsum += w + add * c;                 // 关键：add 乘以子树计数
    }
    if (!limit && !lead0) {
        vis[pos][limit][lead0][p2][p1] = true;
        dp[pos][limit][lead0][p2][p1] = {cnt, wsum};
    }
    return {cnt, wsum};
}

ll solve(ll n) {
    if (n <= 0) return 0;
    int len = 0; ll t = n;
    for (; t; t /= 10) a[len++] = t % 10;    // a[0]=个位,...,a[len-1]=最高位
    memset(vis, 0, sizeof vis);
    return dfs(len - 1, true, true, -1, -1).second;
}
// 主函数返回 solve(num2) - solve(num1 - 1);
```

## 6.4 完整流程 · 交互演示

下面把整道题跑成一个交互流程：输入 L、R，演示 `f(R) - f(L-1)` 的前缀和转化，以及单步填数时如何累积波动值贡献。可单步执行观察。

<!--DEMO:fullproblem-->

> **TODO** [待补充] 你做这道题时的笔记、debug 经验、踩坑点
