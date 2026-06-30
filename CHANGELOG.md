# CHANGELOG — 咕嘎学不会算法

开发变更日志。记录每次改动的内容、原因和方案。

---

## 2026-06-30 · v1 架构重构 + 多专题上线

### 从单专题到多专题平台

**背景**：项目原来是「数位 DP 单专题教程站」（单文件 HTML 原型 → Vite+React 工程），用户决定扩展为覆盖 25 个算法专题的完整教程平台。

**改动**：
- 重构路由：`/tutorial` → `/topics/:topicId`（每个专题独立页面）
- 新建 25 个专题目录（`src/content/topics/{id}/`），每个含 `meta.ts` + `00-overview.md`
- 新建专题列表页 `/topics`（按 8 个分类展示，支持搜索）
- 新建博客系统 `/blog`（纯静态 Markdown + frontmatter）
- 首页从「数位 DP Hero」改为「算法交互教程」平台首页
- 导航栏更新：首页/专题/博客/关于（去掉单独的「教程」链接）

**技术决策**：
- 用 `import.meta.glob` 动态加载 25 个专题的 markdown 内容
- 每个专题内容在一个 `00-overview.md` 文件中（非多文件分章节），简化管理
- 博客用 frontmatter（title/date/summary/tags）+ markdown 渲染

**生成方式**：用 Workflow 多 Agent 并行生成（30 个 Agent，约 22 分钟），每个 Agent 负责 1 个专题的内容生成。

---

## 2026-06-30 · v1.1 UI 修复 + 功能完善

### 修复：LaTeX 公式不渲染
**问题**：rehype-katex 生成的 HTML 需要 KaTeX CSS 才能显示，但 `index.css` 没有导入 KaTeX CSS。
**方案**：在 `src/index.css` 顶部加 `@import "katex/dist/katex.min.css"`。

### 修复：网站改名为「咕嘎学不会算法」
**改动**：TopBar、Hero、Footer、index.html title 中的所有「算法教程」改为「咕嘎学不会算法」。

### 修复：TopBar「专题」在子页面高亮
**问题**：`/topics/digit-dp` 页面中，导航栏的「专题」仍然高亮（NavLink 前缀匹配）。
**方案**：给「专题」的 NavLink 加 `end: true`，只在精确匹配 `/topics` 时高亮。

### 修复：内容与侧栏间距
**问题**：教程正文紧贴侧栏分界线，没有间距。
**方案**：main 元素加 `pl-6 pr-6 md:pl-10 md:pr-10`。

### 改进：排版增强
**改动**：`prose-tutorial` 样式全面升级——
- h2 加底部 2px 主题色边框
- h3 加左侧 3px 主题色边框
- 行内代码高亮（主题色背景 + 前景色）
- 链接文字加下划线 + 半透明装饰色
- 表格加边框和表头背景

### 改进：About 页面
**改动**：去掉 DP 重点，改为技术栈介绍 + 使用说明。

---

## 2026-06-30 · v1.2 侧栏重构 + 层级目录

### 侧栏贴左边 + 去掉居中
**问题**：页面用 `max-w-[1400px] mx-auto` 居中，侧栏跟着内容一起居中，没有贴到窗口左边。
**方案**：TopicPage 外层 div 改为 `flex w-full`（无 max-width），侧栏自然贴左。

### 侧栏层级目录（从 markdown 提取）
**问题**：侧栏只显示 meta.ts 的 6 个固定标题，不是从 markdown 内容动态提取的。
**方案**：
- 新建 `src/lib/extract-headings.ts`：从 markdown 正则提取所有 `##` 和 `###` 标题
- 新建 `src/lib/slugify.ts`（合并到 extract-headings.ts）：生成 URL 友好的锚点 id
- MarkdownRenderer 新增 h2/h3 组件覆写：自动给渲染出的标题加 `id` 属性
- TopicSidebarNav 重写：接受 headings（非 sections），渲染为层级目录（h2 可展开/折叠，h3 缩进显示）

### 侧栏跳转修复
**问题**：`scrollIntoView` 在 SPA 路由下可能不工作。
**方案**：改用 `window.scrollTo` + `element.getBoundingClientRect()` 手动计算滚动位置，补偿固定 TopBar 高度（56px + 16px 间距）。

### 双向拖拽
**问题**：只有左侧侧栏能拖拽，右侧内容区不能拉伸。
**方案**：右侧内容区自动填满剩余空间（`flex-1`），侧栏宽度可拖拽调节（180-500px，localStorage 记忆）。右侧无需额外拖拽——用户拉宽侧栏，内容区自然变窄；拉窄侧栏，内容区自然变宽。

---

## 2026-06-26 · v0.5 部署到 Vercel

### 首次部署
- GitHub 仓库：https://github.com/GetlotMoney/digit-dp-tutorial
- Vercel 生产部署（手动 `npx vercel --prod`）
- 注意：Vercel 项目未关联 GitHub（需手动在 Vercel 仪表盘 Settings → Git 连接）

---

## 2026-06-26 · v0.4 间距修复

### 演示组件间距
**问题**：演示组件内部元素（标题、描述、控件、数字方格）间距过小，元素重叠。
**方案**：
- DemoFrame：标题→描述 4px → 16px，描述→内容 14px → 20px
- demos.css：digit-row 12→16px, badges 10→14px, choices 10→14px, legend 10→16px, statline 12→16px
- 间距测试脚本：遍历所有相邻元素测量 gap，确保 ≥ 16px

### 首页 section 间距
**问题**：Hero/FeatureCards/RoadmapPreview 三个 section 之间间距为 0px（紧贴）。
**方案**：Hero 和 FeatureCards 的 section 加 `mb-8`。

### 数字方格标签重叠
**问题**：digit box 的 `.tag`（N[0]=3）和方格边框重叠。
**方案**：`.tag` top 从 -16px 改为 -28px，`.digit` padding-top 14px → 18px，`.digit-row` margin-top 28px → 40px。

---

## 2026-06-26 · v0.3 移植 5 个交互演示

### 演示从 Babel 单文件移植到 TSX
**来源**：原 `index.html` 的 5 个 React 组件（Babel 在浏览器端转译）
**目标**：Vite + React 19 + TypeScript 工程

**移植内容**：
- `PrefixSumDemo`（前缀和转化）
- `FillDigitsDemo`（逐位填数 + limit/lead0）
- `MemTreeDemo`（记忆化递归树）
- `WavinessDemo`（波动值判定）
- `FullProblemDemo`（LeetCode 3753 完整流程）

**共享组件提取**：
- `DemoFrame.tsx`：演示统一样式框架
- `shared/Badges.tsx`：limit/lead0/free 状态徽章
- `shared/DigitRow.tsx`：数字方格行 + 数字选择按钮
- `shared/utils.ts`：toDigits/wavinessOf 工具函数

**关键改动**：
- 所有 state 加 TypeScript 类型
- `e.target.value` 用 `+e.target.value || 0` 模式
- demos.css 从 index.html 平移，图例色（红=limit/黄=lead0/绿=free）锁定为 `var(--legend-*)`
- demo-registry.tsx 接入 lazy() 懒加载
- TS 6 baseUrl 弃用警告：加 `ignoreDeprecations: "6.0"`
- MarkdownRenderer components 类型扩展支持自定义 `demo` 节点

---

## 2026-06-26 · v0.2 侧栏 + Markdown 正文

### 11 章正文抽取
- 从 index.html 的 HTML 内容提取为 Markdown 文件（`src/content/sections/` 下 11 个 `.md`）
- 用 `import.meta.glob` + `?raw` 加载
- MarkdownRenderer 组件：react-markdown + remark-gfm + remark-math + rehype-katex

### shiki 代码高亮
- 只注册 C++ 语法 + github-light/dark 两个主题
- CodeBlock 组件：暗色切换时 MutationObserver 触发重高亮

### 演示占位
- remark-demo.ts 自定义插件：`<!--DEMO:xxx-->` → 渲染 demo-registry 中的组件
- 5 个演示占位卡（M3 才替换成真实组件）

---

## 2026-06-26 · v0.1 脚手架 + Hero

### 技术栈初始化
- Vite 8 + React 19 + TypeScript + Tailwind v4 + shadcn/ui 4（base-ui）
- 路径别名 `@/` → `src/`
- 靛紫品牌色（`--primary: oklch(0.45 0.23 277)`）
- 暗色模式（三档：浅/深/跟随系统）

### 计划偏差记录
- Tailwind v3 → v4（shadcn 4 不兼容 v3）
- pnpm → npm（corepack 国内网络超时）
- shadcn 用 base-ui（`render` prop），不用 Radix（`asChild`）
- lucide-react 无 `Github` 图标 → 改文字链接
- shadcn Sheet 在 preview 环境 Trigger 不响应 → 改手写抽屉
