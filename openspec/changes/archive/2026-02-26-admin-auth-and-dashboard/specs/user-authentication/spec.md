## ADDED Requirements

### 需求：会话状态检查 API

系统应提供 API 端点供客户端检查用户当前的登录状态。

#### 场景：获取当前会话状态

- **当** 客户端调用 `GET /api/auth/session` 端点
- **则** 系统返回当前用户的会话信息
- **且** 如果用户已登录，返回包含用户信息的 JSON 对象：
  ```json
  {
    "user": {
      "name": "用户名称",
      "email": "user@example.com",
      "image": "https://avatar.url"
    },
    "expires": "ISO时间戳"
  }
  ```
- **且** 如果用户未登录，返回空对象或 `null`

#### 场景：会话过期检测

- **当** 用户的会话已过期
- **且** 客户端调用 `/api/auth/session` 端点
- **则** 系统返回空对象或 `null`
- **且** 客户端应根据返回值判断用户需要重新登录

### 需求：CSRF 保护

系统应确保所有认证相关的 API 请求受到 CSRF 保护。

#### 场景：CSRF Token 验证

- **当** 客户端发起需要认证的请求
- **则** 系统验证请求中的 CSRF Token
- **且** 如果 Token 无效，返回 403 Forbidden 错误
- **且** NextAuth.js 自动处理 CSRF Token 的生成和验证
