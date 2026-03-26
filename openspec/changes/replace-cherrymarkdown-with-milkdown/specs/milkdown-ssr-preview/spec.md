## ADDED Requirements

### Requirement: MilkdownPreview 组件以只读模式渲染 Markdown 内容
系统应提供 MilkdownPreview 组件，以只读模式渲染 Markdown 内容，支持完整的 Markdown 功能集，包括语法高亮、表格、引用块、任务列表和数学公式。

#### Scenario: 组件渲染基础 Markdown
- **当** MilkdownPreview 组件接收到包含标题、段落、列表和代码块的 Markdown 内容时
- **那么** 组件应以正确的格式和样式渲染内容

#### Scenario: 组件渲染高级 Markdown 特性
- **当** MilkdownPreview 组件接收到包含表格、引用块、任务列表或数学公式的 Markdown 内容时
- **那么** 组件应使用适当的样式正确渲染这些特性

#### Scenario: 组件为只读模式
- **当** 用户与 MilkdownPreview 组件交互时
- **那么** 组件不提供编辑功能，仅用于展示

### Requirement: MilkdownPreview 支持服务端渲染
MilkdownPreview 组件应支持服务端渲染，在服务器上将 Markdown 转换为 HTML，确保搜索引擎爬虫可以获取完整的文章内容。

#### Scenario: 服务端渲染 Markdown 为 HTML
- **当** 服务器渲染包含 MilkdownPreview 组件的页面时
- **那么** 服务器应将 Markdown 内容转换为完整的 HTML
- **并且** HTML 应包含所有格式化和样式信息
- **并且** 搜索引擎爬虫可以直接从 HTML 中读取文章内容

#### Scenario: 客户端水合保持内容一致
- **当** 页面在客户端完成水合时
- **那么** 水合后的内容应与服务端渲染的 HTML 完全一致
- **并且** 不应出现内容闪烁或布局抖动

#### Scenario: 不使用动态导入
- **当** MilkdownPreview 组件被导入时
- **那么** 组件应使用静态导入而非动态导入
- **并且** 组件应支持 Next.js 的服务端渲染

### Requirement: MilkdownPreview 遵循主题系统
MilkdownPreview 组件应使用项目的 CSS 变量（`--theme-*`）进行样式配置，实时调整以匹配当前主题（深色/浅色模式），并确保主题切换时无需刷新页面即可生效。

#### Scenario: 深色模式兼容性
- **当** 主题设置为深色模式时
- **那么** 预览内容应使用主题 CSS 变量中的深色主题颜色
- **并且** 无需刷新页面即可看到主题变化效果

#### Scenario: 浅色模式兼容性
- **当** 主题设置为浅色模式时
- **那么** 预览内容应使用主题 CSS 变量中的浅色主题颜色
- **并且** 无需刷新页面即可看到主题变化效果

#### Scenario: 主题动态切换响应
- **当** 用户在页面运行时切换主题
- **那么** MilkdownPreview 组件应立即响应主题变化
- **并且** 主题切换过程应平滑，不应出现闪烁或样式错乱

#### Scenario: SSR 场景下的主题初始值
- **当** 组件在服务端渲染场景下初始化时
- **那么** 组件应接受服务端传入的初始主题值
- **并且** 客户端水合后应与实际主题状态同步

### Requirement: MilkdownPreview 组件 API 设计
MilkdownPreview 组件应提供清晰的 API，包括 content 和 theme 属性，并可选地暴露 ref 以支持客户端操作。

#### Scenario: 接收 Markdown 内容
- **当** 父组件渲染 MilkdownPreview 时
- **那么** 组件应通过 `content` prop 接收 Markdown 字符串
- **并且** content 应为可选参数，默认为空字符串

#### Scenario: 接收主题值
- **当** 父组件渲染 MilkdownPreview 时
- **那么** 组件应通过 `theme` prop 接收当前主题（'light' 或 'dark'）
- **并且** 组件应根据主题值应用相应的样式

#### Scenario: 支持自定义类名
- **当** 父组件需要自定义容器样式时
- **那么** 组件应接受 `className` prop
- **并且** className 应被应用到根元素

### Requirement: 代码高亮集成
MilkdownPreview 组件应集成 Prism.js 进行代码语法高亮，并使用与项目主题匹配的高亮样式。

#### Scenario: 渲染代码块时应用语法高亮
- **当** Markdown 内容包含代码块时
- **那么** 组件应使用 Prism.js 应用语法高亮
- **并且** 代码块应显示行号（如果配置启用）
- **并且** 代码块应支持复制功能

#### Scenario: 代码高亮主题匹配项目主题
- **当** 项目主题为深色模式时
- **那么** 代码高亮应使用深色主题
- **当** 项目主题为浅色模式时
- **那么** 代码高亮应使用浅色主题

### Requirement: 数学公式渲染
MilkdownPreview 组件应支持 LaTeX 数学公式的渲染，包括行内公式和块级公式。

#### Scenario: 渲染行内数学公式
- **当** Markdown 内容包含 `$...$` 格式的行内公式时
- **那么** 组件应使用 KaTeX 渲染公式
- **并且** 公式应与文本正确对齐

#### Scenario: 渲染块级数学公式
- **当** Markdown 内容包含 `$$...$$` 格式的块级公式时
- **那么** 组件应使用 KaTeX 渲染公式
- **并且** 公式应居中显示
- **并且** 公式应支持多行和复杂表达式
