## ADDED Requirements

### Requirement: 管理端页面 Title 设置
系统 SHALL 为所有管理端页面设置适当的 `<title>` 标签，帮助用户识别当前页面位置。

#### Scenario: 页面 Title 显示
- **WHEN** 用户访问任何管理端页面
- **THEN** 浏览器标签页 SHALL 显示页面标题
- **AND** 标题格式 SHALL 为 "页面名称 - 管理后台"

#### Scenario: 动态 Title 生成
- **WHEN** 页面包含动态内容（如编辑特定文章）
- **THEN** Title SHALL 包含动态信息
- **例如**: "编辑文章: 我的文章标题 - 管理后台"

### Requirement: Title 面板覆盖
系统 SHALL 确保所有管理端页面都有 Title 设置，包括：登录页、文章列表、文章编辑、分类管理、标签管理等。

#### Scenario: 登录页 Title
- **WHEN** 用户访问登录页
- **THEN** Title SHALL 显示 "登录 - 管理后台"

#### Scenario: 文章列表页 Title
- **WHEN** 用户访问文章列表页
- **THEN** Title SHALL 显示 "文章管理 - 管理后台"

#### Scenario: 文章编辑页 Title
- **WHEN** 用户访问文章编辑页
- **THEN** Title SHALL 显示 "编辑文章: {文章标题} - 管理后台"
- **AND** 如果文章标题为空，显示 "新建文章 - 管理后台"
