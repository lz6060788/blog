## Context

**当前状态**:
- 文章系统有两个独立的摘要字段：`excerpt`（手动输入）和 `aiSummary`（AI 生成）
- 数据库 schema 定义了两个字段及其相关状态字段
- AI 摘要服务只更新 `aiSummary` 字段
- 文章详情页只返回和显示 `excerpt` 字段
- 两个字段之间没有同步机制

**问题**:
- 用户发现文章详情页显示的摘要与管理端的 AI 摘要不一致
- 数据冗余：两个字段存储相同类型的内容
- 架构混乱：不清楚应该使用哪个字段作为"真实"摘要
- 维护成本高：需要同步两个独立字段

**数据流**:
```
AI 摘要生成 → 更新 aiSummary 字段 → 管理端显示正确
文章详情页 → 只查询 excerpt 字段 → 显示错误（可能为空或过时）
```

## Goals / Non-Goals

**Goals**:
- 统一摘要字段，只保留 `excerpt` 作为单一数据源
- AI 摘要生成后直接更新 `excerpt` 字段
- 移除 `aiSummary`、`aiSummaryGeneratedAt`、`aiSummaryStatus` 冗余字段
- 简化数据模型和业务逻辑
- 提供数据迁移脚本，将现有 `aiSummary` 数据迁移到 `excerpt`

**Non-Goals**:
- 不修改 AI 封面功能（完全独立，不受影响）
- 不改变摘要生成的 Prompt 模板
- 不改变文章详情页的 UI 布局
- 不影响文章列表、分类、标签等其他功能

## Decisions

**决策 1: 保留 `excerpt` 字段，移除 `aiSummary` 字段**

**选择**:
- 保留 `excerpt` 字段作为统一的摘要字段
- 移除 `aiSummary`、`aiSummaryGeneratedAt`、`aiSummaryStatus` 字段

**理由**:
- `excerpt` 是更通用的命名，语义更清晰
- 前端组件已普遍使用 `excerpt` 字段
- 减少字段迁移的工作量
- 保持 API 响应的简洁性

**替代方案**: 保留 `aiSummary`，移除 `excerpt`
- **问题**: 需要修改所有使用 `excerpt` 的前端组件
- **问题**: `aiSummary` 命名不够通用，限制了扩展性

**决策 2: AI 摘要生成直接更新 `excerpt` 字段**

**选择**:
- AI 摘要生成服务成功后，直接更新 `excerpt` 字段
- 移除对 `aiSummary` 相关字段的操作

**理由**:
- 消除同步问题
- 简化业务逻辑
- 减少数据库字段

**替代方案**: 保持双字段，添加同步逻辑
- **问题**: 增加维护复杂度
- **问题**: 同步失败会导致数据不一致

**决策 3: 追踪 AI 生成状态的方式**

**选择**:
- 移除 `aiSummaryStatus` 字段
- AI 生成状态通过 `ai_call_logs` 表查询
- 前端通过轮询日志表判断生成状态

**理由**:
- `ai_call_logs` 表已记录所有 AI 调用状态
- 避免冗余状态字段
- 支持更灵活的状态查询（按时间、按文章）

**替代方案**: 保留 `aiSummaryStatus` 字段
- **问题**: 与 `ai_call_logs` 重复
- **问题**: 增加字段维护成本

**决策 4: 数据迁移策略**

**选择**:
- 优先级：`aiSummary` > 手动 `excerpt` > 空
- 如果 `aiSummary` 存在且非空，覆盖 `excerpt`
- 如果 `aiSummary` 为空或不存在，保留原 `excerpt`
- 迁移后删除 `aiSummary` 相关字段

**理由**:
- 用户反馈管理端的 AI 摘要更好
- AI 摘要是精心生成的，手动输入可能简略
- 确保不丢失已有数据

## Risks / Trade-offs

**风险 1: 迁移过程中数据丢失**
- **缓解**: 迁移前备份数据库
- **缓解**: 使用事务确保迁移原子性
- **缓解**: 提供回滚脚本

**风险 2: 前端组件仍引用旧字段**
- **缓解**: 全面搜索代码库，替换所有引用
- **缓解**: TypeScript 编译时检查
- **缓解**: 提交前测试所有相关页面

**风险 3: AI 生成状态查询变慢**
- **缓解**: `ai_call_logs` 表已建立索引
- **缓解**: 查询限制在单篇文章，性能影响小
- **缓解**: 缓存最近的生成状态

**风险 4: 并发生成摘要导致覆盖**
- **缓解**: 保留生成期间锁定机制
- **缓解**: 基于文章 ID 的并发控制
- **缓解**: 使用数据库行锁

## Migration Plan

**步骤 1: 数据库迁移**
1. 创建迁移脚本 `migrate_excerpt_fields.ts`
2. 将所有 `aiSummary` 数据迁移到 `excerpt`
3. 删除 `aiSummary`、`aiSummaryGeneratedAt`、`aiSummaryStatus` 字段
4. 执行迁移并验证

**步骤 2: 类型定义更新**
1. 更新 `server/db/schema.ts`，移除 AI 摘要字段
2. 更新 `lib/types/entities.ts`，移除 Post 类型的 AI 摘要字段
3. 运行 TypeScript 编译检查

**步骤 3: AI 摘要服务更新**
1. 修改 `server/ai/services/summary.ts`
2. 移除对 `aiSummary` 相关字段的操作
3. 改为直接更新 `excerpt` 字段
4. 更新错误处理逻辑

**步骤 4: 数据访问层更新**
1. 修改 `server/db/queries/posts.ts`
2. 移除查询中的 `aiSummary` 相关字段
3. 确保所有查询返回 `excerpt` 字段

**步骤 5: 管理端组件更新**
1. 修改 `components/admin/ai/ai-summary-editor.tsx`
2. 使用 `excerpt` 替代 `aiSummary`
3. 更新显示逻辑和状态管理

**步骤 6: API 路由更新**
1. 更新 `app/api/admin/posts/[id]/generate-summary/route.ts`
2. 移除 `aiSummaryStatus` 相关逻辑
3. 改为查询 `ai_call_logs` 表判断状态

**步骤 7: 测试验证**
1. 测试 AI 摘要生成功能
2. 测试文章详情页显示
3. 测试管理端编辑页面
4. 测试数据迁移脚本

**回滚策略**:
1. 保留迁移前的数据库备份
2. 如发现问题，恢复备份并回滚代码
3. 分析问题原因，修复后重新迁移

## Open Questions

1. **是否需要保留 AI 摘要生成时间戳？**
   - 当前方案：移除 `aiSummaryGeneratedAt`
   - 替代方案：在 `excerpt` 字段添加元数据标记
   - 决策：不需要，可通过 `ai_call_logs` 查询

2. **如何区分手动输入和 AI 生成的摘要？**
   - 当前方案：通过 `ai_call_logs` 表查询判断
   - 替代方案：添加 `excerpt_source` 字段（manual/ai）
   - 决策：当前方案足够，避免冗余字段

3. **数据迁移是否需要用户确认？**
   - 当前方案：自动迁移，优先使用 AI 摘要
   - 替代方案：提供管理界面让用户选择保留哪个
   - 决策：自动迁移，用户反馈 AI 摘要更好
