## MODIFIED Requirements

### Requirement: 空音乐列表返回
系统 MUST 在数据库中没有音乐时返回空数组。

#### Scenario: 无音乐数据时返回空数组
- **WHEN** API 请求音乐列表且数据库为空
- **THEN** 系统 MUST 返回空数组 `[]`
- **AND** MUST 不返回任何示例或默认数据
- **AND** MUST 返回 200 状态码

#### Scenario: 空数组的响应格式
- **WHEN** API 返回空音乐列表
- **THEN** 响应格式 MUST 与有数据时保持一致
- **AND** MUST 包含正确的字段结构（空数组）

## REMOVED Requirements

### Requirement: 示例数据返回
**Reason**: 示例数据会给前端造成误导
**Migration**: API 在无数据时返回空数组，前端负责显示空状态 UI
