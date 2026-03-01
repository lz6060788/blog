# Server API - AI 功能扩展

## ADDED Requirements

### Requirement: 手动触发生成摘要 API
系统应提供 API 端点允许手动触发 AI 摘要生成。

#### 场景：触发摘要生成
- **当** 向 `POST /api/admin/posts/[id]/generate-summary` 发出请求时
- **且** 用户已通过管理员认证
- **则** 系统设置 `ai_summary_status` 为 'generating'
- **且** 立即返回 202 响应（异步处理）
- **且** 后台异步调用 AI 服务生成摘要

#### 场景：生成中的重复请求
- **当** 向 `POST /api/admin/posts/[id]/generate-summary` 发出请求时
- **且** 该文章的 `ai_summary_status` 已经是 'generating'
- **则** 系统返回 409 冲突错误
- **且** 错误消息："摘要生成中，请等待完成"

#### 场景：AI 配置未检查
- **当** 向 `POST /api/admin/posts/[id]/generate-summary` 发出请求时
- **且** 摘要功能的模型配置不存在或被禁用
- **则** 系统返回 400 错误
- **且** 错误消息："请先在管理后台配置 AI 模型"

### Requirement: 文章响应包含 AI 摘要信息
系统应在文章 API 响应中包含 AI 摘要相关字段。

#### 场景：获取单篇文章包含摘要
- **当** 向 `GET /api/admin/posts/[id]` 发出请求时
- **则** 响应包含以下字段：
  - `aiSummary`: AI 生成的摘要文本（如果存在）
  - `aiSummaryStatus`: 摘要生成状态
  - `aiSummaryGeneratedAt`: 摘要生成时间

#### 场景：获取文章列表包含摘要状态
- **当** 向 `GET /api/admin/posts` 发出请求时
- **则** 每篇文章包含 `aiSummaryStatus` 字段
- **且** 不包含完整的 `aiSummary` 文本（减少响应体积）

### Requirement: 轮询摘要生成状态
系统应提供 API 端点查询文章的摘要生成状态。

#### 场景：查询摘要状态
- **当** 向 `GET /api/admin/posts/[id]/ai-summary-status` 发出请求时
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
- **且** 该文章的 `ai_summary_status` 为 'generating'
- **则** 系统返回 409 冲突错误
- **且** 错误消息："摘要生成中，请等待完成后再发布"

#### 场景：生成期间保存被拒绝
- **当** 向 `PUT /api/admin/posts/[id]` 发出请求时
- **且** 该文章的 `ai_summary_status` 为 'generating'
- **则** 系统返回 409 冲突错误
- **且** 错误消息："摘要生成中，请等待完成后再编辑"

### Requirement: AI 模型配置管理 API
系统应提供 AI 模型配置的 CRUD API。

#### 场景：获取所有模型配置
- **当** 向 `GET /api/admin/ai/model-configs` 发出请求时
- **且** 用户已通过管理员认证
- **则** 系统返回所有模型配置列表
- **且** API Key 脱敏（只显示前 4 位）
- **且** 响应状态为 200

#### 场景：创建模型配置
- **当** 向 `POST /api/admin/ai/model-configs` 发出请求时
- **且** 请求体包含有效配置数据（name、provider、model、apiKey 等）
- **且** 用户已通过管理员认证
- **则** 系统创建新配置
- **且** API Key 加密后存储
- **且** 响应状态为 201

#### 场景：更新模型配置
- **当** 向 `PUT /api/admin/ai/model-configs/[id]` 发出请求时
- **且** 请求体包含更新后的配置数据
- **且** 用户已通过管理员认证
- **则** 系统更新指定配置
- **且** 响应状态为 200

#### 场景：删除模型配置
- **当** 向 `DELETE /api/admin/ai/model-configs/[id]` 发出请求时
- **且** 用户已通过管理员认证
- **则** 系统删除指定配置
- **且** 如果配置被功能映射引用，返回 400 错误
- **且** 成功时响应状态为 204

#### 场景：测试模型配置
- **当** 向 `POST /api/admin/ai/model-configs/[id]/test` 发出请求时
- **且** 用户已通过管理员认证
- **则** 系统使用该配置调用 AI 服务
- **且** 成功时返回 200 和测试结果
- **且** 失败时返回 400 和错误信息

### Requirement: 功能映射管理 API
系统应提供功能与模型配置映射的 API。

#### 场景：获取功能映射
- **当** 向 `GET /api/admin/ai/function-mappings` 发出请求时
- **且** 用户已通过管理员认证
- **则** 系统返回所有功能映射
- **且** 响应状态为 200

#### 场景：更新功能映射
- **当** 向 `PUT /api/admin/ai/function-mappings` 发出请求时
- **且** 请求体包含 `{ functionName, modelConfigId }`
- **且** 用户已通过管理员认证
- **则** 系统更新或创建功能映射
- **且** 响应状态为 200

#### 场景：获取默认模型配置
- **当** 向 `GET /api/admin/ai/default-models` 发出请求时
- **且** 用户已通过管理员认证
- **则** 系统返回各功能的默认模型配置映射
- **且** 响应格式：`{ summary: { id, name, model, provider }, cover: {...}, search: {...} }`

### Requirement: AI 调用日志查询 API
系统应提供查询 AI 调用日志的 API。

#### 场景：查询 AI 调用日志
- **当** 向 `GET /api/admin/ai/logs` 发出请求时
- **且** 用户已通过管理员认证
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
- **且** 用户未在管理员白名单中
- **则** 系统返回 403 禁止访问
- **且** 响应包含错误消息"权限不足"

#### 场景：AI 日志 API 需要管理员权限
- **当** 访问 `/api/admin/ai/logs` 时
- **且** 用户未在管理员白名单中
- **则** 系统返回 403 禁止访问

## MODIFIED Requirements

（此变更不涉及修改现有 API 的行为，仅新增 AI 摘要相关 API 端点）
