## Why

当前音乐播放列表有权限校验，限制了非登录用户或非特定用户访问音乐。这不符合公开音乐播放器的预期行为，应该允许所有访问者都能听到设置的音乐。

## What Changes

- **BREAKING**: 移除音乐播放列表 API 的权限校验中间件
- 修改 `/api/music/playlist` 端点，允许所有用户访问（包括未登录用户）
- 移除前端对音乐权限错误的处理逻辑

## Capabilities

### New Capabilities
无新增能力

### Modified Capabilities
- `music-player`: 移除播放列表权限校验要求
- `music-management`: 移除音乐管理 API 的访问限制

## Impact

- **后端 API**: `/api/music/playlist` 端点将移除 `requireAuth` 或类似权限检查中间件
- **前端组件**: 音乐播放器组件不再需要处理权限错误（401/403）
- **安全性**: 音乐播放列表将变为公开访问，任何能访问站点的人都能获取音乐信息
