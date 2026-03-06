## Context

**当前状态**:
- 文章详情页使用 `ArticleHeader` 组件显示摘要（excerpt）
- 文章正文通过 `ArticleContent` 组件渲染，使用 `CherryPreview` 组件
- `CherryPreview` 使用 `previewOnly` 模式，可能在开头显示内容截断

**问题**:
- 用户反馈标题下方显示的是内容截断，而不是摘要
- `ArticleHeader` 确实显示了 excerpt，但 `CherryPreview` 的预览模式可能造成了干扰

**组件结构**:
```
ArticleWrapper
  ├── ArticleHeader (显示 excerpt)
  └── ArticleContent
      └── CherryPreview (previewOnly 模式)
```

## Goals / Non-Goals

**Goals:**
- 确保标题下方只显示摘要，不显示内容截断
- 保持 CherryPreview 的主题切换功能
- 不影响文章正文的正常显示

**Non-Goals:**
- 不修改 CherryPreview 组件的核心功能
- 不改变文章内容的存储方式
- 不影响编辑器功能

## Decisions

**决策 1: 移除 CherryPreview 的预览模式显示**

**选择**: 将 `defaultModel` 从 `previewOnly` 改为正常模式，但保持只读（readonly）

**理由**:
- `previewOnly` 模式会在开头显示内容预览，造成混淆
- 正常的只读模式可以完整渲染文章，同时保持编辑禁用
- 用户不需要在详情页看到内容截断

**替代方案**: 完全移除 CherryPreview，改用纯 Markdown 渲染
- **问题**: 失去主题切换功能，这是重要的用户体验特性

**决策 2: 确保摘要位置正确**

**当前状态**: `ArticleHeader` 已正确显示 excerpt（line 47-50）

**验证**: 确保摘要清晰可辨，不被其他元素遮挡或混淆

## Risks / Trade-offs

**风险 1**: 切换到正常模式可能影响性能
- **缓解**: CherryPreview 已是优化的组件，性能影响可接受
- **缓解**: 保持 readonly=true，确保不会意外编辑

**风险 2: 布局可能发生变化
- **缓解**: 测试不同长度的文章，确保布局稳定
- **缓解**: 保持现有的 prose 样式系统

## Migration Plan

**步骤**:
1. 修改 `cherry-preview-internal.tsx` 中的 `defaultModel`
2. 从 `previewOnly` 改为普通模式，保持 `readonly: true`
3. 测试不同文章显示效果
4. 验证主题切换功能正常

**回滚策略**: 如有问题，恢复 `previewOnly` 模式

## Open Questions

1. **是否需要添加摘要长度限制？**
   - 如果摘要过长，可以考虑添加截断或滚动
   - 当前方案是保持原样，让用户控制摘要长度

2. **是否需要添加"展开全文"功能？**
   - 对于长摘要，可以考虑添加折叠/展开功能
   - 当前不需要，保持简洁
