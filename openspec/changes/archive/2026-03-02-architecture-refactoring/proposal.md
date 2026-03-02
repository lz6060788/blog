## Why

当前项目存在多层次的架构问题，严重影响了代码的可维护性和开发效率：`lib/` 和 `components/` 目录结构混乱导致引用路径不统一；业务逻辑在 API Routes、Server Actions 和查询层之间重复，违反 DRY 原则；存在 N+1 查询性能问题；缺乏分页机制；样式入口文件臃肿且存在遗留代码。这些问题随着项目规模增大将日益显著，急需进行系统性重构。

## What Changes

- **规范 lib/ 目录结构**: 统一使用 `lib/utils/index.ts` 和 `lib/types/index.ts` 作为入口，删除根目录下的冗余文件
- **重组 components/ 目录**: 按功能模块归类组件（`blog/`, `layout/`, `common/`, `editor/` 等）
- **创建统一样式入口**: 新建 `app/styles/index.css` 统一管理所有样式引入，简化 `app/layout.tsx`
- **清理遗留代码**: 移除 `app/styles/legacy` 目录，完成向 Tailwind/新样式系统的迁移
- **统一业务逻辑层**: 建立 `server/services` 目录，将核心业务逻辑从 Controller 层剥离
- **优化查询性能**: 消除 N+1 查询问题，使用 Drizzle 关联查询或批量查询策略
- **实现分页机制**: 为列表型 API 添加标准的分页参数（`page`, `limit`）和筛选能力
- **提取通用工具**: 将 `generateSlug` 等工具函数提取到 `lib/utils`

## Capabilities

### New Capabilities
- `service-layer`: 统一的业务逻辑层，封装核心业务逻辑、事务管理和第三方服务调用
- `data-access-layer`: 标准化的数据访问层（Repository 模式），屏蔽 ORM 细节，提供优化的查询方法
- `pagination-system`: 通用的分页参数处理和响应格式化能力
- `component-organization`: 清晰的组件分类和组织结构

### Modified Capabilities
- `article-public-api`: 添加分页支持，优化查询性能（REQUIREMENTS 变更）
- `server-api`: 调整接口层职责，仅负责参数校验和响应格式化（REQUIREMENTS 变更）

## Impact

- **代码组织**: 影响整个项目的目录结构，需更新所有导入路径
- **API 行为**: 列表型接口将支持分页，返回格式变化（潜在 BREAKING 变更）
- **性能**: 消除 N+1 查询后将显著提升接口响应速度
- **开发体验**: 清晰的分层架构将降低认知负担，提高开发效率
- **依赖**: 无新增外部依赖，主要是代码结构重组
