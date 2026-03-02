## ADDED Requirements

### Requirement: Repository 层职责定义
系统应建立统一的 Repository（数据访问）层，封装所有数据库操作细节。

#### Scenario: Repository 层目录结构
- **当** 创建 Repository 层时
- **那么** 所有 Repository 文件位于 `server/repositories/` 目录下
- **并且** 按数据实体分组（如 `post.repository.ts`, `user.repository.ts`, `tag.repository.ts`）

#### Scenario: Repository 封装 ORM 细节
- **当** 实现 Repository 方法时
- **那么** 方法应使用 Drizzle ORM 进行查询
- **并且** 不应暴露 Drizzle 的查询构建器给上层
- **并且** 返回类型应为领域对象或基本类型

### Requirement: Repository 提供优化的查询方法
系统应在 Repository 层实现优化的查询方法，解决 N+1 问题。

#### Scenario: 使用关联查询避免 N+1
- **当** 查询文章及其关联数据时
- **那么** Repository 应使用 Drizzle 的 `with` 语法一次性加载关联数据
- **并且** 不应在循环中逐个查询关联数据

#### Scenario: 批量查询优化
- **当** 需要查询多个实体的关联数据时
- **那么** Repository 应先聚合所有 ID
- **并且** 使用 `whereIn` 批量查询
- **并且** 在内存中组装结果

#### Scenario: 文章列表查询包含关联
- **当** Repository 的 `getPublishedPosts` 方法被调用时
- **那么** 查询应包含文章的分类信息
- **并且** 查询应包含文章的标签列表
- **并且** 使用关联查询而非循环查询

### Requirement: Repository 方法命名规范
系统应遵循清晰的 Repository 方法命名规范。

#### Scenario: 查询方法命名
- **当** 定义查询单个实体的方法时
- **那么** 方法名应以 `get` 开头（如 `getPostById`, `getPostBySlug`）
- **并且** 返回类型应为实体或 null

#### Scenario: 列表方法命名
- **当** 定义查询实体列表的方法时
- **那么** 方法名应以 `list` 或 `getMany` 开头（如 `listPublishedPosts`, `getPostsByCategory`）
- **并且** 应支持分页参数

#### Scenario: 创建方法命名
- **当** 定义创建实体的方法时
- **那么** 方法名应以 `create` 开头（如 `createPost`）
- **并且** 返回创建的实体

#### Scenario: 更新方法命名
- **当** 定义更新实体的方法时
- **那么** 方法名应以 `update` 开头（如 `updatePost`）
- **并且** 应接受部分更新参数
- **并且** 返回更新后的实体

#### Scenario: 删除方法命名
- **当** 定义删除实体的方法时
- **那么** 方法名应以 `delete` 或 `remove` 开头（如 `deletePost`, `removePostFromCategory`）
- **并且** 返回删除是否成功

### Requirement: Repository 处理数据转换
系统应在 Repository 层处理数据库类型到业务类型的转换。

#### Scenario: 数据库字段转换
- **当** 读取包含特殊约定的字段时
- **那么** Repository 应将数据库格式转换为业务格式
- **例如** `temperature` 字段从整数（0-100）转换为小数（0.0-1.0）

#### Scenario: 日期格式处理
- **当** 读取日期字段时
- **那么** Repository 应返回 Date 对象而非字符串
- **并且** 确保时区处理一致

### Requirement: Repository 提供分页支持
系统应在 Repository 层实现分页查询逻辑。

#### Scenario: Repository 方法支持分页参数
- **当** 列表查询方法接受分页参数时
- **那么** 参数应包含 `page`（页码）和 `limit`（每页数量）
- **并且** 计算正确的 `offset` 值
- **并且** 返回分页元数据（total, page, limit）

#### Scenario: 分页边界处理
- **当** page 超出范围时
- **那么** Repository 应返回空数组
- **并且** total 应为实际总数
- **并且** 不应抛出错误

#### Scenario: 分页参数验证
- **当** limit 超过最大值时
- **那么** Repository 应将其限制为最大值（如 100）
- **并且** 不应抛出错误

### Requirement: Repository 层与现有 queries 整合
系统应将现有的 `server/db/queries/` 代码整合到 Repository 层。

#### Scenario: 迁移现有 queries 到 Repository
- **当** 迁移 `server/db/queries/posts.ts` 时
- **那么** 查询逻辑应移至 `PostRepository`
- **并且** 优化原有的查询实现
- **并且** 删除原有的 queries 文件

#### Scenario: 保持接口兼容性
- **当** 迁移 queries 时
- **那么** 应先创建新的 Repository 接口
- **并且** 在测试验证后再删除旧代码
- **并且** 确保不中断现有功能

### Requirement: Repository 层数据库连接管理
系统应通过 Repository 层统一管理数据库连接。

#### Scenario: Repository 注入数据库客户端
- **当** 创建 Repository 实例时
- **那么** 应从 `server/db` 注入数据库客户端
- **并且** 所有 Repository 实例共享同一个数据库连接

#### Scenario: 数据库配置一致性
- **当** Repository 执行查询时
- **那么** 使用统一的数据库配置（如运行时配置）
- **并且** 确保 SQLite 的 Node.js 运行时要求
