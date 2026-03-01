## 1. 统计查询模块

- [x] 1.1 创建 `server/db/queries/stats.ts` 模块文件
- [x] 1.2 实现 `getTotalPosts()` 函数，返回所有文章总数
- [x] 1.3 实现 `getPublishedPostsCount()` 函数，返回已发布文章数
- [x] 1.4 实现 `getDraftPostsCount()` 函数，返回草稿文章数
- [x] 1.5 实现 `getRecentPostsCount()` 函数，返回最近7天新增文章数
- [x] 1.6 实现 `getDashboardStats()` 聚合函数，返回所有统计数据对象
- [x] 1.7 添加 TypeScript 类型定义 `DashboardStats`

## 2. API 路由

- [x] 2.1 创建 `app/api/admin/stats/route.ts` 文件
- [x] 2.2 实现 GET 请求处理器，调用 `getDashboardStats()`
- [x] 2.3 添加认证检查，使用 `auth()` 验证用户登录状态
- [x] 2.4 处理未认证情况，返回 401 状态码
- [x] 2.5 返回 JSON 格式的统计数据响应
- [x] 2.6 添加错误处理，捕获数据库异常返回 500

## 3. 管理端首页改造

- [x] 3.1 修改 `app/admin/page.tsx`，移除硬编码的 stats 数据
- [x] 3.2 将页面组件改为异步函数组件
- [x] 3.3 在组件中调用统计查询函数获取真实数据
- [x] 3.4 添加加载状态处理（使用服务端组件流式渲染）
- [x] 3.5 更新统计卡片显示从 API 获取的数据
- [x] 3.6 确保页面保持 `export const dynamic = 'force-dynamic'` 配置

## 4. 测试验证

- [x] 4.1 TypeScript 编译检查通过，无类型错误
- [ ] 4.2 本地启动开发服务器，验证 API 路由正常响应
- [ ] 4.3 测试未登录用户访问 stats API，确认返回 401
- [ ] 4.4 以管理员身份登录，访问管理端首页
- [ ] 4.5 验证统计数据显示正确，与数据库实际数据一致
- [ ] 4.6 创建新文章，刷新首页验证统计数据更新
- [ ] 4.7 发布草稿文章，验证已发布/草稿数量变化
