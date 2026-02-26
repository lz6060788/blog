# 设计文档：登录注册页面

## Context

### 当前状态

系统已实现基于 NextAuth.js 的 OAuth 认证（GitHub、Google），使用 Drizzle ORM + SQLite 存储用户数据。现有认证组件包括 `LoginButton` 和 `UserMenu`，但缺少独立的登录页面。

### 技术栈

- **前端框架**: Next.js 14 (App Router)
- **认证**: NextAuth.js v5
- **样式**: Tailwind CSS（现有主题系统）
- **动画**: framer-motion（项目已有依赖）
- **主题**: next-themes（支持浅色/深色/自动模式）
- **数据库**: Drizzle ORM + SQLite
- **会话管理**: JWT + Database Session 混合模式

### 现有设计系统

**主题系统**（已实现）：
- CSS 自定义属性（CSS 变量）
- 语义化颜色命名：`theme-bg-canvas`、`theme-text-canvas`、`theme-accent-primary` 等
- 亮色主题基于 zinc 色系（zinc-50 到 zinc-950）
- 深色主题已设计（zinc-950 背景，zinc-50 文本）
- 强调色使用 emerald 系列

**字体系统**（已配置）：
- **Sans**: Outfit（通过 CSS 变量 `--font-outfit`）
- **Mono**: JetBrains Mono（通过 CSS 变量 `--font-jetbrains-mono`）

**动画模式**（项目已使用）：
- 使用 framer-motion 的 `motion` 组件
- variants 模式：`container` + `item` 定义动画状态
- `staggerChildren` 实现交错入场动画
- `whileHover`、`whileTap` 实现交互反馈
- spring 过渡：`transition={{ type: 'spring', stiffness: 200, damping: 15 }}`

**设计规范**（已建立）：
- 圆角：`rounded-[2rem]`（大卡片）、`rounded-full`（小元素）
- 卡片样式：`bg-theme-card-bg` + `border border-theme-card` + `shadow-card`
- 导航栏：`bg-theme-nav` + `backdrop-blur-md`
- 图标库：@phosphor-icons/react

### 设计约束

- 必须使用现有主题系统，不创建新配色
- 必须使用 framer-motion，不使用自定义 CSS 动画
- 必须与现有 NextAuth.js 配置兼容
- 需支持响应式设计（移动端、平板、桌面）
- 应遵循 accessibility 最佳实践（WCAG 2.1 AA）

## Goals / Non-Goals

### Goals

1. **品牌一致性**: 在现有设计系统基础上创建独特但不突兀的登录页面
2. **无缝集成**: 与现有认证系统和主题系统完美配合
3. **视觉差异化**: 通过布局和排版创新，而非新配色或字体
4. **性能优化**: 使用项目已优化的动画模式，保持流畅（60fps）
5. **可访问性**: 键盘导航、屏幕阅读器支持、足够的色彩对比度

### Non-Goals

- 不创建新的配色方案或主题变量
- 不引入新的字体（使用现有 Outfit + JetBrains Mono）
- 不使用自定义 CSS 动画（仅用 framer-motion）
- 不实现邮箱/密码登录（仅 OAuth）
- 不修改现有主题配置或全局样式

## Decisions

### 1. 设计策略：在约束内创新

**决策**: 在现有设计系统内通过布局、排版和微交互实现差异化。

**创新点**:
- **布局**: 分屏设计而非居中卡片，与现有页面的单栏布局形成对比
- **排版**: 大标题 + 装饰性排版元素，利用 Outfit 字体的几何特性
- **深度**: 使用现有的 `shadow-card` + `bg-theme-bg-surface` 创建层次感
- **动画**: 复用项目的 variants 模式，但调整 stagger 参数营造新节奏

**理由**:
- 保持品牌一致性
- 避免设计系统碎片化
- 利用现有组件和样式，减少代码重复

### 2. 色彩使用策略

**决策**: 完全使用现有主题颜色变量，通过组合创造新效果。

**配色方案**（基于现有变量）：
- **主背景**: `bg-theme-bg-canvas`
- **视觉区域背景**: `bg-theme-bg-surface`（与主背景形成对比）
- **功能区域背景**: `bg-theme-card-bg`（卡片风格）
- **主文字**: `text-theme-text-canvas`
- **次要文字**: `text-theme-text-secondary`
- **强调色**: `bg-theme-accent-primary`（GitHub 按钮）
- **边框**: `border border-theme-border`

**视觉技巧**：
- 使用渐变叠加：`bg-gradient-to-br from-theme-bg-surface to-theme-bg-surface-alt`
- 使用透明度创造层次：`bg-theme-accent-primary/10`（背景色）

**理由**:
- 自动适配深色/浅色主题切换
- 无需维护额外配色代码
- 与项目其他页面保持一致

### 3. 字体使用

**决策**: 使用项目现有字体，通过大小、粗细和间距创造层次。

**字体应用**：
- **页面标题**: `font-sans text-4xl font-semibold tracking-tight`
- **装饰性文字**: `font-mono text-sm`（用于标签、元信息）
- **按钮文字**: `font-sans text-sm font-medium`
- **欢迎信息**: `font-sans text-2xl font-medium`

**排版层次**：
```tsx
// 主标题
<h1 className="text-4xl font-semibold tracking-tight text-theme-text-canvas">
  欢迎回来
</h1>

// 装饰性标签
<span className="font-mono text-xs text-theme-text-tertiary uppercase tracking-wider">
  /login
</span>

// 按钮文字
<button className="font-sans text-sm font-medium">
  使用 GitHub 登录
</button>
```

**理由**:
- Outfit 已有几何现代感，无需引入新字体
- JetBrains Mono 提供技术感，适合装饰元素
- 与现有组件风格一致

### 4. 动画系统

**决策**: 完全使用 framer-motion，复用项目已有的动画模式。

**动画模式**（参考 AuthorCard 和 Navigation）：

```tsx
// 1. 容器 + 子元素交错动画
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,  // 可调整交错延迟
      delayChildren: 0.2,     // 可调整初始延迟
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

// 2. 悬停交互
<motion.div
  whileHover={{ y: -2 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
>

// 3. 背景装饰动画
<motion.div
  animate={{ scale: [1, 1.1, 1] }}
  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
>
```

**应用场景**：
- **页面入场**: 整体使用 container/item variants
- **按钮悬停**: `whileHover={{ y: -2 }}` + `whileTap={{ scale: 0.97 }}`
- **图标动画**: 参考 Navigation 的 logo 旋转效果
- **装饰元素**: 循环动画（如 AuthorCard 的状态指示器）

**理由**:
- 项目已有 framer-motion 依赖
- 动画代码可复用，减少维护成本
- 性能已优化（GPU 加速）

### 5. 布局架构

**决策**: 分屏布局（Split Screen）

**Desktop**:
- 左侧 (55%): 视觉区域 - 品牌展示、装饰图形
- 右侧 (45%): 功能区域 - 登录表单、OAuth 按钮

**Mobile**:
- 垂直堆叠，视觉区域在上（35%），功能区域在下（65%）

**组件层次**：
```
app/login/page.tsx
├── motion.div (容器，stagger 动画)
    ├── VisualSection (视觉区域)
    │   ├── motion.div (品牌标题)
    │   ├── motion.div (装饰图形 - 循环动画)
    │   └── motion.div (欢迎文字)
    └── AuthSection (功能区域)
        ├── motion.div (欢迎信息)
        ├── motion.div (OAuth 按钮组)
        │   ├── motion.button (GitHub 按钮)
        │   └── motion.button (Google 按钮)
        └── motion.div (页脚链接)
```

**响应式断点**：
- `md`: 768px（平板）
- `lg`: 1024px（桌面端，启用分屏布局）

**理由**:
- 分屏布局与现有单栏页面形成差异
- 视觉区域可以展示品牌个性
- 功能区域保持卡片风格，符合现有设计语言

### 6. 组件设计

**决策**: 创建可复用的认证组件，遵循项目现有组件模式。

**组件列表**：

1. **`AuthLayout`** (components/auth/AuthLayout.tsx)
   - 布局容器，处理分屏逻辑
   - 添加背景色和响应式类
   - 使用 `motion.div` 包裹，支持入场动画

2. **`VisualSection`** (components/auth/VisualSection.tsx)
   - 左侧视觉区域
   - 品牌标题 + 装饰性几何图形
   - 使用 framer-motion 循环动画

3. **`OAuthButton`** (components/auth/OAuthButton.tsx)
   - 通用的 OAuth 登录按钮
   - 接受 provider（'github' | 'google'）props
   - 样式参考现有按钮风格
   - 图标使用 @phosphor-icons/react

4. **`AuthCard`** (components/auth/AuthCard.tsx)
   - 右侧功能区域的卡片容器
   - 使用 `bg-theme-card-bg border border-theme-card shadow-card rounded-[2rem]`
   - 类似 AuthorCard 的样式风格

**代码示例**（OAuthButton）：
```tsx
export function OAuthButton({ provider }: { provider: 'github' | 'google' }) {
  const config = {
    github: {
      label: '使用 GitHub 登录',
      icon: GithubLogo,
      className: 'bg-theme-btn-bg-primary text-theme-btn-text-primary hover:bg-theme-btn-bg-primary-hover',
    },
    google: {
      label: '使用 Google 登录',
      icon: GoogleLogo,
      className: 'bg-theme-btn-ghost text-theme-btn-text-ghost hover:bg-theme-btn-bg-ghost-hover',
    },
  }

  const { label, icon: Icon, className } = config[provider]

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className={cn('w-full px-4 py-3 rounded-2xl flex items-center justify-center gap-2 font-sans text-sm font-medium transition-colors', className)}
    >
      <Icon size={20} weight="bold" />
      <span>{label}</span>
    </motion.button>
  )
}
```

### 7. 状态管理

**决策**: 复用 NextAuth.js 的会话管理，无额外状态库。

**实现**：
```tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // 已登录用户重定向
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center">加载中...</div>
  }

  // 未登录显示登录表单
  return <AuthLayout />
}
```

**理由**:
- NextAuth 已提供完整的会话管理
- 无需额外状态管理库
- 与项目其他部分的认证逻辑一致

### 8. 图标使用

**决策**: 使用项目已有的 @phosphor-icons/react 库。

**图标映射**：
- GitHub: `GithubLogo` (weight="bold" 或 "fill")
- Google: `GoogleLogo`
- 装饰图标: `CirclesThree`, `SquaresFour`, `Sparkle` 等

**示例**：
```tsx
import { GithubLogo, GoogleLogo, Sparkle } from '@phosphor-icons/react'

<Sparkle size={32} weight="fill" className="text-theme-accent-tertiary" />
```

## Risks / Trade-offs

### Risk 1: 分屏布局在移动端体验不佳

**风险**: 左侧视觉区域在小屏幕上占用空间

**缓解措施**:
- 移动端减少视觉区域高度至 30-35%
- 使用装饰性背景而非复杂图形
- 确保功能区域（登录按钮）优先显示

### Risk 2: 动画性能问题

**风险**: 过多 framer-motion 动画可能影响低端设备

**缓解措施**:
- 复用项目已验证的动画配置
- 减少同时动画的元素数量
- 使用 CSS `will-change` 提示浏览器优化
- 测试低端设备的性能

### Risk 3: 主题切换时样式问题

**风险**: 深色/浅色主题切换时可能有闪烁

**缓解措施**:
- 使用项目已有的 ThemeProvider
- 所有颜色使用 CSS 变量，自动适配主题
- 避免硬编码颜色值

## Migration Plan

### 部署步骤

1. **Phase 1: 组件开发**（无用户影响）
   - 创建 AuthLayout、VisualSection、OAuthButton 组件
   - 使用现有主题变量和 framer-motion 模式
   - 单元测试

2. **Phase 2: 页面集成**（无用户影响）
   - 创建 `/login` 路由
   - 测试 OAuth 流程
   - 测试主题切换

3. **Phase 3: 导航更新**（用户可见）
   - 更新 LoginButton 指向新页面
   - 监控错误日志

### 回滚策略

- 保留原 LoginButton，仅修改链接
- 如遇问题，快速恢复原链接
- 无数据库变更，无需数据回滚

## Open Questions

1. **Q**: 是否需要添加视觉区域的装饰图形？
   - **A**: 可选，先实现基础布局，再迭代添加装饰元素

2. **Q**: 页面是否需要支持多语言？
   - **A**: 是，使用项目现有的 next-intl 系统

3. **Q**: 是否需要在视觉区域显示社交证明（如用户数量）？
   - **A**: 可选的 Phase 2 功能，核心功能优先

4. **Q**: 移动端是否完全隐藏视觉区域？
   - **A**: 不完全隐藏，保留简化版本（20-30% 高度）
