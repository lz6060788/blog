## 1. 依赖和配置

- [x] 1.1 安装 NextAuth.js v5 (next-auth@beta) 和 Drizzle 适配器
- [x] 1.2 创建 `.env.local` 文件并添加到 `.gitignore`
- [x] 1.3 在 `.env.local` 中添加必需的环境变量模板

## 2. 数据库模型

- [x] 2.1 在 `lib/db/schema.ts` 中添加 NextAuth.js 表定义（users, sessions, accounts）
- [x] 2.2 运行数据库迁移创建认证相关表
- [x] 2.3 创建 Drizzle 适配器配置文件（在 auth.ts 中）

## 3. NextAuth.js 配置

- [x] 3.1 创建 `lib/auth.ts` 配置文件
- [x] 3.2 配置 GitHub OAuth 提供商
- [x] 3.3 配置 Google OAuth 提供商
- [x] 3.4 配置 Drizzle 适配器和会话策略
- [x] 3.5 实现 signIn callback 进行基于邮箱的账号自动关联
- [x] 3.6 生成 AUTH_SECRET 并添加到环境变量

## 4. API 路由

- [x] 4.1 创建 `/app/api/auth/[...nextauth]/route.ts` 处理程序
- [ ] 4.2 测试登录和登出端点（需要 OAuth 凭据）

## 5. 客户端集成

- [x] 5.1 在根布局添加 SessionProvider 包装器
- [x] 5.2 创建登录按钮组件 (`components/auth/LoginButton.tsx`)
- [x] 5.3 创建用户菜单组件 (`components/auth/UserMenu.tsx`)
- [x] 5.4 创建登出功能（已在 UserMenu 中实现）
- [x] 5.5 在导航栏中集成认证 UI

## 6. 受保护的 API 示例

- [x] 6.1 创建受保护的 API 端点示例 (`/app/api/protected/route.ts`)
- [x] 6.2 创建需要认证的中间件辅助函数
- [ ] 6.3 测试受保护端点的认证流程（需要 OAuth 凭据）

## 7. 测试和文档

- [ ] 7.1 在开发环境测试 GitHub OAuth 登录流程
- [ ] 7.2 在开发环境测试 Google OAuth 登录流程
- [ ] 7.3 测试账号自动关联功能（相同邮箱的不同提供商）
- [x] 7.4 在 README 中添加认证设置文档
- [x] 7.5 创建 OAuth 应用注册指南

## 8. OAuth 应用注册

- [ ] 8.1 在 GitHub 创建 OAuth App（手动操作）
- [ ] 8.2 在 Google Cloud Console 创建 OAuth 2.0 凭据（手动操作）
- [ ] 8.3 配置回调 URL（开发环境）
