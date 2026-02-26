## 1. 管理端主题集成

- [x] 1.1 在 `app/admin/layout.tsx` 中添加 ThemeProvider 包装，使用与主站相同的配置（`attribute="class"`, `defaultTheme="light"`, `enableSystem`, `disableTransitionOnChange={false}`）
- [x] 1.2 在 `components/admin/top-bar.tsx` 中导入 ThemeToggle 组件
- [x] 1.3 在 TopBar 右侧用户头像左侧添加 ThemeToggle 组件，确保间距和布局正确
- [x] 1.4 验证 ThemeProvider 配置与主站一致（检查 `app/[locale]/layout.tsx` 中的配置）

## 2. Button 组件悬浮状态修复

- [x] 2.1 修改 `components/ui/button.tsx` 中的 `buttonVariants`，为 default variant 添加 `hover:shadow` 效果
- [x] 2.2 修改 default variant 的悬浮状态，确保文字颜色使用正确的前景色变量
- [x] 2.3 修改 outline variant，将 `hover:bg-accent hover:text-accent-foreground` 替换为正确的颜色变量
- [x] 2.4 修改 ghost variant，确保悬浮状态颜色对比度符合 WCAG AA 标准
- [x] 2.5 在所有管理端页面测试按钮变体（default、outline、ghost、link）的悬浮效果

## 3. 其他 shadcn/ui 组件修复

- [x] 3.1 检查并修复 `components/ui/table.tsx` 的悬浮和焦点状态
- [x] 3.2 检查并修复 `components/ui/switch.tsx` 的悬浮状态
- [x] 3.3 检查并修复 `components/ui/dropdown-menu.tsx` 的悬浮状态
- [x] 3.4 检查并修复 `components/ui/dialog.tsx` 和 `components/ui/sheet.tsx` 的样式

## 4. 管理端页面组件样式审查

- [x] 4.1 审查 `app/admin/posts/page.tsx` 中的样式，修复不符合 UI 规范的地方
- [x] 4.2 审查 `app/admin/posts/new/page.tsx` 中的样式，确保按钮悬浮状态正确
- [x] 4.3 审查 `app/admin/drafts/page.tsx` 中的样式
- [x] 4.4 审查 `app/admin/settings/page.tsx` 中的样式
- [x] 4.5 审查 `components/admin/sidebar.tsx` 中的导航链接悬浮状态
- [x] 4.6 审查 `components/admin/top-bar.tsx` 中的交互元素样式

## 5. 主题变量使用检查

- [x] 5.1 搜索管理端组件中硬编码的颜色类（如 `bg-white`、`text-black`）
- [x] 5.2 搜索并替换为对应的主题变量（如 `bg-theme-bg-surface`、`text-theme-text-canvas`）
- [x] 5.3 检查是否有使用旧 shadcn/ui 变量名的地方（如 `bg-background`、`text-foreground`）
- [x] 5.4 确保所有颜色使用项目主题变量而非硬编码

## 6. 主题同步验证

- [x] 6.1 在主站切换到深色主题，然后进入管理端，验证管理端显示深色主题
- [x] 6.2 在管理端切换主题，返回主站，验证主站显示新选择的主题
- [x] 6.3 刷新页面，验证主题配置在 localStorage 中正确持久化
- [x] 6.4 测试自动模式，验证主题跟随系统偏好设置

## 7. 可访问性和对比度测试

- [x] 7.1 在浅色主题下检查所有按钮的文字与背景对比度（至少 4.5:1）
- [x] 7.2 在深色主题下检查所有按钮的文字与背景对比度
- [x] 7.3 检查所有交互元素的悬浮、焦点和激活状态是否有清晰的视觉反馈
- [x] 7.4 使用键盘导航测试所有交互元素的焦点状态

## 8. 移动端适配验证

- [x] 8.1 在移动端视口下检查 ThemeToggle 组件显示和布局
- [x] 8.2 验证主题切换按钮在移动端的触摸区域足够大（至少 44x44px）
- [x] 8.3 验证主题切换按钮不与其他控件重叠

## 9. 主题系统规范更新

- [x] 9.1 确认 `openspec/specs/theme-system/spec.md` 中的相关需求已通过 delta spec 更新
- [x] 9.2 验证所有新增和修改的需求都有对应的实现

## 10. 最终验证和清理

- [x] 10.1 运行 `npm run build` 确保没有 TypeScript 错误
- [x] 10.2 检查控制台是否有任何警告或错误
- [x] 10.3 在浅色和深色主题下进行完整的用户流程测试
- [x] 10.4 清理调试代码和注释
