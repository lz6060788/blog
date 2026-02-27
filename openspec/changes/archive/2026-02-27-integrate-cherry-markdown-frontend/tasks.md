## 1. 创建 CherryPreview 组件

- [x] 1.1 创建 `components/cherry-preview-internal.tsx`，实现 Cherry Markdown 客户端初始化
- [x] 1.2 创建 `components/cherry-preview.tsx` 包装组件，定义 props 接口
- [x] 1.3 配置 Cherry Markdown 为只读预览模式
- [x] 1.4 实现主题属性以支持深色/浅色模式切换

## 2. 将预览组件集成到文章详情页

- [x] 2.1 在 `app/[locale]/post/[id]/page.tsx` 中导入并使用 CherryPreview
- [x] 2.2 使用 CherryPreview 组件替换手动 Markdown 解析逻辑
- [x] 2.3 将文章内容和当前主题传递给 CherryPreview
- [x] 2.4 移除旧的正则表达式解析代码

## 3. 样式适配

- [x] 3.1 添加 Cherry Markdown 预览的 CSS 覆盖样式，使用主题 CSS 变量
- [x] 3.2 测试深色模式下的预览渲染效果
- [x] 3.3 测试浅色模式下的预览渲染效果
- [x] 3.4 验证代码块、表格和其他元素使用正确的主题颜色

## 4. 测试与验证

- [x] 4.1 测试各种 Markdown 语法（标题、列表、代码块、表格、引用块、任务列表）
- [x] 4.2 测试文章详情页使用 CherryPreview 后正确加载
- [x] 4.3 验证主题切换时预览样式正确更新
- [x] 4.4 检查控制台错误和性能问题
