## MODIFIED Requirements

### 需求：客户端组件协调
系统应正确协调服务端组件和客户端组件，确保主题切换等客户端功能正常工作。

#### 场景：CherryPreview 作为独立客户端组件
- **当** 文章详情页渲染时
- **那么** CherryPreview 应作为独立的客户端组件嵌入
- **并且** CherryPreview 应接收文章内容和当前主题作为 props
- **并且** CherryPreview 应使用正常只读模式渲染完整内容
- **并且** CherryPreview 不应使用预览模式（previewOnly）显示内容截断

## REMOVED Requirements

### 需求：客户端组件协调（旧版本）
**原因**: 之前的设计使用了 CherryPreview 的预览模式，会在开头显示内容截断，造成用户困惑

**迁移**: 将 CherryPreview 从 previewOnly 模式改为正常只读模式，确保显示完整内容而不是截断
