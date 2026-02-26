## Context

当前项目使用 next-themes 库实现主题切换，主站已集成 ThemeProvider 和 ThemeToggle 组件。主题配置存储在 localStorage 中，键名为 "blog-theme"。然而，管理端布局 (`app/admin/layout.tsx`) 没有被 ThemeProvider 包装，导致管理端无法访问主题状态，也无法使用 ThemeToggle 组件。

此外，shadcn/ui 的 Button 组件使用了 Tailwind 的颜色别名（如 `bg-primary`、`text-primary-foreground`、`hover:bg-primary/90`），这些别名映射到 CSS 变量。当前浅色主题的 primary 颜色是 emerald 系列，但悬浮状态使用 `hover:bg-primary/90`（90% 透明度），在浅色背景上对比度不足。

项目已定义的 CSS 变量包括：
- `--bg-canvas`, `--bg-surface`, `--bg-muted`：背景色
- `--text-canvas`, `--text-secondary`, `--text-tertiary`：文本色
- `--accent-primary`, `--accent-bg`, `--accent-text`：强调色
- `--border-default`：边框色
- `--error-primary`, `--error-bg`, `--error-text`：错误色

## Goals / Non-Goals

**Goals:**
- 管理端能够访问和切换主题状态
- 管理端与主站共享同一 localStorage 主题配置
- 修复所有按钮组件的悬浮状态对比度问题
- 确保所有交互元素有清晰的视觉反馈
- 统一使用主题变量，避免硬编码颜色

**Non-Goals:**
- 重新设计主题颜色系统（仅在现有变量基础上修复）
- 修改 next-themes 的核心行为
- 添加新的主题模式（仅使用现有的 light/dark/system）

## Decisions

### 1. 管理端 ThemeProvider 集成方式

**决策**：在管理端布局外层添加 ThemeProvider，而非修改主站布局的 ThemeProvider 作用域。

**理由**：
- 管理端布局是独立的客户端组件，有自己的 SessionProvider 包装
- next-themes 的 ThemeProvider 可以安全嵌套，内部 provider 会覆盖外部（但在此场景中我们希望共享状态）
- 通过使用相同的 storage key 配置，两个 ThemeProvider 实例将访问同一 localStorage 数据

**替代方案考虑**：
- 方案 A：在根布局包装整个应用。问题：管理端布局是客户端组件，根布局的服务器组件无法直接包装。
- 方案 B：修改 app/layout.tsx。问题：可能影响现有路由结构，增加复杂度。

### 2. 主题切换组件放置位置

**决策**：将 ThemeToggle 组件放在 TopBar 右侧，用户头像左侧。

**理由**：
- 主题切换是全局设置，不属于特定内容区域
- 用户习惯在顶部导航栏寻找设置相关选项
- 与用户菜单区分开，避免误操作

**替代方案考虑**：
- 方案 A：放在 Sidebar 底部。问题：移动端隐藏 Sidebar，功能不可达。
- 方案 B：放在设置页面。问题：用户需要频繁切换主题，放在设置页面不够便捷。

### 3. 按钮悬浮状态对比度修复方案

**决策**：为 default variant 的按钮添加 `hover:shadow` 阴影效果，同时调整悬浮状态的文字颜色为 `hover:text-primary-foreground`（确保使用正确的前景色变量），并在 outline variant 中使用 `hover:bg-accent` 而非 `hover:bg-accent/90`。

**理由**：
- 阴影可以增强按钮的悬浮感知，改善视觉反馈
- 使用主题变量确保在深色和浅色主题下都有正确的对比度
- 避免 `/90` 透明度变体在浅色背景上对比度不足的问题

**替代方案考虑**：
- 方案 A：使用 darker 背景色（如 `hover:bg-emerald-700`）。问题：硬编码颜色违反主题变量原则。
- 方案 B：添加边框。问题：影响设计一致性。

### 4. UI 规范检查范围

**决策**：按优先级分三阶段检查：
1. 高优先级：所有交互元素（按钮、链接、表单控件）的悬浮、焦点状态
2. 中优先级：颜色对比度和主题变量使用
3. 低优先级：动画过渡效果和微交互

**理由**：
- 先修复可访问性问题（对比度、交互反馈）
- 再维护代码质量（主题变量一致性）
- 最后增强用户体验（动画效果）

## Risks / Trade-offs

### 风险 1：ThemeProvider 嵌套导致状态不同步

**风险**：如果两个 ThemeProvider 实例配置不一致（如不同的 storage key），可能导致主题状态不同步。

**缓解**：确保管理端和主站的 ThemeProvider 使用相同的配置：
```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="light"
  enableSystem
  disableTransitionOnChange={false}
>
```

### 风险 2：修改 Button 组件影响现有使用

**风险**：修改 `buttonVariants` 的样式可能影响项目中所有使用 Button 的地方。

**缓解**：
- 仅修改悬浮状态，不改变默认状态
- 添加过渡效果确保变化平滑
- 在管理端页面测试所有按钮变体

### 风险 3：主题变量命名不一致

**风险**：项目中可能存在使用旧变量名或硬编码颜色的地方。

**缓解**：
- 使用 Grep 工具搜索常见的硬编码模式（如 `bg-white`, `text-black`, `#` 开头的颜色）
- 搜索旧变量名（如 `bg-background`, `text-foreground`）
- 优先修复管理端相关组件，主站可后续优化

## Migration Plan

1. **阶段 1：管理端主题集成**
   - 修改 `app/admin/layout.tsx`，添加 ThemeProvider 包装
   - 修改 `components/admin/top-bar.tsx`，集成 ThemeToggle 组件

2. **阶段 2：UI 组件修复**
   - 修改 `components/ui/button.tsx`，修复悬浮状态样式
   - 检查并修复其他 shadcn/ui 组件（table、switch、dropdown-menu）

3. **阶段 3：管理端页面审查**
   - 审查所有管理端页面组件的样式
   - 修复不符合 UI 规范的地方

4. **阶段 4：测试验证**
   - 在浅色和深色主题下测试所有功能
   - 验证主题在主站和管理端之间同步

## Open Questions

1. **主题切换动画时机**：是否需要在主题切换时添加页面过渡效果？当前 next-themes 默认禁用过渡以避免闪烁。
2. **Cherry Editor 适配**：Cherry Markdown 编辑器是否有深色主题？如果需要，如何与项目主题同步？（当前未调研）
3. **移动端体验**：管理端的主题切换按钮在移动端是否需要调整大小或位置？
