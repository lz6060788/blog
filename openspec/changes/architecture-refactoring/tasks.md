## 1. 基础设施准备

- [x] 1.1 创建 `server/services/` 目录结构
- [x] 1.2 创建 `server/repositories/` 目录结构
- [x] 1.3 创建用户端组件目录结构
  - [x] 1.3.1 创建 `components/public/home/` 目录
  - [x] 1.3.2 创建 `components/public/posts/` 目录
  - [x] 1.3.3 创建 `components/public/archive/` 目录
  - [x] 1.3.4 创建 `components/public/categories/` 目录
  - [x] 1.3.5 创建 `components/public/tags/` 目录
  - [x] 1.3.6 创建 `components/public/search/` 目录
- [x] 1.4 创建管理端组件目录结构（重组现有 `components/admin/`）
  - [x] 1.4.1 创建 `components/admin/dashboard/` 目录
  - [x] 1.4.2 创建 `components/admin/posts/` 目录
  - [x] 1.4.3 创建 `components/admin/categories/` 目录
  - [x] 1.4.4 创建 `components/admin/tags/` 目录
  - [x] 1.4.5 创建 `components/admin/ai/` 目录
  - [x] 1.4.6 创建 `components/admin/settings/` 目录
  - [x] 1.4.7 创建 `components/admin/shared/` 目录
- [x] 1.5 创建共享业务组件目录 `components/shared/`
  - [x] 1.5.1 创建 `components/shared/post/` 目录
  - [x] 1.5.2 创建 `components/shared/author/` 目录
  - [x] 1.5.3 创建 `components/shared/navigation/` 目录
  - [x] 1.5.4 创建 `components/shared/feedback/` 目录
- [x] 1.6 创建布局组件目录结构
  - [x] 1.6.1 创建 `components/layout/header/` 目录
  - [x] 1.6.2 创建 `components/layout/footer/` 目录
  - [x] 1.6.3 创建 `components/layout/sidebar/` 目录
- [x] 1.7 创建编辑器组件目录结构
  - [x] 1.7.1 创建 `components/editor/cherry/` 目录
  - [x] 1.7.2 创建 `components/editor/preview/` 目录
  - [x] 1.7.3 创建 `components/editor/toolbar/` 目录
- [x] 1.8 创建 `app/styles/index.css` 统一样式入口文件
- [x] 1.9 在 `app/styles/index.css` 中导入所有现有样式文件
- [x] 1.10 更新 `app/layout.tsx`，移除分散的样式导入，仅引入 `index.css`
- [x] 1.11 规范 `lib/utils/` 目录，统一使用 `index.ts` 入口
- [x] 1.12 规范 `lib/types/` 目录，统一使用 `index.ts` 入口

## 2. 组件目录重组

### 2.1 用户端组件迁移
- [x] 2.1.1 移动首页组件到 `components/public/home/`（HeroSection, FeaturedPosts 等）
- [x] 2.1.2 移动文章页面组件到 `components/public/posts/`（PostList, PostDetail, PostContent 等）
- [x] 2.1.3 移动归档页面组件到 `components/public/archive/`（ArchiveGrid, TimelineList 等）
- [x] 2.1.4 移动分类页面组件到 `components/public/categories/`（CategoryList, CategoryCard 等）
- [x] 2.1.5 移动标签页面组件到 `components/public/tags/`（TagCloud, TagList 等）
- [x] 2.1.6 移动搜索组件到 `components/public/search/`（SearchBar, SearchResults 等）

### 2.2 管理端组件重组
- [x] 2.2.1 重组仪表盘组件到 `components/admin/dashboard/`（StatsCards, QuickActions 等）
- [x] 2.2.2 重组文章管理组件到 `components/admin/posts/`（PostTable, PostForm 等）
- [x] 2.2.3 重组分类管理组件到 `components/admin/categories/`
- [x] 2.2.4 重组标签管理组件到 `components/admin/tags/`
- [x] 2.2.5 重组 AI 配置组件到 `components/admin/ai/`
- [x] 2.2.6 重组系统设置组件到 `components/admin/settings/`
- [x] 2.2.7 提取管理端共享组件到 `components/admin/shared/`

### 2.3 共享业务组件提取
- [x] 2.3.1 提取文章共享组件到 `components/shared/post/`（PostCard, PostMeta, PostTags 等）
- [x] 2.3.2 提取作者共享组件到 `components/shared/author/`（AuthorCard, AuthorInfo 等）
- [x] 2.3.3 提取导航共享组件到 `components/shared/navigation/`（Pagination, Breadcrumbs 等）
- [x] 2.3.4 提取反馈共享组件到 `components/shared/feedback/`（LoadingSpinner, EmptyState 等）

### 2.4 布局和编辑器组件重组
- [x] 2.4.1 重组头部布局组件到 `components/layout/header/`（Header, Navigation, UserMenu 等）
- [x] 2.4.2 重组页脚布局组件到 `components/layout/footer/`（Footer, FooterLinks 等）
- [x] 2.4.3 重组侧边栏组件到 `components/layout/sidebar/`
- [x] 2.4.4 重组编辑器组件到 `components/editor/cherry/` 和 `components/editor/preview/`

### 2.5 组件索引文件和路径更新
- [x] 2.5.1 为所有组件目录创建 `index.ts` 索引文件，统一导出接口
- [x] 2.5.2 更新用户端页面（`app/`）中的组件导入路径
- [x] 2.5.3 更新管理端页面中的组件导入路径
- [x] 2.5.4 更新组件间的相互引用路径
- [x] 2.5.5 删除 `components/` 根目录下的所有未分类组件文件
- [x] 2.5.6 运行 TypeScript 编译检查，确保无路径错误
- [ ] 2.5.7 手动测试关键页面，确保组件渲染正常（需要用户启动开发服务器验证）

## 3. Service 层实现

- [x] 3.1 创建 `PostService` 服务类（`server/services/post.service.ts`）
- [x] 3.2 实现 `PostService.createPost()` 方法
- [x] 3.3 实现 `PostService.updatePost()` 方法
- [x] 3.4 实现 `PostService.deletePost()` 方法
- [x] 3.5 实现 `PostService.getPostById()` 方法
- [x] 3.6 实现 `PostService.getPostBySlug()` 方法
- [x] 3.7 实现 `PostService.listPublishedPosts()` 方法（支持分页和筛选）
- [x] 3.8 实现 `PostService.publishPost()` 方法（包含摘要生成状态检查）
- [x] 3.9 提取 `generateSlug` 工具函数到 `lib/utils/slug.ts`
- [ ] 3.10 整合现有 AI 服务到新 Service 层架构
- [ ] 3.11 创建 `StatsService` 服务类
- [ ] 3.12 创建 `AuthService` 服务类（如需要）

## 4. Repository 层实现

- [x] 4.1 创建 `PostRepository` 类（`server/repositories/post.repository.ts`）
- [x] 4.2 实现 `PostRepository` 的数据库连接注入
- [x] 4.3 实现 `PostRepository.findById()` 方法（使用关联查询优化）
- [x] 4.4 实现 `PostRepository.findBySlug()` 方法
- [x] 4.5 实现 `PostRepository.listPublished()` 方法（使用关联查询避免 N+1）
- [x] 4.6 实现 `PostRepository.create()` 方法（支持事务）
- [x] 4.7 实现 `PostRepository.update()` 方法
- [x] 4.8 实现 `PostRepository.delete()` 方法
- [x] 4.9 实现分页查询辅助方法（计算 offset、total 等）
- [ ] 4.10 处理数据库字段转换（如 temperature 整数转小数）
- [ ] 4.11 迁移 `server/db/queries/posts.ts` 中的查询逻辑到 Repository
- [ ] 4.12 创建其他 Repository（TagRepository, CategoryRepository 等）

## 5. 分页系统实现

- [ ] 5.1 创建分页参数类型定义（`lib/types/pagination.ts`）
- [ ] 5.2 创建分页响应类型定义（`lib/types/pagination-response.ts`）
- [ ] 5.3 实现分页参数验证函数
- [ ] 5.4 实现分页元数据计算函数（total, page, limit, totalPages, hasNext, hasPrev）
- [ ] 5.5 创建分页响应格式化工具函数
- [ ] 5.6 在 Repository 层实现分页查询逻辑
- [ ] 5.7 在 Service 层集成分页支持

## 6. API Routes 重构

- [ ] 6.1 重构 `app/api/posts/route.ts` GET 方法，使用 PostService
- [ ] 6.2 重构 `app/api/posts/route.ts` POST 方法，使用 PostService
- [ ] 6.3 重构 `app/api/posts/[id]/route.ts` GET 方法，使用 PostService
- [ ] 6.4 重构 `app/api/posts/[id]/route.ts` PUT 方法，使用 PostService
- [ ] 6.5 重构 `app/api/posts/[id]/route.ts` DELETE 方法，使用 PostService
- [ ] 6.6 重构管理端统计 API，使用 StatsService
- [ ] 6.7 重构 AI 相关 API，确保使用 AIService
- [ ] 6.8 统一错误处理逻辑（Service 异常 → HTTP 状态码）
- [ ] 6.9 移除 API Routes 中的重复业务逻辑代码
- [ ] 6.10 测试所有 API 端点，确保行为一致

## 7. Server Actions 重构

- [ ] 7.1 重构 `server/actions/posts.ts`，使用 PostService
- [ ] 7.2 移除 Server Actions 中的重复业务逻辑
- [ ] 7.3 确保 Server Actions 与 API Routes 行为一致
- [ ] 7.4 处理表单状态和错误消息
- [ ] 7.5 测试所有 Server Actions

## 8. 查询性能优化

- [ ] 8.1 使用 Drizzle 的 `with` 语法优化文章-分类关联查询
- [ ] 8.2 使用批量查询策略优化文章-标签多对多查询
- [ ] 8.3 验证所有查询无 N+1 问题（使用开发日志或 EXPLAIN）
- [ ] 8.4 为关键查询添加性能监控日志
- [ ] 8.5 运行性能测试，对比优化前后响应时间

## 9. 分页功能集成

- [ ] 9.1 在文章列表 API 中添加分页参数支持
- [ ] 9.2 在文章列表 API 中实现分页响应格式
- [ ] 9.3 实现向后兼容逻辑（未提供分页参数时返回所有数据）
- [ ] 9.4 添加分页参数验证
- [ ] 9.5 在分类筛选 API 中集成分页
- [ ] 9.6 在标签筛选 API 中集成分页
- [ ] 9.7 更新 API 文档或代码注释

## 10. 样式系统清理

- [ ] 10.1 检查 `app/styles/legacy/` 目录中的样式文件使用情况
- [ ] 10.2 将 legacy 样式迁移到 Tailwind 或新的语义化变量
- [ ] 10.3 删除 `app/styles/legacy/` 目录
- [ ] 10.4 验证所有页面样式正常显示

## 11. lib 目录规范化

- [ ] 11.1 将 `lib/utils.ts` 内容迁移到 `lib/utils/index.ts`
- [ ] 11.2 将 `lib/types.ts` 内容迁移到 `lib/types/index.ts`
- [ ] 11.3 删除根目录下的冗余文件
- [ ] 11.4 更新所有导入路径，统一使用 `@/lib/utils` 和 `@/lib/types`
- [ ] 11.5 创建子模块文件（如 `lib/utils/slug.ts`, `lib/utils/date.ts`）
- [ ] 11.6 在 `lib/utils/index.ts` 中统一导出所有工具函数

## 12. 测试与验证

- [ ] 12.1 运行所有单元测试
- [ ] 12.2 运行所有集成测试
- [ ] 12.3 手动测试文章列表页面（含分页）
- [ ] 12.4 手动测试文章详情页面
- [ ] 12.5 手动测试管理端文章 CRUD
- [ ] 12.6 手动测试 AI 摘要生成功能
- [ ] 12.7 使用开发工具检查网络请求，验证分页参数
- [ ] 12.8 检查控制台错误日志
- [ ] 12.9 性能测试：对比优化前后 API 响应时间
- [ ] 12.10 验证 N+1 问题已解决（检查数据库查询日志）

## 13. 文档更新

- [ ] 13.1 更新 README 或架构文档，反映新的分层架构
- [ ] 13.2 添加 Service 层开发规范文档
- [ ] 13.3 添加 Repository 层开发规范文档
- [ ] 13.4 更新组件目录结构说明
- [ ] 13.5 添加分页 API 使用示例

## 14. 清理与收尾

- [ ] 14.1 删除已迁移的旧代码文件
- [ ] 14.2 删除空的目录
- [ ] 14.3 运行 `npm run lint` 修复代码风格问题
- [ ] 14.4 运行 TypeScript 编译检查，确保无类型错误
- [ ] 14.5 检查并移除未使用的导入
- [ ] 14.6 提交代码到 Git（按模块分阶段提交）
- [ ] 14.7 创建 Pull Request 或合并到主分支
