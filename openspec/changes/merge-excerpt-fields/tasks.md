## 1. 准备工作

- [x] 1.1 备份数据库
  - 导出当前数据库完整备份
  - 验证备份文件完整性
  - 记录数据库当前 schema 版本

- [x] 1.2 验证当前状态
  - 检查有多少文章存在 `aiSummary` 数据
  - 检查有多少文章存在 `excerpt` 数据
  - 生成数据迁移影响报告

## 2. 数据库迁移

- [ ] 2.1 创建数据迁移脚本
  - 创建 `server/db/migrations/merge-excerpt-fields.ts`
  - 实现将 `aiSummary` 迁移到 `excerpt` 的逻辑
  - 优先级：aiSummary > 手动 excerpt > 空
  - 添加事务确保迁移原子性
  - 添加回滚函数

- [ ] 2.2 测试迁移脚本
  - 在测试环境执行迁移
  - 验证数据正确性
  - 测试回滚功能

- [ ] 2.3 执行生产迁移
  - 确认备份完成
  - 执行迁移脚本
  - 验证迁移结果
  - 确认所有文章摘要正确

- [ ] 2.4 删除旧字段
  - 从 schema 移除 `aiSummary` 字段定义
  - 从 schema 移除 `aiSummaryGeneratedAt` 字段定义
  - 从 schema 移除 `aiSummaryStatus` 字段定义
  - 生成并执行 DDL 删除数据库列

## 3. 类型定义更新

- [ ] 3.1 更新数据库 Schema
  - 编辑 `server/db/schema.ts`
  - 移除 `aiSummary` 字段（posts 表）
  - 移除 `aiSummaryGeneratedAt` 字段（posts 表）
  - 移除 `aiSummaryStatus` 字段（posts 表）
  - 运行 drizzle-kit push 更新数据库

- [ ] 3.2 更新实体类型
  - 编辑 `lib/types/entities.ts`
  - 从 Post 类型移除 `aiSummary` 字段
  - 从 Post 类型移除 `aiSummaryGeneratedAt` 字段
  - 从 Post 类型移除 `aiSummaryStatus` 字段

- [ ] 3.3 验证类型检查
  - 运行 TypeScript 编译检查
  - 修复所有类型错误
  - 确保无遗漏的旧字段引用

## 4. AI 摘要服务更新

- [ ] 4.1 修改摘要生成服务
  - 编辑 `server/ai/services/summary.ts`
  - 移除对 `aiSummary` 字段的更新
  - 改为更新 `excerpt` 字段
  - 移除对 `aiSummaryGeneratedAt` 的更新
  - 移除对 `aiSummaryStatus` 的更新

- [ ] 4.2 更新状态查询逻辑
  - 修改为查询 `ai_call_logs` 表判断生成状态
  - 实现按 post_id 和 action='summary-generation' 查询
  - 按时间倒序获取最新状态

- [ ] 4.3 更新错误处理
  - 确保失败时记录到 `ai_call_logs`
  - 保持现有的重试机制
  - 验证错误提示正确

## 5. 数据访问层更新

- [ ] 5.1 更新文章查询
  - 编辑 `server/db/queries/posts.ts`
  - 移除 getPost() 中的 `aiSummary` 字段查询
  - 移除 getPost() 中的 `aiSummaryGeneratedAt` 字段查询
  - 移除 getPost() 中的 `aiSummaryStatus` 字段查询
  - 确保返回 `excerpt` 字段

- [ ] 5.2 更新文章列表查询
  - 检查 getPublishedPosts() 是否返回 AI 摘要字段
  - 如有，移除相关字段
  - 保持只返回 `excerpt` 字段

- [ ] 5.3 验证查询结果
  - 测试 getPost() 返回正确的 `excerpt`
  - 测试 getPublishedPosts() 返回正确的 `excerpt`
  - 验证不再返回 `aiSummary` 相关字段

## 6. API 路由更新

- [ ] 6.1 更新摘要生成 API
  - 编辑 `app/api/admin/posts/[id]/generate-summary/route.ts`
  - 移除设置 `aiSummaryStatus` 的逻辑
  - 改为依赖 `ai_call_logs` 表记录状态
  - 保持异步处理和 202 响应

- [ ] 6.2 更新状态查询 API
  - 编辑 `app/api/admin/posts/[id]/ai-summary-status/route.ts`
  - 改为查询 `ai_call_logs` 表获取状态
  - 返回 status、summary（excerpt）、error、generatedAt
  - 保持轮询机制

- [ ] 6.3 验证 API 行为
  - 测试触发生成摘要
  - 测试查询生成状态
  - 验证生成期间锁定机制
  - 验证生成失败处理

## 7. 管理端组件更新

- [ ] 7.1 更新 AI 摘要编辑器组件
  - 编辑 `components/admin/ai/ai-summary-editor.tsx`
  - 将所有 `aiSummary` 引用改为 `excerpt`
  - 将所有 `aiSummaryStatus` 引用改为查询 logs
  - 将所有 `aiSummaryGeneratedAt` 引用改为查询 logs
  - 更新显示逻辑

- [ ] 7.2 更新文章编辑页面
  - 编辑 `app/admin/posts/[id]/edit/page.tsx`
  - 检查是否有直接引用 `aiSummary` 字段
  - 如有，改为使用 `excerpt`
  - 验证数据传递正确

- [ ] 7.3 更新文章列表页面
  - 编辑 `app/admin/posts/page.tsx`
  - 检查是否显示 `aiSummaryStatus`
  - 如有，改为查询 `ai_call_logs` 表
  - 验证列表显示正确

## 8. 前端类型和接口更新

- [ ] 8.1 更新 Post 类型定义
  - 搜索所有使用 Post 类型的文件
  - 确保没有引用 `aiSummary` 字段
  - 确保没有引用 `aiSummaryGeneratedAt` 字段
  - 确保没有引用 `aiSummaryStatus` 字段

- [ ] 8.2 更新 API 响应类型
  - 检查 API 响应的 TypeScript 类型
  - 移除 AI 摘要相关字段定义
  - 确保 `excerpt` 字段类型正确

## 9. 测试验证

- [ ] 9.1 单元测试
  - 测试数据迁移脚本
  - 测试 AI 摘要生成服务
  - 测试状态查询逻辑

- [ ] 9.2 集成测试
  - 测试完整生成流程
  - 测试生成失败处理
  - 测试并发请求

- [ ] 9.3 UI 测试
  - 测试管理端文章编辑页
  - 测试 AI 摘要生成按钮
  - 测试生成状态显示
  - 测试重新生成功能

- [ ] 9.4 文章详情页测试
  - 测试文章详情页显示摘要
  - 验证摘要内容正确（来自 excerpt）
  - 验证不再显示截断内容

## 10. 回归测试

- [ ] 10.1 测试 AI 封面功能
  - 验证 AI 封面生成不受影响
  - 验证封面状态查询正常
  - 验证封面显示正常

- [ ] 10.2 测试文章其他功能
  - 测试文章创建
  - 测试文章编辑
  - 测试文章发布
  - 测试文章删除

- [ ] 10.3 性能测试
  - 测试状态查询性能（ai_call_logs 表）
  - 验证无性能下降
  - 验证数据库查询优化

## 11. 文档更新

- [ ] 11.1 更新 API 文档
  - 更新摘要生成 API 文档
  - 更新状态查询 API 文档
  - 标注字段变更

- [ ] 11.2 更新数据库文档
  - 更新 posts 表 schema 文档
  - 记录字段移除
  - 记录迁移脚本

- [ ] 11.3 更新变更日志
  - 记录架构变更
  - 记录迁移影响
  - 提供迁移指南

## 12. 清理工作

- [ ] 12.1 清理测试数据
  - 清理测试环境的测试数据
  - 验证生产环境数据正确

- [ ] 12.2 删除废弃代码
  - 搜索所有对 `aiSummary` 的引用
  - 确保全部已删除
  - 确保无死代码

- [ ] 12.3 提交变更
  - 提交所有代码变更
  - 提交数据库迁移记录
  - 创建 git tag 标记迁移版本
