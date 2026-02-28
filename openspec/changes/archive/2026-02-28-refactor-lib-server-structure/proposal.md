# Proposal: 重构 lib 目录结构

## Why

当前 `lib/` 目录职责混杂，包含数据库连接、认证配置、Server Actions、工具函数和类型定义等多种不同性质的代码。这种混合组织方式违反了单一职责原则，导致：
- **语义不清**：`lib/` 应该是工具库，但包含了大量服务端业务逻辑
- **引用混乱**：数据库相关代码分散在 `lib/db/`、`lib/db.ts`、`lib/auth/` 多处
- **命名歧义**：`data.ts`（静态数据）vs `db.ts`（数据库连接）容易混淆
- **临时文件堆积**：如 `get-post.ts` 等临时文件没有合适的位置

## What Changes

### 目录结构重构

创建新的 `server/` 目录，将服务端相关内容从 `lib/` 迁移出去：

```
server/
├── actions/         # Server Actions (从 lib/actions/ 迁移)
├── auth/            # 认证相关 (整合 lib/auth.ts 和 lib/auth/)
└── db/              # 数据库相关 (整合 lib/db/ 和 lib/db.ts)
    └── queries/     # 数据库查询函数
```

重组 `lib/` 为纯工具库：

```
lib/
├── data/            # 静态演示数据 (临时)
├── types/           # 类型定义
└── utils/           # 工具函数
```

### 引用路径更新

所有引用路径从 `@/lib/*` 更新为 `@/server/*`（服务端相关）或保持 `@/lib/*`（工具库）。

### 清理临时文件

- `lib/get-post.ts` → 整合到 `server/db/queries/posts.ts`
- `lib/data.ts` → 标记 `@deprecated`，后续迁移到数据库后移除

## Capabilities

### New Capabilities

无（本次变更为内部重构，不涉及新功能）

### Modified Capabilities

无（本次变更仅调整代码组织结构，不修改任何功能需求）

## Impact

### 受影响的代码区域

- **管理后台** (7 个页面): 需要更新 `@/lib/actions/*` 引用为 `@/server/actions/*`
- **前台文章详情页**: 需要更新 `@/lib/get-post` 引用为 `@/server/db/queries/posts`
- **组件** (2 个): 管理后台表单组件需要更新 action 引用
- **内部引用** (5 处): Server Actions 和 auth 配置内部的 `@/lib/db` 和 `@/lib/auth` 引用

### 不影响的范围

- **用户可见功能**: 所有功能保持不变，仅调整代码组织
- **API 接口**: 无 API 变更
- **数据库结构**: 无数据库变更

### 依赖变更

无新增或移除的 npm 依赖。
