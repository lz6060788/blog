## MODIFIED Requirements

### Requirement: API 路由结构
系统应支持使用 Next.js App Router 模式在 `/app/api/` 下创建 API 路由，路由处理器应简化为仅处理 HTTP 层逻辑。

#### 场景：API 路由目录结构
- **当** 创建 API 路由时
- **则** 它们位于 `/app/api/` 目录下
- **且** 每个路由都有一个 `route.ts` 文件作为处理器

#### 场景：RESTful 资源路由
- **当** 创建资源 API 时（例如 posts）
- **则** 路由遵循 RESTful 约定（`/api/posts`、`/api/posts/[id]`）
- **且** HTTP 方法在同一个 `route.ts` 文件中处理
- **且** Route Handler 调用 Service 层方法处理业务逻辑

### Requirement: CRUD 操作处理器
系统应通过 API 路由处理器支持标准 CRUD 操作，业务逻辑委托给 Service 层。

#### 场景：GET 所有资源
- **当** 向集合端点（例如 `/api/posts`）发出 GET 请求时
- **则** Route Handler 解析查询参数（分页、筛选）
- **且** Route Handler 验证用户认证和权限
- **且** Route Handler 调用对应的 Service 方法（如 `PostService.listPosts()`）
- **且** Route Handler 格式化响应（JSON、状态码）
- **且** 系统返回资源数组和分页元数据
- **且** 响应状态为 200

#### 场景：GET 单个资源
- **当** 向资源端点（例如 `/api/posts/1`）发出 GET 请求时
- **则** Route Handler 解析路径参数
- **且** Route Handler 调用 Service 方法（如 `PostService.getPostById()`）
- **且** 系统返回单个资源对象
- **且** 如果找到，响应状态为 200
- **且** 如果未找到，响应状态为 404

#### 场景：POST 创建资源
- **当** 使用有效数据向集合端点发出 POST 请求时
- **则** Route Handler 解析请求体
- **且** Route Handler 验证数据格式
- **且** Route Handler 调用 Service 方法（如 `PostService.createPost()`）
- **则** 系统创建新资源
- **且** 响应状态为 201
- **且** 响应包含创建的资源

#### 场景：PUT 更新资源
- **当** 使用有效数据向资源端点发出 PUT 请求时
- **则** Route Handler 解析请求体
- **且** Route Handler 调用 Service 方法（如 `PostService.updatePost()`）
- **则** 系统更新资源
- **且** 如果成功，响应状态为 200
- **且** 如果未找到，响应状态为 404

#### 场景：DELETE 资源
- **当** 向资源端点发出 DELETE 请求时
- **则** Route Handler 调用 Service 方法（如 `PostService.deletePost()`）
- **则** 系统删除资源
- **且** 如果成功，响应状态为 204
- **且** 如果未找到，响应状态为 404

### Requirement: 运行时配置
系统应将 API 路由配置为使用 Node.js 运行时（SQLite 所需）。

#### 场景：运行时为 Node.js
- **当** 创建使用数据库的 API 路由时
- **则** 路由导出 `export const runtime = 'nodejs'`
- **且** 路由可以通过 `better-sqlite3` 访问 SQLite

### Requirement: 错误处理
系统应从 API 路由提供一致的错误响应，错误来源于 Service 层。

#### 场景：Service 层抛出业务异常
- **当** Service 层抛出业务异常时
- **则** API Route Handler 捕获异常
- **且** API 返回对应的 HTTP 状态码
- **且** 响应包含错误消息（来自 Service 层）

#### 场景：数据库错误
- **当** Service 层数据库操作失败时
- **则** Service 抛出数据库异常
- **且** API 返回 500 状态码
- **且** 响应包含错误消息

#### 场景：验证错误
- **当** Route Handler 验证请求数据失败时
- **则** API 返回 400 状态码
- **且** 响应包含验证错误详细信息

#### 场景：认证错误
- **当** 用户未认证访问受保护的端点时
- **则** Route Handler 检测会话不存在
- **且** API 返回 401 状态码
- **且** 响应包含错误消息"未认证"

#### 场景：权限错误
- **当** Service 层检测到权限不足时
- **则** Service 抛出权限异常
- **且** API 返回 403 状态码
- **且** 响应包含错误消息"权限不足"

### Requirement: JSON 请求/响应格式
系统应将 JSON 用于所有 API 请求和响应体。

#### 场景：接受 JSON 请求
- **当** 使用 `Content-Type: application/json` 发出请求时
- **则** 请求体被解析为 JSON

#### 场景：返回 JSON 响应
- **当** API 路由响应时
- **则** 响应具有 `Content-Type: application/json`
- **且** 主体是有效的 JSON

### Requirement: 数据库集成
系统应通过 Repository 层访问数据库，API 路由不应直接使用数据库客户端。

#### 场景：不再从 Route Handler 导入数据库客户端
- **当** API 路由处理器需要数据库访问时
- **则** 它不应从 `@/lib/db` 导入数据库客户端
- **且** 它应调用对应的 Service 方法
- **且** Service 方法通过 Repository 访问数据库

#### 场景：在请求处理中调用 Service
- **当** 收到 API 请求时
- **则** 处理器调用 Service 方法
- **且** Service 通过 Repository 查询数据库
- **且** 结果在响应中返回

### Requirement: 受保护的 API 路由
系统应支持要求用户认证的 API 路由，认证检查在 Route Handler 层进行。

#### 场景：受保护的 GET 端点
- **当** 向受保护的端点发出 GET 请求
- **且** Route Handler 检查会话
- **且** 用户已登录
- **则** Route Handler 调用 Service 方法
- **且** 系统返回请求的资源
- **且** 响应状态为 200

#### 场景：受保护的端点未认证
- **当** 向受保护的端点发出请求
- **且** Route Handler 检查会话
- **且** 用户未登录
- **则** Route Handler 返回 401 状态码
- **且** 响应包含错误消息"未认证"

### Requirement: 在 API 路由中访问会话
系统应允许 API 路由处理器访问当前用户会话，用于认证和权限检查。

#### 场景：获取当前用户
- **当** API 路由需要知道当前用户
- **则** 它使用 `auth()` 函数获取会话
- **且** 可以从会话中获取用户 ID 和信息
- **且** 将用户 ID 传递给 Service 层

#### 场景：检查认证状态
- **当** API 路由需要验证用户身份
- **则** 它检查会话是否存在
- **且** 如果不存在则返回 401 未认证
- **且** 如果存在则继续处理请求

### Requirement: 用户关联的数据访问
系统应允许 API 路由返回与当前用户关联的数据，用户 ID 从会话中获取。

#### 场景：获取用户专属资源
- **当** API 路由返回用户专属数据（如用户收藏）
- **则** Route Handler 从会话获取用户 ID
- **且** 将用户 ID 传递给 Service 方法
- **且** Service 通过 Repository 查询数据
- **且** 只返回属于该用户的数据
- **且** 防止用户访问其他用户的数据

### Requirement: 管理端统计 API 端点
系统应提供 `/api/admin/stats` 端点，用于获取管理端首页所需的统计数据，业务逻辑在 Service 层。

#### 场景：请求统计数据
- **当** 向 `/api/admin/stats` 发出 GET 请求时
- **且** Route Handler 检查用户认证和权限
- **且** 用户已通过认证和授权
- **则** Route Handler 调用 StatsService.getDashboardStats()
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
  - `aiGeneratedPosts`: 已生成 AI 摘要的文章数（整数）
  - `aiPendingPosts`: 正在生成摘要的文章数（整数）
  - `aiFailedPosts`: 摘要生成失败的文章数（整数）
  - `aiTotalTokens`: 今日 AI 调用总 Token 数（整数）

#### 场景：统计端点需要认证
- **当** 向 `/api/admin/stats` 发出请求
- **且** Route Handler 检查会话
- **且** 用户未登录
- **则** 系统返回 401 状态码
- **且** 响应包含错误消息"未认证"

### Requirement: 管理端 API 路由前缀
系统应使用 `/api/admin/` 前缀来标识管理端专用的 API 端点。

#### 场景：管理端 API 路由
- **当** 创建管理端专用 API 时
- **则** 路由位于 `/app/api/admin/` 目录下
- **且** 所有管理端 API 共享 `/api/admin/` 前缀

### Requirement: 手动触发生成摘要 API
系统应提供 API 端点允许手动触发 AI 摘要生成，业务逻辑在 AI Service 层。

#### 场景：触发摘要生成
- **当** 向 `POST /api/admin/posts/[id]/generate-summary` 发出请求时
- **且** Route Handler 检查管理员权限
- **且** 用户已通过管理员认证
- **则** Route Handler 调用 AIService.generateSummary(postId)
- **则** Service 设置 `ai_summary_status` 为 'generating'
- **且** 立即返回 202 响应（异步处理）
- **且** 后台异步调用 AI 服务生成摘要

#### 场景：生成中的重复请求
- **当** 向 `POST /api/admin/posts/[id]/generate-summary` 发出请求时
- **且** Route Handler 调用 AIService
- **且** Service 检测到该文章的 `ai_summary_status` 已经是 'generating'
- **则** Service 抛出冲突异常
- **且** 系统返回 409 冲突错误
- **且** 错误消息："摘要生成中，请等待完成"

#### 场景：AI 配置未检查
- **当** 向 `POST /api/admin/posts/[id]/generate-summary` 发出请求时
- **且** Route Handler 调用 AIService
- **且** Service 检测到摘要功能的模型配置不存在或被禁用
- **则** Service 抛出配置异常
- **且** 系统返回 400 错误
- **且** 错误消息："请先在管理后台配置 AI 模型"

### Requirement: 文章响应包含 AI 摘要信息
系统应在文章 API 响应中包含 AI 摘要相关字段。

#### 场景：获取单篇文章包含摘要
- **当** 向 `GET /api/admin/posts/[id]` 发出请求时
- **则** Route Handler 调用 PostService.getPostById()
- **则** 响应包含以下字段：
  - `aiSummary`: AI 生成的摘要文本（如果存在）
  - `aiSummaryStatus`: 摘要生成状态
  - `aiSummaryGeneratedAt`: 摘要生成时间

#### 场景：获取文章列表包含摘要状态
- **当** 向 `GET /api/admin/posts` 发出请求时
- **则** Route Handler 调用 PostService.listPosts()
- **则** 每篇文章包含 `aiSummaryStatus` 字段
- **且** 不包含完整的 `aiSummary` 文本（减少响应体积）

### Requirement: 轮询摘要生成状态
系统应提供 API 端点查询文章的摘要生成状态。

#### 场景：查询摘要状态
- **当** 向 `GET /api/admin/posts/[id]/ai-summary-status` 发出请求时
- **则** Route Handler 调用 AIService.getSummaryStatus(postId)
- **则** 系统返回摘要生成状态
- **且** 响应包含：
  - `status`: 'generating'、'done' 或 'failed'
  - `summary`: 摘要文本（仅当 status='done' 时）
  - `error`: 错误信息（仅当 status='failed' 时）
  - `generatedAt`: 生成时间（仅当 status='done' 时）

### Requirement: 生成期间拒绝发布
系统应确保摘要生成期间文章不能被发布。

#### 场景：生成期间发布被拒绝
- **当** 向 `PUT /api/admin/posts/[id]/publish` 发出请求时
- **则** Route Handler 调用 PostService.publishPost(postId)
- **且** Service 检测到该文章的 `ai_summary_status` 为 'generating'
- **则** Service 抛出状态异常
- **且** 系统返回 409 冲突错误
- **且** 错误消息："摘要生成中，请等待完成后再发布"

#### 场景：生成期间保存被拒绝
- **当** 向 `PUT /api/admin/posts/[id]` 发出请求时
- **则** Route Handler 调用 PostService.updatePost(postId, data)
- **且** Service 检测到该文章的 `ai_summary_status` 为 'generating'
- **则** Service 抛出状态异常
- **且** 系统返回 409 冲突错误
- **且** 错误消息："摘要生成中，请等待完成后再编辑"

### Requirement: AI 模型配置管理 API
系统应提供 AI 模型配置的 CRUD API，业务逻辑在 AI Service 层。

#### 场景：获取所有模型配置
- **当** 向 `GET /api/admin/ai/model-configs` 发出请求时
- **且** Route Handler 检查管理员权限
- **且** 用户已通过管理员认证
- **则** Route Handler 调用 AIService.listModelConfigs()
- **则** 系统返回所有模型配置列表
- **且** API Key 脱敏（只显示前 4 位）
- **且** 响应状态为 200

#### 场景：创建模型配置
- **当** 向 `POST /api/admin/ai/model-configs` 发出请求时
- **且** Route Handler 验证请求数据
- **且** 请求体包含有效配置数据（name、provider、model、apiKey 等）
- **且** 用户已通过管理员认证
- **则** Route Handler 调用 AIService.createModelConfig(data)
- **则** 系统创建新配置
- **且** Service 确保 API Key 加密后存储
- **且** 响应状态为 201

#### 场景：更新模型配置
- **当** 向 `PUT /api/admin/ai/model-configs/[id]` 发出请求时
- **且** Route Handler 验证请求数据
- **且** 请求体包含更新后的配置数据
- **且** 用户已通过管理员认证
- **则** Route Handler 调用 AIService.updateModelConfig(id, data)
- **则** 系统更新指定配置
- **且** 响应状态为 200

#### 场景：删除模型配置
- **当** 向 `DELETE /api/admin/ai/model-configs/[id]` 发出请求时
- **且** 用户已通过管理员认证
- **则** Route Handler 调用 AIService.deleteModelConfig(id)
- **则** 系统删除指定配置
- **且** Service 检查配置是否被功能映射引用
- **且** 如果被引用返回 400 错误
- **且** 成功时响应状态为 204

#### 场景：测试模型配置
- **当** 向 `POST /api/admin/ai/model-configs/[id]/test` 发出请求时
- **且** 用户已通过管理员认证
- **则** Route Handler 调用 AIService.testModelConfig(id)
- **则** 系统使用该配置调用 AI 服务
- **且** 成功时返回 200 和测试结果
- **且** 失败时返回 400 和错误信息

### Requirement: 功能映射管理 API
系统应提供功能与模型配置映射的 API，业务逻辑在 AI Service 层。

#### 场景：获取功能映射
- **当** 向 `GET /api/admin/ai/function-mappings` 发出请求时
- **且** 用户已通过管理员认证
- **则** Route Handler 调用 AIService.getFunctionMappings()
- **则** 系统返回所有功能映射
- **且** 响应状态为 200

#### 场景：更新功能映射
- **当** 向 `PUT /api/admin/ai/function-mappings` 发出请求时
- **且** Route Handler 验证请求数据
- **且** 请求体包含 `{ functionName, modelConfigId }`
- **且** 用户已通过管理员认证
- **则** Route Handler 调用 AIService.updateFunctionMapping(data)
- **则** 系统更新或创建功能映射
- **且** 响应状态为 200

#### 场景：获取默认模型配置
- **当** 向 `GET /api/admin/ai/default-models` 发出请求时
- **且** 用户已通过管理员认证
- **则** Route Handler 调用 AIService.getDefaultModels()
- **则** 系统返回各功能的默认模型配置映射
- **且** 响应格式：`{ summary: { id, name, model, provider }, cover: {...}, search: {...} }`

### Requirement: AI 调用日志查询 API
系统应提供查询 AI 调用日志的 API，支持分页和筛选。

#### 场景：查询 AI 调用日志
- **当** 向 `GET /api/admin/ai/logs` 发出请求时
- **且** 用户已通过管理员认证
- **则** Route Handler 解析查询参数（分页、筛选）
- **则** Route Handler 调用 AIService.listCallLogs(params)
- **则** 系统返回 AI 调用日志列表
- **且** 支持分页（page、limit 参数）
- **且** 支持筛选（postId、status、startDate、endDate 参数）

#### 场景：日志响应格式
- **当** 请求 `/api/admin/ai/logs` 成功时
- **则** 响应包含：
  - `logs`: 日志记录数组
  - `total`: 总记录数
  - `page`: 当前页码
  - `limit`: 每页记录数
- **且** 每条日志包含：id、postId、action、provider、model、inputTokens、outputTokens、status、errorMessage、durationMs、createdAt

### Requirement: API 权限控制扩展
系统应确保 AI 相关 API 需要管理员权限。

#### 场景：AI 模型配置 API 需要管理员权限
- **当** 访问 `/api/admin/ai/model-configs` 时
- **则** Route Handler 检查用户会话
- **且** 如果用户未在管理员白名单中
- **则** 系统返回 403 禁止访问
- **且** 响应包含错误消息"权限不足"

#### 场景：AI 日志 API 需要管理员权限
- **当** 访问 `/api/admin/ai/logs` 时
- **则** Route Handler 检查用户会话
- **且** 如果用户未在管理员白名单中
- **则** 系统返回 403 禁止访问
- **且** 响应包含错误消息"权限不足"

## REMOVED Requirements

无需求被移除，仅调整实现架构。
