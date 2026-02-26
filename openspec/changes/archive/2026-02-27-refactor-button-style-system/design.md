## Context

当前项目使用 shadcn/ui 作为 UI 组件库，包含 7 个基础组件：
- Button（6 种变体）
- Switch（开关）
- Dialog（对话框）
- Avatar（头像）
- DropdownMenu（下拉菜单）
- Table（表格）
- Sheet（侧边栏）

所有组件都共享 shadcn/ui 的通用颜色变量：
- `primary` / `primary-foreground` → `--accent-primary` / `--accent-fg`
- `secondary` / `secondary-foreground` → `--bg-muted` / `--text-canvas`
- `accent` / `accent-foreground` → `--accent-bg` / `--accent-primary`
- `destructive` / `destructive-foreground` → `--error-primary` / `--text-reversed`
- `muted` / `muted-foreground` → `--bg-muted` / `--text-secondary`
- `background` / `foreground` → `--bg-canvas` / `--text-canvas`
- `popover` / `popover-foreground` → `--bg-surface` / `--text-canvas`
- `input` → `--input-bg`
- `border` → `--border-default`

这种共享变量架构导致组件间强耦合，难以独立维护。

## Goals / Non-Goals

**Goals:**
- 为每个 shadcn/ui 组件建立独立的颜色命名空间
- 保持现有视觉效果和组件 API 不变
- 建立可复制的模式，便于未来添加新组件
- 提供清晰的命名约定

**Non-Goals:**
- 不改变组件的视觉效果
- 不改变组件的 props API
- 不修改 shadcn/ui 的核心逻辑

## Decisions

### 1. 组件颜色变量架构

采用三层架构：

| 层级 | 位置 | 命名格式 | 示例 | 职责 |
|------|------|----------|------|------|
| 颜色清单层 | `global.css` | `--{component}-{property}-{state}` | `--btn-default-bg-hover` | 纯颜色值 |
| 配置映射层 | `tailwind.config.ts` | `theme.colors.theme.{component}.{property}` | `theme.btn.defaultBg` | CSS 变量引用 |
| 组件使用层 | 组件文件 | `{type}-theme-{component}-{property}` | `bg-theme-btn-default-bg` | Tailwind 类名 |

### 2. 组件简写命名

为保持类名简洁，使用组件简写：

| 组件 | 简写 | 说明 |
|------|------|------|
| Button | btn | 按钮 |
| Switch | swt | 开关 |
| Dialog | dlg | 对话框 |
| Avatar | avt | 头像 |
| DropdownMenu | ddm | 下拉菜单 |
| Table | tbl | 表格 |
| Sheet | sht | 侧边栏 |

### 3. 属性命名规范

使用语义化的属性名：
- `bg`: 背景色
- `fg`: 前景色（文字/图标）
- `border`: 边框色
- `shadow`: 阴影色

状态后缀：
- `-hover`: 悬停状态
- `-focus`: 聚焦状态
- `-active`: 激活状态
- `-checked`: 选中状态
- `-unchecked`: 未选中状态

### 4. 各组件变量设计

#### Button (btn)
```css
/* Default 变体 */
--btn-default-bg / --btn-default-fg
--btn-default-bg-hover / --btn-default-fg-hover

/* Destructive 变体 */
--btn-destructive-bg / --btn-destructive-fg
--btn-destructive-bg-hover

/* Outline 变体 */
--btn-outline-bg (透明)
--btn-outline-fg / --btn-outline-border
--btn-outline-bg-hover

/* Secondary 变体 */
--btn-secondary-bg / --btn-secondary-fg
--btn-secondary-bg-hover

/* Ghost 变体 */
--btn-ghost-bg (透明)
--btn-ghost-fg
--btn-ghost-bg-hover / --btn-ghost-fg-hover

/* Link 变体 */
--btn-link-bg (透明)
--btn-link-fg
```

#### Switch (swt)
```css
/* Checked 状态 */
--swt-bg-checked
--swt-bg-checked-hover
--swt-thumb-bg

/* Unchecked 状态 */
--swt-bg-unchecked
--swt-border-unchecked

/* Focus 状态 */
--swt-ring-color
```

#### Dialog (dlg)
```css
/* Overlay */
--dlg-overlay-bg

/* Content */
--dlg-content-bg
--dlg-content-border

/* Close Button */
--dlg-close-bg-hover
--dlg-close-fg-hover

/* Text */
--dlg-title-fg
--dlg-desc-fg
```

#### Avatar (avt)
```css
/* Fallback */
--avt-fallback-bg
--avt-fallback-fg
```

#### DropdownMenu (ddm)
```css
/* Content */
--ddm-content-bg
--ddm-content-border
--ddm-content-fg

/* Item */
--ddm-item-bg-hover
--ddm-item-fg-hover

/* Separator */
--ddm-separator-bg

/* Label */
--ddm-label-fg
```

#### Table (tbl)
```css
/* Footer */
--tbl-footer-bg

/* Row */
--tbl-row-bg-hover
--tbl-row-bg-selected

/* Text */
--tbl-head-fg
--tbl-caption-fg
```

#### Sheet (sht)
```css
/* Overlay */
--sht-overlay-bg

/* Content */
--sht-content-bg
--sht-content-border

/* Close Button */
--sht-close-bg-hover

/* Text */
--sht-title-fg
--sht-desc-fg
```

## Risks / Trade-offs

### 风险 1: 变量数量增加
**风险**: 从约 10 个共享变量增加到约 50 个组件专用变量

**缓解措施**:
- 变量按组件组织，结构清晰
- CSS 变量作用域明确
- 现代浏览器处理大量 CSS 变量性能良好

### 风险 2: 初始迁移工作量大
**风险**: 需要同时修改 7 个组件

**缓解措施**:
- 逐个组件迁移，每个组件独立可测试
- 保持视觉效果不变，易于视觉回归
- 建立详细的检查清单

### 风险 3: 类名长度增加
**风险**: `bg-theme-btn-default-bg` 比 `bg-primary` 长

**缓解措施**:
- 现代 IDE 支持自动完成
- 类名自描述性强
- 使用 cn/clsx 工具管理复杂样式

## Migration Plan

### 阶段 1: 扩展 global.css（所有组件颜色变量）

### 阶段 2: 更新 tailwind.config.ts（所有组件映射）

### 阶段 3: 逐个组件更新样式
1. Button
2. Switch
3. Avatar
4. Table
5. DropdownMenu
6. Dialog
7. Sheet

### 阶段 4: 测试验证

### 回滚策略
如有问题，通过 git revert 快速回滚。

## Open Questions

无
