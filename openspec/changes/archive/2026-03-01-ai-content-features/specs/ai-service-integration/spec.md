# AI Service Integration

## ADDED Requirements

### Requirement: AI 服务基础架构
系统应提供可扩展的 AI 服务集成基础架构，支持多种 AI 提供商。

#### 场景：支持多种 AI 提供商
- **当** 系统初始化 AI 服务时
- **则** 支持至少以下提供商：DeepSeek、智谱 GLM、通义千问、月之暗面 Kimi、百川智能
- **且** 支持国际提供商作为备选：OpenAI
- **且** 提供统一的调用接口，屏蔽底层提供商差异

#### 场景：AI 服务模块结构
- **当** 开发者查看 AI 服务代码时
- **则** AI 服务位于 `server/ai/` 目录
- **且** 包含客户端初始化、服务类、Prompt 模板、类型定义

### Requirement: AI 摘要生成服务
系统应提供文章摘要手动生成服务。

#### 场景：调用摘要生成服务
- **当** 用户点击"生成 AI 摘要"按钮时
- **则** 系统调用 AI 摘要生成服务
- **且** 传入文章标题和内容作为输入
- **且** 返回生成的摘要文本

#### 场景：摘要生成 Prompt 模板
- **当** AI 服务生成摘要时
- **则** 使用预定义的 Prompt 模板
- **且** Prompt 要求 AI 生成简洁的中文摘要（200 字以内）
- **且** Prompt 指导 AI 捕捉文章核心内容和关键信息

#### 场景：摘要语言自适应
- **当** 文章内容为非中文时
- **则** AI 应生成与文章内容相同语言的摘要
- **且** 系统应检测文章内容语言

### Requirement: 手动按钮触发 + 生成锁定
系统应通过按钮触发摘要生成，生成期间锁定编辑和发布。

#### 场景：按钮触发生成
- **当** 用户在文章编辑页点击"生成 AI 摘要"按钮时
- **则** 系统调用 `POST /api/admin/posts/[id]/generate-summary` API
- **且** 设置 `ai_summary_status` 为 'generating'
- **且** 立即返回响应，不等待 AI 生成完成

#### 场景：生成期间锁定编辑
- **当** `ai_summary_status` 为 'generating' 时
- **则** 禁用文章编辑表单（所有输入框只读）
- **且** 禁用"发布"和"保存"按钮
- **且** 显示"摘要生成中..."加载状态
- **且** 隐藏"生成 AI 摘要"按钮

#### 场景：生成期间锁定发布
- **当** 用户尝试发布文章且 `ai_summary_status` 为 'generating' 时
- **则** 系统拒绝发布请求
- **且** 返回错误提示"摘要生成中，请等待完成"
- **且** 前端禁用发布按钮（优先级高于服务端验证）

#### 场景：生成完成解锁
- **当** AI 摘要生成完成（成功或失败）时
- **则** 设置 `ai_summary_status` 为 'done' 或 'failed'
- **且** 更新 `ai_summary` 和 `ai_summary_generated_at` 字段（成功时）
- **且** 解锁编辑和发布按钮
- **且** 显示生成的摘要或错误提示
- **且** 显示"重新生成"按钮

#### 场景：前端轮询状态
- **当** 前端触发摘要生成后
- **则** 每 3 秒轮询一次 `GET /api/admin/posts/[id]/ai-summary-status`
- **当** 状态变为 'done' 或 'failed' 时
- **则** 停止轮询并更新 UI

#### 场景：允许重新生成
- **当** 用户再次点击"生成 AI 摘要"按钮（或"重新生成"按钮）时
- **则** 系统重新触发生成流程
- **且** 覆盖原有的摘要内容

### Requirement: 错误处理与重试
系统应实现完善的错误处理和重试机制。

#### 场景：AI 调用失败重试
- **当** AI 服务调用失败时（网络错误、超时、5xx 错误）
- **则** 系统自动重试最多 2 次
- **且** 重试采用指数退避策略（1 秒、2 秒）
- **且** 记录每次重试到日志

#### 场景：重试失败后提示
- **当** 重试 2 次后仍然失败时
- **则** 设置 `ai_summary_status` 为 'failed'
- **且** 记录错误信息到 `ai_call_logs` 表
- **且** 解锁编辑和发布按钮
- **且** 显示错误提示"摘要生成失败：{错误原因}"
- **且** 允许用户重试

#### 场景：配置未检查提示
- **当** AI 服务未配置模型时
- **则** 返回错误提示"请先在管理后台配置 AI 模型"
- **且** 提供跳转链接到配置页面

### Requirement: AI 调用日志记录
系统应记录所有 AI 调用的详细信息。

#### 场景：记录成功调用
- **当** AI 调用成功时
- **则** 系统在 `ai_call_logs` 表创建记录
- **且** 记录包含：post_id、model_config_id、action、provider、model、input_tokens、output_tokens、status、duration_ms

#### 场景：记录失败调用
- **当** AI 调用失败时
- **则** 系统在 `ai_call_logs` 表创建记录
- **且** 记录包含：post_id、model_config_id、action、provider、model、status='failed'、error_message、duration_ms

#### 场景：查询调用日志
- **当** 管理员需要排查 AI 问题
- **则** 可以查询 `ai_call_logs` 表获取历史调用记录
- **且** 可按 post_id、status、时间范围筛选

### Requirement: Token 使用量跟踪
系统应跟踪 AI 服务的 Token 使用量。

#### 场景：记录输入输出 Token
- **当** AI 调用完成时
- **则** 系统从 API 响应中提取 input_tokens 和 output_tokens
- **且** 将使用量记录到 `ai_call_logs` 表
- **且** 用于成本监控和预算控制

### Requirement: AI 服务配置读取
系统应从数据库读取 AI 服务配置。

#### 场景：按功能读取模型配置
- **当** AI 服务需要为某功能（如摘要）生成内容时
- **则** 根据 function_name 查询 `ai_function_mappings` 表
- **且** 获取对应的 model_config_id
- **且** 从 `ai_model_configs` 表读取完整配置
- **且** 配置包含：provider、model、api_key_encrypted、base_url、max_tokens、temperature

#### 场景：配置不存在或被禁用
- **当** 查询的 model_config_id 为 NULL 或对应配置的 enabled=false 时
- **则** AI 服务返回错误"请先在管理后台配置 AI 模型"
- **且** 不调用任何 AI API

#### 场景：provider 值映射
- **当** 读取 provider 值时
- **则** 系统将其映射到对应的 AI SDK 创建函数
- **且** `deepseek` → 创建 OpenAI 兼容客户端，base_url=https://api.deepseek.com
- **且** `zhipu` → 创建智谱 SDK 客户端或 OpenAI 兼容客户端
- **且** `qwen` → 创建 OpenAI 兼容客户端，base_url=https://dashscope.aliyuncs.com/compatible-mode/v1
- **且** `moonshot` → 创建 OpenAI 兼容客户端，base_url=https://api.moonshot.cn/v1
- **且** `baichuan` → 创建 OpenAI 兼容客户端，base_url=https://api.baichuan-ai.com/v1
- **且** `openai` → 创建 OpenAI 官方客户端

### Requirement: API Key 安全存储
系统应安全存储和使用 AI API Key。

#### 场景：加密存储 API Key
- **当** 保存 API Key 到数据库时
- **则** 使用 AES-256-GCM 加密算法加密
- **且** 加密密钥从环境变量 `ENCRYPTION_KEY` 获取（32 字节）
- **且** 存储加密后的密文到 `api_key_encrypted` 字段
- **且** 每个 API Key 使用唯一的随机 nonce/IV

#### 场景：解密使用 API Key
- **当** 调用 AI 服务时
- **则** 从数据库读取 `api_key_encrypted`
- **且** 使用 `ENCRYPTION_KEY` 解密
- **且** 解密后的密钥仅在内存中使用，不写入日志
- **且** 调用完成后立即从内存清除

#### 场景：日志中脱敏 API Key
- **当** 记录包含 API Key 的日志时
- **则** 只显示前 4 个字符，其余用 `****` 替代
- **且** 示例：`sk-12****` 而非完整密钥
