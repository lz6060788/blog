## 为什么

当前博客没有用户认证系统，无法实现用户登录、个性化体验和权限管理。为了支持未来的功能（如用户发布评论、收藏文章、个人中心等），需要建立用户认证基础设施。NextAuth.js 是 Next.js 生态中最成熟的认证解决方案，提供开箱即用的 OAuth 支持和会话管理。

## 变更内容

- **NextAuth.js 集成**：安装并配置 NextAuth.js 认证库
- **OAuth 提供商配置**：支持 GitHub 和 Google OAuth 登录
- **数据库模型**：创建用户表和会话表（使用 Drizzle ORM）
- **会话管理**：实现用户会话的创建、验证和销毁
- **API 路由**：添加 NextAuth.js 的认证 API 端点
- **客户端集成**：提供登录/登出 UI 组件和 hooks

## 能力

### 新能力
- `user-authentication`：用户认证和会话管理，包括 OAuth 登录流程
- `user-session`：用户会话状态管理和访问控制

### 修改的能力
- `server-api`：添加会话保护 API 的能力

## 影响

- **新依赖**：next-auth（或 auth.js，NextAuth v5 的新名称）
- **数据库**：新增 users 和 sessions 表到现有 SQLite 数据库
- **API 路由**：添加 `/api/auth/[...nextauth]` 路由处理器
- **环境变量**：需要配置 OAuth 提供商的客户端 ID 和密钥
- **前端组件**：添加登录按钮、用户头像显示等组件
