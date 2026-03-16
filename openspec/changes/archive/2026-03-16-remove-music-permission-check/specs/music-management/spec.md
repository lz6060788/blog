## MODIFIED Requirements

### Requirement: 音乐列表 API 访问
系统音乐列表 API MUST 不要求身份验证，允许所有用户访问。

#### Scenario: 公开访问音乐列表
- **WHEN** 任何用户请求音乐列表 API
- **THEN** 系统 MUST 返回音乐列表数据
- **AND** MUST 不检查用户身份验证状态
- **AND** MUST 不返回权限错误

## REMOVED Requirements

### Requirement: 播放列表访问权限检查
**Reason**: 音乐列表应作为公开内容访问
**Migration**: 移除 API 端点的权限校验中间件
