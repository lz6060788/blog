## ADDED Requirements

### Requirement: Milkdown 使用项目 CSS 变量
Milkdown 编辑器和预览组件应使用项目定义的 CSS 变量（`--theme-*`）进行样式配置，而不是使用预设主题的默认颜色。

#### Scenario: 映射项目 CSS 变量到 Milkdown 样式
- **当** Milkdown 组件渲染时
- **那么** 组件应使用 `--theme-background` 作为背景色
- **并且** 组件应使用 `--theme-text-primary` 作为文本颜色
- **并且** 组件应使用 `--theme-border` 作为边框颜色
- **并且** 组件应使用 `--theme-primary` 作为强调色（链接、引用边框等）

#### Scenario: 响应 CSS 变量变化
- **当** 项目 CSS 变量值发生变化（如主题切换）时
- **那么** Milkdown 组件应自动应用新的变量值
- **并且** 组件样式应立即更新，无需重新渲染

### Requirement: Milkdown 样式文件组织
Milkdown 相关的样式应集中在独立的 CSS 文件中，并与项目的 Tailwind CSS 配置兼容。

#### Scenario: 样式文件位置和命名
- **当** 项目组织样式文件时
- **那么** Milkdown 样式应位于 `app/styles/components/milkdown.css`
- **并且** 样式应使用 `.milkdown` 类作为根选择器
- **并且** 样式不应污染其他组件

#### Scenario: 使用项目颜色系统
- **当** 定义 Milkdown 元素样式时
- **那么** 应使用项目 CSS 变量而非硬编码颜色值
- **并且** 所有颜色应支持深色/浅色主题切换
- **示例**: `color: var(--theme-text-primary)` 而非 `color: #333`

### Requirement: Milkdown 元素样式定制
Milkdown 渲染的 Markdown 元素应与项目设计系统保持一致，包括排版、间距和视觉效果。

#### Scenario: 标题样式
- **当** 渲染 Markdown 标题（h1-h6）时
- **那么** 标题应使用项目的字体大小和间距规范
- **并且** 标题应继承项目的字重和行高

#### Scenario: 列表样式
- **当** 渲染有序或无序列表时
- **那么** 列表项应使用项目的列表样式
- **并且** 列表缩进和间距应符合项目设计规范

#### Scenario: 引用块样式
- **当** 渲染引用块时
- **那么** 引用块应有左侧边框，使用 `--theme-primary` 颜色
- **并且** 引用块背景色应使用 `--theme-background-secondary`
- **并且** 引用块文本颜色应使用 `--theme-text-secondary`

#### Scenario: 代码块样式
- **当** 渲染代码块时
- **那么** 代码块背景应使用 `--theme-code-background`
- **并且** 代码块边框应使用 `--theme-border`
- **并且** 代码块文本应使用等宽字体

#### Scenario: 表格样式
- **当** 渲染表格时
- **那么** 表格边框应使用 `--theme-border`
- **并且** 表头背景应使用 `--theme-background-secondary`
- **并且** 斑马纹行应使用交替背景色

### Requirement: 深色模式下的对比度保证
Milkdown 组件在深色模式下应确保所有文本和背景有足够的对比度，符合 WCAG AA 标准。

#### Scenario: 深色模式文本对比度
- **当** 主题切换到深色模式时
- **那么** 所有文本颜色应与背景有至少 4.5:1 的对比度
- **并且** 代码块文本应有足够的对比度

#### Scenario: 深色模式下链接和强调色
- **当** 深色模式下渲染链接或强调元素时
- **那么** 这些元素应保持足够的对比度和可读性
- **并且** 强调色应与深色背景协调

### Requirement: 响应式布局
Milkdown 组件应支持响应式布局，在不同屏幕尺寸下保持良好的阅读体验。

#### Scenario: 移动端适配
- **当** 在小屏幕设备上渲染时
- **那么** 代码块应支持水平滚动
- **并且** 表格应支持水平滚动
- **并且** 字体大小应适配移动端阅读

#### Scenario: 图片自适应
- **当** Markdown 内容包含图片时
- **那么** 图片应自适应容器宽度
- **并且** 图片不应超出容器边界
