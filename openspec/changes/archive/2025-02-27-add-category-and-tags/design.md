## Context

当前博客系统使用 Drizzle ORM + SQLite 存储文章数据。`lib/types.ts` 中定义的 `Post` 类型包含 `category` (字符串) 和 `tags` (字符串数组) 字段，但数据库 schema 中缺少相应的表和关系。

现有数据模型基于以下约束：
- SQLite 作为数据库（限制外键级联的某些功能）
- Next.js App Router 架构
- Drizzle ORM 用于数据库操作
- 现有 posts 表仅包含基本字段（id, title, content, excerpt, published, authorId, createdAt, updatedAt）

## Goals / Non-Goals

**Goals:**
- 支持文章的分类和标签存储与检索
- 保持与现有 Post 类型定义的一致性
- 使用 Drizzle ORM 迁移系统进行 schema 变更
- 在管理端提供分类和标签管理功能

**Non-Goals:**
- 分类层级结构（仅支持单层分类）
- 标签层级结构
- 文章前台展示的分类/标签筛选（此功能属于前台展示层，不在此次变更范围内）

## Decisions

### 数据模型设计

**决策 1：分类作为独立表（categories）**
- **选择**：创建独立的 `categories` 表
- **理由**：
  - 支持分类的 CRUD 管理操作
  - 便于未来扩展分类属性（如描述、图标等）
  - 保持数据规范化
- **替代方案**：在 posts 表中直接存储 category 字符串 → 不利于数据一致性和管理

**决策 2：标签作为独立表 + 多对多关系**
- **选择**：创建 `tags` 表 + `post_tags` 关联表
- **理由**：
  - 支持标签复用和去重
  - 便于标签管理和统计
  - 符合数据库范式
- **替代方案**：在 posts 表中以 JSON 数组存储标签 → 难以查询和统计

**决策 3：posts 表添加外键**
- **选择**：添加 `categoryId` 外键（可为 NULL）
- **理由**：
  - 支持文章暂时无分类的情况
  - 保持数据完整性
- **替代方案**：必填外键 → 限制灵活性

**决策 4：readTime 和 publishedDate 字段**
- **选择**：添加 `readTime` (integer) 和 `publishedDate` (text) 字段
- **理由**：
  - 与 lib/types.ts 中 Post 类型保持一致
  - `publishedDate` 区别于 `createdAt`，支持草稿后发布的场景
- **替代方案**：仅使用 `createdAt` → 无法区分创建和发布时间

### API 设计

**决策 5：嵌套关联数据在文章 API**
- **选择**：文章 GET API 返回时包含 category 和 tags 对象
- **理由**：
  - 减少前端请求次数
  - 符合 RESTful 嵌套资源模式
- **替代方案**：前端分别请求文章、分类、标签 → 增加复杂度

## Risks / Trade-offs

### 已知风险

**风险 1：现有数据的迁移**
- **问题**：如果已有文章数据，新增 NOT NULL 字段可能导致迁移失败
- **缓解措施**：
  - 新增字段均设置为可为 NULL 或有默认值
  - 提供数据迁移脚本为现有文章设置默认值

**风险 2：SQLite 外键级联删除**
- **问题**：SQLite 的外键约束可能影响删除操作
- **缓解措施**：
  - 在 schema 中明确定义 `onDelete` 行为
  - 分类删除时设置为 NULL 而非级联删除文章
  - 标签删除时级联删除关联记录

**风险 3：多对多查询性能**
- **问题**：关联查询可能影响性能
- **缓解措施**：
  - 当前为单用户博客，数据量小
  - 未来可通过索引优化

### 权衡

**权衡 1：单层分类 vs 层级分类**
- 选择单层分类（更简单）
- 损失：不支持分类树结构
- 理由：个人博客不需要复杂分类体系

**权衡 2：标签唯一性**
- 选择：标签名称全局唯一
- 损失：无法创建同名但含义不同的标签
- 理由：简化管理，避免歧义

## Migration Plan

### 迁移步骤

1. **更新数据库 schema** (`lib/db/schema.ts`)
   - 添加 categories 表
   - 添加 tags 表
   - 添加 post_tags 关联表
   - 扩展 posts 表（categoryId, readTime, publishedDate）
   - 添加 Drizzle 关系定义

2. **生成并执行迁移**
   ```bash
   drizzle-kit generate
   drizzle-kit migrate
   ```

3. **更新 API 路由** (`app/api/posts/`)
   - 修改 POST /api/posts：接受 categoryId 和 tags
   - 修改 PUT /api/posts/[id]：支持更新分类和标签
   - 修改 GET /api/posts：返回完整的 category 和 tags 数据

4. **更新管理端 UI**
   - 文章表单添加分类选择器（下拉框）
   - 文章表单添加标签输入（支持多选或输入）

5. **更新类型定义**
   - 确保 lib/types.ts 与数据库 schema 类型一致

### 回滚策略

- 迁移文件保留在 `drizzle/` 目录
- 如需回滚，手动执行逆序 SQL 删除新增表和字段
- 或使用 `drizzle-kit drop` 回退 schema

## Open Questions

1. **分类是否必填？** → 决策：不必填（categoryId 可为 NULL）
2. **标签数量限制？** → 决策：暂不限制（未来可添加）
3. **标签颜色/图标支持？** → 决策：不在此次范围（非目标）
