## 背景原因

当前博客系统文章封面需要用户手动上传或选择，缺乏自动化封面生成能力。高质量的文章封面能够提升内容吸引力和社交媒体分享效果。参考已实现的 AI 摘要生成功能，通过 AI 自动生成封面图片可以显著改善用户体验，减少内容创作成本，并保持视觉风格的一致性。

## 变更内容

- **新增 AI 封面生成服务**：扩展现有 AI 服务架构，支持图像生成能力，根据文章内容自动生成封面图片
- **新增数据库字段**：在 posts 表新增封面相关字段（封面图片 URL、生成状态、生成时间等）
- **新增封面上传 API**：提供封面上传到对象存储的接口（复用文件上传功能）
- **新增封面生成 API**：提供 `POST /api/admin/posts/[id]/generate-cover` 接口，触发 AI 封面生成
- **新增前端封面生成按钮**：在文章编辑页面集成"生成 AI 封面"功能，支持状态轮询
- **新增封面预览组件**：在编辑器中展示封面预览，支持重新生成和手动上传替换
- **集成 AI 图像生成模型**：支持主流图像生成模型（DALL-E、Stable Diffusion、Midjourney 或国内服务商）

## Capabilities

### 新增能力
- `ai-cover-generation`: AI 封面生成服务，根据文章标题和内容自动生成封面图片，支持多种图像生成模型

### 修改的能力
- `ai-service-integration`: 扩展现有 AI 服务集成能力，新增图像生成模型支持（在现有文本生成基础上增加图像生成能力）

## 影响范围

**数据库影响**：
- posts 表新增字段：
  - `cover_image_url`: TEXT，封面图片 URL
  - `ai_cover_status`: VARCHAR(20)，封面生成状态（pending/generating/done/failed）
  - `ai_cover_generated_at`: TIMESTAMP，封面生成时间
  - `ai_cover_prompt`: TEXT，生成封面使用的 Prompt（用于可追溯性）

**后端影响**：
- 扩展 `server/ai/` 模块，新增图像生成客户端和封面生成服务类
- 新增 `server/prompts/cover-generation-prompt.ts`，定义封面生成 Prompt 模板
- 扩展 `ai_function_mappings` 表，新增 `cover-generation` 功能映射
- 新增封面生成 API 路由
- 集成对象存储服务（复用现有 COS 文件上传功能）

**前端影响**：
- 修改文章编辑页面，新增封面预览和"生成 AI 封面"按钮
- 新增封面生成状态轮询逻辑（参考摘要生成的实现）
- 新增封面上传组件（支持手动上传替换 AI 生成的封面）
- 新增封面类型定义和错误处理

**外部依赖**：
- AI 图像生成服务（OpenAI DALL-E、Stability AI、或国内服务商如通义万相、百度文心一格等）
- 腾讯云 COS 服务（用于存储生成的封面图片）

**安全考虑**：
- 生成内容审核（防止不适宜内容）
- 生成频率限制（控制 API 成本）
- 图片大小和格式限制
- Prompt 注入防护
