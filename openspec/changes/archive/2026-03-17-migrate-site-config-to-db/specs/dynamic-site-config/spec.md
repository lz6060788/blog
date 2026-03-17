# Dynamic Site Config Specification

动态站点配置能力 - 允许在管理后台修改博客配置并实时生效，无需重新部署。

## ADDED Requirements

### Requirement: Blog name from database

系统 SHALL 从数据库 settings 表读取博客名称，并在前端导航栏显示。

#### Scenario: Navigation displays blog name from database
- **WHEN** 用户访问任何页面
- **THEN** 导航栏显示 settings 表中的 blogName 字段值
- **AND** 该值与数据库中存储的值一致

#### Scenario: Blog name updates reflect immediately
- **WHEN** 管理员在后台修改博客名称
- **THEN** 下一次页面请求时导航栏显示新的博客名称
- **AND** 无需重新部署应用

### Requirement: Author information from database

系统 SHALL 从数据库 settings 表读取作者信息（姓名、头像、简介、位置、星座、邮箱、社交链接）。

#### Scenario: Homepage displays author info from database
- **WHEN** 用户访问首页
- **THEN** 作者卡片显示数据库中的作者信息
- **AND** 所有字段（name, avatar, bio, location, zodiac, email, social）与数据库一致

#### Scenario: Social links support both full URLs and usernames
- **WHEN** 社交链接字段包含完整 URL（如 https://github.com/user）
- **THEN** 链接直接使用该 URL
- **WHEN** 社交链接字段只包含用户名（如 github.com/user）
- **THEN** 系统自动添加 https:// 前缀

### Requirement: Fallback to config file

系统 SHALL 在数据库中没有设置记录时，使用 `config/site.ts` 作为默认值。

#### Scenario: Database has no settings record
- **WHEN** settings 表中没有记录
- **THEN** 系统使用 `config/site.ts` 中的默认值
- **AND** 前端正常显示，不会报错

#### Scenario: Database has settings record
- **WHEN** settings 表中有记录
- **THEN** 系统使用数据库中的值
- **AND** 忽略 `config/site.ts` 中的对应值

### Requirement: Client component data passing

系统 SHALL 通过服务端包装器组件将数据库配置传递给客户端组件。

#### Scenario: Navigation receives blog name as prop
- **WHEN** Navigation 组件渲染
- **THEN** 它从服务端包装器接收 blogName 作为 prop
- **AND** Navigation 保留所有客户端 hooks 功能（useSession, usePathname 等）

#### Scenario: No direct database queries in client components
- **WHEN** 客户端组件需要配置数据
- **THEN** 它通过 props 从服务端组件接收数据
- **AND** 不直接调用数据库查询函数

### Requirement: Settings persistence

系统 SHALL 确保管理后台的配置修改正确保存到数据库。

#### Scenario: Admin saves settings
- **WHEN** 管理员在设置页面点击"保存"
- **THEN** 系统更新 settings 表的记录
- **AND** 下次请求时返回新的值

#### Scenario: All settings fields are persisted
- **WHEN** 管理员修改任何设置字段（博客名称、作者信息、社交链接等）
- **THEN** 所有字段都被保存到数据库
- **AND** 没有字段被丢失
