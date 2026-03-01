## ADDED Requirements

### Requirement: 管理端统计 API 端点
系统应提供 `/api/admin/stats` 端点，用于获取管理端首页所需的统计数据。

#### 场景：请求统计数据
- **当** 向 `/api/admin/stats` 发出 GET 请求时
- **且** 用户已通过认证
- **则** 系统返回统计数据
- **且** 响应状态为 200

#### 场景：统计数据响应格式
- **当** 请求 `/api/admin/stats` 成功时
- **则** 响应具有 `Content-Type: application/json`
- **且** 响应体包含以下字段：
  - `totalPosts`: 文章总数（整数）
  - `publishedPosts`: 已发布文章数（整数）
  - `draftPosts`: 草稿文章数（整数）
  - `recentPosts`: 最近7天新增文章数（整数）

#### 场景：统计端点需要认证
- **当** 向 `/api/admin/stats` 发出请求
- **且** 用户未登录
- **则** 系统返回 401 状态码
- **且** 响应包含错误消息"未认证"

### Requirement: 管理端 API 路由前缀
系统应使用 `/api/admin/` 前缀来标识管理端专用的 API 端点。

#### 场景：管理端 API 路由
- **当** 创建管理端专用 API 时
- **则** 路由位于 `/app/api/admin/` 目录下
- **且** 所有管理端 API 共享 `/api/admin/` 前缀
