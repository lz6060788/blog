# shadcn/ui 集成实现任务

## 1. 依赖安装与配置

- [x] 1.1 安装核心依赖：`class-variance-authority`, `clsx`, `tailwind-merge`
- [x] 1.2 验证 `lib/utils.ts` 中的 `cn` 函数实现
- [x] 1.3 运行 `npx shadcn@latest init` 初始化 shadcn/ui 配置
- [x] 1.4 验证生成的 `components.json` 配置文件（已删除 shadcn/ui 的 HSL 变量）

## 2. 主题变量扩展

- [x] 2.1 在 `globals.css` 的 `:root` 中添加 `--radius` 圆角变量（设置为 `1rem`）
- [x] 2.2 验证项目现有 CSS 变量表是否完整（--bg-*、--text-*、--accent-* 等）
- [x] 2.3 如有需要，扩展现有变量表（如添加新的 --bg-* 或 --text-* 变量）
- [x] 2.4 **不添加** shadcn/ui 的别名变量（如 --background、--foreground）
- [x] 2.5 确认深色模式下所有变量都有对应值

## 3. Tailwind 配置更新

- [x] 3.1 在 `tailwind.config.ts` 的 `theme.extend.colors` 中添加 shadcn/ui 颜色映射
- [x] 3.2 映射 `background` → `var(--bg-canvas)`
- [x] 3.3 映射 `foreground` → `var(--text-canvas)`
- [x] 3.4 映射 `card` → `var(--card-bg)`
- [x] 3.5 映射 `primary` → `var(--accent-primary)`
- [x] 3.6 映射其他 shadcn/ui 颜色（secondary、muted、accent、destructive、border、input、ring）
- [x] 3.7 添加 `radius: 'var(--radius)'`
- [ ] 3.8 验证 Tailwind 类名（bg-background、text-foreground 等）可用（需要运行时测试）
- [ ] 3.9 验证深色模式下颜色类名正确工作（需要运行时测试）

## 4. Button 组件集成

- [x] 4.1 运行 `npx shadcn@latest add button` 添加 Button 组件
- [x] 4.2 定制 Button 组件样式，使用项目主题变量
- [x] 4.3 配置 Button 变体（default、ghost、outline）
- [x] 4.4 配置 Button 尺寸（default、sm、lg）
- [x] 4.5 更新 `components/auth/UserMenu.tsx` 使用新的 Button 组件
- [x] 4.6 测试 UserMenu 功能（点击、下拉菜单、登出）

## 4.5 UI 组件引用修复

- [x] 4.5.1 添加 dropdown-menu 组件
- [x] 4.5.2 添加 avatar 组件
- [x] 4.5.3 删除旧的未使用组件（DropdownMenu.tsx, Avatar.tsx）
- [x] 4.5.4 验证所有 UI 组件引用正确
- [x] 4.5.5 启动开发服务器，确认无编译错误

## 5. 基础组件集成

- [ ] 5.1 运行 `npx shadcn@latest add input` 添加 Input 组件
- [ ] 5.2 定制 Input 组件样式，使用项目主题变量
- [ ] 5.3 运行 `npx shadcn@latest add label` 添加 Label 组件
- [ ] 5.4 运行 `npx shadcn@latest add card` 添加 Card 相关组件
- [ ] 5.5 测试组件在浅色模式下的显示
- [ ] 5.6 测试组件在深色模式下的显示

## 6. 高级组件集成（可选）

- [ ] 6.1 运行 `npx shadcn@latest add dialog` 添加 Dialog 组件
- [ ] 6.2 运行 `npx shadcn@latest add tabs` 添加 Tabs 组件
- [ ] 6.3 运行 `npx shadcn@latest add toast` 添加 Toast 组件（需安装 sonner）
- [ ] 6.4 定制组件样式以匹配项目设计

## 7. 现有组件评估（可选）

- [ ] 7.1 评估现有 DropdownMenu 组件是否需要替换
- [ ] 7.2 评估现有 Avatar 组件是否需要替换
- [ ] 7.3 如需替换，运行 `npx shadcn@latest add dropdown-menu` 和 `avatar`
- [ ] 7.4 更新使用这些组件的代码

## 8. 测试与验证

- [ ] 8.1 测试所有新组件的键盘导航
- [ ] 8.2 测试所有新组件的屏幕阅读器支持
- [ ] 8.3 验证所有组件的色彩对比度 ≥ 4.5:1
- [ ] 8.4 测试主题切换时组件颜色过渡动画
- [ ] 8.5 运行 TypeScript 类型检查，确保无类型错误
- [ ] 8.6 检查 bundle 大小，确认无明显膨胀

## 9. 文档更新

- [ ] 9.1 更新 README.md，说明 shadcn/ui 的使用方法
- [ ] 9.2 添加组件使用示例到文档
- [ ] 9.3 记录主题变量映射关系

## 10. 清理与优化（可选）

- [ ] 10.1 移除未使用的旧组件代码
- [ ] 10.2 优化依赖包，移除不必要的 Radix UI 包
- [ ] 10.3 评估是否需要代码分割优化
