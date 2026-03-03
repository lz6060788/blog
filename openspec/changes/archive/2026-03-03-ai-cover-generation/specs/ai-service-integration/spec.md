# AI Service Integration - Delta

## MODIFIED Requirements

### Requirement: AI 服务基础架构
系统应提供可扩展的 AI 服务集成基础架构，支持多种 AI 提供商和多种生成能力。

#### 场景：支持多种 AI 提供商
- **当** 系统初始化 AI 服务时
- **则** 支持至少以下提供商：DeepSeek、智谱 GLM、通义千问、月之暗面 Kimi、百川智能
- **且** 支持国际提供商作为备选：OpenAI
- **且** 提供统一的调用接口，屏蔽底层提供商差异
- **且** 支持文本生成和图像生成两种能力类型

#### 场景：AI 服务模块结构
- **当** 开发者查看 AI 服务代码时
- **则** AI 服务位于 `server/ai/` 目录
- **且** 包含客户端初始化、服务类、Prompt 模板、类型定义
- **且** 包含文本生成客户端（`text-client.ts`）和图像生成客户端（`image-client.ts`）

### Requirement: AI 服务配置读取
系统应从数据库读取 AI 服务配置，支持不同类型的能力。

#### 场景：按功能读取模型配置
- **当** AI 服务需要为某功能（如摘要、封面）生成内容时
- **则** 根据 function_name 查询 `ai_function_mappings` 表
- **且** 获取对应的 model_config_id
- **且** 从 `ai_model_configs` 表读取完整配置
- **且** 配置包含：provider、model、api_key_encrypted、base_url、max_tokens、temperature、capability_type
- **且** capability_type 区分 'text' 或 'image' 生成能力

#### 场景：配置不存在或被禁用
- **当** 查询的 model_config_id 为 NULL 或对应配置的 enabled=false 时
- **则** AI 服务返回错误"请先在管理后台配置 AI 模型"
- **且** 不调用任何 AI API

#### 场景：provider 值映射
- **当** 读取 provider 值时
- **则** 系统将其映射到对应的 AI SDK 创建函数
- **且** `deepseek` → 创建 OpenAI 兼容客户端，base_url=https://api.deepseek.com
- **且** `zhipu` → 创建智谱 SDK 客户端或 OpenAI 兼容客户端
- **且** `qwen` → 创建 OpenAI 兼容客户端，base_url=https://dashscope.aliyuncs.com/compatible-mode/v1，支持图像生成（通义万相）
- **且** `moonshot` → 创建 OpenAI 兼容客户端，base_url=https://api.moonshot.cn/v1
- **且** `baichuan` → 创建 OpenAI 兼容客户端，base_url=https://api.baichuan-ai.com/v1
- **且** `openai` → 创建 OpenAI 官方客户端，支持文本生成（GPT）和图像生成（DALL-E）

#### 场景：图像生成模型映射
- **当** capability_type 为 'image' 时
- **则** 使用图像生成专用的模型配置
- **且** `openai` → 使用 DALL-E 2 或 DALL-E 3 模型
- **且** `qwen` → 使用通义万相模型
- **且** `stability` → 使用 Stable Diffusion 模型（需要额外配置）

### Requirement: AI 调用日志记录
系统应记录所有 AI 调用的详细信息，包括文本和图像生成。

#### 场景：记录成功调用
- **当** AI 调用成功时
- **则** 系统在 `ai_call_logs` 表创建记录
- **且** 文本生成记录包含：post_id、model_config_id、action、provider、model、input_tokens、output_tokens、status、duration_ms
- **且** 图像生成记录包含：post_id、model_config_id、action、provider、model、image_size、image_format、status、duration_ms

#### 场景：记录失败调用
- **当** AI 调用失败时
- **则** 系统在 `ai_call_logs` 表创建记录
- **且** 记录包含：post_id、model_config_id、action、provider、model、status='failed'、error_message、duration_ms

#### 场景：查询调用日志
- **当** 管理员需要排查 AI 问题
- **则** 可以查询 `ai_call_logs` 表获取历史调用记录
- **且** 可按 post_id、status、时间范围筛选
- **且** 可按 action 类型筛选（summary-generation、cover-generation）

### Requirement: Token 使用量跟踪
系统应跟踪 AI 服务的 Token 使用量和图像生成成本。

#### 场景：记录输入输出 Token
- **当** 文本生成调用完成时
- **则** 系统从 API 响应中提取 input_tokens 和 output_tokens
- **且** 将使用量记录到 `ai_call_logs` 表
- **且** 用于成本监控和预算控制

#### 场景：记录图像生成成本
- **当** 图像生成调用完成时
- **则** 系统从 API 响应中提取图像尺寸、质量和预估成本
- **且** 将使用量记录到 `ai_call_logs` 表的 image_cost 字段
- **且** 用于成本监控和预算控制

## ADDED Requirements

### Requirement: AI 图像生成服务
系统应提供 AI 图像生成服务，支持多种图像生成提供商。

#### 场景：初始化图像生成客户端
- **当** 系统初始化图像生成服务时
- **则** 根据 provider 配置创建对应的图像生成客户端
- **且** 客户端支持 generateImage(prompt, options) 方法
- **且** 返回生成的图像 URL 或 Base64 数据

#### 场景：图像生成参数配置
- **当** 调用图像生成 API 时
- **则** 支持配置图像尺寸（width、height）
- **且** 支持配置图像质量（standard、hd）
- **且** 支持配置图像风格（vivid、natural）
- **且** 支持配置响应格式（url、b64_json）

#### 场景：图像生成响应处理
- **当** AI 返回图像生成结果时
- **则** 系统解析响应数据
- **且** 提取图像 URL 或 Base64 数据
- **且** 验证图像可访问性
- **且** 记录生成参数到日志

### Requirement: AI 功能映射扩展
系统应支持图像生成功能的模型配置映射。

#### 场景：新增封面生成功能映射
- **当** 管理员配置封面生成模型时
- **则** 在 `ai_function_mappings` 表新增记录
- **且** function_name 为 'cover-generation'
- **且** model_config_id 指向支持图像生成的配置
- **且** 系统自动验证配置的模型支持图像生成能力

#### 场景：功能类型验证
- **当** 配置模型到某功能时
- **则** 系统验证模型的 capability_type 与功能类型匹配
- **且** 'cover-generation' 必须映射到 capability_type='image' 的配置
- **且** 'summary-generation' 必须映射到 capability_type='text' 的配置
- **且** 类型不匹配时返回配置错误
