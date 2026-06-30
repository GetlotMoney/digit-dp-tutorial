/**
 * 数位 DP 专题的章节元数据
 *
 * 从 sections-meta.ts 演化而来；原文件保留以兼容现有路由，
 * 等集成阶段再做最终清理。
 */

export type SectionMeta = {
  id: string
  nav: string
  title: string
  file: string
}

export const DIGIT_DP_SECTIONS: SectionMeta[] = [
  { id: 'preface', nav: '前言', title: '数位 DP 学习教程 · 交互版', file: '00-preface.md' },
  { id: 'roadmap', nav: '学习规划', title: '学习规划（精简版）', file: '01-roadmap.md' },
  { id: 'basics', nav: '1. 基础知识', title: '1. 基础知识回顾', file: '02-basics.md' },
  { id: 'core', nav: '2. 核心思想', title: '2. 数位 DP 的核心思想', file: '03-core.md' },
  { id: 'template', nav: '3. DFS 模板', title: '3. 基本模板（DFS 记忆化写法）', file: '04-template.md' },
  { id: 'easy', nav: '4. 入门题', title: '4. 经典入门题', file: '05-easy.md' },
  { id: 'medium', nav: '5. 进阶题', title: '5. 经典进阶题', file: '06-medium.md' },
  { id: 'example', nav: '6. 完整例题', title: '6. 完整例题 · LeetCode 3753', file: '07-example.md' },
  { id: 'advanced', nav: '7. 综合变体', title: '7. 综合应用与变体', file: '08-advanced.md' },
  { id: 'tricks', nav: '8. 模板总结', title: '8. 模板总结与技巧', file: '09-tricks.md' },
  { id: 'exercises', nav: '9. 练习题单', title: '9. 练习题单', file: '10-exercises.md' },
]
