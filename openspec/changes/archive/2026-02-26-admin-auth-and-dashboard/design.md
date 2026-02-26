## Context

当前博客系统使用 Next.js 14+ App Router 架构，已集成 NextAuth.js 处理 OAuth 认证（GitHub、Google），使用 Drizzle ORM + SQLite 存储用户数据。登录页面（`/login`）已实现，但登录成功后默认重定向到首页。

博客主页（`/`）的导航栏包含登录按钮，所有访客都能看到。后台管理路由（`/admin`）目前不存在或没有访问控制。

**技术栈约束**:
- Next.js 14+ (App Router)
- TypeScript
- shadcn/ui 组件库
- NextAuth.js 认证
- Drizzle ORM + SQLite
- Tailwind CSS

## Goals / Non-Goals

**Goals:**
- 实现后台路由的访问控制，确保只有已登录用户可以访问 `/admin` 及其子路由
- 创建功能完整的后台管理系统，支持文章的增删改查和发布管理
- 将登录功能与博客前台分离，保持博客主页简洁
- 提供统一的后台布局和导航体验
- 保持现有的 OAuth 认证流程不变

**Non-Goals:**
- 不修改博客前台的文章展示逻辑
- 不添加多用户权限管理（如管理员/编辑角色区分）
- 不实现评论管理、标签管理等其他后台功能
- 不修改数据库 schema

## Decisions

### 1. 路由保护实现方式

**决策**: 使用 Next.js Middleware + NextAuth.js 的 `middleware()` 实现路由保护

**理由**:
- NextAuth.js 官方推荐方式，与现有认证系统无缝集成
- Middleware 在页面渲染前执行，性能优于客户端检查
- 自动处理未认证用户的重定向逻辑

**替代方案**:
- 客户端会话检查：会导致未登录内容短暂显示（闪烁），体验不佳
- 服务端组件内检查：需要每个后台页面重复实现，容易遗漏

### 2. 后台布局架构

**决策**: 创建独立的 `admin/layout.tsx`，与前台布局完全分离

**理由**:
- 前后台布局需求完全不同（前台：导航栏+内容；后台：侧边栏+顶部栏+内容）
- 分离后可独立演进，互不影响
- 便于统一应用后台特定的样式和交互模式

**布局结构**:
```
AdminLayout
├── Sidebar (固定左侧，包含导航菜单)
│   ├── 文章管理
│   ├── 草稿箱
│   └── 设置
├── TopBar (固定顶部，包含用户信息和登出)
└── Content (可滚动主区域)
```

### 3. 登录入口变更

**决策**: 移除主页导航栏登录按钮，改为直接访问 `/admin` 作为后台入口

**理由**:
- 简化博客主页界面，对访客更加友好
- `/admin` 是常见的后台路径，符合用户预期
- 系统自动判断登录状态，未登录用户自动跳转登录页

**用户体验流程**:
1. 用户访问 `/admin`
2. Middleware 检查会话
   - 已登录 → 显示后台页面
   - 未登录 → 重定向到 `/login?callbackUrl=/admin`
3. 登录成功后返回 `/admin`

### 4. 登录成功重定向逻辑

**决策**: 修改 `authOptions` 的 `pages.signIn` 回调，默认重定向到 `/admin`

**实现**:
```typescript
callbacks: {
  async signIn({ user, account }) {
    return true; // 允许登录
  },
  async redirect({ url, baseUrl }) {
    // 如果 URL 是登录页，重定向到后台
    if (url === '/login') {
      return `${baseUrl}/admin`;
    }
    return url;
  }
}
```

### 5. 文章管理功能实现

**决策**: 后台文章管理使用服务端组件 + Server Actions

**理由**:
- Next.js 14 推荐 Server Actions 用于数据变更
- 避免创建额外的 API 路由
- 服务端执行，安全性更高（无需暴露 API）

**功能模块**:
- 文章列表：分页展示所有文章，支持筛选（已发布/草稿）
- 文章编辑器：复用或扩展现有的编辑组件
- 发布控制：切换文章状态（草稿/已发布）

### 6. UI 组件选择

**决策**: 使用 shadcn/ui 组件构建后台界面

**组件清单**:
- `Table`: 文章列表表格
- `Button`: 操作按钮（新建、编辑、删除、发布）
- `Dialog`: 确认对话框
- `DropdownMenu`: 操作菜单
- `Toast`: 操作反馈提示
- `Avatar`: 用户头像
- `Switch`: 开关控制
- `Sheet`: 移动端侧边栏抽屉

### 7. 前端设计规范

**决策**: 后台前端页面必须使用 `design-taste-frontend` skill 进行设计

**执行要求**:
- 在实现任何后台 UI 页面或组件之前，必须先调用 `design-taste-frontend` skill
- 该 skill 强制执行度量级规则、严格组件架构、CSS 硬件加速和平衡设计工程原则
- 确保设计质量超过默认 LLM 输出的审美标准
- 覆盖内容包括布局、交互状态、动画效果、响应式设计

### 8. 主题样式系统

**决策**: 使用项目现有的主题系统，不引入新的主题框架

**当前主题配置** (参考 `app/globals.css` 和 `tailwind.config.ts`):
- **中性色**: Zinc 色系 (zinc-50 ~ zinc-950)
- **强调色**: Emerald 色系 (emerald-400 ~ emerald-600)
- **深浅色模式**: 支持 `.dark` 类切换
- **自定义 CSS 变量**: 完整的 `--bg-*`, `--text-*`, `--border-*`, `--accent-*` 等变量

**组件样式映射**:
```css
/* shadcn/ui 组件自动映射到项目 CSS 变量 */
--primary → var(--accent-primary)
--secondary → var(--bg-muted)
--muted → var(--bg-muted)
--accent → var(--accent-bg)
--destructive → var(--error-primary)
--border → var(--border-default)
--ring → var(--accent-primary)
```

**样式约定**:
- 所有后台组件必须使用 `theme-*` 类或 Tailwind 的语义化类
- 禁止硬编码颜色值，必须使用 CSS 变量或 Tailwind 配置
- 新增颜色需求时，优先扩展现有色系，而非添加全新颜色

### 9. Markdown 编辑器

**决策**: 使用 **Cherry Markdown** 作为后台文章编辑器

**理由**:
- 功能丰富的 Markdown 编辑器，支持所见即所得
- 良好的中文支持
- 可扩展的插件系统
- 成熟稳定，社区活跃

**集成任务**:
- 安装 `cherry-markdown` 及其类型定义
- 创建 React 组件封装 Cherry Markdown
- 配置工具栏和编辑器选项（主题色匹配项目主题）
- 实现图片上传、代码高亮等扩展功能
- 确保编辑器与项目主题样式一致（深浅色模式适配）

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|---------|
| Middleware 可能影响页面加载性能 | 使用轻量级的会话检查（仅验证 JWT，不查询数据库） |
| 登录按钮移除后，用户找不到后台入口 | 在页脚添加"管理入口"链接，或提供文档说明 |
| 文章编辑器可能与前台表单冲突 | 后台使用独立的编辑组件，避免复用前台表单 |
| 数据库操作缺少错误处理 | 在 Server Actions 中添加完整的 try-catch 和用户提示 |
| 会话过期时用户仍在后台页面 | Middleware 自动重定向到登录页，前端通过轮询检查会话状态 |

## Migration Plan

**部署步骤**:
1. 创建 `middleware.ts`（如不存在），配置后台路由保护
2. 创建 `app/admin/layout.tsx` 和相关页面组件
3. 修改 `app/page.tsx` 移除导航栏登录按钮
4. 修改 NextAuth 配置，更新登录后重定向逻辑
5. 创建文章管理的 Server Actions
6. 测试登录/登出流程和后台访问控制

**回滚策略**:
- Git commit 可以快速回滚到变更前状态
- 数据库无需迁移，无数据风险
- 如 Middleware 导致问题，可直接删除文件恢复

## Open Questions

1. **文章编辑器实现**: 是扩展现有的编辑表单，还是创建专门的后台编辑器？
   - 建议：先复用现有表单，如有需求再优化

2. **草稿存储方式**: 草稿是否需要与已发布文章区分存储？
   - 建议：使用 `published` 布尔字段区分，同一张表存储

3. **分页实现**: 文章列表使用服务端分页还是客户端虚拟滚动？
   - 建议：初期使用服务端分页，简单可靠

4. **登出后跳转**: 用户在后台登出后应跳转到哪里？
   - 建议：跳转到博客首页（`/`）
