## MODIFIED Requirements

### Requirement: 播放列表获取
系统 MUST 允许所有用户（包括未登录用户）获取音乐播放列表。

#### Scenario: 未登录用户获取播放列表
- **WHEN** 未登录用户访问播放器
- **THEN** 系统 MUST 能够正常获取播放列表
- **AND** MUST 不返回 401 或 403 错误
- **AND** MUST 显示可播放的音乐列表

#### Scenario: 已登录用户获取播放列表
- **WHEN** 已登录用户访问播放器
- **THEN** 系统 MUST 能够正常获取播放列表
- **AND** MUST 显示可播放的音乐列表

## REMOVED Requirements

### Requirement: 播放列表权限校验
**Reason**: 音乐播放列表应为公开内容，不需要权限校验
**Migration**: 移除 API 端点的权限中间件，前端移除权限错误处理
