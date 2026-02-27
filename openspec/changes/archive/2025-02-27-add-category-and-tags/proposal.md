## Why

当前 `lib/types.ts` 中定义的 `Post` 接口包含 `category` 和 `tags` 字段，但数据库 schema（`lib/db/schema.ts`）中的 `posts` 表缺少这些字段的存储支持。这导致应用的数据类型定义与实际数据库结构不一致，无法持久化文章的分类和标签信息。

## What Changes

- **新增分类表**：创建 `categories` 表存储文章分类
- **新增标签表**：创建 `tags` 表存储文章标签
- **新增文章-标签关联表**：创建 `post_tags` 多对多关联表
- **扩展 posts 表**：
  - 添加 `categoryId` 外键字段
  - 添加 `readTime` 字段（预计阅读时间）
  - 添加 `publishedDate` 字段（发布日期）
- **更新 API 路由**：支持创建和更新文章时的分类和标签处理
- **更新管理界面**：在文章创建/编辑表单中添加分类选择和标签输入

## Capabilities

### New Capabilities
- `post-categories`: 文章分类管理，支持单一分类归属
- `post-tags`: 文章标签管理，支持多标签关联（多对多关系）

### Modified Capabilities
- 无

## Impact

- **数据库**：需要执行 schema 迁移，新增 3 个表和 3 个字段
- **API**：文章 CRUD 端点需要更新以处理分类和标签
- **管理端**：文章编辑表单需要添加分类选择器和标签输入组件
- **类型定义**：确保 TypeScript 类型与数据库 schema 保持一致
