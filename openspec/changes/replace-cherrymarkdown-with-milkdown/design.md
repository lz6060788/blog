## Context

博客系统当前使用 CherryMarkdown 作为编辑器和预览组件。项目使用 Next.js 14 App Router，文章详情页需要支持 SEO，但 CherryMarkdown 是纯客户端组件，使用 `ssr: false` 动态导入，导致搜索引擎爬虫无法获取文章内容。

**当前状态:**
- `CherryEditor` - 编辑器组件，客户端渲染
- `CherryPreview` - 预览组件，客户端渲染
- 使用 `cherry-markdown@0.10.3`
- 主题系统基于 CSS 变量（`--theme-*`）

**约束条件:**
- 必须保持现有功能完整（代码高亮、表格、数学公式等）
- 必须兼容深色/浅色主题系统
- 必须确保 SEO 友好（服务端渲染）
- 组件 API 需尽可能兼容现有调用方

**利益相关者:**
- 博客作者 - 编辑体验和预览效果
- SEO - 搜索引擎可见性
- 读者 - 阅读体验和主题一致性

## Goals / Non-Goals

**Goals:**
- 实现文章内容的服务端渲染，确保 SEO
- 保持编辑器和预览组件的所有现有功能
- 完全适配项目的主题系统（CSS 变量）
- 提供流畅的编辑和阅读体验

**Non-Goals:**
- 修改文章数据库 schema（内容格式仍为 Markdown）
- 改变编辑器的工作流或 UX 布局
- 支持 CherryMarkdown 的所有插件（仅保留核心功能）

## Decisions

### 选择 Milkdown 而非其他 SSR 友好的编辑器

**选项比较:**

| 编辑器 | SSR 支持 | 主题定制 | 功能完整度 | 包大小 |
|--------|----------|----------|------------|--------|
| Milkdown | ✅ 原生支持 | ✅ 基于 CSS 变量 | ⭐⭐⭐⭐ | 中等 |
| TipTap | ✅ 支持 | ⚠️ 需要额外配置 | ⭐⭐⭐⭐⭐ | 较大 |
| MDXEditor | ✅ 支持 | ⚠️ 主题配置复杂 | ⭐⭐⭐ | 中等 |

**选择 Milkdown 的原因:**
1. 原生支持 SSR，无需额外配置
2. 主题系统基于 CSS 变量，与项目现有主题系统完美契合
3. 基于 ProseMirror，成熟稳定
4. 包大小适中，加载性能好
5. 支持 WYSIWYG 和 Markdown 分屏模式切换

### 使用两套组件：编辑器 + 预览

保持与当前架构一致，分别实现编辑和预览组件：

- `MilkdownEditor` - 编辑时使用，富交互，无需 SSR
- `MilkdownPreview` - 预览时使用，支持 SSR 输出完整 HTML

**为什么不合并为一个组件:**
- 编辑器功能复杂，SSR 无意义
- 预览组件需要轻量化，优先 SSR 性能
- 现有调用方已经区分两种使用场景

### 主题集成策略

Milkdown 是无头编辑器（headless），需要自行配置样式。官方提供了 `@milkdown/crepe/theme` 主题包，包含多个预构建主题（Crepe、Nord、Frame）及 CSS 变量系统。

**方案:**
1. 使用 `@milkdown/crepe/theme` 作为基础主题（推荐 Crepe 或 Nord）
2. 通过 CSS 变量覆盖来适配项目主题
3. 样式文件 `app/styles/components/milkdown-theme.css` 定义变量映射

**CSS 变量覆盖示例:**
```css
/* 使用 Crepe 主题并覆盖变量 */
.crepe .milkdown {
  --crepe-color-background: var(--theme-background);
  --crepe-color-surface: var(--theme-background-secondary);
  --crepe-color-on-background: var(--theme-text-primary);
  --crepe-color-primary: var(--theme-primary);
  --crepe-color-outline: var(--theme-border);
}
```

**优势:**
- ✅ 无需从零构建样式
- ✅ 跟随上游主题更新
- ✅ 简单的变量覆盖即可适配
- ✅ 内置深色/浅色模式支持

### 组件架构

```
components/editor/milkdown/
├── milkdown-editor.tsx          # 编辑器入口（dynamic import, ssr: false）
├── milkdown-editor-internal.tsx # 编辑器实现
├── milkdown-preview.tsx         # 预览入口（支持 SSR）
└── milkdown-preview-internal.tsx # 预览实现（客户端水合）

app/styles/components/
└── milkdown-theme.css           # Crepe 主题变量覆盖
```

**API 设计:**
```typescript
// 保持与 CherryEditor API 一致
interface MilkdownEditorRef {
  getContent(): string
  setContent(content: string): void
  getHeight(): number
}

interface MilkdownPreviewRef {
  // 如果需要客户端操作
}
```

### SSR 实现方案

**MilkdownPreview 组件:**
1. 默认导出组件支持 SSR（不使用 dynamic import）
2. 内部使用 Milkdown 的 `@milkdown/core` 和 `@milkdown/theme`
3. 服务端：渲染 Markdown → HTML
4. 客户端：水合 + 主题切换支持

**为什么 MilkdownPreview 需要客户端水合:**
- 主题切换功能需要在客户端响应
- 代码高亮需要客户端初始化 Prism

## Risks / Trade-offs

### 风险 1: 主题样式可能不一致
- **风险**: Crepe 主题的默认样式可能与项目设计有细微差异
- **缓解**: 通过 CSS 变量覆盖关键颜色和字体，保持与项目主题一致
- **备选**: 如需深度定制，可基于 Crepe 样式进行二次开发

### 风险 2: 数学公式渲染差异
- **风险**: CherryMarkdown 使用 KaTeX，Milkdown 使用不同的数学插件
- **缓解**: 配置 `@milkdown/plugin-math` 使用 KaTeX 渲染器

### 风险 3: 编辑器包体积增加
- **风险**: Milkdown + 插件可能比 CherryMarkdown 更大
- **缓解**: 使用动态导入和代码分割，仅在使用时加载

### 风险 4: 兼容性问题
- **风险**: 已有文章的 Markdown 语法可能渲染不一致
- **缓解**: 确保 CommonMark 和 GFM 规范完全兼容

### 权衡: 功能 vs 简洁性
- 保留核心功能（代码高亮、表格、数学公式）
- 移除不常用的 CherryMarkdown 插件（如流程图、时序图）
- 如需高级功能，后续可逐步添加插件

## Migration Plan

### 阶段 1: 安装依赖和基础配置
```bash
# 核心包
npm install @milkdown/core @milkdown/ctx

# 预设和插件
npm install @milkdown/preset-commonmark @milkdown/preset-gfm \
  @milkdown/plugin-listener @milkdown/plugin-history \
  @milkdown/plugin-prism @milkdown/plugin-math

# 主题包（提供预构建样式）
npm install @milkdown/crepe/theme
```

### 阶段 2: 配置主题样式
- 导入 Crepe 主题 CSS（`@milkdown/crepe/theme/crepe.css` 或 `nord.css`）
- 创建 `app/styles/components/milkdown-theme.css`
- 通过 CSS 变量覆盖项目主题色
- 测试深色/浅色模式切换

### 阶段 3: 实现组件
- 实现 `MilkdownEditor`（带 Crepe 主题）
- 实现 `MilkdownPreview`（支持 SSR）
- 创建 `milkdown-theme.css` 变量覆盖
- 单元测试和样式验证

### 阶段 4: 集成到页面
- 更新文章编辑页：`CherryEditor` → `MilkdownEditor`
- 更新文章详情页：`CherryPreview` → `MilkdownPreview`
- 验证编辑和预览功能

### 阶段 5: 清理旧代码
- 删除 `components/editor/cherry/` 和 `components/editor/preview/`
- 删除 `cherry-markdown` 依赖
- 删除 `app/styles/components/cherry-preview.css`
- 保留 `app/styles/components/milkdown-theme.css`（新建的样式文件）

### 回滚策略
- Git 回滚到变更前的 commit
- 如果已部署，重新部署旧版本
- 文章数据不受影响（仍为 Markdown 格式）

## Open Questions

1. **是否需要保留 CherryMarkdown 的图片上传功能？**
   - 当前项目可能有独立的图片处理系统
   - 需要确认是否使用 `@milkdown/plugin-upload`

2. **代码高亮主题如何与项目主题一致？**
   - Prism 需要单独配置主题
   - 可能需要自定义 Prism 样式以匹配项目

3. **是否需要支持 Markdown 分屏预览模式？**
   - CherryMarkdown 支持左右分屏
   - Milkdown 支持，但需要额外配置
