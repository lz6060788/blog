## MODIFIED Requirements

### Requirement: 响应式布局
系统 SHALL 确保文章列表在不同屏幕尺寸下都能良好显示。

#### Scenario: 桌面端布局
- **WHEN** 用户在桌面端（宽度 >= 1024px）查看
- **THEN** 所有列（封面缩略图、标题、分类、标签、字数、日期、操作） SHALL 完整显示
- **AND** 封面缩略图列 SHALL 显示在最左侧
- **AND** 封面缩略图尺寸 SHALL 为 160x90px (16:9)

#### Scenario: 移动端布局
- **WHEN** 用户在移动端（宽度 < 768px）查看
- **THEN** 系统 SHALL 隐藏次要信息（字数、部分标签）
- **AND** 使用卡片式布局替代表格布局
- **AND** 封面图片 SHALL 显示在卡片顶部

### Requirement: 封面缩略图显示
系统 SHALL 在管理端文章列表中显示文章封面缩略图。

#### Scenario: 显示有封面的文章
- **WHEN** 文章有封面图片
- **THEN** 系统 SHALL 在封面列显示封面缩略图
- **AND** 缩略图 SHALL 为 160x90px (16:9 比例)
- **AND** 缩略图 SHALL 使用 object-fit: cover 裁剪

#### Scenario: 显示无封面的文章
- **WHEN** 文章没有封面图片
- **THEN** 系统 SHALL 显示默认图标占位符
- **AND** 占位符 SHALL 为 160x90px 区域
- **AND** 占位符 SHALL 使用图标组件（ImageIcon）

#### Scenario: 封面缩略图可点击
- **WHEN** 用户点击封面缩略图
- **THEN** 系统 SHALL 打开文章预览或编辑页面
- **AND** 缩略图 SHALL 显示鼠标悬停效果
