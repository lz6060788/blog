# 设计文档：清理重复的主题配置

## Context

### 当前状态

项目存在以下主题配置：

1. **`app/globals.css`** - CSS 变量定义（实际使用）
   - 定义 `--bg-canvas`, `--text-canvas`, `--accent-primary` 等变量
   - 支持浅色和深色主题
   - 被 `tailwind.config.ts` 引用
   - ⚠️ 包含冗余的 `@layer base` 原子类定义（未使用）

2. **`tailwind.config.ts`** - Tailwind 配置（正确引用）
   - 通过 `var(--bg-canvas)` 引用 CSS 变量
   - 提供 Tailwind 类名（如 `bg-theme-bg-canvas`）

3. **`theme.config.ts`** - TypeScript 配置（未使用）
   - 定义与 globals.css 相同的颜色值
   - 使用不同的命名（`bgPrimary` vs `--bg-canvas`）
   - **未被任何代码引用**

### 问题

- **配置重复**: `theme.config.ts` 与 `globals.css` 定义相同的颜色值
- **原子类冗余**: `globals.css` 定义了 `.bg-canvas` 等类，但代码使用的是 `bg-theme-bg-canvas`
- **维护负担**: 多处配置容易导致不一致
- **混淆**: 不清楚哪个是主题配置的"源"

### 技术栈

- Next.js 14 (App Router)
- Tailwind CSS
- CSS 变量（主题系统）

## Goals / Non-Goals

### Goals

1. **删除冗余配置**: 移除未使用的 `theme.config.ts`
2. **保持单一事实来源**: `globals.css` 作为唯一主题配置
3. **验证功能**: 确保删除后项目正常运行

### Non-Goals

- 不改变 globals.css 的变量命名
- 不改变 tailwind.config.ts 的引用方式
- 不影响现有主题切换功能

## Decisions

### 1. 删除 `theme.config.ts`

**决策**: 直接删除 `theme.config.ts` 文件。

**理由**:
- 该文件未被任何代码引用
- 代码搜索确认只在文档中提及
- 删除不会影响任何功能

**替代方案**:
- **保留文件**: 无意义，增加维护负担
- **迁移功能**: 不适用，文件未被使用

### 2. 不创建新的 TypeScript 类型

**决策**: 不为 CSS 变量创建 TypeScript 类型定义。

**理由**:
- Tailwind 配置已提供类型安全的类名
- CSS 变量通过 `var()` 引用，无需额外类型
- 增加复杂度，收益不大

**替代方案**:
- **创建类型文件**: 可选增强，非必要
- **使用 CSS-in-JS**: 不符合项目设计理念

### 3. 保持 globals.css 为主

**决策**: 继续使用 `globals.css` 作为主题配置的唯一来源。

**理由**:
- CSS 变量在运行时可动态切换（深色/浅色模式）
- Tailwind 配置正确引用这些变量
- 项目已建立完整的工作流

**替代方案**:
- **迁移到 theme.config.ts**: 不推荐，失去 CSS 变量的灵活性
- **使用 Tailwind 默认主题**: 不符合项目设计风格

## Risks / Trade-offs

### Risk 1: 隐藏依赖

**风险**: 可能有未发现的代码依赖 `theme.config.ts`。

**缓解措施**:
- 使用 `grep` 搜索整个代码库确认无引用
- 删除后立即测试项目编译和运行
- 如发现问题，可从 git 历史恢复

### Risk 2: 文档引用

**风险**: OpenSpec 文档中可能引用了 `theme.config.ts`。

**缓解措施**:
- 搜索并更新相关文档
- 或在文档中注明该文件已弃用

### Trade-off: 类型安全

**权衡**: 删除 `theme.config.ts` 会失去 TypeScript 类型定义。

**评估**: 影响较小，因为：
- Tailwind 类名已提供类型安全
- CSS 变量通过字符串引用，类型定义收益有限

## Migration Plan

### 执行步骤

1. **验证无引用**
   ```bash
   grep -r "theme.config" --exclude-dir=node_modules --exclude-dir=.openspec
   ```

2. **删除文件**
   ```bash
   rm theme.config.ts
   ```

3. **更新文档**
   - 搜索 OpenSpec 规范中的引用
   - 更新或删除相关说明

4. **验证功能**
   ```bash
   npm run build
   npm run dev
   ```

5. **提交变更**
   ```bash
   git add theme.config.ts
   git commit -m "chore: remove unused theme.config.ts"
   ```

### 回滚策略

如果删除后出现问题：
```bash
git checkout HEAD -- theme.config.ts
```

## Open Questions

无。这是一个简单的清理任务，没有未解决的技术问题。
