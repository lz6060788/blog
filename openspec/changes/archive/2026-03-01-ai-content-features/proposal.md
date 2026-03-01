## Why

当前博客系统缺乏自动化内容处理能力，每次发布文章都需要手动编写摘要，增加了内容创作的工作量。随着 AI 技术的成熟，集成 AI 能力可以显著提升内容创作效率，改善用户体验。现在引入 AI 功能为未来的智能搜索、自动封面生成等高级特性奠定基础。

## What Changes

- **新增 AI 服务集成模块**：提供统一的 AI 服务调用接口，优先支持中国大陆 AI 提供商（DeepSeek、智谱 GLM、通义千问等）
- **文章摘要手动生成**：在文章新建和详情页通过按钮手动触发 AI 生成摘要，生成期间锁定编辑和发布
- **管理后台 AI 配置**：支持在数据库中配置多个 AI 模型，为不同功能分配不同模型
- **AI 调用日志与错误处理**：记录 AI 调用历史，处理 API 失败场景
- **数据库 schema 扩展**：新增 AI 配置表，扩展 posts 表以存储 AI 生成的摘要和相关元数据

## Capabilities

### New Capabilities

- `ai-service-integration`: AI 服务集成能力，提供统一的 AI 服务调用接口，支持摘要生成等 AI 功能
- `ai-service-configuration`: AI 服务配置能力，允许管理员在后台配置多个 AI 模型，为不同功能（摘要、封面、搜索）分配不同模型

### Modified Capabilities

- `server-api`: 扩展现有 API 以支持 AI 摘要生成功能
- `admin-dashboard-stats`: 管理后台新增 AI 配置管理界面

## Impact

**技术栈**：
- 新增依赖：Vercel AI SDK（统一接口支持多提供商）
- 数据库迁移：新增 ai_model_configs 表，扩展 posts 表

**代码影响**：
- `server/` 目录：新增 `server/ai/` 模块，包含服务调用逻辑
- `app/admin/settings/`：扩展现有设置页面，新增 AI 模型配置和功能映射卡片
- `app/admin/ai/logs/`：新增 AI 调用日志查看页面
- `app/admin/posts/`：文章新建和详情页添加"生成摘要"按钮

**API 变更**：
- `POST /api/admin/posts/[id]/generate-summary`：触发 AI 摘要生成
- `GET /api/admin/posts/[id]/ai-summary-status`：轮询摘要生成状态
- `GET /api/admin/ai/model-configs`：获取所有模型配置
- `POST /api/admin/ai/model-configs`：创建新模型配置
- `PUT /api/admin/ai/model-configs/[id]`：更新模型配置
- `DELETE /api/admin/ai/model-configs/[id]`：删除模型配置
- `POST /api/admin/ai/model-configs/[id]/test`：测试模型配置
- `GET /api/admin/ai/default-models`：获取各功能的默认模型映射

**外部依赖**：
- AI 服务提供商 API（优先中国大陆服务：DeepSeek、智谱 GLM、通义千问等）
