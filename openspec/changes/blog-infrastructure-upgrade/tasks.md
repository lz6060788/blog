## 1. Git 版本控制设置

- [x] 1.1 创建 .gitignore 文件，包含 Next.js 排除项（node_modules、.next、.env 文件、构建产物）
- [x] 1.2 使用 `git init` 命令初始化 Git 仓库
- [x] 1.3 配置远程仓库到 https://github.com/lz6060788/blog
- [x] 1.4 暂存所有项目文件，遵循 .gitignore 规则
- [x] 1.5 在 main 分支创建初始提交，提交消息为 "Initial commit: blog infrastructure setup"
- [x] 1.6 使用 `git push -u origin main` 推送到远程仓库

## 2. 主题系统实现

- [x] 2.1 使用 `npm install next-themes` 安装 next-themes 包
- [x] 2.2 创建 theme.config.ts，定义浅色和深色模式颜色（浅色主题必须完全保留当前项目的 zinc 色系：zinc-50 背景、white 卡片、zinc-900 文本、zinc-200 边框、emerald 强调色）
- [x] 2.3 更新 tailwind.config.ts，使用 css() 函数引用 CSS 变量并启用 darkMode: 'class'，确保现有 zinc 颜色类继续工作
- [x] 2.4 创建 components/ThemeProvider.tsx，包装 next-themes 的 ThemeProvider 组件，设置默认主题为 'light'
- [x] 2.5 更新 app/layout.tsx，用 ThemeProvider 包装 children 并在 html 标签上添加 suppressHydrationWarning
- [x] 2.6 更新 app/globals.css，注册语义化 CSS 自定义属性（--bg-primary、--text-primary 等），设置 300ms ease-in-out 过渡效果
- [x] 2.7 为暗色主题精心设计颜色（zinc-950 主背景、zinc-900 卡片、zinc-50 文本、zinc-400 次级文本、zinc-800 边框、调整后的 emerald 强调色）
- [x] 2.8 创建 components/ThemeToggle.tsx，包含浅色/深色/自动模式选项，遵循 frontend-design 美学规范
- [x] 2.9 将 ThemeToggle 组件添加到 Navigation.tsx
- [x] 2.10 在浏览器中测试主题切换功能（验证亮色主题与原项目完全一致、暗色主题视觉效果良好、localStorage 持久化、平滑过渡、无 FOUC）

## 3. 国际化设置

- [x] 3.1 使用 `npm install next-intl` 安装 next-intl 包
- [x] 3.2 创建 i18n.config.ts，配置语言环境（en、zh）和默认语言环境
- [x] 3.3 创建 middleware.ts，使用 next-intl 中间件进行语言环境检测和路由
- [x] 3.4 创建 locales 目录结构（locales/en/、locales/zh/）
- [x] 3.5 创建翻译 JSON 文件：locales/en/common.json 和 locales/zh/common.json，包含初始翻译
- [x] 3.6 创建额外的翻译命名空间（nav.json、home.json），包含所有 UI 文本
- [x] 3.7 将 app/ 目录重构为 app/[locale]/ 以支持基于语言环境的路由
- [x] 3.8 更新 app/[locale]/layout.tsx，提供翻译并生成带有本地化标题/描述的元数据
- [x] 3.9 更新 app/[locale]/page.tsx（首页），使用 getTranslations helper 用于服务端组件
- [x] 3.10 更新 app/[locale]/archive/page.tsx 以使用翻译
- [x] 3.11 更新 app/[locale]/post/[id]/page.tsx 以使用翻译
- [x] 3.12 更新 components/Navigation.tsx，使用 useTranslations hook 并支持客户端翻译
- [x] 3.13 更新 components/ArchiveGrid.tsx 以使用翻译
- [x] 3.14 更新 components/AuthorCard.tsx（如果存在）以使用翻译
- [x] 3.15 创建 components/LanguageSwitcher.tsx，包含语言选项（英语/中文）
- [x] 3.16 将 LanguageSwitcher 组件添加到 Navigation.tsx，与 ThemeToggle 并排
- [x] 3.17 在 app/[locale]/layout.tsx 中添加 hreflang 标签以优化 SEO（next-intl middleware 自动处理）
- [x] 3.18 测试语言环境路由（验证 /en 和 /zh URL 正确工作，语言切换器更新 URL，翻译正确显示）
- [x] 3.19 测试日期和数字本地化，使用支持语言环境的格式化
- [x] 3.20 验证 SSR 翻译正常工作（检查页面源中的翻译内容）

## 4. 测试和验证

- [x] 4.1 验证 Git 仓库已连接，推送/拉取正常
- [x] 4.2 在所有页面测试主题切换（首页、归档、文章详情）
- [x] 4.3 验证主题偏好在浏览器会话之间持久化
- [x] 4.4 测试自动主题模式是否匹配操作系统偏好
- [x] 4.5 验证两种主题的颜色对比度符合 WCAG AA 标准
- [x] 4.6 在所有页面测试语言切换
- [x] 4.7 验证所有静态文本都可翻译（组件中无硬编码字符串）
- [x] 4.8 使用 localStorage 测试语言偏好持久化
- [x] 4.9 验证页面源中存在 hreflang 标签
- [x] 4.10 运行 `npm run build` 确保没有构建错误
- [x] 4.11 运行 `npm run lint` 确保没有 lint 错误
- [x] 4.12 使用 `npm run build && npm start` 在生产模式下测试应用程序
- [x] 4.13 为 Git 版本控制设置创建提交
- [x] 4.14 为主题系统实现创建提交
- [x] 4.15 为国际化实现创建提交
- [x] 4.16 将所有提交推送到远程仓库
