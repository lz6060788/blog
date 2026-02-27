## 1. 数据库 Schema 变更

- [x] 1.1 在 `lib/db/schema.ts` 中添加 `categories` 表定义
- [x] 1.2 在 `lib/db/schema.ts` 中添加 `tags` 表定义
- [x] 1.3 在 `lib/db/schema.ts` 中添加 `post_tags` 关联表定义
- [x] 1.4 扩展 `posts` 表：添加 `categoryId` 外键字段（可为 NULL）
- [x] 1.5 扩展 `posts` 表：添加 `readTime` 整数字段
- [x] 1.6 扩展 `posts` 表：添加 `publishedDate` 文本字段
- [x] 1.7 添加 Drizzle 关系定义（categories → posts, tags ↔ posts）
- [x] 1.8 生成数据库迁移文件：`drizzle-kit generate`
- [x] 1.9 执行数据库迁移：`drizzle-kit migrate`

## 2. 分类 API 端点

- [x] 2.1 创建 `/app/api/categories/route.ts` - GET（获取所有分类）
- [x] 2.2 创建 `/app/api/categories/route.ts` - POST（创建分类）
- [x] 2.3 创建 `/app/api/categories/[id]/route.ts` - GET（获取单个分类）
- [x] 2.4 创建 `/app/api/categories/[id]/route.ts` - PUT（更新分类）
- [x] 2.5 创建 `/app/api/categories/[id]/route.ts` - DELETE（删除分类）
- [x] 2.6 添加分类名称唯一性验证

## 3. 标签 API 端点

- [x] 3.1 创建 `/app/api/tags/route.ts` - GET（获取所有标签）
- [x] 3.2 创建 `/app/api/tags/route.ts` - POST（创建标签）
- [x] 3.3 创建 `/app/api/tags/[id]/route.ts` - GET（获取单个标签）
- [x] 3.4 创建 `/app/api/tags/[id]/route.ts` - PUT（更新标签）
- [x] 3.5 创建 `/app/api/tags/[id]/route.ts` - DELETE（删除标签）
- [x] 3.6 添加标签名称唯一性验证

## 4. 更新文章 API

- [x] 4.1 修改 `/app/api/posts/route.ts` - POST：接受 `categoryId`、`tags`、`readTime`、`publishedDate`
- [x] 4.2 修改 `/app/api/posts/route.ts` - POST：处理标签自动创建逻辑
- [x] 4.3 修改 `/app/api/posts/route.ts` - POST：建立文章-标签关联
- [x] 4.4 修改 `/app/api/posts/[id]/route.ts` - PUT：支持更新分类和标签
- [x] 4.5 修改 `/app/api/posts/[id]/route.ts` - PUT：处理标签关联的增量更新
- [x] 4.6 修改 `/app/api/posts/route.ts` - GET：查询时包含 category 和 tags 数据
- [x] 4.7 修改 `/app/api/posts/[id]/route.ts` - GET：返回完整的 category 和 tags 对象

## 5. 管理端 UI 组件

- [x] 5.1 创建分类管理页面 `/app/admin/categories/page.tsx`
- [x] 5.2 创建分类表单组件（创建/编辑）
- [x] 5.3 创建分类列表表格组件
- [x] 5.4 创建标签管理页面 `/app/admin/tags/page.tsx`
- [x] 5.5 创建标签表单组件（创建/编辑）
- [x] 5.6 创建标签列表表格组件
- [x] 5.7 更新文章表单：添加分类选择器下拉框
- [x] 5.8 更新文章表单：添加标签输入组件（支持多选）
- [x] 5.9 添加文章表单中的分类和标签数据获取逻辑

## 6. 类型定义更新

- [x] 6.1 确认 `lib/types.ts` 中的 `Post` 类型与数据库 schema 一致
- [x] 6.2 添加 `Category` 类型定义（如不存在）
- [x] 6.3 添加 `Tag` 类型定义（如不存在）
- [x] 6.4 添加 API 请求/响应类型定义

## 7. 测试与验证

- [ ] 7.1 测试分类 CRUD 操作
- [ ] 7.2 测试标签 CRUD 操作
- [ ] 7.3 测试文章创建（带分类和标签）
- [ ] 7.4 测试文章更新（修改分类和标签）
- [ ] 7.5 测试分类删除（文章 categoryId 设为 NULL）
- [ ] 7.6 测试标签删除（级联删除关联记录）
- [x] 7.7 验证数据库迁移成功
- [ ] 7.8 验证 API 返回数据格式正确
