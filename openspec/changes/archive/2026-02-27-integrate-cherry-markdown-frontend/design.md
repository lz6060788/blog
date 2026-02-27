## Context

当前博客项目前台文章详情页（`app/[locale]/post/[id]/page.tsx`）使用手动实现的正则表达式解析 Markdown 内容。这种实现方式只支持基础语法（标题、段落、简单列表、代码块），无法处理更复杂的 Markdown 特性（表格、引用、任务列表、数学公式、脚注等）。

后台管理页面已成功集成 Cherry Markdown 编辑器（`components/admin/cherry-editor.tsx`），提供了完整的编辑和预览能力。Cherry Markdown 是一个功能强大的 Markdown 编辑器，支持丰富的扩展和自定义选项。

**约束条件：**
- 前台需要只读预览，不需要编辑功能
- 必须兼容现有的主题系统（深色/浅色模式）
- Cherry Markdown 需要在客户端渲染
- 文章内容当前来自静态数据（`lib/data`），未来可能来自 API

## Goals / Non-Goals

**Goals:**
- 创建 CherryPreview 只读组件，复用 Cherry Markdown 的渲染能力
- 替换前台文章详情页的手动解析逻辑
- 确保预览样式与主题系统完全兼容
- 保持加载性能，避免不必要的资源消耗

**Non-Goals:**
- 不提供前台编辑能力
- 不修改后台编辑器功能
- 不改变文章数据结构或 API

## Decisions

### 1. 使用 Cherry Markdown 的预览模式

**决策：** 使用 Cherry Markdown 的只读预览模式而非重新实现解析逻辑。

**理由：**
- Cherry Markdown 已在后台使用，无额外依赖成本
- 保证编辑和预览的渲染结果一致
- 支持完整的 Markdown 语法和扩展功能
- 减少维护负担，复用成熟的解决方案

**替代方案：** 考虑过使用其他 Markdown 渲染库（如 react-markdown），但会导致编辑器和预览器使用不同的解析引擎，可能出现渲染不一致的问题。

### 2. 独立的 CherryPreview 组件

**决策：** 创建独立的 `components/cherry-preview.tsx` 组件，而非复用后台的 `CherryEditor` 组件。

**理由：**
- 编辑器组件包含大量编辑相关代码（工具栏、输入处理等），前台不需要
- 只读组件可以更轻量，减少加载资源
- 明确的组件职责分离，便于维护
- 可以针对预览场景优化配置（禁用所有编辑功能）

**实现：** 参考后台 `cherry-editor.tsx` 的动态导入模式，创建一个类似的内部组件来处理 Cherry Markdown 的客户端渲染。

### 3. 主题样式适配

**决策：** 通过 CSS 变量和自定义配置确保 Cherry Markdown 预览与主题系统兼容。

**理由：**
- Cherry Markdown 默认样式可能不完全匹配项目的主题变量
- 需要确保深色/浅色模式切换时预览内容正确响应
- 通过 Cherry Markdown 的 `theme` 配置选项设置预设主题，并通过 CSS 覆盖特定样式

**实现：**
- 使用 Cherry Markdown 的 `theme` 配置（'dark' 或 'light'）匹配当前主题
- 通过全局 CSS 或组件级样式覆盖 Cherry Markdown 的默认样式类
- 确保代码高亮、表格、引用等元素的样式使用主题 CSS 变量

## Risks / Trade-offs

### 性能风险

**风险：** Cherry Markdown 是一个相对重的库，可能影响前台页面加载性能。

**缓解措施：**
- 使用动态导入（已验证可行，参考 `cherry-editor.tsx`）
- 只在文章详情页加载预览组件
- 考虑代码分割和懒加载策略
- 监控加载时间，必要时优化

### 样式兼容性风险

**风险：** Cherry Markdown 的默认样式可能与项目主题系统冲突。

**缓解措施：**
- 充分测试深色/浅色模式下的渲染效果
- 使用 CSS 优先级确保项目样式覆盖默认样式
- 利用 Cherry Markdown 的自定义样式配置选项

### 内容一致性风险

**风险：** 如果文章数据从静态数据迁移到 API，需要确保数据格式兼容。

**缓解措施：**
- Cherry Markdown 接受标准 Markdown 文本，与数据源无关
- 确保 API 返回的内容字段格式正确
- 添加内容解析错误处理

## Migration Plan

1. **创建 CherryPreview 组件**：在 `components/cherry-preview.tsx` 实现只读预览功能
2. **修改文章详情页**：在 `app/[locale]/post/[id]/page.tsx` 中替换手动解析逻辑
3. **样式适配**：添加必要的样式覆盖，确保主题兼容性
4. **测试验证**：在深色/浅色模式下测试各种 Markdown 内容的渲染效果
5. **清理代码**：移除不再需要的手动解析代码

**回滚策略：** 如果出现问题，可以快速恢复到原有的手动解析逻辑，因为新旧实现独立，不会影响其他功能。

## Open Questions

1. **Cherry Markdown 的具体配置选项有哪些？** 需要查看官方文档确定预览模式的最佳配置。
2. **是否需要支持自定义语法扩展？** 当前需求未提及，但 Cherry Markdown 支持扩展，未来可能需要。
3. **代码高亮样式如何处理？** Cherry Markdown 内置代码高亮，但可能需要自定义主题色。
