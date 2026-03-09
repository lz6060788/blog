## 1. 准备工作

- [x] 1.1 备份原始 `MusicPlayer.tsx` 文件
- [x] 1.2 创建 `types.ts` 文件，提取所有类型定义
- [x] 1.3 创建 `constants.ts` 文件，提取常量（如动画配置、尺寸配置）

## 2. 自定义 Hooks 提取

- [x] 2.1 创建 `hooks.ts` 文件
- [x] 2.2 实现 `useLyricsSync` hook（歌词同步和高亮逻辑）
- [x] 2.3 实现 `useProgressBar` hook（进度条拖拽和点击逻辑）
- [x] 2.4 实现 `useVolumeControl` hook（音量控制逻辑）

## 3. 基础组件拆分

- [x] 3.1 创建 `CollapsedWidget.tsx`（折叠悬浮按钮组件）
- [x] 3.2 创建 `VinylRecord.tsx`（黑胶唱片 + 歌曲信息组件）
- [x] 3.3 创建 `LyricsPanel.tsx`（歌词显示面板组件）
- [x] 3.4 创建 `ProgressBar.tsx`（进度条组件）
- [x] 3.5 创建 `PlaybackControls.tsx`（播放控制按钮组件）
- [x] 3.6 创建 `PlaylistPanel.tsx`（播放列表组件）

## 4. 容器组件创建

- [x] 4.1 创建 `ExpandedPlayer.tsx`（展开播放器容器组件）
- [x] 4.2 在 `ExpandedPlayer.tsx` 中组合所有子组件
- [x] 4.3 确保所有 props 正确传递

## 5. 主组件重构

- [x] 5.1 重构 `MusicPlayer.tsx`，使用新提取的 hooks 和组件
- [x] 5.2 移除已迁移到子组件的代码
- [x] 5.3 保留状态管理和事件处理逻辑
- [x] 5.4 确保组件正确组合 `CollapsedWidget` 和 `ExpandedPlayer`

## 6. 样式迁移

- [x] 6.1 将组件相关的样式迁移到对应的子组件文件中
- [x] 6.2 确保暗色模式样式正确应用
- [x] 6.3 验证响应式布局正常工作
- [x] 6.4 修复主题色切换问题（使用 CSS 变量和自定义类）

## 7. 导出和清理

- [x] 7.1 创建 `index.ts` 导出所有公共组件和 hooks
- [x] 7.2 更新 `MusicPlayerWrapper.tsx` 的导入（如需要）
- [x] 7.3 移除未使用的代码和注释

## 8. 验证和测试

> **注意**: 以下任务需要在浏览器中手动测试。所有代码重构已完成，TypeScript 类型检查通过。

- [ ] 8.1 测试播放器展开/收起功能
- [ ] 8.2 测试播放/暂停控制
- [ ] 8.3 测试上一首/下一首切换
- [ ] 8.4 测试进度条拖拽
- [ ] 8.5 测试音量控制
- [ ] 8.6 测试歌词同步滚动
- [ ] 8.7 测试播放列表选择歌曲
- [ ] 8.8 测试移动端响应式布局
- [ ] 8.9 测试暗色模式切换
- [ ] 8.10 检查控制台无错误或警告
