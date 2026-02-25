## 背景

该博客目前是一个静态 Next.js 14 应用，已经集成了 Drizzle ORM 和 SQLite 数据库框架。没有用户认证系统，所有内容都是公开的。为了支持未来的用户交互功能（评论、收藏等），需要添加用户认证能力。

**约束条件：**
- 必须与 Next.js 14 App Router 兼容
- 必须与现有的 Drizzle ORM 和 SQLite 集成
- OAuth 提供商使用 GitHub 和 Google
- 环境变量管理敏感信息（客户端密钥）

## 目标 / 非目标

**目标：**
- 集成 NextAuth.js v5 (auth.js) 进行用户认证
- 支持 GitHub 和 Google OAuth 登录
- 使用现有数据库存储用户和会话数据
- 提供登录/登出 UI 组件
- 实现会话保护的 API 路由中间件

**非目标：**
- 邮箱密码登录（仅 OAuth）
- 用户注册功能（OAuth 自动创建用户）
- 用户资料编辑
- 密码重置流程
- 多因素认证 (MFA)
- 权限管理系统（角色/权限）

## 技术决策

### 认证库：NextAuth.js v5 (auth.js)

**理由：**
- **官方推荐**：Next.js 团队推荐的认证解决方案
- **App Router 原生支持**：v5 版本专为 App Router 设计
- **OAuth 开箱即用**：内置支持数十种 OAuth 提供商
- **数据库适配器**：提供 Drizzle ORM 适配器
- **会话管理**：自动处理 JWT 和数据库会话
- **安全性**：内置 CSRF 保护、加密等安全措施

**考虑的替代方案**：
- Lucia Auth - 更轻量，但需要更多配置
- 自行实现 - 灵活但安全性难以保证

### 数据库模型：使用 Drizzle ORM 适配器

**理由：**
- NextAuth.js 提供官方的 Drizzle 适配器
- 自动生成所需的 users、sessions、accounts 表结构
- 与现有数据库框架无缝集成

**表结构（自动生成）：**
- `users`：用户基本信息（id, name, email, image）
- `sessions`：会话数据（sessionToken, userId, expires）
- `accounts`：OAuth 账户关联（provider, providerAccountId, userId）

### OAuth 提供商：GitHub 和 Google

**理由：**
- **GitHub**：开发者友好，适合技术博客
- **Google**：覆盖面广，大多数用户都有 Google 账户
- **两者互补**：满足不同用户群体的偏好

**未来可扩展**：可添加更多提供商（Twitter、Facebook 等）

### 环境变量配置

**理由：**
- OAuth 密钥不能硬编码
- 使用 `.env.local` 管理本地开发配置
- 生产环境通过部署平台配置环境变量

**必需的环境变量：**
```bash
AUTH_SECRET                    # NextAuth 密钥
GITHUB_CLIENT_ID               # GitHub OAuth App ID
GITHUB_CLIENT_SECRET           # GitHub OAuth App Secret
GOOGLE_CLIENT_ID               # Google OAuth Client ID
GOOGLE_CLIENT_SECRET           # Google OAuth Client Secret
```

### 会话策略：数据库 + JWT 混合

**理由：**
- 数据库会话：可以主动撤销，更适合安全性要求高的场景
- JWT：减少数据库查询，提高性能
- NextAuth.js 默认使用混合策略

### 账号关联策略：基于邮箱的自动关联

**理由：**
- 用户可能在 GitHub 和 Google 使用相同的邮箱
- 避免为同一用户创建多个账号
- 提升用户体验，用户可以用任何方式登录同一个账号

**实现方式：**
在 NextAuth.js 的 `signIn` callback 中实现：
1. 当用户使用 OAuth 登录时，检查返回的邮箱
2. 如果邮箱已存在于数据库中，获取现有用户 ID
3. 将新的 OAuth account 关联到现有用户（而非创建新用户）
4. 如果邮箱不存在，正常创建新用户

**数据库关系：**
```
users (1) ←→ (N) accounts
一个用户可以有多个 OAuth 账户关联
```

**示例场景：**
- 用户首次使用 GitHub 登录 → 创建用户 A
- 用户使用 Google（相同邮箱）登录 → 检测到邮箱已存在 → 将 Google account 关联到用户 A
- 用户现在可以用任一方式登录，都访问同一个账号

## 风险 / 权衡

**风险：OAuth 依赖** → 如果 GitHub/Google 服务中断，用户无法登录。缓解：支持多个 OAuth 提供商作为备份。

**风险：密钥泄露** → 环境变量可能意外暴露。缓解：使用 `.env.local`（gitignore）、不在代码中打印密钥。

**权衡：单一登录方式** → 仅支持 OAuth 可能限制部分用户。缓解：未来可添加邮箱密码登录。

**权衡：会话存储** → 数据库会话需要额外的存储和查询开销。缓解：SQLite 对于个人博客规模足够。

## 待解决的问题

无 - 技术栈和实现路径都很明确。OAuth 应用注册需要在 GitHub 和 Google 开发者控制台手动完成。
