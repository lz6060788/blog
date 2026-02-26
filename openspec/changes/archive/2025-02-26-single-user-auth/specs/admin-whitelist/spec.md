## ADDED Requirements

### Requirement: 管理员邮箱白名单
系统应仅允许预先配置的管理员邮箱地址登录，拒绝所有其他用户的访问请求。

#### Scenario: 白名单用户成功登录
- **WHEN** 用户通过 OAuth 登录且邮箱匹配 `ADMIN_EMAIL` 环境变量
- **THEN** 系统允许用户登录
- **AND** 创建有效会话

#### Scenario: 非白名单用户被拒绝
- **WHEN** 用户通过 OAuth 登录但邮箱不匹配 `ADMIN_EMAIL`
- **THEN** 系统拒绝登录请求
- **AND** 返回错误信息"未授权访问"
- **AND** 不创建会话

#### Scenario: 环境变量未配置
- **WHEN** `ADMIN_EMAIL` 环境变量未设置
- **THEN** 系统启动时显示错误
- **AND** 拒绝所有登录尝试

### Requirement: 邮箱大小写不敏感验证
系统应以大小写不敏感的方式比较用户邮箱与白名单配置。

#### Scenario: 邮箱大小写不同但匹配
- **WHEN** `ADMIN_EMAIL` 配置为 `admin@example.com`
- **AND** 用户 OAuth 返回邮箱为 `Admin@Example.com`
- **THEN** 系统将用户邮箱转换为小写后比较
- **AND** 允许用户登录

### Requirement: OAuth 提供商无关验证
白名单验证应独立于 OAuth 提供商，任何提供商返回的匹配邮箱都应被接受。

#### Scenario: 使用不同提供商但相同邮箱
- **WHEN** `ADMIN_EMAIL` 为 `admin@example.com`
- **AND** 用户首次使用 GitHub 登录（邮箱: admin@example.com）
- **THEN** 系统允许登录
- **WHEN** 用户后续使用 Google 登录（邮箱: admin@example.com）
- **THEN** 系统继续允许登录
- **AND** 使用同一用户账号
