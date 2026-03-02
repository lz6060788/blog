## ADDED Requirements

### Requirement: Service 层职责定义
系统应建立统一的 Service 层，封装核心业务逻辑、事务管理和第三方服务调用。

#### Scenario: Service 层目录结构
- **当** 创建 Service 层时
- **那么** 所有服务文件位于 `server/services/` 目录下
- **并且** 按业务领域分组（如 `post.service.ts`, `auth.service.ts`, `ai.service.ts`）

#### Scenario: Service 层仅包含业务逻辑
- **当** 实现 Service 方法时
- **那么** 方法应包含核心业务逻辑
- **并且** 不应包含 HTTP 请求解析或响应格式化
- **并且** 不应包含直接的数据库操作细节

### Requirement: Service 层调用 Repository
系统应通过 Service 层调用 Repository 层进行数据访问。

#### Scenario: Service 调用 Repository 方法
- **当** Service 需要访问数据库时
- **那么** Service 应注入对应的 Repository 实例
- **并且** 通过 Repository 的方法获取数据
- **并且** Service 不应直接使用 Drizzle ORM 的 db 实例

#### Scenario: Service 方法返回领域对象
- **当** Service 方法完成业务逻辑后
- **那么** 方法应返回领域对象或领域对象集合
- **并且** 返回的对象不包含数据库特定的结构

### Requirement: Service 层事务管理
系统应在 Service 层管理数据库事务。

#### Scenario: Service 方法使用事务
- **当** Service 方法需要修改多个数据实体时
- **那么** Service 应使用数据库事务确保原子性
- **并且** 任一步骤失败时整个事务回滚

#### Scenario: 事务失败处理
- **当** 事务中的操作失败时
- **那么** Service 应抛出业务异常
- **并且** 确保事务完全回滚
- **并且** 数据库状态保持一致

### Requirement: Service 层调用外部服务
系统应在 Service 层处理第三方服务调用（如 AI 服务）。

#### Scenario: Service 调用 AI 服务
- **当** Service 需要调用 AI 服务时
- **那么** Service 应调用对应的 AI 服务客户端
- **并且** 处理调用失败和重试逻辑
- **并且** 记录调用日志

#### Scenario: 外部服务错误处理
- **当** 外部服务调用失败时
- **那么** Service 应返回友好的错误信息
- **并且** 不暴露外部服务的内部错误细节

### Requirement: Service 层业务验证
系统应在 Service 层执行业务规则验证。

#### Scenario: Service 验证业务规则
- **当** Service 方法接收到参数时
- **那么** Service 应验证业务规则（如 slug 唯一性、权限检查）
- **并且** 验证失败时抛出明确的业务异常

### Requirement: Service 方法为纯函数
系统应确保 Service 层方法为无副作用的纯函数（除了通过 Repository 修改数据）。

#### Scenario: Service 方法不依赖 HTTP 上下文
- **当** 实现 Service 方法时
- **那么** 方法不应依赖 Next.js 的 Request/Response 对象
- **并且** 方法不应读取 cookies 或 headers
- **并且** 所有必要数据通过参数传入

#### Scenario: Service 方法可复用
- **当** Service 方法实现为纯函数时
- **那么** 该方法可被 API Route 和 Server Action 同时调用
- **并且** 行为保持一致

### Requirement: 现有代码迁移到 Service 层
系统应将分散在 API Routes 和 Server Actions 中的业务逻辑迁移到 Service 层。

#### Scenario: 文章创建逻辑迁移
- **当** 迁移文章创建逻辑时
- **那么** `createPost` 业务逻辑应位于 `PostService.createPost()`
- **并且** `app/api/posts` 和 `server/actions/posts` 应调用该方法
- **并且** 删除原有的重复代码

#### Scenario: Slug 生成逻辑迁移
- **当** 迁移 Slug 生成逻辑时
- **那么** `generateSlug` 函数应位于 `PostService` 或 `lib/utils`
- **并且** 所有需要生成 Slug 的地方应调用统一实现

### Requirement: Controller 层职责简化
系统应在迁移后简化 Controller 层的职责。

#### Scenario: API Route 仅处理 HTTP 层逻辑
- **当** API Route 收到请求时
- **那么** Route Handler 应解析请求参数
- **并且** 验证用户认证和权限
- **并且** 调用对应的 Service 方法
- **并且** 格式化响应（JSON、状态码）

#### Scenario: Server Action 仅处理表单状态
- **当** Server Action 被调用时
- **那么** Action 应解析表单数据
- **并且** 调用对应的 Service 方法
- **并且** 返回 `ActionResult` 或抛出错误
- **并且** 不包含业务逻辑

### Requirement: Service 层与 AI 模块保持一致
系统应确保新 Service 层与现有 AI 模块的架构风格一致。

#### Scenario: AI 模块作为 Service 的一部分
- **当** 整合 AI 模块时
- **那么** AI 服务应位于 `server/services/ai/`
- **并且** 遵循与其他 Service 相同的接口规范
- **并且** 保持现有的独立 Service 模式优势
