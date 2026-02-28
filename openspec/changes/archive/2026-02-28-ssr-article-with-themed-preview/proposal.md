## Why

当前文章详情页完全使用客户端渲染（'use client'），不利于 SEO（搜索引擎优化），因为搜索引擎爬虫无法获取渲染后的完整内容。同时，CherryPreview 组件虽然已经支持主题配置，但在客户端动态切换主题时可能存在响应不及时或需要刷新才能生效的问题。

## What Changes

- **重构文章详情页为服务端组件**：将 `app/[locale]/post/[id]/page.tsx` 改为服务端组件，在服务端获取文章数据并渲染初始 HTML
- **创建独立的 CherryPreview 客户端组件**：将 CherryPreview 组件优化为独立的客户端组件，支持动态主题切换和客户端水合（hydration）
- **完善 Cherry Markdown 主题适配**：确保 CherryPreview 组件能够实时响应主题变化，无需刷新页面
- **生成静态元数据**：为文章页面生成 SEO 友好的元数据（title、description、og tags 等）

## Capabilities

### Modified Capabilities
- `cherry-markdown-preview`: 新增 SSR 场景支持要求，增强主题动态切换能力

### New Capabilities
- `ssr-article-page`: 文章详情页服务端渲染能力，包括数据获取、元数据生成和客户端组件协调

## Impact

**影响范围：**
- **代码变更**：
  - 重构 `app/[locale]/post/[id]/page.tsx` 为服务端组件
  - 优化 `components/cherry-preview.tsx` 和 `components/cherry-preview-internal.tsx`
  - 新增 `components/article-content.tsx` 作为客户端组件包装器
  - 更新 `app/styles/components/cherry-preview.css` 以增强主题响应
- **数据层**：需要改造文章数据获取逻辑，支持服务端和客户端两种场景
- **依赖项**：无新增依赖，优化现有 Cherry Markdown 集成
- **API 变更**：可能需要调整文章数据 API 以支持服务端查询
- **SEO**：显著改善搜索引擎可抓取性
- **用户体验**：首屏加载更快，主题切换更流畅
