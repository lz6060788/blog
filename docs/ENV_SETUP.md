# 环境变量配置指南

本项目的环境变量文件结构：

```
.env.example              # 公开模板（可提交到 Git）
.env.local                # 开发环境（私有，已在 .gitignore）
.env.production.example   # 生产环境模板（可提交到 Git）
.env.production           # 生产环境（私有，已在 .gitignore）
```

---

## 快速开始

### 开发环境配置

1. **.env.local** 已创建，包含：
   - `AUTH_SECRET`（已生成）
   - GitHub 和 Google OAuth 模板

2. **填写您的 OAuth 凭据**：
   ```bash
   # 编辑 .env.local
   GITHUB_CLIENT_ID=你的实际值
   GITHUB_CLIENT_SECRET=你的实际值
   ```

3. **重启开发服务器**：
   ```bash
   npm dev
   ```

---

## 生产环境配置

### 方案 1：使用部署平台的环境变量（推荐）

**Vercel:**
1. 进入项目设置 → Environment Variables
2. 添加以下变量：
   ```
   AUTH_SECRET
   NEXTAUTH_URL
   GITHUB_CLIENT_ID
   GITHUB_CLIENT_SECRET
   GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET
   ```

**Netlify:**
1. 进入 Site settings → Environment variables
2. 添加相同的环境变量

### 方案 2：使用 .env.production 文件

1. **复制模板**：
   ```bash
   cp .env.production.example .env.production
   ```

2. **填写生产环境凭据**

3. **配置 GitHub/Google 的生产环境回调 URL**：
   - GitHub: `https://yourdomain.com/api/auth/callback/github`
   - Google: `https://yourdomain.com/api/auth/callback/google`

---

## OAuth Apps 配置

### GitHub OAuth App

#### 开发环境
- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

#### 生产环境
创建新应用或在现有应用中添加回调 URL：
- Homepage URL: `https://yourdomain.com`
- Authorization callback URL: `https://yourdomain.com/api/auth/callback/github`

### Google OAuth 2.0

#### 开发环境
- 授权的重定向 URI: `http://localhost:3000/api/auth/callback/google`

#### 生产环境
在同一个 OAuth 2.0 Client ID 中添加：
- 授权的重定向 URI: `https://yourdomain.com/api/auth/callback/google`

---

## 安全提醒

### ✅ 应该做
- 使用 `.env.local` 进行本地开发
- 为生产环境生成新的 `AUTH_SECRET`
- 定期轮换 OAuth 凭据
- 确保 `.env.production` 不提交到 Git

### ❌ 不应该做
- 不要将实际凭据提交到 Git
- 不要在公开代码中硬编码密钥
- 不要在不同环境共用同一个 `AUTH_SECRET`
- 不要在生产环境使用开发环境的凭据

---

## 验证配置

### 检查环境变量是否加载

```typescript
// 在开发服务器控制台查看
console.log("AUTH_SECRET:", process.env.AUTH_SECRET ? "已设置 ✓" : "未设置 ✗")
console.log("GITHUB_CLIENT_ID:", process.env.GITHUB_CLIENT_ID ? "已设置 ✓" : "未设置 ✗")
```

### 测试登录

1. 启动开发服务器
2. 访问 http://localhost:3000
3. 点击导航栏的登录按钮
4. 选择 GitHub 或 Google 登录
5. 授权后应成功返回并显示用户信息

---

## 故障排除

### 环境变量未生效

```bash
# 重启开发服务器
# Ctrl+C 停止，然后重新运行
npm dev
```

### GitHub 登录失败

- 检查回调 URL 是否完全匹配（包括协议和端口）
- 确认 Client Secret 没有多余空格
- 验证 GitHub OAuth App 的 Application name 和 URL 配置

### Google 登录失败

- 确保 OAuth 同意屏幕已配置
- 检查重定向 URI 是否完全匹配
- 验证 Google Cloud 项目的 OAuth 2.0 凭据状态

---

## 生成新的 AUTH_SECRET

### macOS / Linux
```bash
openssl rand -base64 32
```

### Windows (PowerShell)
```powershell
# 使用 PowerShell
New-Guid
```

或在线生成：https://generate-secret.vercel.app/32

---

## 部署平台特定配置

### Vercel
- 在项目设置中配置环境变量
- `NEXTAUTH_URL` 会自动设置，无需手动配置

### Netlify
- 在 Site settings → Environment variables 中配置
- 需要明确设置 `NEXTAUTH_URL`

### Docker
- 在 Dockerfile 或 docker-compose.yml 中传递环境变量
- 或使用 `.env` 文件挂载到容器

---

## 更多信息

- [NextAuth.js 环境变量文档](https://authjs.dev/reference/nextjs#environment-variables)
- [GitHub OAuth Apps 指南](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Google OAuth 2.0 指南](https://developers.google.com/identity/protocols/oauth2)
