## Why

当前博客的个人信息配置（博客名称、作者信息、社交链接等）存储在 `config/site.ts` 文件中。每次修改这些信息都需要重新部署应用，无法在管理后台动态更新。

## What Changes

- 移除前端对 `config/site.ts` 的依赖
- 前端组件（Navigation、AuthorCard）从数据库 settings 表读取配置
- 确保 `getSettings()` 和 `getAuthor()` 查询函数正确返回数据库数据
- 为数据库 settings 表提供正确的初始值（通过迁移或种子数据）
- 保留 `config/site.ts` 作为备份/开发环境使用（可选）

## Capabilities

### New Capabilities
- `dynamic-site-config`: 动态站点配置能力，允许在管理后台修改博客名称、作者信息、社交链接等配置，无需重新部署

### Modified Capabilities
- 无（现有能力的需求未改变，只是实现方式从文件改为数据库）

## Impact

**Affected Code:**
- `components/layout/header/Navigation.tsx` - 移除 `siteConfig` 导入，改为从 props 或 server component 获取
- `components/shared/author/AuthorCard.tsx` - 确保接收来自数据库的 author 数据
- `server/db/queries/settings.ts` - 确保 `getSettings()` 和 `getAuthor()` 返回数据库数据
- `app/[locale]/page.tsx` - 使用 `getSettings()` 和 `getAuthor()` 查询
- `app/admin/settings/page.tsx` - 确保管理后台可以正确编辑这些字段

**Database:**
- `settings` 表已存在，需确保有正确的初始数据

**Migration:**
- 可能需要创建迁移文件来更新 settings 表的默认值或插入初始数据

**Dependencies:**
- 无新依赖
- 现有的 Drizzle ORM 和 settings 表已满足需求
