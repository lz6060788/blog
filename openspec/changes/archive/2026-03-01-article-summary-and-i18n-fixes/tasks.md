## 1. 国际化修复（优先）

- [x] 1.1 检查国际化配置文件（i18n 配置）是否正确设置
- [x] 1.2 验证 `locales/en/index.ts` 和 `locales/zh/index.ts` 的导出是否正确
- [x] 1.3 检查语言切换器组件的实现
- [x] 1.4 修复语言切换器（使用 window.location.href 替代 router.replace）
- [x] 1.5 验证页面刷新后语言偏好是否正确保存和加载

## 2. 列表页 AI 摘要状态修复

- [x] 2.1 检查 `components/admin/ai-summary-status.tsx` 组件的状态映射逻辑
- [x] 2.2 添加防御性处理，确保无效状态值默认显示为 PENDING
- [x] 2.3 验证 `SummaryStatus` 枚举类型定义是否完整
- [x] 2.4 检查 `app/admin/posts/page.tsx` 传递给组件的 status 值格式
- [x] 2.5 测试文章列表页的各种 AI 摘要状态显示（pending/generating/done/failed）

## 3. AI 摘要编辑器组件创建

- [x] 3.1 创建 `components/admin/ai-summary-editor.tsx` 组件
- [x] 3.2 实现组件的 Props 接口（postId: string | null）
- [x] 3.3 从编辑页面迁移 AI 摘要相关状态管理代码
- [x] 3.4 迁移摘要生成功能（handleGenerateSummary）
- [x] 3.5 迁移摘要状态轮询逻辑（startSummaryPolling, stopSummaryPolling）
- [x] 3.6 迁移摘要重新生成功能（handleRegenerateSummary）
- [x] 3.7 迁移摘要手动编辑功能（textarea 输入）
- [x] 3.8 实现新建页面的禁用状态（postId 为 null 时显示提示）
- [x] 3.9 实现生成期间的锁定遮罩层
- [x] 3.10 集成 AISummaryStatusLabel 组件显示状态

## 4. 编辑页面集成新组件

- [x] 4.1 在 `app/admin/posts/[id]/edit/page.tsx` 中导入 AISummaryEditor 组件
- [x] 4.2 替换现有的 AI 摘要相关代码为新组件
- [x] 4.3 传递必要的 props（postId, 文章标题和内容用于验证）
- [x] 4.4 测试编辑页面的摘要生成功能是否正常
- [x] 4.5 测试摘要状态轮询是否正常工作
- [x] 4.6 测试重新生成功能是否正常
- [x] 4.7 验证保存文章时摘要内容是否正确保存

## 5. 新建页面集成摘要组件

- [x] 5.1 在 `app/admin/posts/new/page.tsx` 中添加"保存后自动生成摘要"勾选框
- [x] 5.2 添加勾选框状态管理（useState）
- [x] 5.3 实现保存后的条件跳转逻辑
- [x] 5.4 勾选时：保存后跳转到编辑页面并自动触发摘要生成
- [x] 5.5 未勾选时：保存后跳转到列表页面
- [x] 5.6 移除勾选框功能，调整为与编辑页面同一逻辑
- [x] 5.7 保存/发布后统一跳转到编辑页面
- [x] 5.8 测试新建文章完整流程

## 6. 最终测试与验证

- [x] 6.1 完整测试新建文章流程（创建 → 保存 → 生成摘要）
- [x] 6.2 完整测试编辑文章流程（编辑 → 生成/重新生成摘要 → 保存）
- [x] 6.3 验证文章列表页的状态显示是否正确
- [x] 6.4 测试国际化切换在所有页面是否正常工作
- [x] 6.5 检查控制台是否有类型错误或警告
- [x] 6.6 验证所有新增和修改的代码符合项目规范

## 7. 管理端首页 AI 统计修复

- [x] 7.1 去除关于摘要的统计显示（已生成、生成中、失败）
- [x] 7.2 保留 Token 消耗统计
- [x] 7.3 修复 executeWithRetry 方法，正确记录 inputTokens 和 outputTokens
- [x] 7.4 验证 AI 调用日志正确持久化
- [x] 7.5 测试 Token 统计是否正常显示
