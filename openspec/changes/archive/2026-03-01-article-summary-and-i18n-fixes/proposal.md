## Why

当前系统存在三个影响用户体验的问题：文章新建页面缺少 AI 摘要生成功能（与编辑页功能不一致），文章列表页的 AI 摘要状态显示异常，以及国际化切换功能失效。这些问题降低了管理后台的易用性和一致性。

## What Changes

### 1. 文章新建页面添加 AI 摘要功能
- 将编辑页的 AI 摘要功能提取为可复用组件
- 在新建文章页面集成该组件
- 提供"保存后自动生成摘要"勾选框，让用户选择是否在保存后自动触发生成
- 保存后根据用户选择跳转（勾选则跳转到编辑页并开始生成，否则跳转到列表页）

### 2. 修复文章列表页 AI 摘要状态显示
- 修复 `AISummaryStatusIcon` 组件的状态映射逻辑
- 确保状态值（pending/generating/done/failed）正确显示

### 3. 修复国际化切换功能
- 修复国际化配置问题
- 确保语言切换器正常工作
- 验证翻译文件加载机制
- 注意：翻译文件为常量对象，不需要显式类型注释

## Capabilities

### New Capabilities
- `admin-post-summary`: 文章编辑和新建页面的 AI 摘要功能，提供统一的摘要生成、状态显示和编辑体验

### Modified Capabilities
- `internationalization`: 修复国际化切换功能的实现问题

## Impact

### Affected Code
- `app/admin/posts/new/page.tsx` - 新建文章页面
- `app/admin/posts/[id]/edit/page.tsx` - 编辑文章页面
- `components/admin/ai-summary-status.tsx` - AI 摘要状态组件
- `locales/` - 国际化翻译文件和类型定义
- 可能需要创建新的共享组件 `components/admin/ai-summary-editor.tsx`

### Dependencies
- 现有的 AI 服务 API (`/api/admin/posts/[id]/generate-summary`)
- Cherry Markdown 编辑器
- next-themes 主题系统
