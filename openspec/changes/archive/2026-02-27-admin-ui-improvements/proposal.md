## Why

当前管理端存在多个 UI/UX 问题，影响用户体验和系统一致性：input 组件样式不统一、页面 title 缺失导致导航困难、文章列表信息不全影响效率、列表交互体验不佳、编辑页面存在布局问题（双滚动条、下拉框样式不合理、选择分类后画面抖动）。这些问题需要系统性优化以提升管理端用户体验。

## What Changes

- **Input 组件样式统一化**: 创建独立的 input 组件样式主题文件，替换项目中直接使用原生 input/textarea 的地方
- **管理端页面 Title 设置**: 为所有管理端页面添加适当的 title 标识
- **文章列表信息增强**: 在文章列表中显示分类、标签、字数等信息
- **文章列表交互优化**: 支持点击文章标题直接进入编辑页，添加交互动画和视觉反馈
- **文章编辑页布局优化**:
  - 修复页面双滚动条问题
  - 改进分类选择下拉框样式（可能引入新的 shadcn/ui 组件）
  - 解决选择分类/标签后画面抖动的问题（改变布局避免动态元素出现）

## Capabilities

### New Capabilities
- `admin-input-theme`: 统一的 input 组件样式主题系统
- `admin-page-titles`: 管理端页面标题系统
- `post-list-enhancements`: 文章列表增强功能（分类/标签/字数显示）
- `post-list-edit-interaction`: 文章列表到编辑页的交互优化
- `post-editor-layout`: 文章编辑器布局优化

### Modified Capabilities
- `shadcn-ui-components`: 扩展 input 相关组件的样式支持

## Impact

- **前端组件**: 需要创建/修改 input 组件样式，替换现有原生 input/textarea 使用
- **管理端页面**: 所有管理端页面需要添加 title 设置
- **文章列表页**: 需要增强列表显示信息，添加点击交互
- **文章编辑页**: 需要重构布局以解决滚动条和抖动问题
- **样式系统**: 需要适配新引入的 shadcn/ui 组件样式
