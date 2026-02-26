## ADDED Requirements

### 需求：按钮悬浮状态对比度
系统应确保按钮在悬浮状态下文字颜色与背景色符合 WCAG AA 标准（至少 4.5:1）。

#### 场景：默认按钮悬浮状态
- **当** 用户将鼠标悬停在默认变体按钮上
- **那么** 按钮应显示阴影效果以增强视觉反馈
- **并且** 文字颜色应使用 `text-primary-foreground` 确保对比度
- **并且** 背景颜色应使用 `hover:bg-primary/90`
- **并且** 文字与背景对比度应至少为 4.5:1

#### 场景：轮廓按钮悬浮状态
- **当** 用户将鼠标悬停在轮廓变体按钮上
- **那么** 按钮背景应变为 `bg-accent`
- **并且** 文字颜色应使用 `text-accent-foreground`
- **并且** 文字与背景对比度应至少为 4.5:1

#### 场景：幽灵按钮悬浮状态
- **当** 用户将鼠标悬停在幽灵变体按钮上
- **那么** 按钮背景应变为 `bg-accent`
- **并且** 文字颜色应使用 `text-accent-foreground`

### 需求：交互元素视觉反馈
系统应为所有可交互元素提供清晰的悬浮、焦点和激活状态样式。

#### 场景：链接悬浮状态
- **当** 用户将鼠标悬停在链接上
- **那么** 链接应显示下划线或颜色变化
- **并且** 应使用 CSS 过渡效果确保变化平滑

#### 场景：表单控件焦点状态
- **当** 用户聚焦到表单控件（输入框、下拉框等）
- **那么** 控件应显示焦点环（focus ring）
- **并且** 焦点环颜色应使用 `ring-theme-accent-primary`

#### 场景：开关组件悬浮状态
- **当** 用户将鼠标悬停在开关组件上
- **那么** 开关应有轻微的阴影或缩放效果
- **并且** 应使用 CSS 过渡效果

### 需求：主题变量使用规范
系统应确保所有颜色使用主题变量，避免硬编码。

#### 场景：使用背景色变量
- **当** 组件需要设置背景色
- **那么** 应使用 `bg-theme-bg-canvas`、`bg-theme-bg-surface` 或 `bg-theme-bg-muted`
- **并且** 不应使用硬编码的 Tailwind 颜色类（如 `bg-white`、`bg-zinc-50`）

#### 场景：使用文本色变量
- **当** 组件需要设置文本色
- **那么** 应使用 `text-theme-text-canvas`、`text-theme-text-secondary` 或 `text-theme-text-tertiary`
- **并且** 不应使用硬编码的 Tailwind 颜色类（如 `text-black`、`text-white`）

#### 场景：使用强调色变量
- **当** 组件需要设置强调色
- **那么** 应使用 `text-theme-accent-primary`、`bg-theme-accent-bg` 等
- **并且** 不应使用硬编码的 Tailwind 颜色类（如 `bg-emerald-500`）

### 需求：深色主题按钮适配
系统应确保按钮在深色主题下有足够的对比度和视觉反馈。

#### 场景：深色主题下默认按钮
- **当** 深色主题激活
- **并且** 用户查看默认变体按钮
- **那么** 按钮背景色应使用深色主题的 `--accent-primary` 变量
- **并且** 文字颜色应确保与背景对比度至少为 4.5:1

#### 场景：深色主题下轮廓按钮
- **当** 深色主题激活
- **并且** 用户将鼠标悬停在轮廓变体按钮上
- **那么** 按钮背景应使用 `bg-accent`
- **并且** `bg-accent` 在深色主题下应有足够的对比度

## MODIFIED Requirements

### 需求：shadcn/ui 圆角变量

原需求描述：系统应添加圆角 CSS 变量以支持 shadcn/ui 组件的圆角配置。

#### 场景：添加圆角变量

- **当** 主题系统初始化时
- **那么** 系统在 `:root` 中添加 `--radius` CSS 变量
- **并且** `--radius` 设置为 `1rem`（对应 Tailwind 的 `rounded-2xl`）
- **并且** 深色模式下使用相同的 `--radius` 值
- **并且** 所有交互组件在悬浮状态应保持圆角不变

#### 场景：组件使用圆角变量

- **当** 组件需要引用圆角值
- **那么** 组件可使用 `rounded-[var(--radius)]` 引用该变量
- **并且** 组件可以根据类型覆盖该值（如 Button 使用 `rounded-xl`）

### 需求：Tailwind 颜色映射

原需求描述：系统应在 Tailwind 配置中添加 shadcn/ui 所需的颜色定义，映射到项目现有的 CSS 变量。

#### 场景：配置 shadcn/ui 基础颜色

- **当** Tailwind 配置加载时
- **那么** 系统在 `tailwind.config.ts` 中定义 shadcn/ui 颜色
- **并且** `background` 映射到 `var(--bg-canvas)`
- **并且** `foreground` 映射到 `var(--text-canvas)`
- **并且** `card` 映射到 `var(--card-bg)`
- **并且** `popover` 映射到 `var(--bg-surface)`
- **并且** `primary` 映射到 `var(--accent-primary)`
- **并且** `primary-foreground` 映射到 `var(--accent-fg)`
- **并且** `secondary` 映射到 `var(--bg-muted)`
- **并且** `muted` 映射到 `var(--bg-muted)`
- **并且** `muted-foreground` 映射到 `var(--text-secondary)`
- **并且** `accent` 映射到 `var(--accent-bg)`
- **并且** `accent-foreground` 映射到 `var(--accent-primary)`
- **并且** `destructive` 映射到 `var(--error-primary)`
- **并且** `destructive-foreground` 映射到 `var(--text-reversed)`
- **并且** `border` 映射到 `var(--border-default)`
- **并且** `input` 映射到 `var(--input-bg)`
- **并且** `ring` 映射到 `var(--accent-primary)`
- **并且** `radius` 映射到 `var(--radius)`

#### 场景：悬浮状态颜色映射

- **当** shadcn/ui Button 组件使用 `hover:bg-primary/90` 时
- **那么** 系统应确保悬浮状态与背景有足够对比度
- **并且** 如对比度不足，应添加 `hover:shadow` 效果增强视觉反馈
- **并且** outline 变体应使用 `hover:bg-accent` 而非 `hover:bg-accent/90`

#### 场景：shadcn/ui 组件使用 Tailwind 颜色类

- **当** shadcn/ui 组件使用 `bg-background` 类名
- **那么** Tailwind 将其解析为 `background-color: var(--bg-canvas)`
- **并且** 颜色值直接使用项目的 CSS 变量
- **并且** 无需创建额外的 shadcn/ui 别名变量

#### 场景：深色模式下的颜色映射

- **当** 系统切换到深色模式
- **那么** 所有 Tailwind 颜色类自动使用深色模式的 CSS 变量值
- **并且** `bg-background` 使用深色的 `--bg-canvas`（zinc-950）
- **并且** `text-foreground` 使用深色的 `--text-canvas`（zinc-50）
- **并且** `bg-primary` 使用深色主题下合适的强调色
- **并且** `hover:bg-primary/90` 在深色模式下应有足够对比度

### 需求：主题切换组件

原需求描述：系统应提供主题切换 UI 组件，用于在浅色、深色和自动模式之间切换。

#### 场景：主题切换器显示

- **当** 渲染主题切换组件时
- **那么** 系统应显示三个选项：浅色、深色、自动
- **并且** 系统应指示当前活动的主题
- **并且** 系统应在用户选择不同选项时更新主题
- **并且** 切换器应遵循 frontend-design 美学规范，具有精致的视觉效果
- **并且** 当前选中的选项应有 `bg-theme-text-canvas text-theme-bg-surface` 样式
- **并且** 未选中的选项应有 `text-theme-text-tertiary hover:text-theme-text-secondary` 样式

#### 场景：主题切换器在管理端使用

- **当** 主题切换组件在管理端顶部栏渲染
- **那么** 组件应与主站使用相同的样式
- **并且** 组件应能正确读取和更新 localStorage 中的主题配置
