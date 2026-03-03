## Why

当前文章系统已支持 AI 封面生成和手动上传封面，但在前端页面中尚未展示这些封面。为了提升博客的视觉吸引力和用户体验，需要在多个页面位置展示文章封面，使文章内容更具吸引力和辨识度。

## What Changes

- **管理端文章列表**：在文章列表中添加封面缩略图列
- **用户端文章列表**：在首页和文章列表页展示文章封面卡片
- **归档页面**：在归档页面按时间线展示文章封面
- **文章详情页**：在文章顶部展示封面大图（作为文章头图）

## Capabilities

### New Capabilities
- `article-cover-display`: 文章封面在前端页面的展示功能，包括封面图片的加载、布局适配、响应式显示和降级处理

### Modified Capabilities
- `post-list-enhancements`: 文章列表需要添加封面显示列，修改现有列表布局以适配封面展示
- `ssr-article-page`: 文章详情页需要添加顶部封面展示区域

## Impact

**受影响的页面**：
- `app/admin/posts/page.tsx` - 管理端文章列表
- `app/page.tsx` - 用户端首页（文章列表）
- `app/archive/page.tsx` - 归档页面
- `app/[slug]/page.tsx` - 文章详情页

**API 变更**：
- 无需新增 API，使用现有的 `PostWithRelations` 接口（已包含 `coverImageUrl` 字段）

**组件变更**：
- 需要创建新的封面展示组件（可能复用或扩展现有的封面预览组件）
- 修改文章列表和文章详情页的布局组件

**数据库**：
- 无需变更，`posts` 表已有 `coverImageUrl` 字段

**依赖**：
- Next.js Image 组件用于优化图片加载
- 可能需要添加图片占位符或默认封面设计
