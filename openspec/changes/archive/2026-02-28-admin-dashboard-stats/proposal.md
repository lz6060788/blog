## Why

管理端首页当前显示的是硬编码的静态数据，无法反映博客的真实运营情况。管理员需要一个实时数据看板来了解文章数量、发布状态、发布趋势等关键指标，以便更好地管理博客内容。

## What Changes

- **新增统计服务模块**：在服务端 `server/db/queries/` 下创建统计查询函数，提供文章统计数据
- **新增统计 API 路由**：添加 `/api/admin/stats` 端点，返回管理端首页所需的数据
- **改造管理端首页**：将 `app/admin/page.tsx` 从客户端组件改为服务端组件，从 API 获取真实数据
- **支持多维度统计**：包括文章总数、已发布/草稿数量、最近7天新增文章数

## Capabilities

### New Capabilities
- `admin-dashboard-stats`: 提供管理端首页数据看板所需的统计数据获取能力，包括文章计数、发布状态分布、时间区间统计等

### Modified Capabilities
- `server-api`: 扩展现有 API 能力，添加管理员专用的统计数据端点

## Impact

- **服务端**：新增 `server/db/queries/stats.ts` 统计查询模块
- **API 路由**：新增 `app/api/admin/stats/route.ts`
- **管理端**：改造 `app/admin/page.tsx` 为异步服务端组件
- **数据库**：利用现有的 `posts` 表结构，无需 schema 变更
- **依赖**：无新增外部依赖
