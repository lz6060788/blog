## Context

当前项目使用 Next.js App Router 架构，代码组织存在以下问题：

1. **目录结构混乱**: `lib/` 目录下存在 `utils.ts` 和 `utils/index.ts` 并存，`types.ts` 和 `types/index.ts` 同理；`components/` 根目录下堆积了 20+ 个未分类组件
2. **业务逻辑分散**: 相同的业务逻辑在 `app/api/posts/route.ts`、`server/actions/posts.ts` 和 `server/db/queries/posts.ts` 中重复实现
3. **性能问题**: 存在 N+1 查询模式，列表接口一次性返回所有数据无分页
4. **样式管理臃肿**: `app/layout.tsx` 手动引入 20+ 个 CSS 文件，存在 `styles/legacy` 遗留代码
5. **架构不一致**: AI 模块采用 Service 模式，而 Post 模块混杂在多个层级

技术栈: Next.js App Router、Drizzle ORM、NextAuth v5、SQLite (better-sqlite3)、Shadcn/ui、Tailwind CSS

## Goals / Non-Goals

**Goals:**
- 建立清晰的分层架构（Controller → Service → Repository）
- 消除代码重复，实现 DRY 原则
- 解决 N+1 查询性能问题
- 实现标准化的分页机制
- 规范目录结构和组件组织
- 清理技术债务（legacy 样式、冗余文件）

**Non-Goals:**
- 更换技术栈或框架
- 修改现有的数据模型 Schema
- 重写 AI 模块（已采用良好架构）
- 改变前端 UI/UX

## Decisions

### 1. 分层架构设计

**决策**: 采用标准的三层架构：Controller → Service → Repository

**理由**:
- **Controller 层** (`app/api` + `server/actions`): 仅负责参数校验、权限检查、响应格式化
- **Service 层** (`server/services`): 核心业务逻辑、事务管理、外部服务调用（如 AI）
- **Repository 层** (`server/repositories`): 数据访问抽象，屏蔽 ORM 细节，提供优化的查询方法

**替代方案考虑**:
- **仅使用 Service 层**: 无法充分分离数据访问逻辑，Service 层会过于臃肿
- **保持现状**: 维护成本高，违反单一职责原则

### 2. 组件目录结构

**决策**: 按用户端/管理端 + 页面维度组织组件

```
components/
├── public/                    # 用户端（前台）组件
│   ├── home/                 # 首页组件（Hero, FeaturedPosts）
│   ├── posts/                # 文章列表和详情页（PostList, PostDetail, PostContent）
│   ├── archive/              # 归档页面（ArchiveGrid, TimelineList）
│   ├── categories/           # 分类页面（CategoryList, CategoryCard）
│   ├── tags/                 # 标签页面（TagCloud, TagList）
│   └── search/               # 搜索页面（SearchBar, SearchResults）
├── admin/                     # 管理端组件（已存在，需重组）
│   ├── dashboard/            # 仪表盘（StatsCards, QuickActions）
│   ├── posts/                # 文章管理（PostTable, PostForm, PostEditor）
│   ├── categories/           # 分类管理（CategoryTable, CategoryForm）
│   ├── tags/                 # 标签管理（TagTable, TagForm）
│   ├── ai/                   # AI 配置（ModelConfigForm, FunctionMapping）
│   ├── settings/             # 系统设置（GeneralSettings, UserSettings）
│   └── shared/               # 管理端共享组件（DataTable, ConfirmDialog）
├── shared/                    # 前后台共享的业务组件
│   ├── post/                 # 文章相关（PostCard, PostMeta, PostExcerpt）
│   ├── author/               # 作者相关（AuthorCard, AuthorInfo）
│   ├── navigation/           # 导航相关（Pagination, Breadcrumbs）
│   └── feedback/             # 反馈组件（LoadingSpinner, EmptyState, ErrorMessage）
├── layout/                    # 布局组件
│   ├── header/               # 头部（Header, Navigation, UserMenu）
│   ├── footer/               # 页脚（Footer, FooterLinks, SocialLinks）
│   └── sidebar/              # 侧边栏（Sidebar, SidebarSection）
├── editor/                    # 编辑器组件
│   ├── cherry/               # Cherry Markdown 编辑器
│   ├── preview/              # 预览组件
│   └── toolbar/              # 编辑器工具栏
├── auth/                      # 认证组件（已存在）
└── ui/                        # 基础 UI 组件（shadcn/ui，已存在）
```

**理由**:
- 按用户端/管理端划分，职责清晰，避免混淆
- 按页面细分，组件与功能页面直接对应，便于定位
- shared/ 目录存放跨端复用的业务组件，避免重复
- layout/ 独立管理，因为布局组件通常被多个页面共享

### 3. 查询优化策略

**决策**: 使用 Drizzle 的关联查询 API + 批量查询策略

**实现**:
- 对于简单关联（如文章-分类），使用 `with` 语法一次性加载
- 对于复杂关联（如文章-标签 多对多），使用"先聚合 ID 再批量查询"策略
- 在 Repository 层实现优化的查询方法

**替代方案**:
- **DataLoader 模式**: 过于复杂，不适合当前规模
- **缓存层**: 引入额外复杂度，暂不采用

### 4. 分页设计

**决策**: 采用基于偏移量的分页（Offset-based Pagination）

**参数**:
- `page`: 页码（从 1 开始）
- `limit`: 每页数量（默认 20，最大 100）
- 响应格式: `{ data: T[], total: number, page: number, limit: number }`

**理由**:
- 简单易实现，适合当前数据规模
- 符合 REST API 常见模式

**替代方案考虑**:
- **游标分页**: 更适合实时数据流，当前场景不需要
- **无限滚动**: 前端实现方案，不影响 API 设计

### 5. 样式管理

**决策**: 创建统一样式入口文件 `app/styles/index.css`

**实现**:
```css
/* app/styles/index.css */
@import './base/...';
@import './semantic/...';
@import './components/...';
```

然后在 `app/layout.tsx` 中仅引入这一个文件

**理由**: 集中管理，易于维护，避免遗漏新样式文件

### 6. 通用工具提取

**决策**: 将 `generateSlug` 等工具函数提取到 `lib/utils/index.ts`

**实现**:
```typescript
// lib/utils/index.ts
export * from './slug';
export * from './date';
export * from './validation';
```

**理由**: 统一工具函数入口，避免重复实现

## Risks / Trade-offs

### 风险 1: 大量文件路径修改
**风险**: 重构会涉及数百个文件的导入路径变更
**缓解**: 分阶段进行，每完成一个模块立即测试，使用 IDE 的重构功能

### 风险 2: API 行为变更
**风险**: 分页功能可能破坏现有的 API 客户端
**缓解**:
- 在过渡期间保持向后兼容（默认 `page=1`, `limit=所有数据`）
- 在 API 文档中标注即将废弃的行为
- 提供迁移指南

### 风险 3: 性能优化引入新 Bug
**风险**: 查询逻辑重构可能产生意外的数据不一致
**缓解**:
- 编写单元测试覆盖关键查询
- 使用现有数据集进行对比测试
- 在测试环境充分验证后再部署

### 风险 4: 工作量评估不足
**风险**: 重构范围较大，可能超出预期时间
**缓解**: 按模块分优先级实施，核心模块（Post）优先，其他模块可延后

## Migration Plan

### 阶段 1: 基础设施准备（优先级：高）
1. 创建 `server/services` 和 `server/repositories` 目录结构
2. 重组 `components/` 目录
3. 规范 `lib/` 目录结构
4. 创建统一样式入口文件

### 阶段 2: 核心模块重构（优先级：高）
1. 实现 `PostRepository` 和 `PostService`
2. 重构 `app/api/posts` 使用新的分层架构
3. 重构 `server/actions/posts` 使用新的分层架构
4. 添加分页支持
5. 优化查询性能

### 阶段 3: 其他模块迁移（优先级：中）
1. 迁移其他模块到新架构（按需）
2. 清理 `legacy` 样式代码

### 阶段 4: 测试与验证（优先级：高）
1. 运行所有单元测试和集成测试
2. 手动测试关键用户流程
3. 性能测试对比

### Rollback 策略
- 每个阶段完成后创建 git commit，便于回滚
- 保持旧代码分支直到新代码验证通过
- 监控生产环境错误日志，发现问题立即回滚

## Open Questions

1. **分页默认值**: `limit` 默认值应该设置为多少？
   - 建议: 20（常见值）
   - 需要确认产品需求

2. **向后兼容期**: 是否需要保持 API 向后兼容？
   - 建议: 是，在过渡期（如 2-3 个版本）保持兼容
   - 需要确认产品策略

3. **legacy 样式清理优先级**: 是否需要立即清理所有 legacy 样式？
   - 建议: 低优先级，可以逐步迁移
   - 需要确认是否有特定页面仍在使用
