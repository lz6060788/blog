## 背景

该博客目前是一个使用 App Router 模式的静态 Next.js 14 应用，采用 TypeScript 构建。它具有国际化支持（next-intl）和主题系统，但缺乏任何持久化数据层。所有内容目前都是静态的。

**约束条件：**
- 必须与 Next.js App Router 无缝集成
- 使用 SQLite 作为数据库（基于文件、零配置）
- TypeScript 优先的方法
- 保持个人博客规模的简单设置

## 目标 / 非目标

**目标：**
- 建立可复用的数据库层和连接管理
- 设置 ORM 以进行类型安全的数据库查询
- 创建模式演进的迁移系统
- 定义 CRUD 操作的 API 路由模式
- 支持未来功能（文章、评论、标签等）

**非目标：**
- 定义实际的表结构（将在未来的变更中完成）
- 认证/授权系统
- 缓存层或查询优化
- 数据库复制或备份策略

## 技术决策

### ORM：选择 Drizzle ORM 而非 Prisma

**理由：**
- **轻量级**：Drizzle 没有二进制生成步骤；Prisma 需要 `prisma generate`
- **SQLite 原生**：Drizzle 的 `better-sqlite3` 驱动对 SQLite 性能更好
- **类似 SQL 的语法**：Drizzle 的查询构建器更接近 SQL，更容易调试
- **打包大小**：Drizzle 明显更小（约 50KB vs Prisma 的约 200KB）
- **Next.js App Router 友好**：没有边缘兼容性问题
- **TypeScript 推断**：从查询中获得更好的类型推断

**考虑的替代方案**：Prisma - 成熟的生态系统，出色的迁移功能，但更重且生成步骤增加了构建复杂性。

### 数据库目录：`./data/db.sqlite`

**理由：**
- 将数据库文件保存在项目根目录中（gitignored）
- 与代码分离但易于访问
- SQLite 项目的常见约定

### API 路由模式：App Router（`/app/api/`）

**理由：**
- Next.js 14 默认使用 App Router
- Route Handlers（`route.ts`）支持所有 HTTP 方法
- 如果需要，可以与应用结构共存（例如 `/app/api/posts/route.ts`）

### 连接管理：使用 lib 文件的单例模式

**理由：**
- 单个 db 实例在请求之间复用（SQLite 处理得很好）
- 集中的 `lib/db.ts` 用于数据库访问
- 易于模拟测试

### 迁移工具：Drizzle Kit

**理由：**
- 专为 Drizzle ORM 构建
- 从模式变更生成迁移
- 同时支持 push（开发）和 migrate（生产）工作流

## 风险 / 权衡

**风险：SQLite 并发限制** → SQLite 使用文件级锁定。对于个人博客这是可接受的（单写入者，多读取者）。如果以后需要高并发，可以迁移到 PostgreSQL。

**风险：迁移复杂性增加** → 保持模式变更小而增量。在生产环境中使用 Drizzle 的迁移策略。

**权衡：无连接池** → SQLite 不需要传统的连接池。单例模式就足够了。

**风险：边缘运行时不兼容** → `better-sqlite3` 仅在 Node.js 运行时中工作。API 路由必须使用 Node.js 运行时，而非 Edge。

## 待解决的问题

无 - 框架级别的决策很直接。模式决策将在后续变更中制定。
