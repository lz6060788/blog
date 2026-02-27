## ADDED Requirements

### Requirement: CSS 文件模块化组织

系统应将全局样式按功能域拆分为多个 CSS 文件。

#### Scenario: 目录结构

- **当** 组织 CSS 文件
- **则** 创建 `app/styles/` 目录存放模块化样式
- **且** 包含以下子目录：
  - `base/` - 基础色板变量
  - `semantic/` - 语义颜色变量
  - `components/` - 组件颜色变量
  - `legacy/` - 向后兼容的旧变量

#### Scenario: 主入口文件

- **当** 引入全局样式
- **则** 使用 `app/globals.css` 作为主入口
- **且** 入口文件仅包含 Tailwind 指令和基础层样式
- **且** 模块化 CSS 文件通过 ES6 import 在 `app/layout.tsx` 中导入
- **且** 导入顺序为：基础 → 语义 → 组件 → 向后兼容

### Requirement: 基础模块定义

`base/` 模块应包含基础色板和主题定义。

#### Scenario: 色板文件

- **当** 定义基础色板
- **则** 在 `styles/base/colors.css` 中创建所有色板变量
- **且** 包含 Zinc、Emerald、Red、Amber、Blue 等色板

#### Scenario: 主题文件

- **当** 定义主题切换
- **则** 在 `styles/base/themes.css` 中定义 `:root` 和 `.dark` 选择器
- **且** 浅色主题在 `:root` 中定义
- **且** 深色主题在 `.dark` 中定义

### Requirement: 语义模块定义

`semantic/` 模块应包含背景、文字、边框等语义颜色。

#### Scenario: 背景语义色

- **当** 定义背景语义颜色
- **则** 在 `styles/semantic/background.css` 中创建变量
- **且** 变量包括 `--bg-canvas`、`--bg-surface`、`--bg-muted` 等
- **且** 变量值引用基础色板变量（如 `var(--zinc-50)`）

#### Scenario: 文字语义色

- **当** 定义文字语义颜色
- **则** 在 `styles/semantic/text.css` 中创建变量
- **且** 变量包括 `--text-primary`、`--text-secondary`、`--text-muted` 等

#### Scenario: 边框语义色

- **当** 定义边框语义颜色
- **则** 在 `styles/semantic/border.css` 中创建变量
- **且** 变量包括 `--border-default`、`--border-muted`、`--border-strong` 等

#### Scenario: 强调语义色

- **当** 定义强调语义颜色
- **则** 在 `styles/semantic/accent.css` 中创建变量
- **且** 变量包括 `--accent-primary`、`--accent-bg`、`--success-primary` 等

### Requirement: 组件模块定义

`components/` 模块应按组件类型拆分颜色定义。

#### Scenario: 按组件拆分

- **当** 定义组件颜色
- **则** 每个组件有独立的 CSS 文件
- **且** 文件命名使用组件名（如 `button.css`、`dialog.css`）
- **且** 变量值引用基础色板或语义色变量

#### Scenario: 组件文件列表

- **当** 组织组件样式文件
- **则** 包含以下文件：
  - `button.css` - 按钮颜色（`--btn-*` 前缀）
  - `switch.css` - 开关颜色（`--swt-*` 前缀）
  - `dialog.css` - 对话框颜色（`--dlg-*` 前缀）
  - `dropdown.css` - 下拉菜单颜色（`--ddm-*` 前缀）
  - `table.css` - 表格颜色（`--tbl-*` 前缀）
  - `avatar.css` - 头像颜色（`--avt-*` 前缀）
  - `sheet.css` - 侧边栏颜色（`--sht-*` 前缀）

### Requirement: CSS 导入顺序

样式导入应遵循依赖顺序以确保变量可用。

#### Scenario: 导入顺序

- **当** `layout.tsx` 导入模块
- **则** 在 `RootLayout` 组件顶部使用 ES6 import 语法
- **且** 按以下顺序导入：
  1. `import './globals.css'` - Tailwind 指令和基础样式
  2. `import './styles/base/colors.css'` - 基础色板变量
  3. `import './styles/base/themes.css'` - 主题定义
  4. `import './styles/semantic/background.css'` - 背景语义色
  5. `import './styles/semantic/text.css'` - 文字语义色
  6. `import './styles/semantic/border.css'` - 边框语义色
  7. `import './styles/semantic/accent.css'` - 强调语义色
  8. `import './styles/components/button.css'` - 组件颜色
  9. `import './styles/components/switch.css'`
  10. `import './styles/components/dialog.css'`
  11. `import './styles/components/avatar.css'`
  12. `import './styles/components/dropdown.css'`
  13. `import './styles/components/table.css'`
  14. `import './styles/components/sheet.css'`
  15. `import './styles/legacy/*.css'` - 向后兼容
