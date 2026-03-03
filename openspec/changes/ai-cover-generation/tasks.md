## 1. 数据库迁移

- [x] 1.1 创建数据库迁移脚本，在 posts 表新增封面相关字段（cover_image_url, ai_cover_status, ai_cover_generated_at, ai_cover_prompt）
- [x] 1.2 更新 Drizzle schema 定义（server/db/schema.ts），添加 posts 表新字段
- [x] 1.3 执行数据库迁移脚本
- [x] 1.4 验证数据库迁移成功，确认新字段已添加
- [x] 1.5 更新 TypeScript 类型定义，包含封面相关字段

## 2. AI 服务扩展

- [x] 2.1 创建 AI 图像生成客户端（server/ai/clients/image-client.ts），支持 OpenAI DALL-E 和通义万相
- [x] 2.2 创建封面生成 Prompt 模板（server/ai/prompts/cover.ts），使用文章标题、摘要、标签生成结构化 Prompt
- [x] 2.3 创建封面生成服务（server/ai/services/cover.ts），实现封面生成核心逻辑
- [x] 2.4 扩展 AI 服务类型定义（server/ai/types.ts），添加图像生成相关类型
- [x] 2.5 在 ai_model_configs 表新增 capability_type 字段（text/image），区分文本和图像生成模型
- [x] 2.6 创建能力类型迁移脚本，为现有配置添加 capability_type 默认值
- [x] 2.7 在 ai_function_mappings 表新增 cover-generation 功能映射配置
- [x] 2.8 扩展 AI 调用日志记录（ai_call_logs 表），支持记录图像生成参数（image_size, image_format, image_cost）

## 3. 后端 API 开发

- [x] 3.1 创建封面生成 API 路由（POST /api/admin/posts/[id]/generate-cover）
- [x] 3.2 创建封面状态查询 API 路由（GET /api/admin/posts/[id]/ai-cover-status）
- [ ] 3.3 实现频率限制中间件，支持单篇限制（每天 5 次）和全局限制（每分钟 10 次）
- [x] 3.4 集成封面生成服务到 API 路由
- [ ] 3.5 实现图像上传到 COS 的逻辑（复用现有文件上传服务）
- [x] 3.6 实现图像生成错误处理和重试机制（最多 2 次，指数退避）
- [x] 3.7 添加 API 请求验证和错误响应处理

## 4. 前端组件开发

- [x] 4.1 创建封面预览组件（components/admin/editor/cover-preview.tsx）
- [x] 4.2 实现封面图片展示功能，支持来源标签（AI 生成/手动上传）
- [x] 4.3 实现"生成 AI 封面"按钮，绑定到封面生成 API
- [x] 4.4 实现"上传封面"按钮，支持文件选择和拖拽上传
- [x] 4.5 实现"删除封面"功能
- [x] 4.6 实现"重新生成"按钮
- [x] 4.7 扩展状态轮询 Hook（hooks/use-ai-generation-status.ts），支持封面状态轮询
- [x] 4.8 添加封面相关 TypeScript 类型定义
- [x] 4.9 集成封面预览组件到文章编辑页面
- [x] 4.10 实现封面生成期间的加载状态展示

## 5. 文章列表和详情页集成

- [x] 5.1 更新文章列表组件，展示封面图片
- [x] 5.2 实现封面图片懒加载优化
- [x] 5.3 更新文章详情页，顶部展示封面图片
- [x] 5.4 添加封面图片的响应式尺寸支持
- [x] 5.5 更新页面元数据，使用封面图片作为 Open Graph Image

## 6. 管理后台配置

- [ ] 6.1 在 AI 模型配置页面添加图像生成模型配置选项
- [ ] 6.2 添加功能映射配置，支持 cover-generation 功能
- [ ] 6.3 添加模型能力类型验证，确保图像生成功能映射到正确类型的模型

## 7. 测试

- [ ] 7.1 编写封面生成服务单元测试
- [ ] 7.2 编写图像生成客户端单元测试
- [ ] 7.3 编写 API 路由集成测试
- [ ] 7.4 编写频率限制功能测试
- [ ] 7.5 编写前端组件单元测试
- [ ] 7.6 端到端测试：完整封面生成流程
- [ ] 7.7 端到端测试：手动上传封面流程
- [ ] 7.8 端到端测试：错误处理和重试机制
- [ ] 7.9 端到端测试：频率限制
- [ ] 7.10 成本测试：验证生成成本符合预期

## 8. 文档和上线

- [ ] 8.1 更新 API 文档，添加封面生成 API 说明
- [ ] 8.2 编写功能使用说明文档
- [ ] 8.3 配置监控和告警（生成成功率、失败率、成本）
- [ ] 8.4 灰度发布，小范围测试
- [ ] 8.5 全量发布
- [ ] 8.6 监控上线后数据，优化 Prompt 和配置
