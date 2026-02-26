# 提案：登录注册页面

## Why

当前博客系统已实现基于 NextAuth.js 的 OAuth 认证（GitHub、Google），但缺少专门的登录和注册页面。用户只能通过页面上的登录按钮进行认证，体验不够完整。一个设计精美的登录注册页面能够提升用户对产品的第一印象，增强品牌认知，提供更流畅的认证体验。

## What Changes

- **新增** 独立的登录页面 `/login`，提供 OAuth 登录选项（GitHub、Google）
- **新增** 注册引导流程，整合到登录页面中（首次登录用户自动注册）
- **新增** 视觉上令人印象深刻的认证界面设计
- **新增** 登录状态切换动画和过渡效果
- **新增** 响应式设计，支持移动端和桌面端
- **优化** 现有 LoginButton 组件，引导用户到新页面

## Capabilities

### New Capabilities

- `login-page`: 用户认证界面系统，包含登录页面和视觉设计规范

### Modified Capabilities

- `user-authentication`: 扩展现有 OAuth 认证，增加专用登录页面入口
- `user-session`: 保持现有会话管理不变，增加页面级别的会话状态展示

## Impact

- **新增文件**：
  - `app/login/page.tsx` - 登录页面组件
  - `app/register/page.tsx` - 注册引导页面（可选，或合并到登录页）
  - `components/auth/LoginForm.tsx` - 登录表单组件
  - `components/auth/AuthButtons.tsx` - OAuth 登录按钮组
  - `components/auth/AuthLayout.tsx` - 认证页面布局容器
- **修改文件**：
  - `components/auth/LoginButton.tsx` - 更新链接到新登录页面
  - `lib/auth.ts` - 可能需要添加页面级别的配置
- **设计依赖**：
  - 遵循 frontend-design 技能规范：独特的字体选择、大胆的色彩方案、精致的动画效果
  - 避免通用的 AI 生成审美（Inter 字体、紫色渐变、标准布局）
- **技术依赖**：
  - 继续使用 NextAuth.js 现有配置
  - 集成现有的 useSession hook 和 SessionProvider
  - 保持与现有数据库架构（Drizzle + SQLite）的兼容性
