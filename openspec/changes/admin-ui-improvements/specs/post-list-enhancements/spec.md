## ADDED Requirements

### Requirement: 文章列表显示分类和标签
系统 SHALL 在文章列表中显示每篇文章的分类和标签信息。

#### Scenario: 显示分类信息
- **WHEN** 用户查看文章列表
- **THEN** 每篇文章行 SHALL 显示其所属分类
- **AND** 分类 SHALL 使用 Badge 组件展示，带有颜色区分

#### Scenario: 显示标签信息
- **WHEN** 用户查看文章列表
- **THEN** 每篇文章行 SHALL 显示其关联的标签
- **AND** 标签 SHALL 使用 Badge 组件展示，显示最多 3 个标签
- **AND** 如果超过 3 个标签，显示 "+N" 提示

### Requirement: 文章列表显示字数统计
系统 SHALL 在文章列表中显示每篇文章的字数统计。

#### Scenario: 显示中文字数
- **WHEN** 用户查看文章列表
- **THEN** 每篇文章行 SHALL 显示字数统计
- **AND** 字数 SHALL 以中文计算方式（字符数）显示
- **AND** 格式 SHALL 为 "X 字"

#### Scenario: 字数统计精度
- **WHEN** 文章字数大于 1000
- **THEN** 显示格式 SHALL 为 "1.2k 字"、"3.5k 字" 等简化格式

### Requirement: 响应式布局
系统 SHALL 确保文章列表在不同屏幕尺寸下都能良好显示。

#### Scenario: 桌面端布局
- **WHEN** 用户在桌面端（宽度 >= 1024px）查看
- **THEN** 所有列（标题、分类、标签、字数、日期、操作） SHALL 完整显示

#### Scenario: 移动端布局
- **WHEN** 用户在移动端（宽度 < 768px）查看
- **THEN** 系统 SHALL 隐藏次要信息（字数、部分标签）
- **AND** 使用卡片式布局替代表格布局
