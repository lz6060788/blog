## Context

**Current State:**
`components/music-player/MusicPlayer.tsx` 是一个 850 行的单体组件，包含：
- 10+ 个状态变量（`mounted`、`isMobile`、`lyricLines`、`currentLyricIndex`、`isDraggingProgress` 等）
- 8+ 个副作用钩子（`useEffect`）
- 多个职责：UI 渲染、歌词同步、进度控制、音量控制、播放列表管理
- 大量内联样式和 JSX 样式标签

**Constraints:**
- 不能改变外部 API 或用户可见功能
- 必须保持与现有 `music-store` 的兼容性
- 重构过程中应用需保持可用

## Goals / Non-Goals

**Goals:**
- 将单体组件拆分为职责单一、可测试的子组件
- 提高代码可维护性和可读性
- 便于单元测试（每个子组件可独立测试）
- 创建可复用的自定义 hooks
- 保持所有现有功能和用户体验不变

**Non-Goals:**
- 不修改任何功能需求
- 不改变组件的外部 API
- 不优化性能（除非是重构的自然结果）
- 不修改 `music-store` 的实现

## Decisions

### 1. 组件拆分策略

**决策：** 按职责拆分为 6 个子组件 + 1 个主组件

**理由：**
- 每个子组件职责单一，易于理解和测试
- 保持组件层级扁平，避免过度嵌套
- 主组件作为协调器，管理状态和传递 props

**组件结构：**
```
MusicPlayer (主组件 - 状态管理 + 组合)
├── CollapsedWidget (折叠悬浮按钮)
├── ExpandedPlayer (展开的播放器容器)
│   ├── VinylRecord (黑胶唱片 + 歌曲信息)
│   ├── LyricsPanel (歌词显示面板)
│   ├── ProgressBar (进度条)
│   ├── PlaybackControls (播放控制按钮)
│   └── PlaylistPanel (播放列表)
```

### 2. 自定义 Hooks 提取

**决策：** 提取以下 hooks

- `useLyricsSync`: 歌词同步和高亮逻辑
- `useProgressBar`: 进度条拖拽和点击逻辑
- `useAudioPlayer`: 音频播放核心逻辑（可选，如果复杂度高）

**理由：**
- 业务逻辑与 UI 分离
- 便于单元测试
- 可在其他场景复用

### 3. 类型定义组织

**决策：** 创建 `types.ts` 集中管理类型

**包含：**
- `MusicPlayerProps` 主组件 props
- 各子组件的 props 类型
- 歌词相关类型

**理由：**
- 类型定义集中管理，便于维护
- 避免在各组件中重复定义

### 4. 样式组织

**决策：** 保留现有的内联样式和 JSX `<style>` 标签方式

**理由：**
- 保持重构的渐进性，降低风险
- 避免引入额外的样式系统复杂度
- 后续可考虑迁移到 CSS Modules 或 Tailwind

### 5. 文件目录结构

**决策：** 在 `components/music-player/` 目录下创建组件文件

```
components/music-player/
├── MusicPlayer.tsx (主组件)
├── CollapsedWidget.tsx
├── ExpandedPlayer.tsx
├── VinylRecord.tsx
├── LyricsPanel.tsx
├── ProgressBar.tsx
├── PlaybackControls.tsx
├── PlaylistPanel.tsx
├── hooks.ts (自定义 hooks)
├── types.ts (类型定义)
├── constants.ts (常量)
└── index.ts (导出)
```

**理由：**
- 所有相关文件集中在同一目录
- 便于导入和查找
- 保持模块内聚性

## Risks / Trade-offs

### Risk: 重构过程中引入功能回归
**缓解措施：**
- 分阶段重构，每次完成一个组件后进行测试
- 使用现有的手动测试流程验证功能
- 考虑在重构后添加自动化测试

### Risk: Props drilling（属性透传）问题
**缓解措施：**
- 主组件作为状态管理中心，合理分配 props
- 必要时使用 Context 或继续依赖现有的 `music-store`
- 保持组件层级扁平，减少透传层级

### Trade-off: 文件数量增加
**权衡：**
- 虽然文件数量增加，但每个文件更小更易维护
- IDE 支持良好，多文件不会显著影响开发体验
- 可读性和可测试性的收益大于文件数量的成本

## Migration Plan

**阶段 1: 准备工作**
1. 创建新文件结构
2. 提取类型定义到 `types.ts`
3. 提取常量到 `constants.ts`

**阶段 2: Hooks 提取**
1. 提取 `useLyricsSync` hook
2. 提取 `useProgressBar` hook
3. 验证 hooks 正常工作

**阶段 3: 组件拆分**
1. 拆分 `CollapsedWidget` 组件
2. 拆分 `VinylRecord` 组件
3. 拆分 `LyricsPanel` 组件
4. 拆分 `ProgressBar` 组件
5. 拆分 `PlaybackControls` 组件
6. 拆分 `PlaylistPanel` 组件
7. 拆分 `ExpandedPlayer` 组件

**阶段 4: 主组件重构**
1. 简化 `MusicPlayer.tsx` 为组合组件
2. 更新导出文件
3. 移除旧代码

**阶段 5: 验证**
1. 手动测试所有播放器功能
2. 检查控制台无错误
3. 验证响应式布局正常工作

**回滚策略：**
- 保留原 `MusicPlayer.tsx` 的备份直到验证完成
- 使用 git 分支进行重构，便于回滚
- 每个阶段完成后提交，便于定位问题

## Open Questions

1. **是否需要添加单元测试？**
   - 建议：重构完成后添加关键组件的单元测试
   - 优先级：中等

2. **是否迁移到 Tailwind CSS？**
   - 建议：暂不迁移，保持现有样式系统
   - 理由：避免同时进行过多变更
   - 后续可单独考虑

3. `music-store` 的使用方式是否需要调整？
   - 建议：暂不修改，保持现有使用方式
   - 后续可评估是否需要进一步封装
