## ADDED Requirements

### Requirement: 基础色板变量定义

系统应提供 Tailwind 风格的基础色板 CSS 变量。

#### Scenario: Zinc 色板定义

- **当** 系统初始化 CSS 变量
- **则** 创建 `--zinc-50` 到 `--zinc-950` 的完整色板变量
- **且** 变量值使用标准 Tailwind Zinc 色板颜色值
- **且** 变量仅在 `:root` 中定义（不定义深色主题覆盖）
- **且** 深色主题的切换由 semantic/*.css 和 components/*.css 文件处理

#### Scenario: Emerald 色板定义

- **当** 系统初始化强调色色板变量
- **则** 创建 `--emerald-50` 到 `--emerald-950` 的完整色板变量
- **且** 变量值使用标准 Tailwind Emerald 色板颜色值

#### Scenario: 语义色色板定义

- **当** 系统初始化语义色色板变量
- **则** 创建 Red、Amber、Blue 等色板用于错误、警告、信息状态
- **且** 每个语义色提供至少 3 个阶梯用于不同状态

### Requirement: 色板变量引用规则

系统应使用标准格式引用基础色板变量。

#### Scenario: 语法格式

- **当** CSS 变量引用基础色板
- **则** 使用 `var(--{color}-{step})` 格式
- **且** 示例引用包括 `var(--zinc-50)`、`var(--emerald-600)`

#### Scenario: 变量命名一致性

- **当** 定义基础色板变量
- **则** 使用 Tailwind 标准命名（zinc、emerald、red、amber、blue 等）
- **且** 色阶使用 50-950 的标准步进（50、100、200...950）

### Requirement: 色板主题切换

基础色板变量应在浅色和深色主题下提供不同的颜色值。

#### Scenario: 浅色主题色板

- **当** 系统处于浅色模式
- **则** `:root` 中的色板变量提供较浅的背景色值和较深的文字色值
- **且** `--zinc-50` 为最浅色（如 `#fafafa`）
- **且** `--zinc-950` 为最深色（如 `#09090b`）

#### Scenario: 深色主题色板

- **当** 系统处于深色模式
- **则** `colors.css` 中的基础色板变量值保持不变
- **且** 深色主题的切换在 semantic/*.css 和 components/*.css 中处理
- **且** 这些文件会根据 .dark class 选择不同的基础色板值
