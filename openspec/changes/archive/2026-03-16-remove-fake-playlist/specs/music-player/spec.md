## MODIFIED Requirements

### Requirement: 空播放列表处理
系统 MUST 在没有可播放音乐时显示空状态，而非虚假/示例播放列表。

#### Scenario: 显示空状态
- **WHEN** 播放列表为空时
- **THEN** 系统 MUST 显示友好的空状态提示
- **AND** MUST 不显示任何虚假或示例音乐数据
- **AND** MUST 提示用户当前没有可播放的音乐

#### Scenario: 空状态点击交互
- **WHEN** 用户在空状态下点击播放器
- **THEN** 系统 MUST 显示提示信息（如"暂无音乐"）
- **AND** MUST 不尝试播放不存在的音乐

## REMOVED Requirements

### Requirement: 示例播放列表展示
**Reason**: 给用户造成误导，让人以为有音乐可播放但实际无法播放
**Migration**: 移除所有硬编码的示例数据，改为显示空状态
