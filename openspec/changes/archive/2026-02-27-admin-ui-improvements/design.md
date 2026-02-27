## Context

当前博客管理端使用 Next.js 14+ App Router 架构，采用 shadcn/ui 组件库。项目已实现三层颜色系统和组件级颜色系统（见 component-color-system spec）。

现有问题：
- 项目中混用原生 `<input>`/`<textarea>` 和 shadcn/ui 的 Input 组件
- 管理端页面未设置 `<title>`，影响用户导航和 SEO
- 文章列表仅显示标题和日期，缺少分类、标签、字数等关键信息
- 文章列表标题无点击交互，需额外点击编辑按钮
- 文章编辑页存在双滚动条、分类下拉框样式简陋、选择分类后画面抖动

## Goals / Non-Goals

**Goals:**
- 统一所有 input/textarea 样式，使用组件库统一风格
- 为所有管理端页面提供清晰的 title 标识
- 增强文章列表信息密度，提升管理效率
- 优化文章列表到编辑页的交互体验
- 修复文章编辑页的布局问题，提升编辑体验

**Non-Goals:**
- 不修改文章编辑器的核心编辑功能
- 不改变现有 API 接口
- 不涉及移动端适配

## Decisions

### 1. Input 组件样式统一

**决策**: 创建统一的 Input 组件样式主题，替换所有原生 input/textarea

**理由**:
- shadcn/ui 已提供 Input、Textarea 组件，样式统一且支持主题
- 原生元素无法利用项目的颜色系统
- 统一组件可减少代码重复，提升可维护性

**实现方式**:
- 在 `components/ui/input.tsx` 基础上创建主题化样式
- 使用项目的颜色系统变量（HSL 语法）
- 搜索并替换 `app/admin/**` 中的原生 input/textarea

**备选方案**: 为原生元素添加统一样式类
**放弃原因**: 仍需手动维护样式一致性，无法利用组件库优势

### 2. 页面 Title 设置

**决策**: 在每个管理端页面组件中使用 Next.js metadata

**理由**:
- Next.js App Router 原生支持 metadata 导出
- 可根据页面内容动态生成 title
- 符合 Next.js 最佳实践

**实现方式**:
```typescript
export const metadata: Metadata = {
  title: '文章管理 - 管理后台',
};
```

**备选方案**: 使用 `useEffect` 动态修改 document.title
**放弃原因**: 不符合 Next.js 规范，可能导致 SEO 问题

### 3. 文章列表信息显示

**决策**: 在现有列表基础上添加分类、标签、字数列

**理由**:
- 用户需要快速了解文章属性
- 字数统计可帮助评估内容完整性
- 分类和标签有助于内容组织

**实现方式**:
- 使用 shadcn/ui 的 Badge 组件显示标签
- 字数统计可在前端计算或从 API 获取
- 使用表格或网格布局，确保响应式适配

### 4. 文章列表交互优化

**决策**: 标题可点击进入编辑页，添加 hover 效果和过渡动画

**理由**:
- 减少点击步骤，提升效率
- 视觉反馈让用户明确可交互区域
- 符合常见 CMS 交互模式

**实现方式**:
```tsx
<Link href={`/admin/posts/${post.id}/edit`} className="hover:text-primary transition-colors">
  {post.title}
</Link>
```

**备选方案**: 使用 onClick 处理路由跳转
**放弃原因**: Link 组件更符合 Next.js 规范，支持 prefetch

### 5. 文章编辑页布局优化

**问题分析**:
- **双滚动条**: 可能是外层容器和编辑器区域都设置了 overflow
- **下拉框样式**: 当前使用原生 select，样式简陋
- **画面抖动**: 选择分类后显示标签输入，导致高度变化

**决策**:
1. 修复双滚动条：调整容器高度策略，使用 `flex-1 overflow-auto` 确保单一滚动区域
2. 引入 shadcn/ui 的 Select 组件替换原生 select
3. 重新设计布局：分类和标签选择区域使用固定高度或预占位，避免动态高度变化

**实现方式**:
```tsx
// 使用 PopoverTrigger 或预留空间
<div className="min-h-[100px]">
  {selectedCategory && <TagSelector />}
</div>
```

**备选方案**: 使用绝对定位覆盖层
**放弃原因**: 复杂度高，可能影响响应式布局

## Risks / Trade-offs

### Risk 1: 替换原生 input 可能影响现有样式
**缓解**: 逐步替换，每个页面替换后进行测试验证

### Risk 2: 引入新的 shadcn/ui 组件需要适配样式
**缓解**: 遵循项目的三层颜色系统，使用 HSL 变量

### Risk 3: 文章编辑页布局修改可能影响其他页面
**缓解**: 使用 CSS 模块化或 scoped 样式，确保修改仅作用于目标页面

### Trade-off: 文章列表信息增加可能降低移动端体验
**缓解**: 使用响应式设计，小屏幕上隐藏次要信息或使用折叠

## Migration Plan

1. **创建 Input 组件样式主题**: 在 `app/admin/globals.css` 或组件样式文件中定义
2. **逐页面替换**: 按以下顺序逐个页面处理：
   - 登录页
   - 文章列表页
   - 文章编辑页
   - 其他管理页面
3. **每个页面完成后**: 提交独立 commit，便于回滚
4. **最终验证**: 全面测试所有管理端页面的功能和样式

## Open Questions

1. 字数统计是否需要实时显示？（建议：保存时计算显示）
2. 文章列表在移动端如何处理新增的信息列？（建议：使用响应式表格或卡片布局）
3. 分类和标签选择是否支持多选？（建议：当前保持单选分类、多选标签）
