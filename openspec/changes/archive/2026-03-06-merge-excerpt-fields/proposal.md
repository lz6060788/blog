## Why

当前文章系统有两个独立的摘要字段：`excerpt`（手动输入）和 `aiSummary`（AI 生成），导致数据冗余和混乱。文章详情页只显示 `excerpt`，而用户认为管理端的 AI 摘要更好，需要统一这两个字段，简化数据模型，提升用户体验。

## What Changes

- **数据库架构**：移除 `aiSummary`、`aiSummaryGeneratedAt`、`aiSummaryStatus` 字段，统一使用 `excerpt` 字段
- **AI 摘要服务**：AI 摘要生成后直接更新 `excerpt` 字段，而非 `aiSummary`
- **类型定义**：更新 Post 类型，移除 AI 摘要相关字段
- **管理端组件**：所有 AI 摘要编辑器统一使用 `excerpt` 字段
- **数据迁移**：提供脚本将现有 `aiSummary` 数据迁移到 `excerpt`

## Capabilities

### Modified Capabilities

- `ai-content-features`: 修改 AI 摘要功能要求，更新为操作单一 `excerpt` 字段

## Impact

**数据库变更**：
- 移除字段：`aiSummary`、`aiSummaryGeneratedAt`、`aiSummaryStatus`
- 保留字段：`excerpt`（统一使用）

**受影响的代码**：
- `server/db/schema.ts` - 移除 AI 摘要相关字段定义
- `server/ai/services/summary.ts` - 修改为更新 `excerpt` 字段
- `lib/types/entities.ts` - 更新 Post 类型定义
- `components/admin/ai/ai-summary-editor.tsx` - 使用 `excerpt` 而非 `aiSummary`
- `app/admin/posts/[id]/edit/page.tsx` - 使用 `excerpt` 字段
- `server/db/queries/posts.ts` - 返回数据时移除 `aiSummary` 相关字段
- 数据迁移脚本

**不影响的范围**：
- AI 封面功能完全独立，不受影响
- 文章列表、分类、标签等功能不受影响
