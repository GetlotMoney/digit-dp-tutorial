# 栈与队列

栈（Stack）和队列（Queue）是最基本的线性数据结构。它们的共同点是限制了数据的访问方式——栈遵循"后进先出"（LIFO），队列遵循"先进先出"（FIFO）。这种看似简单的约束，却是大量算法的核心骨架：括号匹配、表达式求值、BFS 搜索、滑动窗口最值、单调栈优化……几乎每一道竞赛题背后都有栈或队列的身影。

**什么时候该想到栈/队列？**

- 需要"最近的未匹配元素"或"配对消除" → 栈
- 需要按顺序处理、"先来后到" → 队列
- 需要动态维护最值 / 单调性 → 单调栈或单调队列
- 需要按优先级取元素 → 优先队列（堆）

<!--DEMO:stack-queue-visual-->

---

## 核心思想

### 1. 栈（Stack）

栈只允许在一端（栈顶）进行插入（push）和删除（pop）。最后入栈的元素最先出栈。

**括号匹配**是栈的经典应用：遇到左括号入栈，遇到右括号弹出栈顶检查是否匹配。栈为空或不匹配则非法。

**表达式求值**中，栈有两个典型用途：

- **中缀转后缀（逆波兰）**：用一个运算符栈，维护优先级关系。遇到高优先级运算符时先弹出栈顶。
- **后缀表达式求值**：用一个操作数栈，遇数字入栈，遇运算符弹出两个操作数计算后压回。

一个关键性质：栈中元素的相对顺序反映了**嵌套结构**。凡是涉及嵌套、配对、递归回溯的问题，栈都是天然的数据结构。

### 2. 队列（Queue）

队列只允许在一端插入（队尾），另一端删除（队头）。先入队的元素先出队。

队列最常见的应用场景是 **BFS（广度优先搜索）**：按层遍历图或树时，用队列保证"先发现的节点先被扩展"。

**优先队列（Priority Queue）** 是队列的推广——每次取出优先级最高（或最低）的元素，底层通常用堆实现。C++ 中 `std::priority_queue` 默认是大根堆，时间复杂度：插入 $O(\log n)$，取最值 $O(1)$，删除最值 $O(\log n)$。

### 3. 单调栈与单调队列

**单调栈**：栈内元素保持单调递增（或递减）。常用于"找每个元素左边/右边第一个比它大/小的元素"，时间复杂度 $O(n)$。

**单调队列**：队列内元素保持单调。经典应用是**滑动窗口最值**——在一个长度为 $k$ 的滑动窗口中动态维护最大值或最小值，$O(n)$ 时间。

<!--DEMO:monotonic-stack-demo-->

### 4. 循环队列

用数组实现队列时，如果直接维护头尾指针，出队后前面的空间无法复用。循环队列通过取模运算让指针"绕回"数组头部，空间利用率 $O(n)$ 且无额外动态分配开销。

设数组大小为 $N$，头指针 `head`，尾指针 `tail`：

- 入队：`a[tail] = x; tail = (tail + 1) % N;`
- 出队：`head = (head + 1) % N;`
- 判空：`head == tail`
- 判满：`(tail + 1) % N == head`（牺牲一个位置区分空和满）

---

## 模板代码

### 栈的基本操作

```cpp
#include <stack>
using namespace std;

stack<int> stk;

// 入栈
stk.push(42);

// 访问栈顶（不弹出）
int top = stk.top();

// 弹出栈顶
stk.pop();

// 判空
if (stk.empty()) { /* 栈为空 */ }
```

### 队列的基本操作

```cpp
#include <queue>
using namespace std;

queue<int> q;

// 入队
q.push(42);

// 访问队头
int front = q.front();

// 出队
q.pop();

// 判空
if (q.empty()) { /* 队列为空 */ }
```

### 优先队列

```cpp
#include <queue>
using namespace std;

// 大根堆（默认）：最大的在顶部
priority_queue<int> maxHeap;

// 小根堆：最小的在顶部
priority_queue<int, vector<int>, greater<int>> minHeap;

maxHeap.push(3);
maxHeap.push(1);
maxHeap.push(4);
// top() == 4

minHeap.push(3);
minHeap.push(1);
minHeap.push(4);
// top() == 1
```

### 循环队列模板

```cpp
// 固定大小的循环队列
template<typename T, int N>
class CircularQueue {
    T data[N];
    int head = 0, tail = 0; // head == tail 表示空
public:
    bool empty() const { return head == tail; }
    bool full() const { return (tail + 1) % N == head; }

    void push(const T& x) {
        if (full()) return; // 队满，丢弃或扩容
        data[tail] = x;
        tail = (tail + 1) % N;
    }

    T front() const { return data[head]; }

    void pop() {
        if (empty()) return;
        head = (head + 1) % N;
    }
};
```

### 单调栈模板（找每个元素右边第一个更大的值）

```cpp
// 输入：数组 a[0..n-1]
// 输出：ans[i] = a[i] 右边第一个 > a[i] 的值的下标，不存在为 -1
vector<int> nextGreater(const vector<int>& a) {
    int n = a.size();
    vector<int> ans(n, -1);
    stack<int> stk; // 存下标，栈内元素对应值单调递减

    for (int i = 0; i < n; i++) {
        // 当前元素比栈顶大，说明找到了栈顶的"下一个更大元素"
        while (!stk.empty() && a[i] > a[stk.top()]) {
            ans[stk.top()] = i;
            stk.pop();
        }
        stk.push(i);
    }
    return ans;
}
```

### 单调队列模板（滑动窗口最大值）

```cpp
// 输入：数组 a，窗口大小 k
// 输出：每个窗口位置的最大值
vector<int> slidingWindowMax(const vector<int>& a, int k) {
    int n = a.size();
    vector<int> res;
    deque<int> dq; // 存下标，队内元素对应值单调递减

    for (int i = 0; i < n; i++) {
        // 移除超出窗口的队头
        while (!dq.empty() && dq.front() <= i - k)
            dq.pop_front();
        // 维护单调递减：移除所有比当前值小的队尾
        while (!dq.empty() && a[dq.back()] <= a[i])
            dq.pop_back();
        dq.push_back(i);
        // 窗口形成后记录答案
        if (i >= k - 1)
            res.push_back(a[dq.front()]);
    }
    return res;
}
```

---

## 例题详解

### 例题 1：洛谷 P1739 - 括号匹配

**题意**：给定一个只含 `(`、`)` 和其他字符的字符串，判断括号序列是否合法。合法条件：每个 `)` 都有对应的 `(`，且嵌套正确。

**分析**：栈的经典应用。遍历字符串，遇到 `(` 入栈，遇到 `)` 弹出栈顶。若栈为空时遇到 `)`，则非法。遍历结束后栈非空，也非法。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    getline(cin, s);

    stack<char> stk;
    bool ok = true;

    for (char c : s) {
        if (c == '(') {
            stk.push(c);
        } else if (c == ')') {
            if (stk.empty()) {
                ok = false; // 没有匹配的左括号
                break;
            }
            stk.pop(); // 匹配成功
        }
        // 其他字符忽略
    }

    if (!stk.empty()) ok = false; // 还有未匹配的左括号

    cout << (ok ? "YES" : "NO") << endl;
    return 0;
}
```

**复杂度**：$O(n)$，每个字符最多入栈出栈各一次。

### 例题 2：LeetCode 239 - 滑动窗口最大值

**题意**：给定数组 `nums` 和窗口大小 `k`，返回每个滑动窗口中的最大值。

**分析**：暴力枚举每个窗口是 $O(nk)$，用单调队列可以做到 $O(n)$。维护一个单调递减的双端队列（deque），队头始终是当前窗口的最大值。

关键操作（对每个新元素 `nums[i]`）：

1. 队头下标超出窗口 → 弹出队头
2. 队尾元素 $\leq$ 当前值 → 弹出队尾（它不可能成为后续窗口的最大值了）
3. 当前值入队
4. 窗口形成后（$i \geq k - 1$），队头就是窗口最大值

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    deque<int> dq; // 存下标，维护单调递减
    vector<int> ans;

    for (int i = 0; i < n; i++) {
        // 移除超出窗口范围的下标
        while (!dq.empty() && dq.front() <= i - k)
            dq.pop_front();
        // 维护单调递减性
        while (!dq.empty() && nums[dq.back()] <= nums[i])
            dq.pop_back();

        dq.push_back(i);

        // 窗口形成后记录答案
        if (i >= k - 1)
            ans.push_back(nums[dq.front()]);
    }

    for (int i = 0; i < (int)ans.size(); i++) {
        if (i) cout << ' ';
        cout << ans[i];
    }
    cout << endl;
    return 0;
}
```

**复杂度**：$O(n)$。每个元素最多入队出队各一次，均摊 $O(1)$。

---

## 练习题单

| # | 平台 | 题号/名称 | 难度 | 关键点 |
|---|------|-----------|------|--------|
| 1 | 洛谷 | P1739 括号匹配 | 入门 | 栈的基本操作 |
| 2 | LeetCode | 20. Valid Parentheses | 入门 | 括号匹配，多类型括号 |
| 3 | LeetCode | 155. Min Stack | 入门 | 辅助栈维护最值 |
| 4 | 洛谷 | P1449 后缀表达式 | 进阶 | 栈模拟表达式求值 |
| 5 | LeetCode | 239. Sliding Window Maximum | 进阶 | 单调队列 |
| 6 | 洛谷 | P5788 单调栈（模板） | 进阶 | 单调栈找下一个更大值 |
| 7 | LeetCode | 84. Largest Rectangle in Histogram | 综合 | 单调栈求最大矩形 |
| 8 | 洛谷 | P1886 滑动窗口 / 单调队列（模板） | 综合 | 单调队列求窗口最值 |

---

## 常见错误

### 1. 访问空栈的栈顶

```cpp
// 危险！栈为空时调用 top() 或 pop() 是未定义行为
stack<int> stk;
stk.top();   // 未定义行为，可能崩溃
stk.pop();   // 未定义行为

// 正确做法：先检查是否为空
if (!stk.empty()) {
    int val = stk.top();
    stk.pop();
}
```

`std::stack` 和 `std::queue` 的 `top()`、`front()` 在容器为空时不会抛异常，而是直接访问非法内存。竞赛中这通常导致 RE（运行时错误）。

### 2. 单调栈/队列忘记清空残余元素

```cpp
// 单调栈处理完所有元素后，栈中可能还有残留
// 如果需要的是"右边第一个更大值"，残留元素的 ans 应为 -1（初始化时已处理）
// 但如果需要的是"右边第一个更小值"或环形数组，别忘了特殊处理
```

初学者容易只关注遍历循环，忽略了栈/队列中残留的元素是否需要额外处理。

### 3. 优先队列的比较方向搞反

```cpp
// 想要小根堆，却写了大根堆
priority_queue<int> pq; // 默认是大根堆！
pq.push(1);
pq.push(3);
// pq.top() == 3，不是 1

// 正确：小根堆
priority_queue<int, vector<int>, greater<int>> minHeap;
```

竞赛中"最小值优先"的场景非常多，记得用 `greater<int>` 自定义比较器。

### 4. 循环队列的判满条件写错

```cpp
// 错误：用 head == tail 同时判断空和满
// 导致满队列被误判为空队列

// 正确：牺牲一个空间，(tail + 1) % N == head 表示满
bool full() { return (tail + 1) % N == head; }
bool empty() { return head == tail; }
```

如果不牺牲空间，就需要额外维护一个 `size` 变量来区分空和满。

### 5. 用 vector 模拟栈导致性能问题

```cpp
// 如果只需要栈操作，std::stack 比 vector 更合适
// vector 在 push_back 时可能触发重新分配和拷贝
vector<int> v;
v.push_back(1);
v.pop_back(); // 可以，但每次 pop 不会缩小内存

// std::stack 底层默认用 deque，不会有 vector 的重分配问题
stack<int> stk;
```

虽然 vector 也能当栈用，但 `std::stack` 语义更清晰，且底层 deque 对频繁的头部操作更友好。

---

## 延伸阅读

- [OI Wiki - 栈](https://oi-wiki.org/ds/stack/)：栈的定义、性质与应用
- [OI Wiki - 队列](https://oi-wiki.org/ds/queue/)：普通队列、循环队列、双端队列
- [OI Wiki - 单调栈](https://oi-wiki.org/ds/monotonous-stack/)：单调栈的原理与经典题
- [OI Wiki - 单调队列](https://oi-wiki.org/ds/monotonous-queue/)：滑动窗口与单调队列
- [OI Wiki - 优先队列](https://oi-wiki.org/ds/priority-queue/)：堆与优先队列
- [LeetCode Stack 题单](https://leetcode.cn/tag/stack/)：按难度递进的栈练习题
