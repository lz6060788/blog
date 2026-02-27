## ADDED Requirements

### Requirement: User menu shall show admin link after login
登录后的用户头像菜单 SHALL 显示"管理端"选项，点击后导航到 `/admin` 路由。

#### Scenario: Click admin link navigates to admin
- **WHEN** 用户点击用户头像菜单中的"管理端"选项
- **THEN** 系统导航到 `/admin` 路由

### Requirement: User menu shall not show profile option
登录后的用户头像菜单 SHALL 不显示无效的"个人资料"选项。

#### Scenario: User menu shows admin link instead of profile
- **WHEN** 用户已登录并点击头像展开菜单
- **THEN** 菜单显示"管理端"选项
- **AND** 菜单不显示"个人资料"选项
