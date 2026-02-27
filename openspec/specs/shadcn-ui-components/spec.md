# shadcn/ui 组件库规范

## 新增需求

### 需求：shadcn/ui 组件安装

系统应支持通过 shadcn/ui CLI 工具安装和管理 UI 组件。

#### 场景：初始化 shadcn/ui 配置

- **当** 开发者运行 `npx shadcn@latest init` 命令
- **则** 系统生成 `components.json` 配置文件
- **且** 配置文件使用项目现有的主题变量
- **且** 配置文件设置组件导入路径为 `@/components/ui`

#### 场景：添加单个组件

- **当** 开发者运行 `npx shadcn@latest add <component-name>` 命令
- **则** 系统从 shadcn/ui 仓库获取组件代码
- **且** 系统将组件安装到 `components/ui/` 目录
- **且** 组件使用项目主题变量

### 需求：Button 组件

系统应提供 Button 组件，使用组件级专用颜色变量。

#### 场景：使用默认 Button

- **当** 开发者使用 `<Button>点击</Button>`
- **则** 系统渲染使用主要主题色的按钮
- **且** 按钮背景使用 `bg-theme-btn-default-bg`
- **且** 按钮文字使用 `text-theme-btn-default-fg`
- **且** 悬停状态使用 `hover:bg-theme-btn-default-bg-hover hover:text-theme-btn-default-fg-hover`

#### 场景：使用 destructive 变体 Button

- **当** 开发者使用 `<Button variant="destructive">删除</Button>`
- **则** 按钮背景使用 `bg-theme-btn-destructive-bg`
- **且** 按钮文字使用 `text-theme-btn-destructive-fg`
- **且** 悬停状态使用 `hover:bg-theme-btn-destructive-bg-hover`

#### 场景：使用 outline 变体 Button

- **当** 开发者使用 `<Button variant="outline">取消</Button>`
- **则** 按钮背景使用 `bg-theme-btn-outline-bg`
- **且** 按钮文字使用 `text-theme-btn-outline-fg`
- **且** 按钮边框使用 `border-theme-btn-outline-border`
- **且** 悬停时背景变为 `hover:bg-theme-btn-outline-bg-hover hover:text-theme-btn-outline-fg-hover`

#### 场景：使用 secondary 变体 Button

- **当** 开发者使用 `<Button variant="secondary">次要</Button>`
- **则** 按钮背景使用 `bg-theme-btn-secondary-bg`
- **且** 按钮文字使用 `text-theme-btn-secondary-fg`
- **且** 悬停状态使用 `hover:bg-theme-btn-secondary-bg-hover`

#### 场景：使用 ghost 变体 Button

- **当** 开发者使用 `<Button variant="ghost">取消</Button>`
- **则** 按钮背景使用 `bg-theme-btn-ghost-bg`
- **且** 按钮文字使用 `text-theme-btn-ghost-fg`
- **且** 悬停时使用 `hover:bg-theme-btn-ghost-bg-hover hover:text-theme-btn-ghost-fg-hover`

#### 场景：使用 link 变体 Button

- **当** 开发者使用 `<Button variant="link">链接</Button>`
- **则** 按钮背景使用 `bg-theme-btn-link-bg`
- **且** 按钮文字使用 `text-theme-btn-link-fg`

#### 场景：使用不同尺寸的 Button

- **当** 开发者使用 `<Button size="sm">小按钮</Button>`
- **则** 系统渲染小尺寸按钮
- **且** 按钮高度为 `h-9`
- **且** 按钮圆角为 `rounded-md`

#### 场景：Button 点击动画

- **当** 用户点击 Button
- **则** 系统显示点击反馈效果
- **且** 按钮缩小到 `scale-0.97`

#### 场景：Button 键盘导航

- **当** 用户使用 Tab 键聚焦 Button
- **则** 系统显示焦点环
- **且** 用户可按 Enter 或 Space 触发按钮

### 需求：Switch 组件

系统应提供 Switch 组件，使用组件级专用颜色变量。

#### 场景：Switch 选中状态

- **当** 开发者使用 `<Switch defaultChecked />`
- **则** 开关背景使用 `data-[state=checked]:bg-theme-swt-bg-checked`
- **且** 悬停时使用 `hover:shadow-md`
- **且** 聚焦环使用 `focus-visible:ring-theme-swt-ring-color`

#### 场景：Switch 未选中状态

- **当** 开发者使用未选中的 Switch
- **则** 开关背景使用 `data-[state=unchecked]:bg-theme-swt-bg-unchecked`
- **且** 开关边框使用 `data-[state=unchecked]:border-theme-swt-border-unchecked`

#### 场景：Switch 滑块

- **当** Switch 渲染滑块
- **则** 滑块背景使用 `bg-theme-swt-thumb-bg`

### 需求：Dialog 组件

系统应提供 Dialog 组件，使用组件级专用颜色变量。

#### 场景：Dialog 遮罩层

- **当** Dialog 打开时
- **则** 遮罩层背景使用 `bg-theme-dlg-overlay-bg`

#### 场景：Dialog 内容区域

- **当** Dialog 渲染内容区域
- **则** 内容背景使用 `bg-theme-dlg-content-bg`
- **且** 内容边框使用 `border-theme-dlg-content-border`
- **且** 内容阴影使用 `shadow-lg`

#### 场景：Dialog 关闭按钮

- **当** Dialog 渲染关闭按钮
- **则** 按钮悬停时使用 `hover:bg-theme-dlg-close-bg-hover hover:opacity-100`
- **且** 聚焦环使用 `focus:ring-theme-dlg-ring-color`

#### 场景：Dialog 标题

- **当** Dialog 渲染标题
- **则** 标题文字使用 `text-theme-dlg-title-fg`

#### 场景：Dialog 描述

- **当** Dialog 渲染描述
- **则** 描述文字使用 `text-theme-dlg-desc-fg`

#### 场景：打开 Dialog

- **当** 用户触发打开对话框的操作
- **则** 系统显示对话框覆盖层
- **且** 焦点进入对话框

#### 场景：关闭 Dialog

- **当** 用户点击关闭按钮或按 Escape 键
- **则** 系统关闭对话框
- **且** 焦点返回到触发元素

#### 场景：Dialog 键盘陷阱

- **当** Dialog 打开时
- **则** 用户只能通过 Tab 键在对话框内导航
- **且** 焦点不会跳出对话框

### 需求：Avatar 组件

系统应提供 Avatar 组件，使用组件级专用颜色变量。

#### 场景：Avatar Fallback

- **当** Avatar 显示 fallback 内容
- **则** fallback 背景使用 `bg-theme-avt-fallback-bg`
- **且** fallback 文字使用 `text-theme-avt-fallback-fg`

### 需求：DropdownMenu 组件

系统应提供 DropdownMenu 组件，使用组件级专用颜色变量。

#### 场景：DropdownMenu 内容区域

- **当** DropdownMenu 打开时
- **则** 内容背景使用 `bg-theme-ddm-content-bg`
- **且** 内容边框使用 `border-theme-ddm-content-border`
- **且** 内容文字使用 `text-theme-ddm-content-fg`

#### 场景：DropdownMenu 菜单项

- **当** 用户悬停在菜单项上
- **则** 菜单项背景使用 `hover:bg-theme-ddm-item-bg-hover`
- **且** 菜单项文字使用 `hover:text-theme-ddm-item-fg-hover`
- **且** 聚焦时使用 `focus:bg-theme-ddm-item-bg-hover focus:text-theme-ddm-item-fg-hover`

#### 场景：DropdownMenu 分隔线

- **当** DropdownMenu 渲染分隔线
- **则** 分隔线背景使用 `bg-theme-ddm-separator-bg`

#### 场景：DropdownMenu 标签

- **当** DropdownMenu 渲染标签
- **则** 标签文字使用 `text-theme-ddm-label-fg`

### 需求：Input 组件

系统应提供 Input 组件，用于文本输入。

#### 场景：使用默认 Input

- **当** 开发者使用 `<Input placeholder="请输入..." />`
- **则** 系统渲染文本输入框
- **且** 输入框背景使用 `--input-bg` 变量
- **且** 输入框边框使用 `--input-border` 变量

#### 场景：Input 聚焦状态

- **当** 用户点击或使用 Tab 键聚焦 Input
- **则** 系统显示聚焦边框
- **且** 聚焦边框使用 `--input-border-focus` 颜色

#### 场景：Input 禁用状态

- **当** 开发者使用 `<Input disabled />`
- **则** 系统渲染禁用的输入框
- **且** 输入框显示为灰色（`--text-disabled`）
- **且** 用户无法在输入框中输入文本

#### 场景：Input 组件颜色变量

- **当** 使用 Input 组件
- **则** 组件 SHALL 使用项目的 HSL 颜色变量
- **包括**: `--background`, `--foreground`, `--primary`, `--border` 等

#### 场景：支持的 Input 变体

- **当** 开发者使用不同变体的 Input
- **则** 系统 SHALL 支持 `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` 变体
- **且** 每个变体 SHALL 自动适配主题颜色

### 需求：Card 组件

系统应提供 Card 相关组件（Card、CardHeader、CardContent、CardFooter）。

#### 场景：使用 Card 组件

- **当** 开发者使用 `<Card><CardContent>内容</CardContent></Card>`
- **则** 系统渲染卡片容器
- **且** 卡片背景使用 `--card-bg` 变量
- **且** 卡片边框使用 `--card-border` 变量
- **且** 卡片阴影使用 `--card-shadow` 变量

#### 场景：Card 圆角样式

- **当** Card 组件渲染
- **则** 系统应用 `rounded-[2rem]` 圆角
- **且** 圆角风格与项目其他卡片一致

### 需求：Label 组件

系统应提供 Label 组件，用于表单标签。

#### 场景：Label 与 Input 关联

- **当** 开发者使用 `<Label htmlFor="email">邮箱</Label><Input id="email" />`
- **则** 系统渲染可点击的标签
- **且** 点击标签时聚焦对应的输入框
- **且** 标签文字颜色使用 `--text-primary`

#### 场景：Label 必填标记

- **当** 开发者使用 `<Label>邮箱 <span className="text-destructive">*</span></Label>`
- **则** 系统在标签后显示红色星号
- **且** 星号颜色使用 `--error-primary`

### 需求：Select 组件

系统应提供 Select 组件，用于下拉选择功能。

#### 场景：Select 组件引入

- **当** 项目需要下拉选择功能
- **则** 系统 SHALL 使用 `npx shadcn@latest add select` 引入 Select 组件
- **且** Select 组件 SHALL 完全适配项目主题

#### 场景：Select 组件样式覆盖

- **当** Select 组件默认样式不符合需求
- **则** 系统 SHALL 通过 CSS 变量覆盖默认样式
- **且** 保持组件的功能不变

#### 场景：Select 组件主题适配

- **当** 用户切换主题（亮色/暗色）
- **则** Select 组件 SHALL 自动适配主题颜色
- **且** 使用项目的 HSL 颜色变量

### 需求：Table 组件

系统应提供 Table 组件，使用组件级专用颜色变量。

#### 场景：Table Footer

- **当** Table 渲染页脚
- **则** 页脚背景使用 `bg-theme-tbl-footer-bg`

#### 场景：Table Row 悬停

- **当** 用户悬停在表格行上
- **则** 行背景使用 `hover:bg-theme-tbl-row-bg-hover`

#### 场景：Table Row 选中

- **当** 表格行被选中
- **则** 行背景使用 `data-[state=selected]:bg-theme-tbl-row-bg-selected`

#### 场景：Table Head

- **当** Table 渲染表头
- **则** 表头文字使用 `text-theme-tbl-head-fg`

#### 场景：Table Caption

- **当** Table 渲染标题
- **则** 标题文字使用 `text-theme-tbl-caption-fg`

### 需求：Sheet 组件

系统应提供 Sheet 组件，使用组件级专用颜色变量。

#### 场景：Sheet 遮罩层

- **当** Sheet 打开时
- **则** 遮罩层背景使用 `bg-theme-sht-overlay-bg`

#### 场景：Sheet 内容区域

- **当** Sheet 渲染内容区域
- **则** 内容背景使用 `bg-theme-sht-content-bg`
- **且** 内容边框使用 `border-theme-sht-content-border`

#### 场景：Sheet 关闭按钮

- **当** Sheet 渲染关闭按钮
- **则** 按钮悬停时使用 `hover:bg-theme-sht-close-bg-hover`

#### 场景：Sheet 标题

- **当** Sheet 渲染标题
- **则** 标题文字使用 `text-theme-sht-title-fg`

#### 场景：Sheet 描述

- **当** Sheet 渲染描述
- **则** 描述文字使用 `text-theme-sht-desc-fg`

### 需求：组件主题适配

所有 shadcn/ui 组件必须使用项目主题变量，确保深色/浅色模式切换一致。

#### 场景：浅色模式下的组件

- **当** 系统处于浅色模式
- **则** 所有组件使用浅色主题的 CSS 变量
- **且** 组件颜色与项目其他部分一致

#### 场景：深色模式下的组件

- **当** 系统切换到深色模式
- **则** 所有组件自动更新为深色主题的 CSS 变量
- **且** 组件颜色与项目其他部分一致

#### 场景：主题切换动画

- **当** 用户切换主题
- **则** 组件颜色以 300ms 过渡动画切换
- **且** 过渡使用 `ease-in-out` 缓动函数

### 需求：组件可访问性

所有 shadcn/ui 组件必须符合 WCAG 2.1 AA 标准。

#### 场景：屏幕阅读器支持

- **当** 屏幕阅读器用户访问组件
- **则** 所有交互元素有正确的 ARIA 标签
- **且** 组件状态变化有适当的公告

#### 场景：键盘导航

- **当** 键盘用户访问组件
- **则** 所有交互元素可通过 Tab 键访问
- **且** 焦点顺序符合逻辑
- **且** 焦点元素有清晰的视觉指示

#### 场景：色彩对比度

- **当** 组件在任何主题下渲染
- **则** 所有文字与背景的对比度 ≥ 4.5:1
- **且** 交互元素有清晰的视觉反馈

### 需求：组件类型安全

所有 shadcn/ui 组件必须提供完整的 TypeScript 类型定义。

#### 场景：Button 组件类型

- **当** 开发者使用 Button 组件
- **则** TypeScript 提供 `variant` 和 `size` 属性的类型提示
- **且** 无效的变体名称会导致类型错误

#### 场景：组件 Props 类型

- **当** 开发者使用任何 shadcn/ui 组件
- **则** TypeScript 提供完整的 Props 类型定义
- **且** 所有必需属性都有类型提示
