# 双指针与滑动窗口

双指针是竞赛与面试中最常用的技巧之一。核心思想很简单：用**两个指针**在序列上移动，通过维护某种单调性或窗口性质，把原本 $O(n^2)$ 的暴力枚举优化到 $O(n)$。滑动窗口是双指针的一个重要子类，专门处理「连续子数组 / 子串」问题。

本章覆盖三种经典模型：**对撞指针**（左右端点向中间逼近）、**快慢指针**（两个同向指针）、**滑动窗口**（定长 / 变长），并介绍单调队列优化变长窗口最值的方法。

<!--DEMO:two-pointers-overview-->

---

## 核心思想

### 对撞指针（左右指针）

适用于**有序数组**或**满足某种单调性的场景**。两个指针分别从数组两端出发，根据当前状态决定谁移动：

- 若 $a[l] + a[r] < \text{target}$，说明和太小，左指针右移以增大；
- 若 $a[l] + a[r] > \text{target}$，说明和太大，右指针左移以减小。

每次只移动一个指针，保证不遗漏有效解。总操作次数不超过 $2n$，时间 $O(n)$。

**前提条件：** 数组有序，或存在某种「增大左端点使值变大、减小右端点使值变小」的单调关系。

<!--DEMO:collision-pointer-->

### 快慢指针（同向双指针）

两个指针从同一侧出发，速度不同。典型应用：

- **判环**（Floyd 判圈）：快指针每次走两步，慢指针每次走一步，若链表有环则必相遇。
- **找中间节点**：快指针到达末尾时，慢指针恰好在中间。
- **分区 / 删除元素**：慢指针维护「已处理区域」的右边界，快指针扫描新元素。

### 滑动窗口

滑动窗口是双指针在**连续子数组**问题上的特殊形态。维护一个区间 $[l, r)$，右端点 $r$ 不断右移以扩展窗口，当窗口不再满足条件时收缩左端点 $l$。

**关键思想：** $l$ 和 $r$ 都只向右移动，每个元素最多进出窗口各一次，所以总复杂度 $O(n)$。

#### 定长窗口

窗口大小固定为 $k$ 时，每次 $r$ 右移一步，同时 $l$ 右移一步，保持窗口长度不变。通常用**滑动一次加一个、减一个**的增量法维护窗口内的聚合值（和、最大值等）。

#### 变长窗口

窗口大小不固定，维护的条件是「窗口内状态满足某个性质」。$r$ 向右扩展，当性质被破坏时移动 $l$ 收缩，直到性质恢复。每次 $l$ 的移动方向不回退，因此总复杂度仍为 $O(n)$。

#### 单调队列优化变长窗口

当需要在滑动窗口中求**最大值 / 最小值**时，暴力扫描窗口内所有元素是 $O(k)$ 的，单调队列可以将单次查询优化到 $O(1)$。

核心做法：用双端队列（deque）维护下标，队列中对应的值保持**单调递减**（求最大值时）。每次右端点扩展时，将队尾所有小于新元素的值弹出；每次左端点收缩时，检查队首是否已过期（下标小于 $l$），若是则弹出。队首始终是当前窗口的最大值。

整体复杂度：每个元素入队、出队各最多一次，总计 $O(n)$。

<!--DEMO:sliding-window-->

---

## 模板代码

### 对撞指针模板

```cpp
// 对撞指针：在有序数组 a 中找满足条件的二元组
int twoSum(int a[], int n, int target) {
    int l = 0, r = n - 1;
    int cnt = 0;
    while (l < r) {
        int sum = a[l] + a[r];
        if (sum == target) {
            cnt++;
            l++;  // 找到一组，两端同时收缩
            r--;
        } else if (sum < target) {
            l++;  // 和太小，左指针右移
        } else {
            r--;  // 和太大，右指针左移
        }
    }
    return cnt;
}
```

### 变长滑动窗口模板

```cpp
// 变长滑动窗口：找满足条件的最短/最长子数组
int slidingWindow(int a[], int n) {
    int l = 0;
    int ans = INT_MAX;  // 或 0，视题意而定
    int windowState = 0; // 窗口内的状态（和、计数等）

    for (int r = 0; r < n; r++) {
        // 1. 右端点扩展：把 a[r] 加入窗口
        windowState += a[r]; // 按题意修改

        // 2. 左端点收缩：当窗口不满足条件时收缩
        while (/* 窗口不满足条件 */) {
            windowState -= a[l]; // 把 a[l] 移出窗口
            l++;
        }

        // 3. 更新答案
        ans = min(ans, r - l + 1);
    }
    return ans;
}
```

### 定长滑动窗口模板

```cpp
// 定长滑动窗口：窗口大小固定为 k
int fixedWindow(int a[], int n, int k) {
    int windowSum = 0;

    // 初始化第一个窗口
    for (int i = 0; i < k; i++) {
        windowSum += a[i];
    }
    int ans = windowSum;

    // 滑动：每次加一个、减一个
    for (int r = k; r < n; r++) {
        windowSum += a[r];       // 右边进来
        windowSum -= a[r - k];   // 左边出去
        ans = max(ans, windowSum);
    }
    return ans;
}
```

### 单调队列模板（滑动窗口最值）

```cpp
// 单调队列：求每个长度为 k 的窗口的最大值
vector<int> maxSlidingWindow(vector<int>& a, int k) {
    deque<int> dq;  // 存下标，对应值单调递减
    vector<int> res;

    for (int i = 0; i < (int)a.size(); i++) {
        // 移除队尾所有比新元素小的（维护单调递减）
        while (!dq.empty() && a[dq.back()] <= a[i])
            dq.pop_back();
        dq.push_back(i);

        // 移除已滑出窗口的队首元素
        if (dq.front() <= i - k)
            dq.pop_front();

        // 窗口形成后，队首即为最大值
        if (i >= k - 1)
            res.push_back(a[dq.front()]);
    }
    return res;
}
```

---

## 例题详解

### 例题 1：盛最多水的容器（LeetCode 11）

**题目描述：** 给定 $n$ 条垂线段，第 $i$ 条的端点为 $(i, 0)$ 和 $(i, h[i])$。找两条线，使它们与 $x$ 轴围成的容器能盛最多的水。

**分析：** 容器的容量 = $\min(h[l], h[r]) \times (r - l)$。若用暴力枚举所有 $(l, r)$，复杂度 $O(n^2)$。

使用对撞指针：从两端出发，每次移动**较短**的那一边。为什么？因为移动较长的那边，宽度减小、高度不会增加（瓶颈在短板），容量一定不会变大；而移动较短的那边，虽然宽度减小，但高度有机会增加。

```cpp
class Solution {
public:
    int maxArea(vector<int>& height) {
        int l = 0, r = (int)height.size() - 1;
        int ans = 0;
        while (l < r) {
            // 当前容量 = 较短边 × 宽度
            int area = min(height[l], height[r]) * (r - l);
            ans = max(ans, area);
            // 移动较短的一侧
            if (height[l] < height[r])
                l++;
            else
                r--;
        }
        return ans;
    }
};
```

**复杂度：** 时间 $O(n)$，空间 $O(1)$。

### 例题 2：无重复字符的最长子串（LeetCode 3）

**题目描述：** 给定字符串 $s$，找出其中**不含重复字符**的最长子串的长度。

**分析：** 典型的变长滑动窗口。用一个哈希表记录窗口内每个字符的出现次数。右端点不断右移，当 $s[r]$ 的计数超过 1 时，收缩左端点直到重复消除。

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> cnt; // 窗口内字符计数
        int l = 0, ans = 0;

        for (int r = 0; r < (int)s.size(); r++) {
            cnt[s[r]]++;  // 右端点加入

            // 出现重复，收缩左端点
            while (cnt[s[r]] > 1) {
                cnt[s[l]]--;
                l++;
            }

            ans = max(ans, r - l + 1);
        }
        return ans;
    }
};
```

**复杂度：** 时间 $O(n)$（每个字符最多进出窗口各一次），空间 $O(|\Sigma|)$（字符集大小）。

<!--DEMO:longest-substring-->

---

## 练习题单

| # | 平台 | 题号/题名 | 难度 | 考点 |
|---|------|-----------|------|------|
| 1 | 洛谷 | [P1102 A-B 数对](https://www.luogu.com.cn/problem/P1102) | 入门 | 排序 + 对撞指针 / 二分 |
| 2 | LeetCode | [11. 盛最多水的容器](https://leetcode.cn/problems/container-with-most-water/) | 入门 | 对撞指针 |
| 3 | LeetCode | [3. 无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/) | 入门 | 变长滑动窗口 |
| 4 | LeetCode | [76. 最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/) | 进阶 | 变长滑动窗口 + 计数匹配 |
| 5 | LeetCode | [239. 滑动窗口最大值](https://leetcode.cn/problems/sliding-window-maximum/) | 进阶 | 单调队列 |
| 6 | 洛谷 | [P1638 逛画展](https://www.luogu.com.cn/problem/P1638) | 进阶 | 变长滑动窗口（覆盖所有种类） |
| 7 | Codeforces | [279B Books](https://codeforces.com/problemset/problem/279/B) | 进阶 | 变长窗口（最大区间长度） |
| 8 | 洛谷 | [P2698 [USACO12MAR] Flowerpot S](https://www.luogu.com.cn/problem/P2698) | 综合 | 单调队列 + 二分答案 |

> 建议先做 1-3 打基础，再做 4-6 练变长窗口，最后 7-8 综合提升。

---

## 常见错误

### 1. 忘记收缩左端点 / while 写成 if

变长窗口中，左端点可能需要**连续多次**收缩才能恢复条件。用 `if` 只收缩一次会导致窗口内仍有不合法状态。

```cpp
// 错误：只收缩一次
if (/* 不满足条件 */) { l++; }

// 正确：循环收缩
while (/* 不满足条件 */) { ... l++; }
```

### 2. 窗口边界开闭不一致

$[l, r]$ 闭区间 vs $[l, r)$ 左闭右开，混用会导致漏掉元素或多算元素。建议在整道题中统一使用一种，模板代码中推荐 $[l, r]$ 闭区间。

### 3. 定长窗口初始化遗漏

定长窗口需要**先构建初始窗口**，再开始滑动。常见错误是直接从 $r=0$ 开始滑动，导致第一个窗口大小不足 $k$。

### 4. 对撞指针在无序数组上使用

对撞指针要求**单调性前提**（如数组有序）。如果数组无序，直接使用对撞指针会遗漏解。正确做法是先排序（注意排序是否改变下标含义），或换用哈希表。

### 5. 单调队列存值不存下标

单调队列中必须存**下标**而非值，否则无法判断队首是否已滑出窗口（下标 $\leq i - k$ 时需要弹出）。只存值会丢失位置信息。

---

## 延伸阅读

- [OI Wiki - 双指针](https://oi-wiki.org/misc/two-pointer/)：系统总结对撞指针、快慢指针、三分法等变体。
- [OI Wiki - 单调队列](https://oi-wiki.org/ds/monotonous-queue/)：单调队列的原理与更多应用场景。
- [LeetCode 双指针标签](https://leetcode.cn/tag/two-pointers/)：按难度筛选的双指针题集。
- [LeetCode 滑动窗口标签](https://leetcode.cn/tag/sliding-window/)：滑动窗口专题练习。
