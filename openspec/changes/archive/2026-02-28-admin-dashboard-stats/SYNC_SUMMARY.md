# OpenSpec Delta Specs 同步摘要

## 同步日期
2026-02-28

## 变更标识
admin-dashboard-stats

## 同步的 Delta Specs

### 1. 新增规范：admin-dashboard-stats

**文件路径**: `D:\workspace\git\blog\openspec\specs\admin-dashboard-stats\spec.md`

**变更类型**: 新增 (ADDED)

**主要内容**:
- 获取文章总数统计：系统应提供统计所有文章总数的能力，包括已发布和草稿文章
- 获取已发布文章统计：系统应提供统计已发布文章数量的能力
- 获取草稿文章统计：系统应提供统计草稿文章数量的能力
- 获取最近7天新增文章统计：系统应提供统计最近7天内新增文章数量的能力
  - 时间计算基于当前时间向前推算7天
  - 判断依据是文章的 createdAt 字段
  - 使用 604800000 毫秒（7天）作为时间窗口
- 统计数据聚合接口：系统应提供统一的接口返回所有管理端首页所需的统计数据
  - 返回 totalPosts、publishedPosts、draftPosts、recentPosts 四个指标
- 统计查询性能：系统应确保统计查询在100毫秒内完成，使用 COUNT 聚合函数
- 统计数据一致性：确保 totalPosts 等于 publishedPosts 加 draftPosts，所有统计基于同一时刻的数据库快照

### 2. 修改规范：server-api

**文件路径**: `D:\workspace\git\blog\openspec\specs\server-api\spec.md`

**变更类型**: 修改 (MODIFIED)

**变更详情**:

#### 新增的需求：

1. **管理端统计 API 端点**
   - 系统应提供 `/api/admin/stats` 端点，用于获取管理端首页所需的统计数据
   - 场景：请求统计数据（向 `/api/admin/stats` 发出 GET 请求，用户已认证时返回统计数据，状态码200）
   - 场景：统计数据响应格式（响应为 JSON 格式，包含 totalPosts、publishedPosts、draftPosts、recentPosts 字段）
   - 场景：统计端点需要认证（用户未登录时返回401状态码和错误消息"未认证"）

2. **管理端 API 路由前缀**
   - 系统应使用 `/api/admin/` 前缀来标识管理端专用的 API 端点
   - 场景：管理端 API 路由（路由位于 `/app/api/admin/` 目录下，所有管理端 API 共享 `/api/admin/` 前缀）

## 同步状态

- [x] 创建 admin-dashboard-stats 主规范文件
- [x] 更新 server-api 主规范文件
- [x] 验证所有变更已正确应用

## 影响范围

### 新增文件
- `openspec/specs/admin-dashboard-stats/spec.md`

### 修改文件
- `openspec/specs/server-api/spec.md`

### 无影响的文件
- 其他所有规范文件保持不变

## 验证清单

- [x] admin-dashboard-stats 规范已创建
- [x] server-api 规范已更新
- [x] 所有 ADDED 需求已添加到主规范
- [x] 所有 MODIFIED 需求已更新到主规范
- [x] 无 REMOVED 需求（符合 delta spec）

## 下一步行动

建议在完成同步后：
1. 验证所有变更已正确应用到主规范文件
2. 如需要，使用 `openspec-archive-change` 技能归档此变更
