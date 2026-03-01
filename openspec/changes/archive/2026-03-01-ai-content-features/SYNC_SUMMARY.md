# OpenSpec Delta Specs 同步摘要

## 同步日期
2026-03-01

## 变更标识
ai-content-features

## 同步的 Delta Specs

### 1. 修改规范：admin-dashboard-stats

**文件路径**: `D:\workspace\git\blog\openspec\specs\admin-dashboard-stats\spec.md`

**变更类型**: 修改 (MODIFIED)

**变更详情**:

#### 扩展现有需求：统计数据聚合接口
- 新增 AI 相关统计指标到响应结构
- 新增字段：
  - `aiGeneratedPosts`: 已生成 AI 摘要的文章数（整数）
  - `aiPendingPosts`: 正在生成摘要的文章数（整数）
  - `aiFailedPosts`: 摘要生成失败的文章数（整数）
  - `aiTotalTokens`: 今日 AI 调用总 Token 数（整数）

#### 新增的需求：

1. **AI 配置集成到设置页面**
   - 在现有设置页面集成 AI 模型配置和功能映射卡片
   - 提供完整的配置管理界面（添加、编辑、删除、测试）
   - 支持启用/禁用配置和功能映射分配

2. **AI 摘要生成状态指示**
   - 文章列表显示摘要生成状态标识（generating/done/failed）
   - 文章编辑页显示生成按钮和状态
   - 生成期间锁定编辑和发布功能
   - 支持实时状态轮询

3. **AI 调用日志查看**
   - 在管理后台侧边栏添加"AI 日志"菜单项
   - 提供日志查看界面，支持筛选和分页
   - 显示详细调用信息（时间、配置、文章、Token 使用量、状态等）

### 2. 新增规范：ai-service-configuration

**文件路径**: `D:\workspace\git\blog\openspec\specs\ai-service-configuration\spec.md`

**变更类型**: 新增 (ADDED)

**主要内容**:
- AI 模型配置管理界面（增删改查）
- AI 模型配置 API（CRUD 端点）
- 功能映射管理（为不同 AI 功能分配模型）
- 配置测试功能
- 配置验证（字段验证、格式验证、唯一性验证）
- AI 配置权限控制（仅管理员可访问）
- 配置 UI 交互优化（API Key 脱敏、保存提示、删除确认）
- 首次配置引导

### 3. 新增规范：ai-service-integration

**文件路径**: `D:\workspace\git\blog\openspec\specs\ai-service-integration\spec.md`

**变更类型**: 新增 (ADDED)

**主要内容**:
- AI 服务基础架构（支持多种 AI 提供商）
  - DeepSeek、智谱 GLM、通义千问、月之暗面、百川智能、OpenAI
  - 统一调用接口，屏蔽提供商差异
- AI 摘要生成服务
  - 手动按钮触发 + 生成期间锁定
  - 摘要语言自适应
  - Prompt 模板管理
- 错误处理与重试机制
  - 自动重试最多 2 次，指数退避策略
  - 失败后记录日志并允许用户重试
- AI 调用日志记录
  - 记录成功和失败调用的详细信息
  - 支持查询和筛选
- Token 使用量跟踪
  - 记录输入输出 Token
  - 用于成本监控和预算控制
- AI 服务配置读取
  - 按功能读取模型配置
  - provider 值映射到对应的 AI SDK
- API Key 安全存储
  - AES-256-GCM 加密算法
  - 从环境变量获取加密密钥
  - 日志中脱敏显示

### 4. 修改规范：server-api

**文件路径**: `D:\workspace\git\blog\openspec\specs\server-api\spec.md`

**变更类型**: 修改 (MODIFIED)

**变更详情**:

#### 扩展现有需求：管理端统计 API 端点
- 统计数据响应格式新增 AI 相关字段：
  - `aiGeneratedPosts`: 已生成 AI 摘要的文章数（整数）
  - `aiPendingPosts`: 正在生成摘要的文章数（整数）
  - `aiFailedPosts`: 摘要生成失败的文章数（整数）
  - `aiTotalTokens`: 今日 AI 调用总 Token 数（整数）

#### 新增的需求：

1. **手动触发生成摘要 API**
   - `POST /api/admin/posts/[id]/generate-summary`
   - 异步处理，返回 202 响应
   - 生成中的重复请求返回 409 冲突错误
   - AI 配置未检查时返回 400 错误

2. **文章响应包含 AI 摘要信息**
   - 获取单篇文章包含：aiSummary、aiSummaryStatus、aiSummaryGeneratedAt
   - 获取文章列表仅包含 aiSummaryStatus（减少响应体积）

3. **轮询摘要生成状态**
   - `GET /api/admin/posts/[id]/ai-summary-status`
   - 返回 status、summary、error、generatedAt

4. **生成期间拒绝发布**
   - 生成期间发布/保存返回 409 冲突错误

5. **AI 模型配置管理 API**
   - `GET /api/admin/ai/model-configs` - 获取所有配置
   - `POST /api/admin/ai/model-configs` - 创建配置
   - `PUT /api/admin/ai/model-configs/[id]` - 更新配置
   - `DELETE /api/admin/ai/model-configs/[id]` - 删除配置
   - `POST /api/admin/ai/model-configs/[id]/test` - 测试配置

6. **功能映射管理 API**
   - `GET /api/admin/ai/function-mappings` - 获取功能映射
   - `PUT /api/admin/ai/function-mappings` - 更新功能映射
   - `GET /api/admin/ai/default-models` - 获取默认模型配置

7. **AI 调用日志查询 API**
   - `GET /api/admin/ai/logs` - 查询调用日志
   - 支持分页和筛选参数

8. **API 权限控制扩展**
   - AI 模型配置 API 需要管理员权限
   - AI 日志 API 需要管理员权限

## 同步状态

- [x] 更新 admin-dashboard-stats 主规范文件
- [x] 创建 ai-service-configuration 主规范文件
- [x] 创建 ai-service-integration 主规范文件
- [x] 更新 server-api 主规范文件
- [x] 验证所有变更已正确应用

## 影响范围

### 新增文件
- `openspec/specs/ai-service-configuration/spec.md`
- `openspec/specs/ai-service-integration/spec.md`

### 修改文件
- `openspec/specs/admin-dashboard-stats/spec.md`
- `openspec/specs/server-api/spec.md`

### 无影响的文件
- 其他所有规范文件保持不变

## 验证清单

- [x] admin-dashboard-stats 规范已更新（新增 AI 配置集成、状态指示、日志查看需求）
- [x] ai-service-configuration 规范已创建（配置管理、API、测试、验证）
- [x] ai-service-integration 规范已创建（服务架构、摘要生成、错误处理、日志、安全）
- [x] server-api 规范已更新（新增 AI 相关 API 端点）
- [x] 所有 ADDED 需求已添加到主规范
- [x] 所有 MODIFIED 需求已更新到主规范
- [x] 无 REMOVED 需求（符合 delta spec）

## 下一步行动

建议在完成同步后：
1. 验证所有变更已正确应用到主规范文件
2. 如需要，使用 `openspec-archive-change` 技能归档此变更
3. 根据同步后的规范开始实现 AI 内容功能

## 相关文档

- Delta specs 源路径: `openspec/changes/ai-content-features/specs/`
- 主规范目标路径: `openspec/specs/`
