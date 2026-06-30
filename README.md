# Guga Algo — Interactive Algorithm Tutorial

An interactive algorithm learning platform with hands-on visualizations. Covers 25+ topics across data structures, graph theory, dynamic programming, math, strings, and more.

## Features

- **25 algorithm topics** with full tutorial content (overview, core concepts, template code, example problems, practice sets)
- **Interactive demos** — clickable visualizations for sorting, BFS/DFS, knapsack DP, digit DP, and more
- **Hierarchical sidebar** — all topics organized by category, with expandable sub-sections
- **Resizable layout** — drag to adjust sidebar and content width
- **Dark mode** — light/dark/system theme toggle
- **Blog** — static markdown blog with tag filtering
- **Auth system** — Supabase email/password registration and login
- **KaTeX math** — LaTeX formulas rendered in tutorials
- **Code highlighting** — Shiki-based syntax highlighting with copy button
- **Mobile responsive** — collapsible sidebar drawer on small screens

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | Vite + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animation | Framer Motion |
| Markdown | react-markdown + remark-gfm + remark-math + rehype-katex |
| Code Highlight | Shiki (lazy-loaded) |
| Auth & Database | Supabase (PostgreSQL + Auth) |
| Deployment | Vercel |
| Package Manager | npm |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:5173

# Build for production
npm run build
```

### Environment Variables

Create `.env.local` in the project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
src/
├── content/
│   ├── topics/           # 25 algorithm topics (meta.ts + 00-overview.md each)
│   ├── blog/             # Blog posts (markdown with frontmatter)
│   └── topics-registry.ts # Topic metadata & categories
├── components/
│   ├── layout/           # TopBar, Sidebar, ThemeToggle, PageTransition
│   ├── markdown/         # MarkdownRenderer, CodeBlock, remark-demo plugin
│   ├── home/             # Hero, FeatureCards, RoadmapPreview, Footer
│   ├── ui/               # shadcn/ui components (Button, Card, Badge, etc.)
│   └── demos/            # Interactive demo components (lazy-loaded)
├── pages/                # Route pages (Landing, Topics, Topic, Blog, Login, Register)
├── hooks/                # useAuth, useTheme, useScrollSpy
├── lib/                  # supabase client, shiki highlighter, demo-registry, utils
└── styles/               # demos.css (demo-specific styles)
```

## Topic Categories

| Category | Topics |
|----------|--------|
| Basics | Binary Search, Sorting, Prefix Sum, Two Pointers, Greedy |
| Search | DFS & BFS, Backtracking |
| Dynamic Programming | Knapsack, Interval DP, Tree DP, Bitmask DP, Digit DP |
| Data Structures | Stack & Queue, Union-Find, Segment Tree, Fenwick Tree, Monotonic Stack |
| Graph Theory | Graph Traversal, Shortest Path, MST, LCA, Topological Sort |
| Math | Number Theory |
| Strings | KMP & Trie |
| Miscellaneous | Discretization & Sqrt Decomposition |

## License

MIT
