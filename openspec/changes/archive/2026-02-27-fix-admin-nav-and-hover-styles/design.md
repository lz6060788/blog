## Context

当前项目使用 Next.js 14 App Router 架构，采用 next-auth/react 进行身份认证。项目包含：

1. **主页导航** (`components/auth/UserMenu.tsx`)：使用 `useSession` hook 获取用户信息，显示头像下拉菜单
2. **管理端顶部导航** (`components/admin/top-bar.tsx`)：当前使用硬编码用户信息，需要改为从 session 获取
3. **管理端首页** (`app/admin/page.tsx`)：包含快捷操作卡片，使用 Tailwind CSS 的 `group` 和 `group-hover` 类处理悬浮样式

## Goals / Non-Goals

**Goals:**
- 修复主页用户菜单"个人资料"无效问题，改为跳转到管理端
- 修复管理端导航栏用户信息显示，移除无效菜单项
- 修复管理端快捷操作卡片悬浮样式问题

**Non-Goals:**
- 不涉及后端 API 修改
- 不涉及认证流程修改
- 不涉及主题系统修改

## Decisions

### 1. 主页用户菜单修改
**决策**：将"个人资料"改为"管理端"链接，使用 Next.js `Link` 组件导航

**理由**：
- `Link` 组件提供客户端导航，性能更优
- 保持与现有路由模式一致
- 不需要创建个人资料页面

**替代方案**：使用 `router.push()` — 被拒绝，因为这是静态链接，使用 `Link` 更符合 Next.js 最佳实践

### 2. 管理端用户信息获取
**决策**：在管理端布局中添加 `SessionProvider`，在 `TopBar` 组件中使用 `useSession` hook

**理由**：
- 与主页 `UserMenu` 保持一致的实现方式
- 项目已有 `SessionProvider` 组件 (`components/auth/SessionProvider.tsx`)
- 获取真实的用户信息而非硬编码

**替代方案**：通过 props 传递用户信息 — 被拒绝，会增加组件层级复杂度

### 3. 快捷操作悬浮样式
**决策**：为文字元素添加 `group-hover:text-theme-text-canvas` 类

**理由**：
- 卡片使用 `group` 类，子元素使用 `group-hover:*` 即可响应
- 使用现有主题色变量，保持一致性
- 最小化代码改动

**替代方案**：使用 CSS `:hover` 伪类 — 被拒绝，需要更多自定义样式代码

## Risks / Trade-offs

### Risk: 管理端布局未使用 SessionProvider
**风险描述**：`TopBar` 组件需要访问 session，但管理端布局可能未包装 `SessionProvider`

**缓解措施**：检查 `app/admin/layout.tsx`，如未包含则添加 `SessionProvider` 包装

### Risk: 快捷操作悬浮样式可能影响其他主题
**风险描述**：不同主题下文字颜色变量可能表现不一致

**缓解措施**：使用项目统一的主题色系统 (`text-theme-text-canvas`)，该系统已在深色/浅色主题中测试

## Migration Plan

1. 修改 `components/auth/UserMenu.tsx`：将"个人资料"改为"管理端"
2. 检查并修改 `app/admin/layout.tsx`：确保包含 `SessionProvider`
3. 修改 `components/admin/top-bar.tsx`：使用 `useSession` 替换硬编码，移除"个人资料"菜单项
4. 修改 `app/admin/page.tsx`：为快捷操作卡片文字添加悬浮样式
5. 测试所有修改点，确认功能正常

## Open Questions

无
