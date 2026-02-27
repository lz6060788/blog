## ADDED Requirements

### Requirement: 点击标题进入编辑页
系统 SHALL 允许用户点击文章列表中的文章标题直接进入编辑页面。

#### Scenario: 标题可点击
- **WHEN** 用户将鼠标悬停在文章标题上
- **THEN** 标题 SHALL 显示为可点击状态（颜色变化、下划线或鼠标指针变化）

#### Scenario: 点击跳转到编辑页
- **WHEN** 用户点击文章标题
- **THEN** 系统 SHALL 导航到文章编辑页面
- **AND** URL SHALL 为 `/admin/posts/{id}/edit`

### Requirement: 交互动画和视觉反馈
系统 SHALL 为可点击的标题提供交互动画和视觉反馈。

#### Scenario: Hover 状态样式
- **WHEN** 用户鼠标悬停在标题上
- **THEN** 标题颜色 SHALL 变为主题色
- **AND** 过渡动画时长 SHALL 为 200ms
- **AND** 使用 CSS `transition-colors` 属性

#### Scenario: 点击反馈
- **WHEN** 用户点击标题
- **THEN** 系统 SHALL 提供视觉反馈（如短暂的颜色加深或缩放效果）
- **AND** 页面导航 SHALL 在动画完成后执行

### Requirement: 可访问性支持
系统 SHALL 确保标题链接符合可访问性标准。

#### Scenario: 键盘导航
- **WHEN** 用户使用 Tab 键聚焦到标题
- **THEN** 系统 SHALL 显示焦点指示器（outline 或 ring）
- **AND** 按 Enter 键 SHALL 触发导航

#### Scenario: 屏幕阅读器支持
- **WHEN** 屏幕阅读器读取标题
- **THEN** 系统 SHALL 提供合适的 aria-label
- **例如**: "编辑文章：{文章标题}"
