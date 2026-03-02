## ADDED Requirements

### Requirement: 组件按用户端/管理端和页面维度组织
系统应按用户端/管理端划分，再按页面细分组织组件。

#### Scenario: 组件目录顶层结构
- **当** 创建或移动组件时
- **那么** 组件应位于对应的功能域目录下：
  - `components/public/` - 用户端（前台）组件
  - `components/admin/` - 管理端组件
  - `components/shared/` - 前后台共享的业务组件
  - `components/layout/` - 布局组件
  - `components/editor/` - 编辑器组件
  - `components/auth/` - 认证相关组件（已存在）
  - `components/ui/` - 基础 UI 组件（shadcn/ui，已存在）

#### Scenario: 组件分类原则
- **当** 判断组件属于哪个目录时
- **那么** 首先判断是用户端还是管理端
- **并且** 然后按页面或功能模块进一步细分
- **并且** 如果组件被前后台共用，放入 `components/shared/`
- **并且** 如果组件是布局相关，放入 `components/layout/`

### Requirement: 用户端组件目录结构
系统应将用户端组件按页面维度组织在 `components/public/` 目录下。

#### Scenario: 用户端首页组件
- **当** 重组用户端首页组件时
- **那么** 组件应位于 `components/public/home/`
- **示例组件**：
  - `HeroSection` - 首页英雄区
  - `FeaturedPosts` - 精选文章
  - `RecentPosts` - 最新文章列表

#### Scenario: 用户端文章页面组件
- **当** 重组文章相关组件时
- **那么** 组件应位于 `components/public/posts/`
- **示例组件**：
  - `PostList` - 文章列表
  - `PostDetail` - 文章详情页
  - `PostContent` - 文章内容渲染
  - `PostNavigation` - 上一篇/下一篇导航

#### Scenario: 用户端归档页面组件
- **当** 重组归档页面组件时
- **那么** 组件应位于 `components/public/archive/`
- **示例组件**：
  - `ArchiveGrid` - 归档网格视图
  - `TimelineList` - 时间线列表视图
  - `ArchiveFilter` - 归档筛选器

#### Scenario: 用户端分类页面组件
- **当** 重组分类页面组件时
- **那么** 组件应位于 `components/public/categories/`
- **示例组件**：
  - `CategoryList` - 分类列表
  - `CategoryCard` - 分类卡片
  - `CategoryPosts` - 分类下的文章列表

#### Scenario: 用户端标签页面组件
- **当** 重组标签页面组件时
- **那么** 组件应位于 `components/public/tags/`
- **示例组件**：
  - `TagCloud` - 标签云
  - `TagList` - 标签列表
  - `TagPosts` - 标签下的文章列表

#### Scenario: 用户端搜索页面组件
- **当** 重组搜索相关组件时
- **那么** 组件应位于 `components/public/search/`
- **示例组件**：
  - `SearchBar` - 搜索输入框
  - `SearchResults` - 搜索结果列表
  - `SearchFilter` - 搜索筛选器

### Requirement: 管理端组件目录结构
系统应将管理端组件按功能模块组织在 `components/admin/` 目录下。

#### Scenario: 管理端仪表盘组件
- **当** 重组仪表盘组件时
- **那么** 组件应位于 `components/admin/dashboard/`
- **示例组件**：
  - `StatsCards` - 统计卡片
  - `QuickActions` - 快捷操作
  - `RecentActivity` - 最近活动

#### Scenario: 管理端文章管理组件
- **当** 重组文章管理组件时
- **那么** 组件应位于 `components/admin/posts/`
- **示例组件**：
  - `PostTable` - 文章列表表格
  - `PostForm` - 文章表单
  - `PostEditor` - 文章编辑器容器
  - `PostStatusBadge` - 文章状态标签

#### Scenario: 管理端分类管理组件
- **当** 重组分类管理组件时
- **那么** 组件应位于 `components/admin/categories/`
- **示例组件**：
  - `CategoryTable` - 分类列表表格
  - `CategoryForm` - 分类表单

#### Scenario: 管理端标签管理组件
- **当** 重组标签管理组件时
- **那么** 组件应位于 `components/admin/tags/`
- **示例组件**：
  - `TagTable` - 标签列表表格
  - `TagForm` - 标签表单
  - `TagMerge` - 标签合并工具

#### Scenario: 管理端 AI 配置组件
- **当** 重组 AI 配置组件时
- **那么** 组件应位于 `components/admin/ai/`
- **示例组件**：
  - `ModelConfigForm` - 模型配置表单
  - `ModelConfigList` - 模型配置列表
  - `FunctionMapping` - 功能映射配置
  - `CallLogs` - 调用日志查看

#### Scenario: 管理端设置组件
- **当** 重组系统设置组件时
- **那么** 组件应位于 `components/admin/settings/`
- **示例组件**：
  - `GeneralSettings` - 通用设置
  - `UserSettings` - 用户设置
  - `ThemeSettings` - 主题设置

#### Scenario: 管理端共享组件
- **当** 重组管理端共享组件时
- **那么** 组件应位于 `components/admin/shared/`
- **示例组件**：
  - `DataTable` - 通用数据表格
  - `ConfirmDialog` - 确认对话框
  - `BatchActions` - 批量操作工具
  - `FilterPanel` - 筛选面板

### Requirement: 共享业务组件目录
系统应将前后台共享的业务组件放在 `components/shared/` 目录。

#### Scenario: 文章相关共享组件
- **当** 组件既被用户端也被管理端使用时
- **那么** 文章相关组件应位于 `components/shared/post/`
- **示例组件**：
  - `PostCard` - 文章卡片
  - `PostMeta` - 文章元信息
  - `PostExcerpt` - 文章摘要
  - `PostTags` - 文章标签展示

#### Scenario: 作者相关共享组件
- **当** 组件既被用户端也被管理端使用时
- **那么** 作者相关组件应位于 `components/shared/author/`
- **示例组件**：
  - `AuthorCard` - 作者卡片
  - `AuthorInfo` - 作者信息
  - `AuthorAvatar` - 作者头像

#### Scenario: 导航相关共享组件
- **当** 组件既被用户端也被管理端使用时
- **那么** 导航相关组件应位于 `components/shared/navigation/`
- **示例组件**：
  - `Pagination` - 分页器
  - `Breadcrumbs` - 面包屑导航
  - `TabNav` - 标签导航

#### Scenario: 反馈相关共享组件
- **当** 组件既被用户端也被管理端使用时
- **那么** 反馈相关组件应位于 `components/shared/feedback/`
- **示例组件**：
  - `LoadingSpinner` - 加载状态
  - `EmptyState` - 空状态
  - `ErrorMessage` - 错误提示
  - `SuccessMessage` - 成功提示

### Requirement: 布局组件目录
系统应将布局相关组件组织在 `components/layout/` 目录。

#### Scenario: 头部布局组件
- **当** 重组头部布局组件时
- **那么** 组件应位于 `components/layout/header/`
- **示例组件**：
  - `Header` - 页头容器
  - `Navigation` - 导航菜单
  - `UserMenu` - 用户菜单
  - `SearchToggle` - 搜索切换按钮

#### Scenario: 页脚布局组件
- **当** 重组页脚布局组件时
- **那么** 组件应位于 `components/layout/footer/`
- **示例组件**：
  - `Footer` - 页脚容器
  - `FooterLinks` - 页脚链接
  - `SocialLinks` - 社交媒体链接
  - `Copyright` - 版权信息

#### Scenario: 侧边栏布局组件
- **当** 重组侧边栏布局组件时
- **那么** 组件应位于 `components/layout/sidebar/`
- **示例组件**：
  - `Sidebar` - 侧边栏容器
  - `SidebarSection` - 侧边栏区块
  - `SidebarToggle` - 侧边栏切换按钮

### Requirement: 编辑器组件目录
系统应将所有编辑器相关组件组织在 `components/editor/` 目录。

#### Scenario: Cherry Markdown 编辑器
- **当** 重组编辑器组件时
- **那么** Cherry 编辑器组件应位于 `components/editor/cherry/`
- **并且** 包含编辑器及其 internal 文件

#### Scenario: 编辑器预览组件
- **当** 重组预览组件时
- **那么** 预览组件应位于 `components/editor/preview/`
- **并且** 统一导出预览功能

#### Scenario: 编辑器工具栏
- **当** 重组工具栏组件时
- **那么** 工具栏组件应位于 `components/editor/toolbar/`
- **示例组件**：
  - `EditorToolbar` - 工具栏容器
  - `ToolbarButton` - 工具栏按钮
  - `ToolbarSeparator` - 工具栏分隔符

#### Scenario: 编辑器统一导出
- **当** 引用编辑器组件时
- **那么** 应从 `components/editor/index.ts` 导入
- **并且** 内部实现细节不应暴露

### Requirement: 组件索引文件
系统应每个组件目录包含 `index.ts` 索引文件，统一导出接口。

#### Scenario: 目录索引文件
- **当** 创建组件目录时
- **那么** 应创建 `index.ts` 文件
- **并且** 导出该目录下的所有公共组件
- **示例**：`components/public/home/index.ts` 导出 HeroSection, FeaturedPosts

#### Scenario: 统一导出格式
- **当** 使用组件时
- **那么** 应从目录索引导入
- **用户端示例**：`import { PostCard } from '@/components/shared/post'`
- **管理端示例**：`import { PostTable } from '@/components/admin/posts'`
- **并且** 不应从具体文件导入

#### Scenario: 类型导出
- **当** 组件包含复杂的类型定义时
- **那么** 类型也应从 index.ts 导出
- **示例**：`export type { PostCardProps } from './PostCard'`

### Requirement: 组件内部结构规范
系统应规范组件文件的内部结构。

#### Scenario: 组件文件组织
- **当** 组件包含紧密相关的子组件时
- **那么** 可以创建组件子目录
- **示例**：`components/public/posts/PostDetail/PostDetail.tsx` 和 `PostHeader.tsx`
- **并且** 子目录的 `index.ts` 应导出所有公共子组件

#### Scenario: 组件样式文件
- **当** 组件需要特定样式时
- **那么** 样式文件应与组件文件在同一目录
- **并且** 优先使用 Tailwind 类
- **或者** 使用 CSS Modules：`ComponentName.module.css`

#### Scenario: 组件测试文件
- **当** 为组件编写测试时
- **那么** 测试文件应与组件文件在同一目录
- **命名格式**：`ComponentName.test.tsx` 或 `ComponentName.spec.tsx`

### Requirement: 组件路径更新
系统应更新所有引用组件的导入路径。

#### Scenario: 更新 app 目录中的导入
- **当** 组件目录重组后
- **那么** 所有 `app/` 目录下的文件应更新导入路径
- **用户端页面**：从 `@/components/public/...` 导入
- **管理端页面**：从 `@/components/admin/...` 导入
- **布局文件**：从 `@/components/layout/...` 导入
- **并且** 确保 TypeScript 编译无错误

#### Scenario: 更新组件间的引用
- **当** 组件目录重组后
- **那么** 组件间的相互引用应使用新的路径
- **共享组件引用**：从 `@/components/shared/...` 导入
- **基础组件引用**：从 `@/components/ui` 导入

### Requirement: components/ 根目录清理
系统应清理 `components/` 根目录下的未分类文件。

#### Scenario: 移动或删除根目录组件
- **当** 完成组件重组后
- **那么** `components/` 根目录下应仅包含顶级功能目录
- **并且** 不应有未归类的 `.tsx` 文件
- **并且** 不应有遗留的测试文件

#### Scenario: 验证组件完整性
- **当** 移动组件后
- **那么** 应运行测试确保功能正常
- **并且** 应检查构建过程无错误
- **并且** 应手动验证页面渲染正确

### Requirement: 组件文档和注释
系统应在组件目录中包含必要的文档。

#### Scenario: 目录 README 文件
- **当** 组件目录包含多个子目录或复杂组件时
- **那么** 应包含 `README.md` 说明目录结构和组件用途
- **示例**：`components/admin/README.md` 说明各子目录的功能

#### Scenario: 组件 JSDoc 注释
- **当** 组件有复杂的 Props 类型时
- **那么** 应添加 JSDoc 注释说明每个 Prop 的用途
- **并且** 应包含使用示例

### Requirement: 组件复用性原则
系统应确保组件具有良好的复用性。

#### Scenario: 组件职责单一
- **当** 创建或重构组件时
- **那么** 组件应仅负责单一功能
- **并且** 不应包含不相关的业务逻辑
- **并且** Props 接口应清晰明确

#### Scenario: 共享组件识别
- **当** 发现代码在用户端和管理端重复时
- **那么** 应提取到 `components/shared/` 目录
- **并且** 确保组件足够通用，支持不同的配置需求

#### Scenario: 组件配置化
- **当** 组件可能在不同场景使用时
- **那么** 组件应通过 Props 接受配置
- **并且** 不应硬编码业务规则
- **并且** 应提供合理的默认值

### Requirement: 组件性能优化
系统应在组件重组时考虑性能优化。

#### Scenario: 使用 React.memo
- **当** 组件频繁重渲染且 Props 很少变化时
- **那么** 应使用 `React.memo` 包裹组件
- **并且** 应提供正确的比较函数（如需要）

#### Scenario: 代码分割和懒加载
- **当** 组件体积较大或不是首屏必需时
- **那么** 应使用 `next/dynamic` 进行懒加载
- **管理端页面**：可以懒加载非关键管理功能
- **用户端页面**：可以懒加载非首屏内容
- **并且** 应提供加载状态组件

### Requirement: 组件命名规范
系统应遵循清晰的组件命名规范。

#### Scenario: 组件文件命名
- **当** 创建组件文件时
- **那么** 使用 PascalCase 命名
- **示例**：`PostCard.tsx`, `ArchiveGrid.tsx`
- **并且** 文件名应与组件名称一致

#### Scenario: 组件目录命名
- **当** 创建组件目录时
- **那么** 使用 kebab-case 或 camelCase 命名
- **页面目录**：使用 kebab-case（如 `archive/`, `search/`）
- **功能模块目录**：使用 kebab-case（如 `dashboard/`, `settings/`）

#### Scenario: 组件索引命名
- **当** 组件有多个变体时
- **那么** 在索引文件中统一导出
- **并且** 使用描述性的导出名称
- **示例**：`export { Default as PostCard, Compact as PostCardCompact }`
