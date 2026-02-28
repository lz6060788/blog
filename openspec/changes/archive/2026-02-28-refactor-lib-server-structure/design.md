# Design: 重构 lib 目录结构

## Context

### 当前状态

`lib/` 目录包含以下内容：

```
lib/
├── actions/              # Server Actions
│   ├── categories.ts
│   ├── posts.ts
│   ├── settings.ts
│   └── tags.ts
├── auth/                 # Auth 适配器
│   └── drizzle-adapter.ts
├── db/                   # 数据库 schema
│   └── schema.ts
├── auth.ts               # NextAuth 配置
├── data.ts               # 静态演示数据 (临时)
├── db.ts                 # 数据库连接实例
├── get-post.ts           # 文章获取 (临时文件)
├── middleware-auth.ts    # 认证工具函数
├── types.ts              # 类型定义
└── utils.ts              # 工具函数
```

### 约束条件

- 使用 TypeScript + Next.js App Router
- 使用 Drizzle ORM + SQLite
- 使用 NextAuth.js 处理认证
- Server Actions 用于管理后台 CRUD
- 需要保持现有功能完全不变

## Goals / Non-Goals

**Goals:**
- 将服务端相关代码统一到 `server/` 目录
- 将 `lib/` 纯化为工具库目录
- 为每个子目录创建 `index.ts` 统一导出
- 保持所有现有功能不变
- 提供清晰的引用路径迁移路径

**Non-Goals:**
- 不修改任何业务逻辑
- 不改变 API 接口
- 不调整数据库结构
- 不添加新功能

## Decisions

### 1. 创建 `server/` 目录

**决策**: 创建顶层 `server/` 目录存放所有服务端相关代码

**理由**:
- `lib/` 在语义上应该是工具库，不应包含业务逻辑
- Next.js App Router 项目中，服务端代码（Server Actions、数据库操作）与工具函数是不同层次的抽象
- `server/` 名称清晰表达"仅可在服务端使用"的约束

**考虑的替代方案**:
- **方案 A**: 保持现状 - ❌ 语义不清晰，职责混杂
- **方案 B**: 创建 `api/` 目录 - ❌ 与 Next.js route handlers 概念混淆
- **方案 C**: 创建 `internal/` 目录 - ❌ 名称不够具体

### 2. `server/` 内部子目录结构

**决策**: 采用 `actions/`、`auth/`、`db/` 三层结构

**理由**:
- `actions/` - Server Actions 是 Next.js 特有概念，独立管理
- `auth/` - 认证是独立关注点，包含配置、适配器、中间件
- `db/` - 数据库相关，包含连接、schema、查询

**考虑的替代方案**:
- **扁平结构** (所有文件在 server/ 根目录) - ❌ 文件过多，无分类
- **按功能分** (posts/, categories/, users/) - ❌ 跨功能的共享代码（如 auth）无处安放

### 3. 子目录统一导出模式

**决策**: 每个子目录创建 `index.ts` 统一导出

**理由**:
- 引用路径简洁：`@/server/auth` 而非 `@/server/auth/config`
- 便于内部重构：修改内部文件结构不影响外部引用
- 符合 CommonJS/ES 模块约定

**示例**:
```typescript
// server/auth/index.ts
export { auth, signIn, signOut, handlers } from './config'
export { requireAuth, getOptionalAuth, withAuth } from './middleware'

// server/db/index.ts
export { db } from './index'
export * from './schema'
```

### 4. 临时文件处理

**决策**: `data.ts` 标记 `@deprecated`，`get-post.ts` 整合到 `db/queries/`

**理由**:
- `data.ts` 是演示数据，迁移数据库后应删除，先标记废弃
- `get-post.ts` 的查询逻辑应在 `server/db/queries/` 有统一位置

### 5. 引用路径迁移策略

**决策**: 批量查找替换 + 验证测试

**理由**:
- 引用变更简单明确（`@/lib/*` → `@/server/*`）
- 可以使用正则批量处理
- 需要完整测试验证无遗漏

**迁移映射**:
| 旧路径 | 新路径 |
|--------|--------|
| `@/lib/actions/*` | `@/server/actions/*` |
| `@/lib/auth` | `@/server/auth` |
| `@/lib/middleware-auth` | `@/server/auth/middleware` |
| `@/lib/db` | `@/server/db` |
| `@/lib/db/schema` | `@/server/db/schema` |
| `@/lib/get-post` | `@/server/db/queries/posts` |
| `@/lib/data` | `@/lib/data` (不变) |
| `@/lib/types` | `@/lib/types` (不变) |
| `@/lib/utils` | `@/lib/utils` (不变) |

## Risks / Trade-offs

### 风险 1: 引用路径遗漏

**描述**: 批量替换可能遗漏某些引用，导致运行时错误

**缓解措施**:
- 使用 `grep` 搜索所有 `@/lib/` 引用，逐一检查
- 运行 TypeScript 编译检查类型错误
- 完整测试所有页面功能

### 风险 2: 循环依赖

**描述**: 新的导出结构可能引入循环依赖

**缓解措施**:
- `index.ts` 仅重新导出，不添加新逻辑
- 使用 `ts-check` 验证无循环依赖

### 风险 3: 服务端/客户端边界混淆

**描述**: `server/` 目录中的代码可能被客户端组件错误引用

**缓解措施**:
- TypeScript 配置中 `paths` 别名不区分服务端/客户端
- 依赖 Next.js 的 `server only` 错误检测
- 文档中明确标注 `server/` 仅限服务端使用

### Trade-off: 更长的导入路径

**描述**: 某些情况下导入路径变长，如 `@/lib/db` → `@/server/db`

**权衡**:
- **缺点**: 路径长度增加 2-3 个字符
- **优点**: 语义清晰，一眼可看出代码运行环境
- **结论**: 语义价值大于路径长度的微小代价

## Migration Plan

### 实施步骤

1. **创建目录结构** - 创建所有新目录
2. **迁移数据库文件** - `lib/db/` → `server/db/`
3. **迁移认证文件** - `lib/auth.ts` + `lib/auth/` → `server/auth/`
4. **迁移 Actions** - `lib/actions/` → `server/actions/`
5. **重组 lib 目录** - 创建 `lib/data/`、`lib/types/`、`lib/utils/`
6. **更新引用路径** - 批量查找替换
7. **验证测试** - TypeScript 检查 + 功能测试

### 回滚策略

如果重构导致问题：
- Git 可以快速回滚到重构前
- 或者保留原目录，逐步迁移引用

### 测试计划

- TypeScript 编译无错误
- 管理后台所有页面正常（文章、分类、标签、设置）
- 前台文章详情页 SSR 正常
- 登录/登出功能正常

## Open Questions

无（所有决策已明确）
