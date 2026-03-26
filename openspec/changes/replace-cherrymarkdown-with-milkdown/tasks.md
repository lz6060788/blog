## 1. 依赖安装

- [x] 1.1 安装 Milkdown 核心包（@milkdown/core, @milkdown/ctx）
- [x] 1.2 安装 Milkdown 预设（@milkdown/preset-commonmark, @milkdown/preset-gfm）
- [x] 1.3 安装 Milkdown 插件（listener, history, prism, math）
- [x] 1.4 安装 Crepe 主题包（@milkdown/crepe）
- [x] 1.5 验证安装成功（运行 npm install 无错误）

## 2. 主题样式配置

- [x] 2.1 安装 `@milkdown/crepe/theme` 主题包（已在 1.4 中完成）
- [x] 2.2 创建 `app/styles/components/milkdown-theme.css` 样式文件
- [x] 2.3 导入 Crepe 基础主题 CSS（选择 Crepe 或 Nord 主题）
- [x] 2.4 通过 CSS 变量覆盖项目主题色（背景、文本、边框、强调色）
- [x] 2.5 配置深色/浅色主题变量映射
- [ ] 2.6 验证样式在不同主题下的显示效果
- [ ] 2.7 （可选）微调字体和间距以匹配项目设计

## 3. MilkdownPreview 组件实现

- [x] 3.1 创建 `components/editor/milkdown/milkdown-preview-internal.tsx` 内部实现
- [x] 3.2 实现 Milkdown 初始化和 Markdown 转 HTML 逻辑
- [x] 3.3 集成 Prism 代码高亮插件
- [x] 3.4 集成 KaTeX 数学公式渲染
- [x] 3.5 实现主题切换响应（使用 useTheme 监听主题变化）
- [x] 3.6 创建 `components/editor/milkdown/milkdown-preview.tsx` 入口组件
- [x] 3.7 实现 SSR 支持（不使用 dynamic import）
- [x] 3.8 定义组件 API（content, theme, className props）
- [x] 3.9 实现 ref 暴露（如需要客户端操作）
- [ ] 3.10 验证 SSR 输出完整 HTML

## 4. MilkdownEditor 组件实现

- [x] 4.1 创建 `components/editor/milkdown/milkdown-editor-internal.tsx` 内部实现
- [x] 4.2 实现 Milkdown 编辑器初始化
- [x] 4.3 实现工具栏和快捷键支持（通过 Crepe）
- [x] 4.4 实现 onChange 回调和内容获取 API
- [x] 4.5 实现 getHeight API（用于自适应高度）
- [x] 4.6 创建 `components/editor/milkdown/milkdown-editor.tsx` 入口组件
- [x] 4.7 使用 dynamic import 包装（ssr: false）
- [x] 4.8 添加加载状态提示
- [x] 4.9 定义组件 API（initialValue, onChange, height, className, theme props）
- [x] 4.10 实现 ref 暴露（getContent, setContent, getHeight）
- [ ] 4.11 验证编辑功能（输入、删除、格式化）

## 5. 页面集成

- [x] 5.1 更新文章编辑页：导入 MilkdownEditor 替代 CherryEditor
- [x] 5.2 更新文章编辑页：更新组件 props 调用
- [ ] 5.3 验证文章编辑功能正常
- [x] 5.4 更新文章详情页：导入 MilkdownPreview 替代 CherryPreview
- [x] 5.5 更新文章详情页：更新组件 props 调用
- [ ] 5.6 验证文章预览功能正常
- [ ] 5.7 验证主题切换在预览页正常工作

## 6. SEO 验证

- [ ] 6.1 启动开发服务器，访问文章详情页
- [ ] 6.2 查看页面源码，验证文章内容以 HTML 格式存在
- [ ] 6.3 验证 meta 标签（title, description, og:tags）正确
- [ ] 6.4 使用 Lighthouse 或 SEO 工具验证 SEO 评分

## 7. 清理旧代码

- [x] 7.1 删除 `components/editor/cherry/` 目录
- [x] 7.2 删除 `components/editor/preview/` 目录
- [x] 7.3 删除 `app/styles/components/cherry-preview.css` 文件
- [x] 7.4 从 `package.json` 中移除 `cherry-markdown` 依赖
- [x] 7.5 运行 `npm install` 清理依赖

## 8. 测试和优化

- [ ] 8.1 测试所有 Markdown 语法（标题、列表、代码块、表格、公式等）
- [ ] 8.2 测试深色/浅色主题切换
- [ ] 8.3 测试移动端响应式布局
- [ ] 8.4 测试代码高亮和复制功能
- [ ] 8.5 性能测试：检查包大小和加载时间
- [ ] 8.6 修复发现的 bug 和样式问题
- [ ] 8.7 准备部署

## 9. 文档更新（可选）

- [ ] 9.1 更新 CLAUDE.md 中的编辑器相关说明（如有）
- [ ] 9.2 更新 README 或使用文档（如有）
