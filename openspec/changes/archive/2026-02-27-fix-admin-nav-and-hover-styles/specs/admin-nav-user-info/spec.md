## ADDED Requirements

### Requirement: Admin nav shall display correct user info
管理端顶部导航栏 SHALL 正确显示当前登录用户的信息。

#### Scenario: Admin nav shows user display name
- **WHEN** 用户已登录并访问管理端
- **THEN** 导航栏显示用户的显示名称或用户名
- **AND** 显示信息与登录用户一致

### Requirement: Admin nav shall not show profile option
管理端顶部导航栏用户菜单 SHALL 不包含"个人资料"选项。

#### Scenario: Admin nav menu has no profile link
- **WHEN** 用户点击管理端导航栏的用户信息
- **THEN** 下拉菜单不包含"个人资料"选项
- **AND** 菜单只包含有效的操作选项（如退出登录）

### Requirement: Admin nav shall include logout option
管理端顶部导航栏用户菜单 SHALL 包含"退出登录"选项。

#### Scenario: Click logout signs out user
- **WHEN** 用户点击"退出登录"选项
- **THEN** 系统执行退出登录操作
- **AND** 用户被重定向到登录页面
