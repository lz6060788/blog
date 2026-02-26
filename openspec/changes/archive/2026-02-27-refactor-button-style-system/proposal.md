## Why

当前项目中的所有 shadcn/ui 组件（Button、Switch、Dialog、Avatar、DropdownMenu、Table、Sheet）都直接使用 shadcn/ui 的通用颜色变量（如 `bg-primary`、`text-primary-foreground`、`bg-accent` 等），这些变量在 Tailwind 配置中被映射到项目的主题色（如 `--accent-primary`、`--accent-fg`）。这种做法导致：

1. **组件间样式耦合**：多个组件共享相同的颜色变量，修改一个组件的颜色可能意外影响其他组件
2. **维护困难**：无法独立调整某个组件的样式而不影响其他组件
3. **命名不清晰**：`bg-primary` 无法表达这是按钮的背景色还是开关的激活状态
4. **扩展性差**：添加新组件时难以确定应该复用哪些现有变量

## What Changes

### 架构变更
- **BREAKING**: 为所有 shadcn/ui 基础组件建立独立的颜色变量系统
- **BREAKING**: 在 `tailwind.config.ts` 中为每个组件添加专用颜色映射
- **BREAKING**: 在 `global.css` 中为每个组件定义独立的颜色变量

### 涉及组件
- **Button**: 6 种变体（default、destructive、outline、secondary、ghost、link）
- **Switch**: checked/unchecked 状态，hover/focus 状态
- **Dialog**: overlay、content、close button、title、description
- **Avatar**: fallback 背景
- **DropdownMenu**: content、item、separator、label
- **Table**: header、row、footer、caption
- **Sheet**: overlay、content、close button、title、description

### 命名规范
- **Tailwind 类名**: `theme-{component}-{property}`（如 `theme-btn-default-bg`）
- **CSS 变量**: `--{component}-{property}-{state}`（如 `--btn-default-bg-hover`）
- **组件简写**: btn、swt、dlg、avt、ddm、tbl、sht

## Capabilities

### New Capabilities
- `component-color-system`: 建立组件级颜色变量系统，为每个 UI 组件定义独立的颜色命名空间

### Modified Capabilities
- `shadcn-ui-components`: 更新所有组件的颜色变量引用方式，从通用 shadcn/ui 变量迁移到组件专用变量

## Impact

### 涉及文件
- `components/ui/button.tsx` - 更新按钮样式类名
- `components/ui/switch.tsx` - 更新开关样式类名
- `components/ui/dialog.tsx` - 更新对话框样式类名
- `components/ui/avatar.tsx` - 更新头像样式类名
- `components/ui/dropdown-menu.tsx` - 更新下拉菜单样式类名
- `components/ui/table.tsx` - 更新表格样式类名
- `components/ui/sheet.tsx` - 更新侧边栏样式类名
- `tailwind.config.ts` - 添加所有组件的颜色映射
- `app/globals.css` - 定义所有组件的颜色变量

### 兼容性
- **视觉兼容**: 最终视觉效果保持不变，仅改变底层实现
- **API 兼容**: 所有组件的 props API 不变

### 迁移路径
1. 先完成所有组件的变量定义和映射
2. 逐个组件更新样式类名
3. 每个组件更新后进行视觉验证
