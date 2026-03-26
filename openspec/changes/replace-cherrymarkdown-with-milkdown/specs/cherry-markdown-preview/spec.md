## REMOVED Requirements

### Requirement: Cherry Markdown 预览组件以只读模式渲染 Markdown 内容
**原因**: 被 MilkdownPreview 替代，Milkdown 支持 SSR 而 CherryMarkdown 不支持

**迁移**: 使用新的 `MilkdownPreview` 组件替代 `CherryPreview`，API 保持一致（content、theme props）

#### Scenario: 组件渲染基础 Markdown（旧版本）
- **当** CherryPreview 组件接收到包含标题、段落、列表和代码块的 Markdown 内容时
- **那么** 组件应以正确的格式和样式渲染内容

#### Scenario: 组件渲染高级 Markdown 特性（旧版本）
- **当** CherryPreview 组件接收到包含表格、引用块、任务列表或数学公式的 Markdown 内容时
- **那么** 组件应使用适当的样式正确渲染这些特性

#### Scenario: 组件为只读模式（旧版本）
- **当** 用户与 CherryPreview 组件交互时
- **那么** 组件不提供编辑功能，仅用于展示

### Requirement: 预览组件遵循主题系统（旧版本）
**原因**: CherryPreview 使用 CherryMarkdown 的主题系统，被 Milkdown 的 CSS 变量系统替代

**迁移**: 新的 `MilkdownPreview` 直接使用项目的 CSS 变量（`--theme-*`），无需单独配置主题

#### Scenario: 深色模式兼容性（旧版本）
- **当** 主题设置为深色模式时
- **那么** 预览内容应立即使用主题 CSS 变量中的深色主题颜色
- **并且** 无需刷新页面即可看到主题变化效果

#### Scenario: 浅色模式兼容性（旧版本）
- **当** 主题设置为浅色模式时
- **那么** 预览内容应立即使用主题 CSS 变量中的浅色主题颜色
- **并且** 无需刷新页面即可看到主题变化效果

#### Scenario: 主题动态切换响应（旧版本）
- **当** 用户在页面运行时切换主题
- **那么** CherryPreview 组件应立即响应主题变化
- **并且** 组件应通过重新初始化或动态更新样式来应用新主题
- **并且** 主题切换过程应平滑，不应出现闪烁或样式错乱

#### Scenario: SSR 场景下的主题初始值（旧版本）
- **当** 组件在服务端渲染场景下初始化时
- **那么** 组件应接受服务端传入的初始主题值
- **并且** 客户端水合后应与实际主题状态同步

### Requirement: 文章详情页使用 CherryPreview（旧版本）
**原因**: 组件名称变更，CherryPreview 被 MilkdownPreview 替代

**迁移**: 更新文章详情页的组件导入，从 `CherryPreview` 改为 `MilkdownPreview`

#### Scenario: 文章内容通过 CherryPreview 显示（旧版本）
- **当** 用户导航到文章详情页时
- **那么** 文章内容使用 CherryPreview 组件渲染

### Requirement: CherryPreview 支持服务端渲染场景（旧版本）
**原因**: 此需求描述的是 CherryPreview 的架构设计（独立客户端组件），但实际上 CherryPreview 不支持真正的 SSR。MilkdownPreview 将实现真正的 SSR。

**迁移**: 不适用。新组件将直接支持 SSR，无需动态导入和客户端独立水合的设计。

#### Scenario: 作为独立客户端组件嵌入（旧版本）
- **当** CherryPreview 组件嵌入到服务端组件中时
- **那么** 组件应使用 'use client' 指令标记为客户端组件
- **并且** 组件应通过 props 接收 Markdown 内容和主题值

#### Scenario: 服务端传递初始数据（旧版本）
- **当** 服务端组件渲染页面时
- **那么** 服务端应将文章内容作为 prop 传递给 CherryPreview
- **并且** 服务端应将当前主题（或默认主题）作为 prop 传递给 CherryPreview

#### Scenario: 客户端独立水合（旧版本）
- **当** 页面在客户端加载完成时
- **那么** CherryPreview 组件应独立进行水合
- **并且** 水合过程不应影响页面的其他部分
- **并且** 水合完成后应能响应客户端的交互和主题变化
