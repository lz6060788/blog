## MODIFIED Requirements

### Requirement: 三层颜色变量架构

系统应采用三层架构组织颜色变量：颜色清单层、配置映射层、组件使用层。

#### 场景：颜色清单层定义

- **当** 定义主题色数值时
- **则** 系统在 `styles/base/colors.css` 中创建基础色板 CSS 自定义属性
- **且** 基础色板变量使用 Tailwind 风格命名（如 `--zinc-50`、`--emerald-600`）
- **且** 变量使用纯颜色值（如 `#fafafa`、`#18181b`）
- **且** 同时定义语义角色变量（如 `--neutral-50` 到 `--neutral-950`）
- **且** 语义角色变量在 `:root` 中引用对应的基础色板变量

#### 场景：语义颜色层定义

- **当** 定义语义颜色变量
- **则** 系统在 `styles/base/colors.css` 中创建语义角色变量（如 `--neutral-*`、`--accent-*`、`--danger-*`）
- **且** 语义角色变量仅在 `:root` 中定义，引用对应的基础色板变量
- **且** 主题切换由组件文件（`styles/components/*.css`）通过 `.dark` 选择器处理
- **且** `styles/semantic/` 目录下的文件创建具体语义 CSS 变量（如 `--bg-canvas`、`--text-primary`）
- **且** 语义颜色变量值引用语义角色变量或基础色板变量
- **且** 不使用硬编码颜色值

#### 场景：组件颜色层定义

- **当** 定义组件颜色变量
- **则** 系统在 `styles/components/` 目录下按组件类型创建独立文件
- **且** 组件颜色变量值引用语义角色变量（如 `var(--neutral-900)`、`var(--danger-600)`）
- **且** 组件颜色变量在 `:root` 和 `.dark` 中分别定义以支持主题切换
- **且** 不使用硬编码颜色值
- **且** 不直接引用基础色板变量（如 `--zinc-*`、`--emerald-*`）

#### 场景：配置映射层定义

- **当** 创建 Tailwind 颜色映射时
- **则** 系统在 `tailwind.config.ts` 中添加组件颜色配置
- **且** 配置路径为 `theme.colors.theme.{component}.{property}`
- **且** 配置值引用 CSS 变量（如 `var(--btn-default-bg)`）

#### 场景：组件使用层定义

- **当** 组件引用颜色时
- **则** 系统使用 Tailwind 类名 `{type}-theme-{component}-{property}`
- **且** 示例类名包括 `bg-theme-btn-default-bg`、`text-theme-btn-default-fg`
- **且** 类名通过 Tailwind 配置解析为 CSS 变量引用

### Requirement: 组件变量引用语义角色变量

组件颜色变量应引用语义角色变量（如 `--neutral-*`、`--accent-*`），不直接引用基础色板变量，不使用硬编码。

#### 场景：按钮引用语义角色变量

- **当** 定义按钮默认变体颜色
- **则** `--btn-default-bg` 引用语义角色变量（如 `var(--neutral-900)` 在浅色主题）
- **且** `--btn-default-fg` 引用语义角色变量（如 `var(--neutral-50)` 在浅色主题）
- **且** 深色主题下 `--btn-default-bg` 切换为 `var(--neutral-50)`
- **且** 深色主题下 `--btn-default-fg` 切换为 `var(--neutral-900)`

#### 场景：按钮引用语义色

- **当** 定义按钮幽灵变体颜色
- **则** `--btn-ghost-fg` 可引用语义色（如 `var(--text-secondary)`）
- **且** `--btn-ghost-bg-hover` 可引用语义色（如 `var(--bg-surface-alt)`）

#### 场景：开关引用强调色

- **当** 定义开关选中状态颜色
- **则** `--swt-bg-checked` 引用强调色角色变量（如 `var(--accent-600)`）
- **且** `--swt-bg-checked-hover` 引用相邻色板值（如 `var(--accent-500)`）
- **且** 强调色角色变量在 colors.css 中映射到具体色板（如 emerald）
