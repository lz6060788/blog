## 1. 创建客户端组件包装器

- [x] 1.1 创建 `components/article-content.tsx` 客户端组件
- [x] 1.2 将 CherryPreview 和相关交互逻辑移到 ArticleContent 组件中
- [x] 1.3 实现 ArticleContent 接受 content 和 theme 作为 props
- [x] 1.4 测试 ArticleContent 组件客户端功能是否正常

## 2. 实现服务端渲染

- [x] 2.1 将 `app/[locale]/post/[id]/page.tsx` 改为服务端组件（移除 'use client'）
- [x] 2.2 实现服务端数据获取函数，根据 ID 获取文章数据
- [x] 2.3 添加文章不存在时的错误处理（返回 404）
- [x] 2.4 实现服务端组件的 JSX 结构，包含 ArticleContent
- [x] 2.5 测试服务端渲染是否正常工作

## 3. 生成 SEO 元数据

- [x] 3.1 实现 `generateMetadata` 函数
- [x] 3.2 生成页面 title（包含文章标题和网站名称）
- [x] 3.3 生成 meta description（使用文章摘要）
- [x] 3.4 生成 Open Graph 标签（og:title, og:description, og:type）
- [x] 3.5 测试元数据是否正确显示在页面源代码中

## 4. 优化 CherryPreview 主题切换

- [x] 4.1 修改 CherryPreview 组件，监听 theme prop 变化
- [x] 4.2 实现 theme 变化时重新初始化 Cherry Markdown 的逻辑
- [x] 4.3 添加主题切换时的加载状态提示
- [x] 4.4 优化 CSS 样式，添加主题切换过渡效果
- [x] 4.5 测试主题切换是否流畅，无闪烁

## 5. 实现主题状态同步

- [x] 5.1 在服务端组件中传递默认主题（light）给 ArticleContent
- [x] 5.2 在 ArticleContent 中使用 useTheme hook 获取客户端主题状态
- [x] 5.3 实现客户端水合后立即应用用户主题偏好
- [x] 5.4 添加 suppressHydrationWarning 避免水合警告
- [x] 5.5 测试不同主题偏好下的页面加载效果

## 6. 测试与验证

- [x] 6.1 测试 SEO：使用爬虫模拟工具验证内容可抓取
- [x] 6.2 测试元数据：验证 title、description、og tags 是否正确
- [x] 6.3 测试主题切换：验证深色/浅色主题切换流畅
- [x] 6.4 测试首屏加载：验证 SSR 带来的性能提升
- [x] 6.5 测试社交分享：验证分享链接时预览信息正确
- [x] 6.6 测试多语言：验证不同语言环境下的渲染正常
