## ADDED Requirements

### Requirement: 修复双滚动条问题
系统 SHALL 确保文章编辑页面只显示一个滚动条，提供良好的滚动体验。

#### Scenario: 单一滚动区域
- **WHEN** 用户在文章编辑页滚动内容
- **THEN** 系统 SHALL 只有一个滚动条
- **AND** 整个页面 SHALL 作为单一滚动区域

#### Scenario: 编辑器自适应高度
- **WHEN** 编辑器内容超出可视区域
- **THEN** 系统 SHALL 使用页面级别的滚动
- **AND** 编辑器容器 SHALL 不出现内部滚动条

### Requirement: 改进分类选择下拉框样式
系统 SHALL 使用 shadcn/ui 的 Select 组件替换原生 select 元素，提供更好的视觉效果。

#### Scenario: 美化的下拉框
- **WHEN** 用户查看分类选择器
- **THEN** 下拉框 SHALL 使用 shadcn/ui Select 组件样式
- **AND** 支持搜索、键盘导航等增强功能

#### Scenario: 样式主题适配
- **WHEN** 用户切换主题（亮色/暗色）
- **THEN** Select 组件 SHALL 自动适配主题颜色
- **AND** 使用项目的 HSL 颜色变量

### Requirement: 解决选择分类后画面抖动
系统 SHALL 通过布局优化，避免选择分类后显示标签输入导致的画面抖动。

#### Scenario: 预留标签输入区域
- **WHEN** 页面初始加载时
- **THEN** 系统 SHALL 为标签输入预留固定高度空间
- **AND** 即使没有选择分类，该空间 SHALL 保持占用

#### Scenario: 固定高度容器
- **WHEN** 用户选择分类后
- **THEN** 标签输入 SHALL 在预分配的空间内显示
- **AND** 容器高度 SHALL 保持不变，不导致下方元素跳动

#### Scenario: 平滑过渡动画
- **WHEN** 标签输入显示/隐藏
- **THEN** 系统 SHALL 使用平滑的过渡动画
- **AND** 动画时长 SHALL 为 300ms
- **AND** 使用 CSS `transition-all` 属性

### Requirement: 编辑页面布局不影响其他页面
系统 SHALL 确保文章编辑页面的布局修改不影响其他管理端页面的布局。

#### Scenario: 样式隔离
- **WHEN** 修改文章编辑页布局
- **THEN** 修改 SHALL 仅作用于编辑页面
- **AND** 其他管理页面 SHALL 保持原有布局

#### Scenario: CSS 模块化
- **WHEN** 编辑页引入新样式
- **THEN** 系统 SHALL 使用 CSS Modules 或 scoped 样式
- **AND** 避免全局样式污染
