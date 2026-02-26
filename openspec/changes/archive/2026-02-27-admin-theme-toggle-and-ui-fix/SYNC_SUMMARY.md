# OpenSpec Delta Specs 同步摘要

## 同步日期
2026-02-27

## 变更标识
admin-theme-toggle-and-ui-fix

## 同步的 Delta Specs

### 1. 新增规范：admin-theme-sync

**文件路径**: `D:\workspace\git\blog\openspec\specs\admin-theme-sync\spec.md`

**变更类型**: 新增 (ADDED)

**主要内容**:
- 管理端主题提供程序：管理端布局应被 ThemeProvider 包装，使管理端能够访问和切换主题状态
- 管理端主题切换组件：管理端顶部栏应提供主题切换组件，允许用户在浅色、深色和自动模式之间切换
- 主题切换组件移动端适配：确保主题切换组件在移动端保持可用性和可访问性
- ThemeProvider 配置一致性：管理端和主站的 ThemeProvider 应使用相同配置，确保主题状态正确同步
- 主题状态同步：管理端与主站之间的主题状态双向同步机制

### 2. 修改规范：theme-system

**文件路径**: `D:\workspace\git\blog\openspec\specs\theme-system\spec.md`

**变更类型**: 修改 (MODIFIED)

**变更详情**:

#### 修改的需求：

1. **shadcn/ui 圆角变量**
   - 原需求描述：系统应添加圆角 CSS 变量以支持 shadcn/ui 组件的圆角配置
   - 修改后新增：所有交互组件在悬浮状态应保持圆角不变

2. **Tailwind 颜色映射**
   - 原需求描述：系统应在 Tailwind 配置中添加 shadcn/ui 所需的颜色定义，映射到项目现有的 CSS 变量
   - 修改后新增：
     - `primary-foreground` 映射到 `var(--accent-fg)`
     - `muted-foreground` 映射到 `var(--text-secondary)`
     - `accent-foreground` 映射到 `var(--accent-primary)`
     - `destructive-foreground` 映射到 `var(--text-reversed)`
   - 新增场景：悬浮状态颜色映射（确保悬浮状态与背景有足够对比度，outline 变体应使用 `hover:bg-accent`）
   - 深色模式下的颜色映射新增：`bg-primary` 使用深色主题下合适的强调色，`hover:bg-primary/90` 在深色模式下应有足够对比度

3. **主题切换组件**
   - 原需求描述：系统应提供主题切换 UI 组件，用于在浅色、深色和自动模式之间切换
   - 修改后新增：
     - 当前选中的选项应有 `bg-theme-text-canvas text-theme-bg-surface` 样式
     - 未选中的选项应有 `text-theme-text-tertiary hover:text-theme-text-secondary` 样式
   - 新增场景：主题切换器在管理端使用（组件应与主站使用相同的样式，应能正确读取和更新 localStorage 中的主题配置）

#### 新增的需求：

1. **按钮悬浮状态对比度**
   - 确保按钮在悬浮状态下文字颜色与背景色符合 WCAG AA 标准（至少 4.5:1）
   - 默认按钮悬浮状态：显示阴影效果，使用 `text-primary-foreground`，背景使用 `hover:bg-primary/90`
   - 轮廓按钮悬浮状态：背景变为 `bg-accent`，文字使用 `text-accent-foreground`
   - 幽灵按钮悬浮状态：背景变为 `bg-accent`，文字使用 `text-accent-foreground`

2. **交互元素视觉反馈**
   - 为所有可交互元素提供清晰的悬浮、焦点和激活状态样式
   - 链接悬浮状态：显示下划线或颜色变化，使用 CSS 过渡效果
   - 表单控件焦点状态：显示焦点环（focus ring），颜色使用 `ring-theme-accent-primary`
   - 开关组件悬浮状态：有轻微的阴影或缩放效果，使用 CSS 过渡效果

3. **主题变量使用规范**
   - 确保所有颜色使用主题变量，避免硬编码
   - 使用背景色变量：应使用 `bg-theme-bg-canvas`、`bg-theme-bg-surface` 或 `bg-theme-bg-muted`
   - 使用文本色变量：应使用 `text-theme-text-canvas`、`text-theme-text-secondary` 或 `text-theme-text-tertiary`
   - 使用强调色变量：应使用 `text-theme-accent-primary`、`bg-theme-accent-bg` 等

4. **深色主题按钮适配**
   - 确保按钮在深色主题下有足够的对比度和视觉反馈
   - 深色主题下默认按钮：背景色应使用深色主题的 `--accent-primary` 变量，文字颜色应确保与背景对比度至少为 4.5:1
   - 深色主题下轮廓按钮：背景应使用 `bg-accent`，在深色主题下应有足够的对比度

## 同步状态

- [x] 创建 admin-theme-sync 主规范文件
- [x] 更新 theme-system 主规范文件
- [x] 验证所有变更已正确应用

## 影响范围

### 新增文件
- `openspec/specs/admin-theme-sync/spec.md`

### 修改文件
- `openspec/specs/theme-system/spec.md`

### 无影响的文件
- 其他所有规范文件保持不变

## 验证清单

- [x] admin-theme-sync 规范已创建
- [x] theme-system 规范已更新
- [x] 所有 ADDED 需求已添加到主规范
- [x] 所有 MODIFIED 需求已更新到主规范
- [x] 无 REMOVED 需求（符合 delta spec）

## 下一步行动

建议在完成同步后：
1. 验证所有变更已正确应用到主规范文件
2. 如需要，使用 `openspec-archive-change` 技能归档此变更
