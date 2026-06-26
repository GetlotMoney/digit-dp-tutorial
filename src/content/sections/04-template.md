# 3. 基本模板（DFS 记忆化写法）

下面是一个统计「`[0, N]` 中满足某条件的数个数」的通用模板。理解后，大多数入门题只需改 `dfs` 里的条件判断和额外状态即可。

```cpp
// 洛谷 P2602 / HDU 2089 类模板：统计 [0,N] 满足条件的数个数
// 这里以「不含有数字 4」为例
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

int a[20];          // 存 N 的每一位，a[0]=个位...a[len-1]=最高位（低位在前）
ll dp[20][2][2];    // [pos][limit][lead0]
bool vis[20][2][2];

ll dfs(int pos, bool limit, bool lead0) {
    if (pos == -1) return 1;          // 填完了，算一个合法数
    if (!limit && !lead0 && vis[pos][limit][lead0])
        return dp[pos][limit][lead0]; // 只有非限制、非前导零的状态才记忆化

    int up = limit ? a[pos] : 9;      // 当前位能填的最大值
    ll res = 0;
    for (int d = 0; d <= up; d++) {
        if (d == 4) continue;         // 题目条件：不含 4
        res += dfs(pos - 1, limit && (d == up), lead0 && (d == 0));
    }
    if (!limit && !lead0) {
        vis[pos][limit][lead0] = true;
        dp[pos][limit][lead0] = res;
    }
    return res;
}

ll solve(ll N) {
    int len = 0;
    for (; N; N /= 10) a[len++] = N % 10;
    memset(vis, 0, sizeof vis);
    return dfs(len - 1, true, true);
}

int main() {
    ll L, R; cin >> L >> R;
    cout << solve(R) - solve(L - 1) << endl;
    return 0;
}
```

> **TIP 关键理解：** `limit && (d == up)` 表示「之前一直贴着上界，且当前位也填到上界，那么下一位仍受限制」；`lead0 && (d == 0)` 表示「之前都是前导零，当前位还是 0，那么仍是前导零」。这两个递归参数是数位 DP 的精髓。

## 3.1 记忆化的递归树 · 交互演示

下面用一棵递归树展示「为什么只记忆化 `limit=0 && lead0=0` 的状态」。观察：受限分支（红色）和前导零分支（黄色）只会各走一条，所以不缓存；而自由分支（绿色）会被大量重复访问，缓存能省下大量重复计算。

<!--DEMO:memtree-->

> **TODO** [待补充] 你对模板的理解笔记、debug 过程
