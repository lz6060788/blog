> **重要提示**：在实现任何后台 UI 页面或组件之前，必须先使用 `design-taste-frontend` skill 进行设计。这确保了设计质量符合项目的度量级规则、组件架构和视觉标准。

## 1. 路由保护与认证配置

- [x] 1.1 在项目根目录创建或更新 `middleware.ts`，配置 `/admin/*` 路由保护
- [x] 1.2 配置 NextAuth.js 的 `redirect` 回调，将登录成功后的默认重定向改为 `/admin`
- [x] 1.3 修改登录页面中"已登录用户访问登录页"的重定向逻辑，改为跳转到 `/admin`
- [x] 1.4 测试路由保护：未登录访问 `/admin` 应重定向到 `/login?callbackUrl=/admin`
- [x] 1.5 测试登录流程：登录成功后应重定向到 `/admin`

## 2. 后台布局组件

- [x] 2.1 创建 `app/admin/layout.tsx` 布局组件
- [x] 2.2 创建侧边栏组件 (`components/admin/sidebar.tsx`)，包含导航菜单
- [x] 2.3 创建顶部栏组件 (`components/admin/top-bar.tsx`)，包含用户信息和登出按钮
- [x] 2.4 实现移动端响应式：添加汉堡菜单按钮和侧边栏抽屉功能
- [x] 2.5 实现导航菜单高亮状态，根据当前路径自动高亮对应菜单项
- [x] 2.6 实现登出功能，调用 NextAuth.js 的 `signOut` 并重定向到首页

## 3. 后台首页

- [x] 3.1 创建 `app/admin/page.tsx` 后台首页
- [x] 3.2 实现统计卡片：文章总数、已发布数、草稿数、最近 7 天新增
- [x] 3.3 添加快捷操作按钮：新建文章、查看草稿、管理文章
- [x] 3.4 (可选) 添加最近活动列表

## 4. 文章管理功能

- [x] 4.1 创建 `app/admin/posts/page.tsx` 文章列表页面
- [x] 4.2 创建 `app/admin/posts/new/page.tsx` 新建文章页面
- [x] 4.3 创建 `app/admin/posts/[id]/edit/page.tsx` 编辑文章页面
- [x] 4.4 实现 Server Actions：`createPost`、`updatePost`、`deletePost`、`togglePostStatus`
- [x] 4.5 实现文章列表表格，包含标题、创建时间、状态、操作按钮
- [x] 4.6 实现分页功能（每页 20 条）
- [x] 4.7 实现搜索功能：按标题关键词过滤
- [x] 4.8 实现状态筛选：全部/已发布/草稿
- [x] 4.9 添加删除确认对话框
- [x] 4.10 实现空状态提示

## 5. 草稿管理功能

- [x] 5.1 创建 `app/admin/drafts/page.tsx` 草稿箱页面
- [x] 5.2 实现草稿列表（只显示 `published: false` 的文章）
- [x] 5.3 添加"直接发布"按钮，快速将草稿发布
- [x] 5.4 实现自动保存功能：编辑时每 30 秒自动保存草稿
- [ ] 5.5 实现草稿预览功能（可选）

## 6. 设置页面

- [x] 6.1 创建 `app/admin/settings/page.tsx` 设置页面
- [x] 6.2 实现设置表单：博客名称、博客描述、每页显示文章数
- [x] 6.3 实现 Server Actions：`updateSettings`
- [x] 6.4 添加设置保存成功提示

## 7. 博客主页调整

- [x] 7.1 从主页导航栏移除登录按钮
- [ ] 7.2 (可选) 在页脚添加"管理入口"链接，指向 `/admin`

## 8. UI 组件安装

- [x] 8.1 安装 shadcn/ui 的 Table 组件（如未安装）
- [x] 8.2 安装 shadcn/ui 的 Dialog 组件（如未安装）
- [x] 8.3 安装 shadcn/ui 的 DropdownMenu 组件（如未安装）
- [x] 8.4 安装 shadcn/ui 的 Switch 组件（如未安装）
- [x] 8.5 安装 shadcn/ui 的 Sheet 组件（用于移动端侧边栏，如未安装）

## 9. Cherry Markdown 编辑器集成

- [x] 9.1 安装 `cherry-markdown` 及其类型定义
- [x] 9.2 创建 `components/admin/cherry-editor.tsx` React 组件封装
- [x] 9.3 配置 Cherry Markdown 选项：工具栏、主题、上传回调
- [ ] 9.4 创建 Cherry Markdown 主题样式文件，匹配项目 CSS 变量
- [ ] 9.5 实现深浅色模式自动切换逻辑
- [ ] 9.6 实现图片上传功能（可选：创建图片上传 API 端点）
- [x] 9.7 测试编辑器：输入、工具栏、预览、保存功能

## 10. 前端设计（使用 design-taste-frontend skill）

- [x] 10.1 使用 `design-taste-frontend` 设计后台布局（侧边栏 + 顶部栏）
- [x] 10.2 使用 `design-taste-frontend` 设计文章列表页面
- [ ] 10.3 使用 `design-taste-frontend` 设计文章编辑页面
- [x] 10.4 使用 `design-taste-frontend` 设计草稿箱页面
- [x] 10.5 使用 `design-taste-frontend` 设计后台首页
- [x] 10.6 使用 `design-taste-frontend` 设计设置页面
- [x] 10.7 确保所有设计使用项目主题色（参考 `app/globals.css` 和 `tailwind.config.ts`）

## 11. 测试与验证

- [x] 11.1 端到端测试：未登录用户访问 `/admin` 被拦截并重定向
- [ ] 11.2 端到端测试：登录用户可正常访问后台所有页面
- [ ] 11.3 功能测试：新建文章并发布（使用 Cherry Markdown）
- [ ] 11.4 功能测试：将已发布文章改为草稿
- [ ] 11.5 功能测试：删除文章
- [ ] 11.6 功能测试：搜索和筛选功能
- [ ] 11.7 功能测试：登出功能
- [ ] 11.8 响应式测试：移动端布局正常显示
- [ ] 11.9 主题测试：深浅色模式切换正常
- [ ] 11.10 编辑器测试：Cherry Markdown 功能完整可用

## 12. 文档与清理

- [ ] 12.1 更新 README.md，添加后台管理功能说明
- [ ] 12.2 清理开发时的注释和调试代码
- [ ] 12.3 确保所有新增组件有正确的 TypeScript 类型
- [x] 12.4 运行 `npm run build` 确保无构建错误
