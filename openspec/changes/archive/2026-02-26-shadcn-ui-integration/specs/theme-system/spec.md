# 主题系统规范变更

## ADDED Requirements

### 需求：shadcn/ui 圆角变量

系统应添加圆角 CSS 变量以支持 shadcn/ui 组件的圆角配置。

#### 场景：添加圆角变量

- **当** 主题系统初始化时
- **则** 系统在 `:root` 中添加 `--radius` CSS 变量
- **且** `--radius` 设置为 `1rem`（对应 Tailwind 的 `rounded-2xl`）
- **且** 深色模式下使用相同的 `--radius` 值

#### 场景：组件使用圆角变量

- **当** 组件需要引用圆角值
- **则** 组件可使用 `rounded-[var(--radius)]` 引用该变量
- **且** 组件可以根据类型覆盖该值（如 Button 使用 `rounded-xl`）

### 需求：Tailwind 颜色映射

系统应在 Tailwind 配置中添加 shadcn/ui 所需的颜色定义，映射到项目现有的 CSS 变量。

#### 场景：配置 shadcn/ui 基础颜色

- **当** Tailwind 配置加载时
- **则** 系统在 `tailwind.config.ts` 中定义 shadcn/ui 颜色
- **且** `background` 映射到 `var(--bg-canvas)`
- **且** `foreground` 映射到 `var(--text-canvas)`
- **且** `card` 映射到 `var(--card-bg)`
- **且** `popover` 映射到 `var(--bg-surface)`
- **且** `primary` 映射到 `var(--accent-primary)`
- **且** `secondary` 映射到 `var(--bg-muted)`
- **且** `muted` 映射到 `var(--bg-muted)`
- **且** `accent` 映射到 `var(--accent-bg)`
- **且** `destructive` 映射到 `var(--error-primary)`
- **且** `border` 映射到 `var(--border-default)`
- **且** `input` 映射到 `var(--input-bg)`
- **且** `ring` 映射到 `var(--accent-primary)`
- **且** `radius` 映射到 `var(--radius)`

#### 场景：shadcn/ui 组件使用 Tailwind 颜色类

- **当** shadcn/ui 组件使用 `bg-background` 类名
- **则** Tailwind 将其解析为 `background-color: var(--bg-canvas)`
- **且** 颜色值直接使用项目的 CSS 变量
- **且** 无需创建额外的 shadcn/ui 别名变量

#### 场景：深色模式下的颜色映射

- **当** 系统切换到深色模式
- **则** 所有 Tailwind 颜色类自动使用深色模式的 CSS 变量值
- **且** `bg-background` 使用深色的 `--bg-canvas`（zinc-950）
- **且** `text-foreground` 使用深色的 `--text-canvas`（zinc-50）
- **且** 其他颜色相应映射

### 需求：shadcn/ui 配置文件

系统应生成 `components.json` 配置文件以支持 shadcn/ui CLI 工具。

#### 场景：生成配置文件

- **当** 开发者运行 `npx shadcn@latest init` 命令
- **则** 系统在项目根目录生成 `components.json` 文件
- **且** 配置文件设置 `tailwind.config` 路径为 `tailwind.config.ts`
- **且** 配置文件设置 `cssVars` 为 `true`（使用 CSS 变量）
- **且** 配置文件设置组件路径为 `@/components/ui`
- **且** 配置文件设置工具函数路径为 `@/lib/utils`

#### 场景：配置文件使用项目颜色映射

- **当** `components.json` 生成时
- **则** 配置不定义 shadcn/ui 的默认颜色变量
- **且** shadcn/ui 组件通过 Tailwind 配置映射到项目变量
- **且** 保持项目 CSS 变量作为唯一的事实来源

## MODIFIED Requirements

### 需求：CSS 自定义属性

原需求描述：系统应使用 CSS 自定义属性（CSS 变量）来设置所有主题颜色。

#### 场景：以项目变量为主的颜色系统

- **当** 定义主题颜色时
- **那么** 系统应创建以项目命名规范为主的 CSS 变量
- **并且** 项目变量使用语义化前缀（--bg-*、--text-*、--accent-* 等）
- **并且** 系统不在 `:root` 中创建 shadcn/ui 的别名变量（如 --background、--foreground）
- **并且** shadcn/ui 组件通过 Tailwind 配置映射到项目变量
- **并且** 如果组件需要新的语义颜色，扩展现有的变量系列（如添加 --bg-* 变量）
- **并且** 系统应使用语义化前缀便于理解和维护
- **并且** 变量应可在运行时更新而无需重新构建

### 需求：Tailwind CSS 集成

原需求描述：系统应将 CSS 自定义属性与 Tailwind CSS 配置集成。

#### 场景：Tailwind 颜色映射（shadcn/ui 支持）

- **当** Tailwind 处理样式时
- **那么** 系统应在 Tailwind 配置中扩展颜色定义
- **并且** 扩展应包含 shadcn/ui 所需的颜色（background、foreground、primary、secondary 等）
- **并且** 这些颜色通过 CSS() 函数引用项目的 CSS 变量（如 background: 'var(--bg-canvas)'）
- **并且** 确保所有现有类名继续工作（bg-zinc-50、text-zinc-900 等）
- **并且** 新增 shadcn/ui 颜色类名（bg-background、text-foreground 等）
- **并且** 新增类名在深色/浅色模式下自动使用正确的变量值

## REMOVED Requirements

无移除的需求。
