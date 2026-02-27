## 1. 创建基础色板系统

- [x] 1.1 创建 `app/styles/base/` 目录
- [x] 1.2 创建 `app/styles/base/colors.css`，定义 Zinc 色板（`--zinc-50` 到 `--zinc-950`）
- [x] 1.3 在 `colors.css` 中添加 Emerald 色板（`--emerald-50` 到 `--emerald-950`）
- [x] 1.4 在 `colors.css` 中添加语义色板（Red、Amber、Blue）
- [x] 1.5 创建 `app/styles/base/themes.css`，定义 `:root` 浅色主题和 `.dark` 深色主题

## 2. 创建语义颜色模块

- [x] 2.1 创建 `app/styles/semantic/` 目录
- [x] 2.2 创建 `app/styles/semantic/background.css`，将背景色变量改为引用基础色板
- [x] 2.3 创建 `app/styles/semantic/text.css`，将文字色变量改为引用基础色板
- [x] 2.4 创建 `app/styles/semantic/border.css`，将边框色变量改为引用基础色板
- [x] 2.5 创建 `app/styles/semantic/accent.css`，将强调色和语义色变量改为引用基础色板

## 3. 创建组件颜色模块

- [x] 3.1 创建 `app/styles/components/` 目录
- [x] 3.2 创建 `app/styles/components/button.css`，将按钮颜色变量改为引用基础色板
- [x] 3.3 创建 `app/styles/components/switch.css`，将开关颜色变量改为引用基础色板
- [x] 3.4 创建 `app/styles/components/dialog.css`，将对话框颜色变量改为引用基础色板
- [x] 3.5 创建 `app/styles/components/avatar.css`，将头像颜色变量改为引用基础色板
- [x] 3.6 创建 `app/styles/components/dropdown.css`，将下拉菜单颜色变量改为引用基础色板
- [x] 3.7 创建 `app/styles/components/table.css`，将表格颜色变量改为引用基础色板
- [x] 3.8 创建 `app/styles/components/sheet.css`，将侧边栏颜色变量改为引用基础色板

## 4. 创建向后兼容模块

- [x] 4.1 创建 `app/styles/legacy/` 目录
- [x] 4.2 创建 `app/styles/legacy/input.css`，将输入框变量改为引用基础色板
- [x] 4.3 创建 `app/styles/legacy/card.css`，将卡片变量改为引用基础色板
- [x] 4.4 创建 `app/styles/legacy/nav.css`，将导航变量改为引用基础色板

## 5. 更新主入口文件

- [x] 5.1 备份当前 `app/globals.css` 为 `app/globals.css.bak`
- [x] 5.2 重写 `app/globals.css`，保留 `@tailwind` 指令和通用样式
- [x] 5.3 在 `globals.css` 中按正确顺序 `@import` 所有新模块
- [x] 5.4 保留 `@layer base` 中的通用样式（`*` 选择器、过渡效果等）
- [x] 5.5 保留 `@layer utilities` 中的工具类

## 6. 验证和测试

- [x] 6.1 检查浅色主题下所有颜色显示正确
- [x] 6.2 检查深色主题下所有颜色显示正确
- [x] 6.3 验证主题切换功能正常工作
- [x] 6.4 验证所有组件（按钮、开关、对话框等）样式无变化
- [x] 6.5 使用开发者工具检查 CSS 变量引用链正确
- [x] 6.6 删除备份文件 `app/globals.css.bak`
