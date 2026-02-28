## Context

当前文章详情页（`app/[locale]/post/[id]/page.tsx`）是完全的客户端组件，使用了 `'use client'` 指令。虽然这简化了状态管理和交互（如主题切换），但也带来了以下问题：

1. **SEO 不友好**：搜索引擎爬虫获取到的是空白 HTML，需要执行 JavaScript 才能看到文章内容
2. **首屏加载慢**：用户需要等待 JavaScript 下载和执行后才能看到内容
3. **社交分享问题**：分享链接时无法正确显示预览图和描述

CherryPreview 组件目前已集成 Cherry Markdown，但主题切换响应可能不够实时，特别是在 SSR 场景下需要特殊处理。

**约束条件：**
- 必须保持多语言支持（`[locale]` 路由）
- 必须保持主题切换功能
- Cherry Markdown 必须在客户端运行（依赖浏览器 API）
- 需要确保服务端和客户端的主题状态同步

## Goals / Non-Goals

**Goals:**
- 将文章详情页改为服务端组件，实现服务端渲染
- 生成完整的 SEO 元数据（title、description、og tags）
- 优化 CherryPreview 组件，确保主题实时响应
- 保持客户端交互功能（主题切换、导航等）
- 提升首屏加载性能和 SEO 效果

**Non-Goals:**
- 不修改文章数据结构（未来迁移 API 时再考虑）
- 不修改多语言路由结构
- 不修改主题系统核心逻辑
- 不改变 Cherry Markdown 的核心配置

## Decisions

### 1. 混合渲染架构

**决策：** 采用服务端组件 + 独立客户端组件的混合架构。

**架构设计：**
```
app/[locale]/post/[id]/page.tsx (服务端组件)
  └── ArticleContent.tsx (客户端组件包装器)
      └── CherryPreview.tsx (客户端组件)
```

**理由：**
- 服务端组件负责数据获取和 SEO 元数据生成
- 客户端组件仅负责需要交互的部分（Cherry Markdown 预览）
- 最小化客户端 JavaScript，只水合必要的组件
- 符合 Next.js App Router 的最佳实践

**替代方案：**
- 完全服务端渲染 + 服务器组件（不适用：Cherry Markdown 需要客户端）
- 保持完全客户端渲染（不采用：SEO 问题无法解决）

### 2. CherryPreview 组件优化

**决策：** 优化 CherryPreview 组件的主题响应机制，使用 `key` prop 强制重新初始化。

**实现方式：**
- 监听 `theme` prop 变化
- 当 theme 变化时，销毁旧的 Cherry Markdown 实例
- 使用新的 theme 配置重新初始化
- 添加 CSS 过渡效果确保平滑切换

**理由：**
- Cherry Markdown 的主题配置在初始化时设置，运行时更改配置需要重新初始化
- 使用 `key` prop 可以触发组件完全重新挂载，确保状态重置
- CSS 过渡可以减轻重新初始化带来的视觉跳动

**替代方案：**
- 动态修改 Cherry Markdown 的 DOM 样式（不采用：无法覆盖所有样式）
- 等待 Cherry Markdown 官方支持运行时主题切换（不采用：时间不确定）

### 3. SEO 元数据生成

**决策：** 使用 Next.js 的 `generateMetadata` 函数在服务端生成元数据。

**实现方式：**
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.id)
  return {
    title: `${post.title} - Blog Name`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
    },
  }
}
```

**理由：**
- Next.js 原生支持，无需额外依赖
- 元数据在服务端生成，SEO 友好
- 支持动态生成（根据文章内容）

### 4. 主题状态同步

**决策：** 服务端使用默认主题，客户端水合后恢复用户偏好。

**实现流程：**
1. 服务端渲染：使用 `light` 作为默认主题渲染初始 HTML
2. 客户端水合：从 localStorage 读取用户的主题偏好
3. 状态同步：立即应用用户的主题偏好，触发 CherryPreview 重新初始化

**理由：**
- 服务端无法访问 localStorage，无法获取用户偏好
- 使用默认主题确保初始渲染一致性
- 客户端快速同步避免"主题闪烁"

**风险缓解：**
- 在 `<head>` 中添加内联脚本，尽早设置主题类
- 使用 `suppressHydrationWarning` 避免 hydration 不匹配警告

## Risks / Trade-offs

### 主题切换时的性能问题

**风险：** 重新初始化 Cherry Markdown 可能导致短暂的卡顿或内容闪烁。

**缓解措施：**
- 添加加载状态提示（显示"切换主题..."）
- 使用 CSS 过渡效果平滑切换
- 优化 Cherry Markdown 配置，减少初始化时间
- 考虑使用虚拟化技术（如只重新渲染预览部分）

### Hydration 不匹配

**风险：** 服务端渲染的 HTML（默认主题）与客户端初始状态（用户偏好主题）不匹配。

**缓解措施：**
- 使用 `suppressHydrationWarning` 在主题相关元素上
- 确保客户端尽快同步主题状态
- 测试不同主题偏好下的水合过程

### Cherry Markdown 依赖体积

**风险：** Cherry Markdown 是一个较大的库，影响页面加载性能。

**缓解措施：**
- 使用动态导入（已实现）
- 只在文章详情页加载该库
- 考虑在未来使用更轻量的替代方案（如 react-markdown + remark/rehype 插件）

### 数据获取性能

**风险：** 服务端数据获取可能影响页面响应速度。

**缓解措施：**
- 使用缓存策略（如 Redis）缓存文章数据
- 考虑使用 ISR（增量静态再生成）或 SSG（静态生成）
- 优化数据库查询（当迁移到 API 时）

## Migration Plan

### 阶段 1：重构组件结构
1. 创建 `components/article-content.tsx` 作为客户端组件包装器
2. 将 CherryPreview 及相关交互逻辑移到该组件中
3. 测试客户端功能是否正常

### 阶段 2：实现服务端渲染
1. 将 `app/[locale]/post/[id]/page.tsx` 改为服务端组件
2. 实现服务端数据获取逻辑
3. 生成 SEO 元数据
4. 测试服务端渲染是否正常

### 阶段 3：优化主题切换
1. 优化 CherryPreview 组件的主题响应机制
2. 实现主题状态的客户端同步
3. 添加加载状态和过渡效果
4. 测试主题切换是否流畅

### 阶段 4：测试与验证
1. 测试 SEO（使用爬虫模拟工具）
2. 测试不同主题下的渲染效果
3. 测试首屏加载性能
4. 测试社交分享预览

**回滚策略：**
- 每个阶段完成后进行测试，确保功能正常
- 保留旧的客户端组件实现，必要时可以快速回退
- 使用 Git 分支管理，便于回滚

## Open Questions

1. **是否需要预渲染主题？** 是否需要在服务端预渲染两种主题的 HTML，以完全避免主题闪烁？
   - **权衡**：增加 HTML 体积 vs 更好的用户体验
   - **建议**：先实现基础版本，根据用户反馈决定是否优化

2. **Cherry Markdown 的替代方案？** 是否应该考虑更轻量的 Markdown 渲染方案？
   - **权衡**：功能完整性 vs 性能
   - **建议**：当前版本满足需求，未来根据性能指标评估

3. **数据缓存策略？** 当迁移到 API 数据源后，如何缓存文章数据？
   - **建议**：使用 Next.js 的 fetch 缓存或 Redis，根据数据更新频率决定

4. **是否需要支持更多 SEO 功能？** 如结构化数据（JSON-LD）、sitemap 生成等？
   - **建议**：作为后续优化项目，当前聚焦于核心 SSR 实现
