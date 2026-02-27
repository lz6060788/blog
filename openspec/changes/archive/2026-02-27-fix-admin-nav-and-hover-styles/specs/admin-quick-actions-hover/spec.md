## ADDED Requirements

### Requirement: Quick action cards shall show hover color change
管理端首页快捷操作卡片在鼠标悬浮时，卡片内文字颜色 SHALL 发生变化以保持与背景色的对比度。

#### Scenario: Hover changes text color for visibility
- **WHEN** 用户将鼠标悬浮在快捷操作卡片上
- **THEN** 卡片内的标题和描述文字颜色发生变化
- **AND** 变化后的文字颜色与卡片背景色保持足够对比度
- **AND** 文字清晰可读

### Requirement: Quick action cards shall maintain icon visibility
快捷操作卡片的图标在悬浮状态下 SHALL 保持清晰可见。

#### Scenario: Hover maintains icon visibility
- **WHEN** 用户将鼠标悬浮在快捷操作卡片上
- **THEN** 图标颜色或透明度发生变化以突出显示
- **AND** 图标与背景保持良好对比度
