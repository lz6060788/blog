# 主题色体系说明（当前实现）

> 本文档基于当前仓库实现（`app/styles` + `tailwind.config.ts`）描述主题色结构、使用约定与扩展流程。

## 1. 当前主题色的整体结构

当前实现是 **四层映射**，从“原始色值”到“组件最终 class”逐层收敛：

1. **原始色值层（Design Primitives）**
   - 文件：`app/styles/globals.css`
   - 只存放品牌/功能原色（例如 `--color-brand-zinc-*`、`--color-brand-accent-*`、`--color-success-500`）。
   - 不建议组件直接使用这一层变量。

2. **主题语义层（Theme Tokens）**
   - 文件：`app/styles/themes.css`
   - 通过 `.theme-light` / `.theme-dark` 定义主题变量（例如 `--theme-background`、`--theme-surface`、`--theme-text-secondary`、`--theme-error-bg`）。
   - 这一层负责亮暗主题差异。

3. **组件语义层（Component Tokens）**
   - 文件：`app/styles/components/*.css`
   - 每个组件建立自己的变量，例如 `--color-button-*`、`--color-input-*`、`--color-dialog-*`。
   - 组件变量应尽量引用 `--theme-*`，避免重复写死色值。

4. **Tailwind 原子类映射层（Tailwind Colors）**
   - 文件：
     - `app/styles/tailwind/colors/theme.ts`
     - `app/styles/tailwind/colors/components.ts`
     - `app/styles/tailwind/colors/core.ts`
     - `tailwind.config.ts`
   - `coreColors` 汇总 theme + component 两类 token，并挂载到 `tailwind.config.ts` 的 `extend.colors`。

---

## 2. “什么时候用什么变量”

### 2.1 页面/业务组件优先用 `theme.*`

适用场景：页面布局、文章区块、列表、卡片容器、通用文本等。

- 背景层次：
  - 页面底色：`bg-theme-canvas`
  - 主容器：`bg-theme-surface`
  - 次级容器/hover：`bg-theme-surface-alt` / `bg-theme-muted`
- 文本层次：
  - 强调文本：`text-theme-text-canvas`
  - 正文文本：`text-theme-text-primary`
  - 次要说明：`text-theme-text-secondary`
  - 辅助信息：`text-theme-text-tertiary`
- 边框：`border-theme-border`、`border-theme-border-muted`
- 状态色：`text-theme-success-primary`、`bg-theme-error-bg` 等

### 2.2 UI 基础组件（button/input/dialog...）优先用组件 token

适用场景：`components/ui/*` 与复用性高的基础组件。

- Button：`bg-button-default-bg`、`text-button-default-fg`
- Input：`bg-input-field-bg`、`border-input-field-border`
- Dialog：`bg-dialog-content-bg`、`border-dialog-content-border`

原则：

- 组件内部不要直接依赖页面级 token（如 `bg-theme-surface`）去拼复杂状态。
- 把状态沉淀成组件 token（hover/focus/disabled），业务侧只使用组件提供的 variant。

### 2.3 关于 `text-theme-text-tertiary` 这类“看起来重复”的类名

这是 Tailwind 原子前缀 + token 路径的组合结果：

- `text-`（Tailwind 工具类前缀，表示设置 `color`）
- `theme-text-tertiary`（token 命名路径）

虽然视觉上出现两个 `text`，但语义分别是“CSS 属性类型”和“主题 token 分组”，并非同一维度重复。实践上保持稳定比强行缩写更重要。

---

## 3. 新增组件时，主题色应如何处理

以新增 `tabs` 组件为例，建议按以下步骤：

1. **在组件样式目录新增变量文件**
   - 新建：`app/styles/components/tabs.css`
   - 定义：
     - `--color-tabs-list-bg`
     - `--color-tabs-trigger-text`
     - `--color-tabs-trigger-bg-active`
     - `--color-tabs-border`
   - 变量来源优先引用 `--theme-*`。

2. **在组件样式入口注册**
   - 修改：`app/styles/components/index.css`
   - 增加：`@import './tabs.css';`

3. **在 Tailwind 颜色映射中暴露原子类**
   - 修改：`app/styles/tailwind/colors/components.ts`
   - 增加：
     - `tabs: { list-bg, trigger-text, trigger-bg-active, border }`

4. **在组件代码中只消费组件 token**
   - `components/ui/tabs.tsx` 使用 `bg-tabs-list-bg` 等类名。
   - 避免散落硬编码色值或绕过组件 token 直接拼页面 token。

5. **检查亮/暗主题可读性**
   - 至少验证：默认、hover、active、disabled、focus ring。

---

## 4. 新增一套主题色（例如 brand-blue）要做什么

新增主题的本质是：新增一组 `.theme-xxx` 变量映射，而不是改组件代码。

1. **准备原始色值（如需要）**
   - 文件：`app/styles/globals.css`
   - 新增品牌色 primitive，例如 `--color-brand-blue-*`。

2. **在 `themes.css` 增加主题类**
   - 文件：`app/styles/themes.css`
   - 新增 `.theme-brand-blue { ... }`，覆盖完整 `--theme-*` 集合（背景、文本、border、状态色）。
   - 建议以 `.theme-light` 为模板复制后微调，避免漏变量。

3. **确认组件 token 无需改动**
   - 组件层应该只引用 `--theme-*`，因此通常无需额外改 `components/*.css`。

4. **确认 Tailwind 映射无需改动**
   - `theme.ts` / `components.ts` 只是映射变量名，只要变量存在即可复用。

5. **接入主题切换入口**
   - 确保运行时会把 `theme-brand-blue` 类挂到根节点（与现有 light/dark 切换机制一致）。

6. **回归验证清单**
   - 页面：背景层次、正文可读性、分隔线对比度。
   - 组件：按钮、输入框、弹层、下拉、表格、徽标。
   - 状态：success/warning/error/info 在新主题下的区分度。

---

## 5. 命名与维护约定（建议遵守）

- 不使用难懂缩写，优先完整语义词（`button`、`input-field`、`dropdown-menu`）。
- 不新增 legacy alias，避免并行命名导致维护成本上升。
- 单个组件 token 命名建议：`[组件]-[部位]-[状态]`，例如 `button-default-bg-hover`。
- 颜色值统一通过 CSS 变量 + `hsl(var(--...))` 输出，避免直接写 hex。
- 新 token 必须在亮/暗主题下都可读，不允许仅在单主题正确。

