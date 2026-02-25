## 1. 依赖和配置

- [ ] 1.1 安装 Drizzle ORM 包（`drizzle-orm`、`better-sqlite3`、`@types/better-sqlite3`）
- [ ] 1.2 安装 Drizzle Kit 用于迁移（`drizzle-kit`）
- [ ] 1.3 创建 `data/` 目录并添加到 `.gitignore`
- [ ] 1.4 创建 Drizzle 配置文件（`drizzle.config.ts`）

## 2. 数据库客户端设置

- [ ] 2.1 创建带有数据库连接单例的 `lib/db.ts`
- [ ] 2.2 配置带有本地数据库文件路径的 `better-sqlite3` 驱动
- [ ] 2.3 在 `lib/db/schema.ts` 创建占位符 schema 文件（目前为空）

## 3. 迁移系统

- [ ] 3.1 为迁移创建 `drizzle/` 目录
- [ ] 3.2 在配置中配置 Drizzle Kit 输出目录
- [ ] 3.3 向 `package.json` 添加迁移脚本（`migrate:generate`、`migrate:apply`、`migrate:push`）
- [ ] 3.4 创建初始迁移（空 schema）

## 4. API 路由基础

- [ ] 4.1 创建 `app/api/` 目录结构
- [ ] 4.2 在 `app/api/health/route.ts` 创建示例健康检查路由（无数据库，仅验证 API 可用）
- [ ] 4.3 在 `app/api/example/route.ts` 创建示例 CRUD API 路由模板（带有 runtime = 'nodejs'）

## 5. 类型安全和集成

- [ ] 5.1 验证从 schema 正确推断 TypeScript 类型
- [ ] 5.2 在开发模式下测试数据库连接
- [ ] 5.3 验证迁移命令正常工作

## 6. 文档

- [ ] 6.1 在 README 中记录数据库使用（设置、迁移命令）
- [ ] 6.2 记录用于未来开发的 API 路由模式
