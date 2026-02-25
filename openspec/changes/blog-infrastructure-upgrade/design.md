## 背景

该博客是一个使用 App Router 的 Next.js 14 应用，目前没有版本控制、动态主题或国际化。代码库使用硬编码的 Tailwind 颜色进行样式设计，限制了自定义和暗色模式的实现。项目的目标受众是英语和中文用户，但缺乏适当的 i18n 基础设施。作为一个极简的个人博客，架构应在支持这些基础功能的同时保持简单。

**当前状态：**
- 无 Git 版本控制 - 代码未跟踪且未备份到远程仓库
- 主题颜色硬编码在 tailwind.config.ts 中，使用 zinc 中性色调
- 不支持暗色模式
- 所有文本内容为英文，没有多语言支持机制
- 单一语言环境路由（仅根路径）

**约束条件：**
- 必须保持 Next.js App Router 兼容性
- 应最小化对打包大小的影响
- 主题切换必须无需页面重新加载
- i18n 必须同时支持服务端和客户端组件
- 构建时间应保持合理

## 目标 / 非目标

**目标：**
- 建立带有 GitHub 远程仓库的 Git 工作流，用于版本控制和协作
- 使用 CSS 自定义属性实现动态主题切换，便于自定义
- 支持浅色/深色/自动主题模式，具有平滑过渡效果
- 为英语和中文语言环境实现完整的 i18n 基础设施
- 保持卓越的开发者体验和性能

**非目标：**
- 实现完整的 CMS 或内容管理系统
- 最初支持超过两种语言（en、zh）
- 复杂的主题自定义（例如，用户定义的颜色方案）
- 每页面或每文章的主题覆盖
- RTL（从右到左）语言支持

## 技术决策

### Git 版本控制策略

**决策：** 在进行代码更改之前，立即初始化 main 分支的 Git 并连接到 GitHub 远程仓库。

**理由：**
- 从此更改的开始建立版本控制
- 允许基础设施升级本身被版本化
- main 分支遵循现代 Git 约定而非 master
- GitHub 连接支持备份和协作

**考虑的替代方案：**
- 在代码更改后初始化 Git：已拒绝 - 会丢失升级过程的历史记录
- 使用带有 develop 分支的 git-flow：已拒绝 - 对单人开发者博客来说过于复杂

### 主题系统实现

**决策：** 使用 CSS 自定义属性和 Next.js 14 App Router 的 `next-themes` 库进行主题管理。

**理由：**
- `next-themes` 提供经过实战测试的主题上下文提供程序，支持 SSR
- CSS 自定义属性支持运行时主题切换，无需 Tailwind 重新构建
- 内置基于系统偏好的自动主题检测
- 通过脚本注入处理未样式化内容闪烁（FOUC）
- 最小的打包影响（约 2KB gzipped）

**架构：**
```
theme.config.ts → 导出主题颜色定义
globals.css → 根据主题注册 CSS 自定义属性
ThemeProvider → 包装应用程序，提供 useTheme hook
tailwind.config.ts → 使用 css() 函数引用 CSS 变量
```

**考虑的替代方案：**
- 使用 CSS 变量的手动主题上下文：已拒绝 - `next-themes` 提供 SSR 安全的实现
- 仅 Tailwind darkMode: 'class'：已拒绝 - 主题更改需要重新构建 CSS
- CSS-in-JS 解决方案（styled-components）：已拒绝 - 与 Tailwind 冲突，增加打包大小

### 国际化库

**决策：** 在 Next.js 14 App Router 中使用 `next-intl` 进行国际化。

**理由：**
- 官方推荐用于 Next.js App Router
- 无缝支持服务端和客户端组件
- 使用 `[locale]` 动态段进行基于语言环境的路由
- TypeScript 优先，具有强类型安全
- 内置 ICU 消息格式，支持复数、日期、数字
- 良好的性能，最小的客户端 JavaScript

**架构：**
```
i18n.config.ts → 语言环境配置
middleware.ts → 语言环境检测和路由
locales/ → JSON 翻译文件
[locale]/ → 用于语言环境路由的 app 目录结构
useTranslations hook → 客户端组件翻译
getTranslations helper → 服务端组件翻译
```

**考虑的替代方案：**
- react-i18next：已拒绝 - 未针对 Next.js App Router 优化，需要更多样板代码
- next-i18next：已拒绝 - 为 Pages Router 设计，已被 next-intl 取代
- 自定义 i18n 解决方案：已拒绝 - 在 SSR、SSG 和 ISR 中正确实现复杂

### 翻译文件结构

**决策：** 使用按命名空间组织的 JSON 文件，采用扁平键结构。

**理由：**
- JSON 易于人工阅读和编辑
- 扁平键（例如 "nav.home"）比嵌套对象更容易搜索
- 命名空间分离（common.json、nav.json）保持文件可管理
- 通过复制结构轻松添加新语言环境

**文件结构：**
```
locales/
  en/
    common.json
    nav.json
    home.json
  zh/
    common.json
    nav.json
    home.json
```

**考虑的替代方案：**
- 每个语言环境一个 JSON：已拒绝 - 随着翻译增长会变得笨重
- YAML 或 TOML 格式：已拒绝 - 需要额外的构建步骤，JSON 是原生的

### 暗色模式实现

**决策：** 支持三种模式：浅色、深色和自动（系统偏好的）。

**理由：**
- 自动模式尊重用户的操作系统偏好的（最常见的期望）
- 浅色/深色模式为可访问性提供显式覆盖
- 跨会话持久化偏好
- 与现代 Web 标准一致

**技术方法：**
- `next-themes` 处理系统偏好检测
- 主题存储为 localStorage 中的 "theme" 键
- 类策略：在激活暗色模式时将 'dark' 类应用于 html 元素
- Tailwind 的 darkMode: 'class' 配置启用 dark: 变体

### 主题颜色设计

**决策：** 保留当前项目的 zinc 色系作为亮色主题，为暗色主题精心设计互补色彩方案。

**理由：**
- 当前项目的视觉设计已经过精心打磨，应完全保留作为亮色主题
- 暗色主题不应是简单的颜色反转，而应遵循 frontend-design 美学规范
- 两种主题应保持一致的设计语言和视觉层次

**亮色主题颜色（保留现有）：**
- 主背景：zinc-50 (#fafafa)
- 卡片背景：white (#ffffff)
- 主文本：zinc-900 (#18181b)
- 次级文本：zinc-500 (#71717a)
- 边框：zinc-200 (#e4e4e7)
- 强调色：emerald-50/400/700 系列

**暗色主题颜色（精心设计）：**
- 主背景：zinc-950 (#09090b) - 深邃的黑
- 卡片背景：zinc-900 (#18181b) - 稍浅的层次
- 主文本：zinc-50 (#fafafa) - 柔和的白
- 次级文本：zinc-400 (#a1a1aa) - 中等灰度
- 边框：zinc-800 (#27272a) - 微妙的分割
- 强调色：emerald-400/500（更亮以在深色背景上可见）、emerald-950（背景）

**设计原则（遵循 frontend-design）：**
- 使用语义化变量名（--bg-primary、--text-primary 等）而非通用名
- 确保暗色主题减少眼疲劳，避免高对比度的刺眼感
- 保持相同的圆角、阴影和布局系统
- 两种主题下的交互状态（hover、focus）都应有清晰反馈
- 文本对比度必须符合 WCAG AA 标准（至少 4.5:1）

## 风险 / 权衡

### 风险：主题加载期间未样式化内容闪烁（FOUC）
**缓解措施：** `next-themes` 在主体加载之前注入脚本以防止 FOUC，主题存储在 localStorage 中以便在后续加载时即时访问

### 风险：i18n 库增加打包大小
**缓解措施：** `next-intl` 使用 tree-shaking，仅加载当前语言环境的翻译，估计 +5KB gzipped

### 风险：翻译维护开销
**缓解措施：** 从最小翻译开始，使用 TypeScript 确保缺失的翻译会导致构建错误（类型安全翻译）

### 风险：服务端组件中的主题上下文水合不匹配
**缓解措施：** `next-themes` 为 Next.js SSR 设计，在应用主题类的 html 元素上使用 suppressHydrationWarning

### 风险：Git 仓库可能在初始提交中包含敏感数据
**缓解措施：** 在初始提交之前审查 .gitignore，确保 .env 文件和构建产物被排除

### 风险：旧浏览器的 CSS 自定义属性回退
**缓解措施：** CSS 变量具有 97%+ 的浏览器支持，对于现代博客可以接受。如果需要，在 Tailwind 配置中提供回退值。

### 风险：如果已部署，语言环境路由可能会破坏现有 URL
**缓解措施：** 这是一个没有部署 URL 的新项目，无需迁移。将来，实现从根到默认语言环境的重定向

### 权衡：语言环境生成导致的构建时间增加
**接受：** Next.js 将为每个语言环境生成静态页面，构建时间加倍（2 个语言环境）。对于构建不频繁的个人博客可以接受

## 迁移计划

### 阶段 1：Git 版本控制
1. 创建 .gitignore 文件
2. 初始化 Git 仓库：`git init`
3. 添加远程源：`git remote add origin https://github.com/lz6060788/blog`
4. 暂存所有文件：`git add .`
5. 创建初始提交：`git commit -m "Initial commit: blog infrastructure setup"`
6. 推送到 main：`git push -u origin main`

### 阶段 2：主题系统
1. 安装 `next-themes` 包
2. 使用颜色定义创建 `theme.config.ts`
3. 更新 `tailwind.config.ts` 以使用 css() 函数引用 CSS 变量
4. 创建包装 next-themes 提供程序的 `components/ThemeProvider.tsx`
5. 更新 `app/layout.tsx` 以包含 ThemeProvider
6. 创建 `components/ThemeToggle.tsx` 组件
7. 将主题切换器添加到 Navigation 组件
8. 在浏览器中测试主题切换

### 阶段 3：国际化
1. 安装 `next-intl` 包
2. 创建 `i18n.config.ts` 配置
3. 为语言环境路由创建 `middleware.ts`
4. 将 `app/` 目录重构为 `app/[locale]/`
5. 使用 JSON 翻译文件创建 `locales/en/` 和 `locales/zh/`
6. 创建翻译工具（useTranslations hook、getTranslations helper）
7. 更新所有组件以使用翻译
8. 创建语言切换器组件
9. 将语言切换器添加到 Navigation
10. 测试语言环境路由和翻译

### 回滚策略
- Git：每个阶段单独提交，易于还原各个阶段
- 主题：如果 CSS 变量引起问题，还原为硬编码的 Tailwind 颜色
- i18n：如果语言环境路由中断，删除中间件并恢复扁平的 app 结构

## 待解决问题

1. **我们应该使用基于路径的语言环境路由（/en、/zh）还是基于子域的（en.example.com、zh.example.com）？**
   - **建议：** 对于没有自定义域复杂性的个人博客，基于路径的路由更简单

2. **我们应该实现本地化 URL（例如，中文关于页面的 /zh/about）吗？**
   - **建议：** 是的，翻译路由段以获得更好的用户体验和 SEO

3. **我们应如何处理多种语言的博客文章内容？**
   - **建议：** 最初对两种语言环境使用相同的文章数据，仅翻译 UI。将来：向 Post 类型添加 locale 字段以进行完整的内容翻译

4. **主题偏好应该在设备间同步吗？**
   - **建议：** 不，为了隐私保持仅本地。用户的偏好可能因设备而异（例如，手机与桌面）
