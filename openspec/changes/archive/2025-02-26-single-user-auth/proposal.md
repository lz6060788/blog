## Why

当前博客程序使用 OAuth 认证系统，允许任意用户通过 GitHub 或 Google 登录。但对于个人博客来说，只有博主本人需要登录来管理内容。多用户认证增加了不必要的复杂性和安全风险。

## What Changes

- **BREAKING**: 移除公开的多用户 OAuth 登录功能
- 新增单用户白名单机制，仅允许预先配置的邮箱地址登录
- 新增管理员授权流程，首次登录时需要手动授权
- 新增环境变量配置博主邮箱（`ADMIN_EMAIL`）
- 修改登录页面，移除社交证明元素
- 修改认证回调逻辑，验证用户邮箱是否在白名单中

## Capabilities

### New Capabilities
- `admin-whitelist`: 单用户白名单验证机制

### Modified Capabilities
- `user-authentication`: 添加白名单验证需求
- `user-session`: 无需求变更

## Impact

- **代码变更**: `lib/auth.ts`（认证逻辑）、`app/[locale]/login/page.tsx`（登录页）、`middleware.ts`（路由保护）
- **环境变量**: 新增 `ADMIN_EMAIL` 必需配置
- **数据库**: 无需变更，继续使用现有 users 表
- **安全性**: 提升安全性，防止未授权用户登录
