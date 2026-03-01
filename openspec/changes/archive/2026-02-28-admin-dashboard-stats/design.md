## Context

当前管理端首页 (`app/admin/page.tsx`) 使用硬编码的静态统计数据。博客系统已经有完整的数据库 schema 和查询模块 (`server/db/queries/`)，但缺少统计相关的查询功能。

现有技术栈：
- 数据库：SQLite + Drizzle ORM
- 查询层：`server/db/queries/posts.ts` 等模块
- API 路由：App Router (`app/api/`)
- 管理端：Next.js Server Components

## Goals / Non-Goals

**Goals:**
- 提供实时的文章统计数据（总数、已发布、草稿、最近7天新增）
- 保持代码结构一致性，复用现有的查询模式
- 确保统计查询的性能，避免全表扫描
- 提供类型安全的 API 响应

**Non-Goals:**
- 复杂的图表可视化（仅数字统计卡片）
- 历史趋势数据存储（仅计算当前统计数据）
- 细粒度的权限控制（管理端已有白名单保护）
- 实时数据推送（页面刷新时获取最新数据）

## Decisions

### 1. 统计查询模块位置
**决策**：在 `server/db/queries/` 下创建独立的 `stats.ts` 模块

**理由**：
- 保持与现有查询模块结构一致（`posts.ts`, `categories.ts`, `tags.ts`, `settings.ts`）
- 统计逻辑集中管理，便于维护和测试
- 可被其他模块复用（如将来需要统计信息导出）

**替代方案**：将统计函数添加到 `posts.ts` 中
- **拒绝原因**：`posts.ts` 已有较多 CRUD 操作，添加统计功能会使其职责过重

### 2. API 路由设计
**决策**：创建 `/api/admin/stats` GET 端点

**理由**：
- RESTful 风格，资源名称清晰
- 符合现有 API 结构（`/api/admin/*` 前缀用于管理端 API）
- 简单的 GET 请求，无需复杂参数

**替代方案**：使用 Server Actions
- **拒绝原因**：当前项目未采用 Server Actions 模式，保持 API 路由一致性

### 3. 管理端页面渲染策略
**决策**：将 `app/admin/page.tsx` 改为异步服务端组件

**理由**：
- Next.js 14+ 推荐使用 App Router 的 Server Components
- 数据在服务端获取，减少客户端请求
- 自动利用 React Server Components 的流式渲染

**替代方案**：保持客户端组件，使用 SWR/Tan Query 获取数据
- **拒绝原因**：增加客户端复杂度，不符合项目当前架构方向

### 4. 统计数据缓存
**决策**：不实现缓存层，每次请求都从数据库计算

**理由**：
- 统计数据查询简单（COUNT 操作），性能影响可忽略
- 管理端访问频率低，无需复杂缓存
- 简化实现，减少 bug 风险

**替代方案**：使用 Next.js 数据缓存或 Redis
- **拒绝原因**：过度工程化，当前需求不需要

## Risks / Trade-offs

### Risk: 统计查询性能随数据增长下降
**Mitigation**: 当前使用 COUNT 查询，在合理数据量（<10万文章）下性能可接受。如未来出现性能问题，可考虑添加数据库索引或预计算表。

### Trade-off: 无历史趋势数据
当前设计仅提供当前统计快照，不存储历史数据。这意味着管理员无法查看文章数量随时间的变化趋势。
**接受原因**：历史趋势属于分析功能，超出当前需求范围。可在后续变更中通过添加 analytics 表实现。

### Risk: 最近7天统计的时区问题
使用 `Date()` 计算时间区间可能存在时区不一致问题。
**Mitigation**: 统一使用数据库时间或 UTC 时间，在 spec 中明确时间计算规则。

## Migration Plan

1. 创建 `server/db/queries/stats.ts` 统计查询模块
2. 创建 `app/api/admin/stats/route.ts` API 路由
3. 改造 `app/admin/page.tsx` 为异步组件并调用 API
4. 本地测试验证统计数据的正确性
5. 提交变更

**Rollback**：如出现问题，可快速回滚到之前的静态数据版本。

## Open Questions

无。本变更设计清晰，技术选型明确。
