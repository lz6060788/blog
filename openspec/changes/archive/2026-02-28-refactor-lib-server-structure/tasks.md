# Implementation Tasks

## 1. 创建目录结构

- [x] 1.1 创建 `server/actions/` 目录
- [x] 1.2 创建 `server/auth/` 目录
- [x] 1.3 创建 `server/db/` 目录
- [x] 1.4 创建 `server/db/queries/` 目录
- [x] 1.5 创建 `lib/data/` 目录
- [x] 1.6 创建 `lib/types/` 目录
- [x] 1.7 创建 `lib/utils/` 目录

## 2. 迁移数据库相关文件到 server/db

- [x] 2.1 创建 `server/db/index.ts`，从 `lib/db.ts` 迁移 db 实例导出
- [x] 2.2 移动 `lib/db/schema.ts` → `server/db/schema.ts`
- [x] 2.3 创建 `server/db/queries/posts.ts`，整合 `lib/get-post.ts` 的内容
- [x] 2.4 删除 `lib/db.ts`
- [x] 2.5 删除 `lib/get-post.ts`
- [x] 2.6 删除空目录 `lib/db/`

## 3. 迁移认证相关文件到 server/auth

- [x] 3.1 创建 `server/auth/config.ts`，从 `lib/auth.ts` 提取 NextAuth 配置逻辑
- [x] 3.2 创建 `server/auth/index.ts`，导出 auth、signIn、signOut、handlers
- [x] 3.3 移动 `lib/auth/drizzle-adapter.ts` → `server/auth/drizzle-adapter.ts`
- [x] 3.4 移动 `lib/middleware-auth.ts` → `server/auth/middleware.ts`
- [x] 3.5 在 `server/auth/index.ts` 中重新导出 middleware 中的函数
- [x] 3.6 更新 `server/auth/config.ts` 内部引用：`@/lib/db` → `@/server/db`
- [x] 3.7 更新 `server/auth/drizzle-adapter.ts` 内部引用：`@/lib/db` → `@/server/db`
- [x] 3.8 删除 `lib/auth.ts`
- [x] 3.9 删除 `lib/middleware-auth.ts`
- [x] 3.10 删除空目录 `lib/auth/`

## 4. 迁移 Server Actions 到 server/actions

- [x] 4.1 移动 `lib/actions/categories.ts` → `server/actions/categories.ts`
- [x] 4.2 移动 `lib/actions/posts.ts` → `server/actions/posts.ts`
- [x] 4.3 移动 `lib/actions/settings.ts` → `server/actions/settings.ts`
- [x] 4.4 移动 `lib/actions/tags.ts` → `server/actions/tags.ts`
- [x] 4.5 更新所有 action 文件内部引用：`@/lib/db` → `@/server/db`
- [x] 4.6 更新所有 action 文件内部引用：`@/lib/auth` → `@/server/auth`
- [x] 4.7 删除空目录 `lib/actions/`

## 5. 重组 lib 目录为工具库

- [x] 5.1 移动 `lib/data.ts` → `lib/data/index.ts`，添加 `@deprecated` 注释
- [x] 5.2 移动 `lib/types.ts` → `lib/types/index.ts`
- [x] 5.3 移动 `lib/utils.ts` → `lib/utils/index.ts`
- [x] 5.4 验证 `lib/` 目录仅包含 `data/`、`types/`、`utils/` 三个子目录

## 6. 更新所有引用路径

- [x] 6.1 更新 `app/admin/categories/page.tsx` 的引用
- [x] 6.2 更新 `app/admin/drafts/page.tsx` 的引用
- [x] 6.3 更新 `app/admin/posts/new/page.tsx` 的引用
- [x] 6.4 更新 `app/admin/posts/page.tsx` 的引用
- [x] 6.5 更新 `app/admin/posts/[id]/edit/page.tsx` 的引用
- [x] 6.6 更新 `app/admin/settings/page.tsx` 的引用
- [x] 6.7 更新 `app/admin/tags/page.tsx` 的引用
- [x] 6.8 更新 `app/[locale]/post/[id]/page.tsx` 的引用
- [x] 6.9 更新 `components/admin/category-form.tsx` 的引用
- [x] 6.10 更新 `components/admin/tag-form.tsx` 的引用
- [x] 6.11 更新 `server/actions/categories.ts` 的内部引用
- [x] 6.12 更新 `server/actions/posts.ts` 的内部引用
- [x] 6.13 更新 `server/actions/settings.ts` 的内部引用
- [x] 6.14 更新 `server/actions/tags.ts` 的内部引用
- [x] 6.15 更新 `server/auth/config.ts` 的内部引用

## 7. 验证重构结果

- [x] 7.1 运行 TypeScript 编译检查，确保无类型错误（注：发现一个与重构无关的已存在类型问题）
- [ ] 7.2 测试管理后台 - 文章列表页
- [ ] 7.3 测试管理后台 - 文章编辑页
- [ ] 7.4 测试管理后台 - 文章新建页
- [ ] 7.5 测试管理后台 - 分类管理
- [ ] 7.6 测试管理后台 - 标签管理
- [ ] 7.7 测试管理后台 - 设置页面
- [ ] 7.8 测试前台 - 文章详情页 SSR
- [ ] 7.9 测试登录功能
- [ ] 7.10 测试登出功能
- [ ] 7.11 检查所有页面无 console 错误
