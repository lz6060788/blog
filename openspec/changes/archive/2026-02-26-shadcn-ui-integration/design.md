# 设计文档：shadcn/ui 组件库集成

## Context

### 当前状态

项目已有完整的主题系统（基于 CSS 变量的 zinc + emerald 配色），包含部分 UI 组件（DropdownMenu、Avatar），但缺少 `Button` 组件导致 `UserMenu.tsx` 报错。现有组件使用了类似 shadcn/ui 的风格，但没有统一的组件库系统。

### 技术栈

- **前端框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS + CSS 变量主题系统
- **组件风格**: 类 shadcn/ui（自定义实现）
- **主题**: 深色/浅色模式切换

### 设计约束

- 必须保持现有项目的 zinc + emerald 配色方案
- 必须保持现有的圆角风格（`rounded-[2rem]` 大卡片，`rounded-full` 小元素）
- 必须兼容现有的主题切换系统
- 必须使用项目现有的 CSS 变量命名规范

## Goals / Non-Goals

### Goals

1. **修复报错**: 解决 UserMenu.tsx 缺少 Button 组件的问题
2. **统一组件库**: 集成 shadcn/ui 组件系统，提供一致的开发体验
3. **保持设计一致性**: 所有组件使用项目主题变量，保持现有设计语言
4. **扩展主题系统**: 添加 shadcn/ui 所需的 CSS 变量，但保持现有命名规范
5. **类型安全**: 使用 TypeScript 提供完整的类型支持

### Non-Goals

- 不改变现有项目的配色方案（zinc + emerald）
- 不改变现有的圆角和间距系统
- 不引入新的构建工具或复杂配置
- 不替换现有的 DropdownMenu 和 Avatar 组件（它们工作正常）

## Decisions

### 1. 使用 shadcn/ui CLI 工具

**决策**: 使用 shadcn/ui 的 CLI 工具 `npx shadcn@latest init` 来初始化配置。

**理由**:
- 官方工具，配置标准化
- 自动生成 `components.json` 配置文件
- 支持增量添加组件（按需安装）

**替代方案**:
- **手动配置**: 容易出错，难以维护
- **完全复制代码**: 失去 CLI 的更新和定制能力

### 2. 组件导入策略

**决策**: 使用 shadcn/ui CLI 按需添加组件，而非一次性添加所有组件。

**理由**:
- 避免不必要的代码和依赖
- 逐步迁移，风险可控
- 可以根据项目需求定制组件

**优先添加的组件**:
1. **Button** - 修复 UserMenu.tsx 报错
2. **Input** - 表单输入组件
3. **Label** - 表单标签
4. **Card** - 卡片容器
5. **Dialog** - 对话框组件
6. **Tabs** - 标签页组件
7. **Toast** - 消息提示组件

### 3. 主题变量扩展策略

**决策**: 以项目现有的颜色变量为主，配置 shadcn/ui 组件直接使用项目变量，必要时扩展现有变量表。

**核心原则**:
- 项目变量是"源"（source of truth）
- shadcn/ui 组件适配项目的变量命名
- 不创建 shadcn/ui 的别名变量（如 `--background`、`--foreground`）
- 如果组件需要新的语义颜色，扩展现有的 `--bg-*`、`--text-*` 等系列

**components.json 配置**:
```json
{
  "tailwind": {
    "config": "tailwind.config.ts",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components/ui",
    "utils": "@/lib/utils"
  },
  "rsc": false,
  "tsx": true
}
```

**项目现有变量 → shadcn/ui 组件映射**:
```css
/* 项目已有，shadcn/ui 直接使用 */
--bg-canvas         → 用于 background（页面背景）
--text-canvas       → 用于 foreground（主要文字）
--card-bg           → 用于 card（卡片背景）
--card-border       → 用于 border（边框）
--bg-surface        → 用于 popover/popover（弹出层背景）
--bg-muted          → 用于 muted（静音背景）
--text-tertiary     → 用于 muted-foreground（次要文字）
--accent-primary    → 用于 primary（主要强调色）
--accent-fg         → 用于 primary-foreground（强调色上的文字）
--accent-bg         → 用于 accent（强调背景）
--error-primary     → 用于 destructive（破坏性操作）
--border-default    → 用于 border（边框）
--input-bg          → 用于 input（输入框背景）
```

**可能需要扩展的项目变量**:
```css
/* 如果 shadcn/ui 组件需要这些，我们添加到项目变量表 */
--bg-overlay        → 遮罩层（已有）
--text-reversed     → 反转文字（已有）
--card-shadow       → 卡片阴影（已有）

/* 新增：shadcn/ui 特定需求 */
--radius            → 组件圆角基础值（新增）
```

**components.json 中的 cssVariables 配置**:
shadcn/ui 组件将使用 `bg-background`、`text-foreground` 等 Tailwind 类名，我们需要在 `tailwind.config.ts` 中将这些映射到项目的 CSS 变量：

```ts
// tailwind.config.ts
colors: {
  background: 'var(--bg-canvas)',
  foreground: 'var(--text-canvas)',
  card: {
    DEFAULT: 'var(--card-bg)',
    foreground: 'var(--text-canvas)',
  },
  popover: {
    DEFAULT: 'var(--bg-surface)',
    foreground: 'var(--text-canvas)',
  },
  primary: {
    DEFAULT: 'var(--accent-primary)',
    foreground: 'var(--accent-fg)',
  },
  secondary: {
    DEFAULT: 'var(--bg-muted)',
    foreground: 'var(--text-canvas)',
  },
  muted: {
    DEFAULT: 'var(--bg-muted)',
    foreground: 'var(--text-tertiary)',
  },
  accent: {
    DEFAULT: 'var(--accent-bg)',
    foreground: 'var(--accent-fg)',
  },
  destructive: {
    DEFAULT: 'var(--error-primary)',
    foreground: 'var(--text-reversed)',
  },
  border: 'var(--border-default)',
  input: 'var(--input-bg)',
  ring: 'var(--accent-primary)',
  radius: 'var(--radius)',
}
```

**理由**:
- 项目保持自己的变量命名规范（`--bg-*`、`--text-*` 等）
- shadcn/ui 组件通过 Tailwind 配置映射到项目变量
- 如果未来项目变量改名，只需更新 Tailwind 配置，组件代码无需改动
- 更清晰的责任划分：项目定义颜色，组件使用颜色

**替代方案（不推荐）**:
- **创建 shadcn/ui 别名变量**: 如 `--background: var(--bg-canvas)`
  - 问题：增加维护负担，变量冗余
  - 问题：混淆"源"变量，不清楚哪个是主要定义

### 4. 圆角系统适配

**决策**: 将 shadcn/ui 的 `--radius` 变量设置为 `1rem`（对应 Tailwind 的 `rounded-2xl`），并根据组件类型使用不同的圆角。

**圆角映射**:
- **大容器（Card, Dialog）**: `rounded-[2rem]` - 2rem
- **按钮（Button）**: `rounded-xl` 或 `rounded-full` - 0.75rem 或 full
- **输入框（Input）**: `rounded-xl` - 0.75rem
- **小元素（Badge, Avatar）**: `rounded-full` - full

**理由**:
- 保持项目现有的大圆角风格
- 不同组件类型使用不同圆角，保持视觉层次
- `--radius: 1rem` 作为默认值，可在组件中覆盖

### 5. class-variance-authority (CVA) 集成

**决策**: 使用 CVA 管理组件变体（如 Button 的 variant、size）。

**示例（Button 组件）**:
```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent-primary focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-theme-btn-bg-primary text-theme-btn-text-primary hover:bg-theme-btn-bg-primary-hover",
        ghost: "bg-theme-btn-bg-ghost text-theme-btn-text-ghost hover:bg-theme-btn-bg-ghost-hover",
        outline: "border border-theme-border hover:bg-theme-bg-surface-alt",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-2xl px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

**理由**:
- CVA 是 shadcn/ui 的标准工具
- 类型安全的变体系统
- 易于扩展和维护

### 6. Radix UI 依赖

**决策**: 接受 shadcn/ui 的 Radix UI 依赖（@radix-ui/*）。

**主要依赖**:
- `@radix-ui/react-dialog` - Dialog 组件
- `@radix-ui/react-dropdown-menu` - DropdownMenu 组件
- `@radix-ui/react-label` - Label 组件
- `@radix-ui/react-slot` - Slot 工具组件
- `@radix-ui/react-tabs` - Tabs 组件
- `@radix-ui/react-toast` - Toast 组件

**理由**:
- Radix UI 是无障碍的可访问组件库
- shadcn/ui 基于 Radix UI 构建
- 提供完整的键盘导航和屏幕阅读器支持

### 7. 现有组件处理

**决策**: 保留现有的 DropdownMenu 和 Avatar 组件，逐步评估是否替换为 shadcn/ui 版本。

**评估标准**:
- 功能是否完整
- 是否使用了项目主题变量
- 是否有 bug 或维护问题

**替换计划**:
- **Phase 1**: 添加 Button 组件，修复 UserMenu.tsx
- **Phase 2**: 添加其他基础组件（Input、Label、Card）
- **Phase 3**: 评估并可能替换 DropdownMenu 和 Avatar
- **Phase 4**: 添加高级组件（Dialog、Tabs、Toast）

**理由**:
- 现有组件工作正常，无需立即替换
- 逐步迁移，降低风险
- 可以对比两个版本的实现，选择最优

### 8. 工具函数验证

**决策**: 验证 `lib/utils.ts` 中的 `cn` 函数是否正确实现。

**期望实现**:
```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**理由**:
- `cn` 函数是 shadcn/ui 组件的核心工具
- 必须安装 `clsx` 和 `tailwind-merge` 依赖
- 正确的实现可以合并 Tailwind 类名并解决冲突

## Risks / Trade-offs

### Risk 1: 主题变量冲突

**风险**: shadcn/ui 的变量命名可能与项目现有变量冲突。

**缓解措施**:
- 使用别名映射（`--background: var(--bg-canvas)`）
- 保留现有变量名，不删除
- 在 `globals.css` 中添加注释说明映射关系

### Risk 2: 组件样式不一致

**风险**: shadcn/ui 组件的默认样式可能与项目现有设计不符。

**缓解措施**:
- 使用项目主题变量覆盖默认样式
- 定制组件的变体（variant）以匹配项目风格
- 测试每个组件在深色/浅色模式下的显示

### Risk 3: 依赖包膨胀

**风险**: 添加多个 Radix UI 包可能导致 bundle 增大。

**缓解措施**:
- 按需添加组件，不一次性添加所有
- 使用 Next.js 的动态导入优化代码分割
- 监控 bundle 大小，必要时进行优化

### Trade-off: 现有组件 vs shadcn/ui

**权衡**: 保留现有组件可能造成代码不一致，但立即替换风险高。

**决策**: 逐步迁移，优先修复报错，再考虑替换。

## Migration Plan

### 部署步骤

1. **Phase 1: 基础设置**（无破坏性变更）
   - 安装依赖：`class-variance-authority`, `clsx`, `tailwind-merge`
   - 运行 `npx shadcn@latest init` 初始化配置
   - 更新 `globals.css` 添加 shadcn/ui 变量
   - 验证 `lib/utils.ts` 的 `cn` 函数

2. **Phase 2: 添加 Button 组件**（修复报错）
   - 运行 `npx shadcn@latest add button`
   - 定制 Button 组件样式以匹配项目主题
   - 更新 `UserMenu.tsx` 使用新的 Button 组件
   - 测试 UserMenu 功能

3. **Phase 3: 添加其他组件**（按需添加）
   - 添加 Input、Label、Card 等基础组件
   - 添加 Dialog、Tabs、Toast 等高级组件
   - 每个组件添加后进行测试

4. **Phase 4: 清理和优化**（可选）
   - 评估现有 DropdownMenu 和 Avatar 是否替换
   - 移除未使用的代码
   - 更新文档

### 回滚策略

- 每个 shadcn/ui 组件都是独立的文件，可以单独删除
- 保留现有组件的备份（重命名为 `.bak`）
- 通过 git 可以快速回滚到之前的状态
- 使用功能开关逐步推出新组件

## Open Questions

1. **Q**: 是否需要替换现有的 DropdownMenu 和 Avatar 组件？
   - **A**: 暂不替换，待评估后再决定

2. **Q**: shadcn/ui 的默认圆角是 `0.5rem`，项目是 `2rem`，如何处理？
   - **A**: 设置 `--radius: 1rem` 作为默认，在不同组件类型使用特定圆角

3. **Q**: 是否需要添加所有 shadcn/ui 组件？
   - **A**: 按需添加，优先修复报错，再根据项目需求添加

4. **Q**: 现有组件的样式是否需要更新以匹配 shadcn/ui 风格？
   - **A**: 暂不更新，保持现有样式，除非有明确需求
