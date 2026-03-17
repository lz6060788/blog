# Implementation Tasks

将个人信息配置从 `config/site.ts` 迁移到数据库 settings 表。

## 1. 数据库和查询层

- [x] 1.1 修改 `getSettings()` 函数，确保从数据库读取配置（而非直接返回 siteConfig）
- [x] 1.2 修改 `getAuthor()` 函数，调用 `getSettings()` 并从数据库数据构建 Author 对象
- [x] 1.3 实现数据回退逻辑：数据库无记录时使用 `config/site.ts` 作为默认值
- [x] 1.4 创建数据库迁移，插入或更新 settings 表的初始数据（使用 config/site.ts 中的值）

## 2. 服务端包装器组件

- [x] 2.1 创建 `NavigationProvider.tsx` 服务端组件
- [x] 2.2 在 `NavigationProvider` 中调用 `getSettings()` 获取配置
- [x] 2.3 将 `blogName` 作为 prop 传递给 `Navigation` 组件

## 3. 客户端组件更新

- [x] 3.1 修改 `Navigation.tsx`，接收 `blogName` 作为 prop
- [x] 3.2 移除 `Navigation.tsx` 中的 `siteConfig` 导入
- [x] 3.3 更新 `Navigation.tsx` 使用 props.blogName 替代 siteConfig.blog.name
- [x] 3.4 验证 `AuthorCard.tsx` 已正确处理社交链接（支持完整 URL 和用户名格式）

## 4. 导出和引用更新

- [x] 4.1 更新 `components/layout/header/index.ts`，导出 `NavigationProvider` 作为 `Navigation`
- [x] 4.2 验证所有使用 Navigation 的页面（首页、文章页、归档页）仍正常工作
- [x] 4.3 确保首页 `app/[locale]/page.tsx` 使用 `getAuthor()` 获取作者信息

## 5. 管理后台验证

- [x] 5.1 检查 `app/admin/settings/page.tsx` 是否正确保存所有 settings 字段
- [x] 5.2 确认管理后台表单包含所有必要字段：blogName, authorName, authorAvatar, authorBio, authorLocation, authorZodiac, authorEmail, authorSocialGithub, authorSocialTwitter, authorSocialLinkedin
- [x] 5.3 验证保存后数据库正确更新

## 6. 测试和验证

- [x] 6.1 启动应用，验证导航栏显示正确的博客名称
- [x] 6.2 验证首页作者卡片显示正确的作者信息
- [x] 6.3 在管理后台修改博客名称，验证刷新后生效
- [x] 6.4 验证社交链接正常工作（GitHub 等链接可点击跳转）
- [x] 6.5 测试回退逻辑：清空 settings 表，验证应用仍能使用 config/site.ts 的默认值

## 7. 清理和文档

- [x] 7.1 在 `config/site.ts` 添加注释，说明这是开发环境默认值，生产环境使用数据库
- [x] 7.2 更新相关文档（如有）说明配置管理方式（项目无 README，跳过）
- [x] 7.3 提交代码前运行 lint 和 type check
