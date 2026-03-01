## 1. 数据查询层实现

- [x] 1.1 更新 `server/db/queries/posts.ts`，实现从数据库获取文章列表的查询函数
- [x] 1.2 更新 `server/db/queries/posts.ts`，实现从数据库获取单篇文章详情的查询函数（包含作者、分类、标签关联数据）
- [x] 1.3 添加 `server/db/queries/posts.ts`，实现获取所有已发布文章 ID 的函数（用于 SSG）
- [x] 1.4 创建 `server/db/queries/categories.ts`，实现获取分类列表的查询函数
- [x] 1.5 创建 `server/db/queries/tags.ts`，实现获取标签列表的查询函数
- [x] 1.6 创建 `server/db/queries/settings.ts`，实现从 settings 表获取作者信息的查询函数

## 2. 数据库 Schema 扩展

- [x] 2.1 在 `server/db/schema.ts` 的 `settings` 表中添加作者信息相关字段（authorName、authorAvatar、authorBio、authorLocation、authorEmail、authorSocial）
- [x] 2.2 生成并运行数据库迁移脚本

## 3. 前台页面迁移

- [x] 3.1 更新 `app/[locale]/page.tsx` 首页，使用新的数据库查询函数获取作者和文章数据
- [x] 3.2 更新 `app/[locale]/archive/page.tsx` 归档页，使用新的数据库查询函数获取文章列表
- [x] 3.3 更新 `app/[locale]/post/[id]/page.tsx` 文章详情页，确保使用数据库查询函数
- [x] 3.4 在文章详情页添加 `generateStaticParams` 函数实现 SSG
- [x] 3.5 在文章详情页添加 `revalidate` 配置（可选，根据需求决定是否启用 ISR）

## 4. 类型定义更新

- [x] 4.1 检查并更新 `lib/types.ts` 中的 `Post` 类型，确保与数据库查询结果匹配
- [x] 4.2 检查并更新 `lib/types.ts` 中的 `Author` 类型，确保与 settings 表中的作者信息匹配
- [x] 4.3 在查询函数中添加类型转换逻辑（如 `published_date` → `date`）

## 5. 清理与验证

- [x] 5.1 删除 `lib/data/index.ts` 中的模拟数据（`posts` 和 `author`）
- [x] 5.2 搜索并移除所有对 `@/lib/data` 的 import 引用
- [x] 5.3 删除 `lib/data/index.ts` 文件（如果不再需要）
- [x] 5.4 验证首页正常显示作者信息和文章列表
- [x] 5.5 验证归档页正常显示文章网格
- [x] 5.6 验证文章详情页正常显示文章内容
- [x] 5.7 验证访问不存在的文章 ID 时显示 404 页面
- [x] 5.8 验证 SSG 构建成功生成静态页面
