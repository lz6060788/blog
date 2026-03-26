## Why

CherryMarkdown 不支持服务端渲染（SSR），导致文章详情页无法提供 SEO 友好的初始 HTML。搜索引擎爬虫无法获取完整的文章内容，严重影响博客的搜索可见性。Milkdown 基于 ProseMirror，支持真正的 SSR，同时保持出色的编辑体验。

## What Changes

- **替换编辑器组件**: 用 Milkdown 替换 CherryMarkdown 作为博客编辑器
  - 移除 `cherry-markdown` 依赖
  - 新增 `@milkdown/core`, `@milkdown/ctx`, `@milkdown/theme-nord` 等 Milkdown 相关包
  - 创建新的 `MilkdownEditor` 和 `MilkdownPreview` 组件

- **创建 Milkdown 编辑器**:
  - 实现编辑器组件，支持 Markdown 编辑
  - 支持代码高亮、表格、数学公式、引用块等高级语法
  - 保持现有工具栏功能和快捷键

- **创建 Milkdown 预览组件**:
  - 实现只读预览组件，支持 SSR
  - 服务端渲染时输出完整 HTML，确保 SEO
  - 客户端水合后支持主题切换

- **主题适配**:
  - 使用项目 CSS 变量（`--theme-*`）替代 Milkdown 默认主题
  - 确保深色/浅色模式下的样式一致
  - 支持主题动态切换

- **兼容现有 API**:
  - 保持 `EditorRef` 和 `PreviewRef` 接口一致
  - 确保 onChange、getHeight 等 API 兼容
  - **BREAKING**: 组件名称变更（`CherryEditor` → `MilkdownEditor`）

## Capabilities

### New Capabilities
- `milkdown-ssr-preview`: 支持 SSR 的 Milkdown 预览组件，服务端渲染完整 HTML，客户端水合后支持主题切换和交互
- `milkdown-theme-integration`: Milkdown 与项目主题系统的集成，使用 CSS 变量实现深色/浅色模式

### Modified Capabilities
- `cherry-markdown-preview`: **BREAKING** 将被 `milkdown-ssr-preview` 替代。功能要求保持一致：只读模式、完整 Markdown 特性支持、主题响应。区别在于新增 SSR 支持和样式系统的变更。
- `ssr-article-page`: 确认现有 spec 要求真正得到满足。使用支持 SSR 的预览组件后，文章内容将在服务端完整渲染为 HTML。

## Impact

### 组件变更
- 新建: `components/editor/milkdown/` 目录
  - `milkdown-editor.tsx` - 编辑器组件
  - `milkdown-editor-internal.tsx` - 内部实现
  - `milkdown-preview.tsx` - 预览组件
  - `milkdown-preview-internal.tsx` - 内部实现
  - `milkdown-theme.ts` - 主题配置
- 删除: `components/editor/cherry/` 和 `components/editor/preview/` 目录

### 依赖变更
- 移除: `cherry-markdown`
- 新增:
  - `@milkdown/core`
  - `@milkdown/ctx`
  - `@milkdown/theme-nord` (作为基础，将被自定义主题覆盖)
  - `@milkdown/preset-commonmark`
  - `@milkdown/preset-gfm`
  - `@milkdown/plugin-listener`
  - `@milkdown/plugin-history`
  - `@milkdown/plugin-upload`
  - `@milkdown/plugin-prism` (代码高亮)
  - `@milkdown/plugin-math` (数学公式)

### 页面影响
- `app/admin/*/edit/*` - 文章编辑页需要更新组件导入
- `app/article/*` - 文章详情页需要更新预览组件导入
- `app/styles/components/cherry-preview.css` - 可删除，样式将集成到 Tailwind

### SEO 改进
- 文章详情页将输出服务端渲染的完整 HTML
- 搜索引擎可直接获取文章内容，无需执行 JavaScript
