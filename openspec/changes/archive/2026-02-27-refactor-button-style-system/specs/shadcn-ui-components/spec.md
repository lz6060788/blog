# shadcn/ui 组件库规范 - 组件颜色系统变更

## MODIFIED Requirements

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
