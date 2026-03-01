## Why

当前用户端（前台）使用 `lib/data/index.ts` 中的静态模拟数据来显示文章内容。而后台管理系统的文章数据已经存储在数据库中，并且服务端 API 和数据库查询层已经就绪。需要移除前台对模拟数据的依赖，实现前后台数据的统一管理。

## What Changes

- **移除模拟数据**：删除 `lib/data/index.ts` 中已标记为 `@deprecated` 的静态演示数据
- **重构数据查询层**：更新 `server/db/queries/posts.ts` 从数据库获取数据而非模拟数据
- **更新前台页面**：
  - 首页 `app/[locale]/page.tsx`：从数据库获取作者和文章列表
  - 归档页 `app/[locale]/archive/page.tsx`：从数据库获取文章列表
  - 文章详情页 `app/[locale]/post/[id]/page.tsx`：使用已有的数据库查询函数
- **作者信息迁移**：将 `author` 静态数据迁移到 `settings` 表或创建专门的作者信息表

## Capabilities

### New Capabilities
- `article-public-api`: 公共文章数据获取能力，包括文章列表、文章详情、分类、标签等前端展示所需的数据查询接口

### Modified Capabilities
- `ssr-article-page`: 文章详情页 SSR 能力需要更新，确保从数据库获取数据并支持静态生成（SSG）

## Impact

- **影响的前台页面**：首页、归档页、文章详情页
- **影响的组件**：`Navigation`、`AuthorCard`、`TimelineList`、`ArchiveGrid`、`ArchiveHeader`、`ArticleWrapper`
- **数据层**：`server/db/queries/posts.ts` 需要重写为真实的数据库查询
- **类型定义**：`lib/types.ts` 中的 `Post` 和 `Author` 类型可能需要调整以匹配数据库 schema
