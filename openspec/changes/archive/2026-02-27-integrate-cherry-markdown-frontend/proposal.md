## Why

当前前台文章详情页使用简单的正则表达式手动解析 Markdown，只支持基础语法（标题、段落、列表、代码块）。这种方式功能受限，无法支持更多 Markdown 特性（表格、引用、任务列表、数学公式等），且维护成本高。后台已集成 Cherry Markdown 编辑器，需要在前台实现相同的渲染能力以保持编辑与预览的一致性。

## What Changes

- **新增前台 Markdown 预览组件**：创建基于 Cherry Markdown 的只读预览组件，支持完整的 Markdown 语法
- **重构文章详情页**：将现有的手动解析逻辑替换为 Cherry Markdown 预览组件
- **保持样式一致性**：确保前台预览样式与当前主题系统（深色/浅色模式）兼容

## Capabilities

### New Capabilities
- `cherry-markdown-preview`: Cherry Markdown 前台预览能力，提供只读的 Markdown 渲染组件，支持完整 Markdown 语法、代码高亮、表格、数学公式等特性

### Modified Capabilities
- 无现有能力需要修改，这是纯新增功能

## Impact

**影响范围：**
- **代码变更**：修改 `app/[locale]/post/[id]/page.tsx`，新增 `components/cherry-preview.tsx`
- **依赖项**：复用现有的 Cherry Markdown 依赖，无需新增依赖
- **API 变更**：无
- **用户体验**：提升前台文章展示的丰富度和一致性
