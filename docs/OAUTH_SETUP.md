# OAuth 应用注册指南

本指南将帮助您为博客配置 GitHub 和 Google OAuth 登录。

## GitHub OAuth App

### 步骤

1. **创建 GitHub OAuth App**
   - 访问：https://github.com/settings/developers
   - 点击 "OAuth Apps" → "New OAuth App"
   - 或直接访问：https://github.com/settings/applications/new

2. **填写应用信息**
   ```
   Application name: My Blog (或任何你喜欢的名字)
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/api/auth/callback/github
   ```

3. **注册应用**
   - 点击 "Register application"
   - 复制 **Client ID**
   - 点击 "Generate a new client secret" 复制 **Client Secret**

4. **配置到环境变量**
   ```bash
   # .env.local
   GITHUB_CLIENT_ID=你复制的 Client ID
   GITHUB_CLIENT_SECRET=你复制的 Client Secret
   ```

### 生产环境

对于生产环境，需要创建另一个 OAuth App 或添加生产环境 URL：

```
Homepage URL: https://yourdomain.com
Authorization callback URL: https://yourdomain.com/api/auth/callback/github
```

## Google OAuth 2.0

### 步骤

1. **创建 Google Cloud 项目**
   - 访问：https://console.cloud.google.com/
   - 创建新项目或选择现有项目

2. **配置 OAuth 同意屏幕**
   - 导航到：APIs & Services → OAuth consent screen
   - 选择 "External" 用户类型
   - 填写必需信息：
     - 应用名称
     - 用户支持电子邮件
     - 开发者联系信息
   - 添加授权域名（开发环境可跳过）

3. **创建 OAuth 2.0 凭据**
   - 导航到：APIs & Services → Credentials
   - 点击 "Create Credentials" → "OAuth 2.0 Client ID"
   - 应用类型选择：Web application
   - 添加授权的重定向 URI：
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - 点击 "Create"

4. **复制凭据**
   - 复制 **Client ID**
   - 复制 **Client Secret**

5. **配置到环境变量**
   ```bash
   # .env.local
   GOOGLE_CLIENT_ID=你复制的 Client ID
   GOOGLE_CLIENT_SECRET=你复制的 Client Secret
   ```

### 生产环境

对于生产环境，需要添加生产环境的重定向 URI：

```
https://yourdomain.com/api/auth/callback/google
```

## 环境变量配置

将所有凭据添加到 `.env.local` 文件：

```bash
# NextAuth.js 配置
AUTH_SECRET=生成的密钥 (使用 openssl rand -base64 32)

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth URL (可选)
NEXTAUTH_URL=http://localhost:3000
```

## 生成 AUTH_SECRET

使用以下命令生成安全的 AUTH_SECRET：

```bash
openssl rand -base64 32
```

## 测试

配置完成后，重启开发服务器：

```bash
npm dev
```

访问 http://localhost:3000 并尝试登录功能。

## 故障排除

### GitHub 登录失败
- 检查回调 URL 是否完全匹配（包括协议和端口）
- 确认 Client Secret 正确复制（没有多余空格）

### Google 登录失败
- 确保 OAuth 同意屏幕已配置
- 检查重定向 URI 是否完全匹配
- 确认 Google Cloud 项目已启用 Google+ API（如需要）

### 会话问题
- 清除浏览器 cookies
- 检查 AUTH_SECRET 是否已设置
- 确认数据库迁移已运行

## 安全建议

1. **永远不要提交 `.env.local` 到版本控制**
   - `.env.local` 已在 `.gitignore` 中

2. **为不同环境使用不同的 OAuth Apps**
   - 开发环境：使用 `localhost`
   - 生产环境：使用实际域名

3. **定期轮换密钥**
   - 定期更新 AUTH_SECRET
   - 如有泄露，立即重新生成 OAuth 凭据

4. **限制 OAuth App 权限**
   - 只请求必需的权限（email, profile）
