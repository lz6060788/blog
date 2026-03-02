# 项目架构文档

## 技术栈

- **框架**: Next.js 14 (App Router)
- **数据库**: SQLite (better-sqlite3)
- **ORM**: Drizzle ORM
- **认证**: NextAuth.js v5
- **国际化**: next-intl
- **UI 组件**: shadcn/ui
- **样式**: Tailwind CSS + CSS Variables

## 分层架构

项目采用标准的**三层架构**：

```
┌─────────────────────────────────────────────────────────┐
│                    Controller 层                         │
│  - app/api/**/route.ts (HTTP 接口)                      │
│  - server/actions/**/ts (Server Actions)                │
│  职责：参数校验、权限检查、响应格式化                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                     Service 层                          │
│  - server/services/*.ts                                │
│  职责：核心业务逻辑、事务管理、外部服务调用                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Repository 层                          │
│  - server/repositories/*.ts                             │
│  - server/db/queries/*.ts                              │
│  职责：数据访问抽象、屏蔽 ORM 细节、优化的查询方法           │
└─────────────────────────────────────────────────────────┘
```

## 目录结构

```
├── app/                          # Next.js App Router
│   ├── [locale]/                 # 国际化路由
│   ├── admin/                   # 管理端页面
│   ├── api/                     # API 路由
│   └── styles/                  # 样式文件
│       ├── index.css            # 统一样式入口
│       ├── base/                # 基础样式
│       ├── semantic/            # 语义化样式
│       └── components/          # 组件样式
├── components/                   # React 组件
│   ├── public/                  # 用户端组件
│   │   ├── home/               # 首页
│   │   ├── posts/              # 文章
│   │   ├── archive/            # 归档
│   │   ├── categories/         # 分类
│   │   ├── tags/               # 标签
│   │   └── search/             # 搜索
│   ├── admin/                   # 管理端组件
│   │   ├── dashboard/          # 仪表盘
│   │   ├── posts/              # 文章管理
│   │   ├── categories/         # 分类管理
│   │   ├── tags/               # 标签管理
│   │   ├── ai/                 # AI 配置
│   │   ├── settings/           # 系统设置
│   │   └── shared/             # 管理端共享
│   ├── shared/                  # 前后台共享组件
│   │   ├── post/               # 文章相关
│   │   ├── author/             # 作者相关
│   │   ├── navigation/         # 导航相关
│   │   └── feedback/           # 反馈组件
│   ├── layout/                  # 布局组件
│   │   ├── header/             # 头部
│   │   ├── footer/             # 页脚
│   │   └── sidebar/            # 侧边栏
│   ├── editor/                  # 编辑器组件
│   ├── auth/                    # 认证组件
│   └── ui/                      # shadcn/ui 基础组件
├── server/                       # 服务端代码
│   ├── services/                # Service 层
│   ├── repositories/            # Repository 层
│   ├── actions/                 # Server Actions
│   ├── db/                      # 数据库
│   │   ├── schema.ts           # 数据库模型
│   │   └── queries/            # 查询函数
│   ├── auth/                    # NextAuth 配置
│   └── ai/                      # AI 服务
├── lib/                         # 工具库
│   ├── types/                   # 类型定义
│   │   ├── entities.ts         # 实体类型
│   │   ├── api.ts              # API 类型
│   │   ├── pagination.ts       # 分页类型
│   │   └── index.ts            # 统一导出
│   └── utils/                   # 工具函数
│       ├── cn.ts               # className 合并
│       ├── slug.ts             # slug 生成
│       └── index.ts            # 统一导出
└── openspec/                    # 变更管理
```

## Service 层开发规范

### 职责
Service 层负责核心业务逻辑，不处理 HTTP 或表单相关的内容。

### 命名规范
- 类名：`XxxService`（如 `PostService`）
- 文件名：`xxx.service.ts`（如 `post.service.ts`）
- 方法名：动词+名词（如 `createPost`, `getPostById`）

### 示例
```typescript
export class PostService {
  constructor(private postRepository: PostRepository) {}

  async createPost(userId: string, input: CreatePostInput): Promise<{ id: string }> {
    // 业务规则验证
    this.validateTitle(input.title)

    // 调用 Repository 层
    const postId = await this.postRepository.create({...})

    return { id: postId }
  }
}
```

### 错误处理
- 业务逻辑错误抛出 `Error` 异常
- Controller 层负责捕获并转换为 HTTP 状态码

## Repository 层开发规范

### 职责
Repository 层负责数据访问，封装所有数据库操作。

### 命名规范
- 类名：`XxxRepository`（如 `PostRepository`）
- 文件名：`xxx.repository.ts`
- 方法名：CRUD 命名（`create`, `findById`, `update`, `delete`, `list`）

### 查询优化原则
1. **避免 N+1 查询**：使用 `leftJoin` + `inArray` 批量查询
2. **使用关联查询**：简单关联用 Drizzle 的 `with` 语法
3. **批量操作**：一次查询获取所有需要的数据

### 示例
```typescript
export class PostRepository {
  async listPublished(options?: ListPostsOptions) {
    // 使用 leftJoin 优化关联查询
    const postsData = await db.select()
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(whereClause)

    // 批量获取标签（避免 N+1）
    const postIds = postsData.map(p => p.id)
    const allTags = await db.select()
      .from(postTags)
      .where(inArray(postTags.postId, postIds))
  }
}
```

## Controller 层开发规范

### API Routes
- 路径：`app/api/**/route.ts`
- 职责：HTTP 请求处理、参数解析、权限校验
- **不包含**：业务逻辑（委托给 Service 层）

### Server Actions
- 路径：`server/actions/**/*.ts`
- 职责：表单处理、缓存重新验证
- **不包含**：业务逻辑（委托给 Service 层）

### 示例
```typescript
// app/api/posts/route.ts
export async function GET(request: Request) {
  // 1. 认证检查
  const session = await auth()
  if (!session) return NextResponse.json({ error: '未认证' }, { status: 401 })

  // 2. 参数解析
  const { searchParams } = new URL(request.url)

  // 3. 调用 Service 层
  const postService = createPostService()
  const result = await postService.listPublishedPosts(params)

  // 4. 返回响应
  return NextResponse.json(result)
}
```

## 分页使用指南

### API 使用

```typescript
// 请求参数
GET /api/posts?page=2&limit=10&search=react

// 响应格式
{
  "data": [...],          // 数据数组
  "total": 45,           // 总记录数
  "page": 2,             // 当前页码
  "limit": 10,           // 每页数量
  "totalPages": 5,       // 总页数
  "hasNext": true,       // 是否有下一页
  "hasPrev": true        // 是否有上一页
}
```

### 代码使用

```typescript
import { PaginationHelper } from '@/lib/types/pagination'

// 规范化参数
const { page, limit, offset } = PaginationHelper.normalizeParams({
  page: 1,
  limit: 20
})

// 计算分页元数据
const metadata = PaginationHelper.calculateMetadata(total, page, limit)
```

## 组件开发规范

### 按域组织组件
- `components/public/` - 用户端组件
- `components/admin/` - 管理端组件
- `components/shared/` - 前后台共享组件

### 组件目录结构
```
components/public/posts/
├── index.ts           # 导出所有公共组件
├── PostList.tsx       # 组件实现
└── PostDetail.tsx     # 组件实现
```

### 导出规范
每个组件目录都应包含 `index.ts` 统一导出：
```typescript
// components/public/posts/index.ts
export { PostList } from './PostList'
export { PostDetail } from './PostDetail'
```

### 导入规范
```typescript
// 推荐：从目录索引导入
import { PostList } from '@/components/public/posts'

// 避免：从具体文件导入
import { PostList } from '@/components/public/posts/PostList'
```

## 开发工作流

1. **创建功能**
   - 先在 Service 层实现业务逻辑
   - 在 Repository 层实现数据访问
   - 在 Controller 层（API/Actions）调用 Service

2. **代码提交**
   - 按功能模块分阶段提交
   - 提交信息清晰描述变更内容

3. **变更管理**
   - 使用 OpenSpec 管理大型变更
   - `openspec/changes/` 目录记录设计文档

## 性能优化建议

1. **查询优化**
   - 使用批量查询避免 N+1
   - 关联查询使用 `leftJoin`
   - 只查询需要的字段

2. **缓存策略**
   - 使用 Next.js 的 `revalidatePath` 增量静态再生成
   - 考虑添加 Redis 缓存热点数据

3. **分页加载**
   - 列表接口必须支持分页
   - 避免一次性加载大量数据
