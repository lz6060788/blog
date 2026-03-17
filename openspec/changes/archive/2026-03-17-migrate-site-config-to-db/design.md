## Context

当前博客的个人信息配置存储在 `config/site.ts` 文件中。Navigation 组件直接导入并使用 `siteConfig.blog.name`。由于 Navigation 是客户端组件（'use client'），需要使用 `useSession` 和 `usePathname` 等 hooks，不能直接调用数据库查询函数。

**Current State:**
- `config/site.ts` - 硬编码配置值
- `server/db/queries/settings.ts` - `getAuthor()` 已改为返回 `siteConfig` 数据
- `components/layout/header/Navigation.tsx` - 客户端组件，直接导入 `siteConfig`
- `settings` 数据库表已存在

## Goals / Non-Goals

**Goals:**
- 前端组件从数据库读取配置，而非文件系统
- 允许在管理后台动态修改个人信息，无需重新部署
- 保持 Navigation 的客户端交互功能（主题切换、语言切换、用户菜单）

**Non-Goals:**
- 不改变 settings 表结构
- 不改变管理后台设置页面的功能
- 不移除 `config/site.ts`（保留作为开发环境备用或备份）

## Decisions

### 1. 数据传递方式：服务端包装器组件

由于 Navigation 是客户端组件，不能直接调用数据库查询。解决方案是创建一个服务端包装器组件，负责获取数据并传递给 Navigation。

**Why this over 直接将 Navigation 改为服务端组件？**
- Navigation 需要使用 `useSession` (next-auth)、`usePathname`、`useTranslations` 等客户端 hooks
- 这些 hooks 只能在客户端组件中使用
- 改为服务端组件会破坏现有交互功能

**Why this over Context API？**
- 需要在根布局创建 Provider 并获取数据，增加复杂度
- 数据是全局的，不针对特定用户，Context 的优势不明显
- 服务端包装器更简单直接

**Why this over SWR/React Query？**
- 配置数据在构建时/请求时获取即可，无需客户端实时轮询
- 增加不必要的复杂度和依赖

### 2. 组件结构设计

```
NavigationProvider (服务端组件)
  ├─ 从数据库获取 settings
  └─ <Navigation blogName={settings.blogName} />

Navigation (客户端组件)
  ├─ 接收 blogName 作为 props
  └─ 保留现有客户端 hooks
```

### 3. 数据回退策略

如果数据库中没有设置记录，使用 `config/site.ts` 作为默认值。这确保：
- 开发环境在没有数据库时也能工作
- `config/site.ts` 保留作为备份和配置参考

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Navigation 在多个页面导入使用 | 统一在 `components/layout/header/index.ts` 导出包装器 |
| 数据库查询性能 | Settings 表是单例模式，查询非常快，可考虑添加缓存 |
| 管理后台设置页面功能完整性 | 需验证 `app/admin/settings/page.tsx` 正确保存所有字段 |

### Trade-off: 服务端包装器 vs Props Drilling

使用包装器组件会增加一层组件嵌套，但：
- 避免在每个使用 Navigation 的页面重复查询数据
- 保持组件接口简洁
- 符合 Next.js 13+ 的服务端/客户端组件分离模式

## Migration Plan

1. **创建服务端包装器组件** `NavigationProvider.tsx`
   - 调用 `getSettings()` 获取配置
   - 将 `blogName` 传递给 `Navigation`

2. **修改 Navigation.tsx**
   - 移除 `siteConfig` 导入
   - 接收 `blogName` 作为 props
   - 保留客户端 hooks

3. **更新导出**
   - `components/layout/header/index.ts` 导出 `NavigationProvider` 作为 `Navigation`

4. **更新 queries/settings.ts**
   - `getAuthor()` 改为调用 `getSettings()` 并从数据库读取
   - 移除 `siteConfig` 的硬编码返回

5. **测试验证**
   - 首页显示正确的博客名称
   - 管理后台可以保存设置
   - 刷新页面后设置持久化

6. **数据库初始化**
   - 确保 settings 表有初始数据（可通过迁移或首次访问时自动创建）

## Open Questions

1. **settings 表初始数据策略？**
   - 选项 A: 创建迁移文件插入初始数据（推荐）
   - 选项 B: 在 `getSettings()` 中首次访问时自动创建
   - 建议：选项 A，更明确可控

2. **是否需要移除 `config/site.ts`？**
   - 建议保留，作为开发环境备份和配置参考文档
