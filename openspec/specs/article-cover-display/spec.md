## ADDED Requirements

### Requirement: 封面图片展示
系统 SHALL 在指定的页面位置展示文章封面图片。

#### Scenario: 展示有封面的文章
- **WHEN** 文章有封面图片（coverImageUrl 不为空）
- **THEN** 系统 SHALL 显示文章封面图片
- **AND** 图片 SHALL 使用 Next.js Image 组件进行优化
- **AND** 图片 SHALL 按照指定尺寸和比例显示

#### Scenario: 展示无封面的文章
- **WHEN** 文章没有封面图片（coverImageUrl 为空或 null）
- **THEN** 系统 SHALL 显示默认占位符
- **AND** 占位符 SHALL 使用图标或渐变背景
- **AND** 占位符样式 SHALL 与页面设计风格一致

### Requirement: 响应式封面布局
系统 SHALL 确保封面在不同设备和屏幕尺寸下正确显示。

#### Scenario: 移动端封面显示
- **WHEN** 用户在移动设备（宽度 < 768px）查看
- **THEN** 封面图片 SHALL 占据容器全宽
- **AND** 封面高度 SHALL 根据比例自适应
- **AND** 图片 SHALL 保持清晰度

#### Scenario: 桌面端封面显示
- **WHEN** 用户在桌面设备（宽度 ≥ 1024px）查看
- **THEN** 封面图片 SHALL 按照设计尺寸显示
- **AND** 多个封面卡片 SHALL 按网格布局排列
- **AND** 图片 SHALL 保持一致的尺寸和比例

### Requirement: 封面图片优化
系统 SHALL 优化封面图片的加载性能和用户体验。

#### Scenario: 图片懒加载
- **WHEN** 封面图片不在首屏可视区域
- **THEN** 系统 SHALL 使用懒加载策略
- **AND** 图片 SHALL 在滚动到可视区域时加载
- **AND** 系统 SHALL 显示加载占位符

#### Scenario: 首屏图片优先加载
- **WHEN** 封面图片在首屏可视区域
- **THEN** 系统 SHALL 使用优先加载策略
- **AND** 图片 SHALL 尽快开始加载
- **AND** 系统 SHALL 禁用懒加载

#### Scenario: 图片加载失败处理
- **WHEN** 封面图片加载失败
- **THEN** 系统 SHALL 显示错误占位符
- **AND** 占位符 SHALL 不影响页面布局
- **AND** 系统 SHALL 记录错误日志

### Requirement: 封面尺寸规范
系统 SHALL 为不同页面位置使用不同的封面尺寸和比例。

#### Scenario: 管理端列表缩略图
- **WHEN** 封面显示在管理端文章列表
- **THEN** 封面尺寸 SHALL 为 160x90px
- **AND** 比例 SHALL 为 16:9
- **AND** 图片 SHALL 使用 object-fit: cover 裁剪

#### Scenario: 用户端列表卡片封面
- **WHEN** 封面显示在用户端文章列表
- **THEN** 封面比例 SHALL 为 16:9
- **AND** 宽度 SHALL 自适应容器
- **AND** 高度 SHALL 根据比例计算

#### Scenario: 归档页面封面
- **WHEN** 封面显示在归档页面
- **THEN** 封面比例 SHALL 为 16:9
- **AND** 尺寸 SHALL 介于列表和详情页之间
- **AND** 封面 SHALL 作为时间线项目的一部分

#### Scenario: 文章详情页头图
- **WHEN** 封面显示在文章详情页顶部
- **THEN** 封面比例 SHALL 为 16:9
- **AND** 宽度 SHALL 为页面全宽
- **AND** 最大高度 SHALL 不超过视口的 60%
- **AND** 图片 SHALL 作为文章头图展示

### Requirement: 封面可访问性
系统 SHALL 确保封面图片符合可访问性标准。

#### Scenario: 封面 alt 文本
- **WHEN** 显示封面图片
- **THEN** 系统 SHALL 提供有意义的 alt 文本
- **AND** alt 文本 SHALL 优先使用文章标题
- **AND** 如果文章标题不可用，alt 文本 SHALL 为"文章封面"

#### Scenario: 键盘导航
- **WHEN** 封面作为链接可点击
- **THEN** 封面 SHALL 支持键盘焦点
- **AND** 系统 SHALL 显示焦点指示器
- **AND** 回车键 SHALL 触发链接跳转
