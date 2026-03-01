## Context

当前项目使用 Next.js 14 App Router 架构，数据库采用 SQLite + Drizzle ORM。后台管理系统已完成，文章数据存储在数据库中（`posts`、`categories`、`tags`、`postTags` 表），但前台页面仍使用 `lib/data/index.ts` 中的静态模拟数据。

项目结构：
- `server/db/schema.ts` - 数据库 schema 定义
- `server/db/queries/posts.ts` - 当前使用模拟数据的查询函数
- `server/actions/posts.ts` - 后台管理用的 Server Actions
- `app/[locale]/` - 前台页面目录
- `lib/data/index.ts` - 已废弃的静态演示数据

## Goals / Non-Goals

**Goals:**
- 移除前台对 `lib/data/index.ts` 的依赖
- 实现从数据库获取文章数据的公共查询层
- 保持前台页面的 SSG/ISR 能力
- 支持分类、标签筛选

**Non-Goals:**
- 修改后台管理系统的 API（已正常工作）
- 修改数据库 schema（现有结构已满足需求）
- 实现文章搜索功能（未来考虑）

## Decisions

### 1. 数据查询层架构
**决策**：在 `server/db/queries/` 下创建公共查询函数，复用 Drizzle ORM 连接。

**理由**：
- 与现有的 `server/db/queries/posts.ts` 结构一致
- Server Actions (`server/actions/posts.ts`) 用于后台写操作，查询函数用于前台读操作，职责分离清晰
- Drizzle ORM 已配置好，无需额外依赖

**替代方案**：
- 使用 API Routes：增加不必要的网络开销和序列化/反序列化
- 直接在页面组件中查询：代码重复，难以维护

### 2. 作者信息存储方案
**决策**：暂时在 `settings` 表中扩展字段存储作者信息，未来可考虑独立的作者表。

**理由**：
- 当前单作者博客场景，settings 表足够
- 避免过度设计
- settings 表已存在且是单例模式

**数据结构**：
```typescript
// settings 表扩展字段
{
  authorName: string,
  authorAvatar: string,
  authorBio: string,
  authorLocation: string,
  authorEmail: string,
  authorSocial: { github?: string, twitter?: string }
}
```

### 3. 类型定义策略
**决策**：保持 `lib/types.ts` 中的 `Post` 和 `Author` 类型作为前端展示层类型，与数据库类型解耦。

**理由**：
- 前端展示层类型可以独立于数据库 schema 变化
- 可以进行类型转换和数据处理（如格式化日期）
- 保持组件接口稳定

**映射关系**：
- `posts.published_date` → `Post.date` (字符串格式)
- `posts.read_time` → `Post.readTime` (数字)
- `categories.name` → `Post.category` (字符串)
- `tags` 数组 → `Post.tags` (字符串数组)

### 4. SSG/ISR 实现方式
**决策**：使用 Next.js 的 `generateStaticParams` 实现静态生成，ISR 配置为可选。

**理由**：
- 文章内容不频繁变化，SSG 可提高性能
- 可通过 `revalidate` 配置启用 ISR
- 与现有 Next.js 14 App Router 最佳实践一致

**实现**：
```typescript
// app/[locale]/post/[id]/page.tsx
export async function generateStaticParams() {
  const posts = await getAllPublishedPostIds()
  return posts.map(id => ({ id }))
}

export const revalidate = 3600 // 1小时 ISR
```

## Risks / Trade-offs

### 风险 1：类型不匹配
**风险**：数据库 schema 与前端类型字段名不一致（如 `published_date` vs `date`）

**缓解措施**：
- 在查询函数中做类型转换
- 使用 TypeScript 严格类型检查
- 添加单元测试验证类型映射

### 风险 2：关联查询性能
**风险**：文章详情需要关联查询 author、category、tags，可能存在 N+1 问题

**缓解措施**：
- 使用 Drizzle ORM 的关联查询 API
- 在查询时使用 `with` 子句一次性加载关联数据
- 考虑为常用查询添加数据库索引

### 风险 3：迁移期间功能中断
**风险**：删除模拟数据可能导致前台页面在迁移期间无法正常工作

**缓解措施**：
- 先实现数据库查询函数，确保其正常工作
- 逐步迁移各页面，而非一次性全部替换
- 保留模拟数据文件作为备份，直到迁移完成

## Migration Plan

1. **实现公共查询函数**
   - 更新 `server/db/queries/posts.ts` 实现真实数据库查询
   - 添加 `server/db/queries/categories.ts` 和 `server/db/queries/tags.ts`
   - 添加 `server/db/queries/settings.ts` 用于获取作者信息

2. **迁移前台页面**
   - 更新首页 `app/[locale]/page.tsx`
   - 更新归档页 `app/[locale]/archive/page.tsx`
   - 更新文章详情页 `app/[locale]/post/[id]/page.tsx`

3. **类型同步**
   - 更新 `lib/types.ts` 确保类型与数据库查询结果匹配

4. **清理**
   - 删除 `lib/data/index.ts` 中的模拟数据
   - 更新相关 import 语句

5. **测试**
   - 验证所有前台页面正常工作
   - 验证 SSG 静态生成功能
   - 验证 ISR 重新验证功能（如果启用）

## Open Questions

1. **作者信息的社交链接存储格式**
   - 选项 A：JSON 字符串存储在 settings 表
   - 选项 D：单独的 author_socials 表
   - **建议**：先用 JSON 字符串，简单够用

2. **ISR 的 revalidate 时间**
   - 文章更新频率低，建议较长的时间间隔（如 1 小时或 1 天）
   - 或考虑按需重新验证（on-demand revalidation）
   - **建议**：先不启用 ISR，纯 SG 构建，未来根据需求调整

3. **是否需要保留模拟数据用于开发**
   - 选项 A：完全删除，使用真实数据库
   - 选项 B：保留作为开发环境的 seed 数据
   - **建议**：删除，使用数据库 seed 脚本初始化开发数据
