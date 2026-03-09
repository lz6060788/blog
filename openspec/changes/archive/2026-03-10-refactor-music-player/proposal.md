## Why

当前 `components/music-player/MusicPlayer.tsx` 文件过大（850 行），包含歌词处理、播放控制、UI 渲染、状态管理等多个职责，导致代码维护困难、测试复杂度增加、组件复用性降低。通过组件拆分可以提高代码可维护性和可测试性。

## What Changes

- 将 `MusicPlayer.tsx` 拆分为多个职责单一的子组件
- 提取歌词显示逻辑为独立的 `LyricsPanel` 组件
- 提取播放控制区域为独立的 `PlaybackControls` 组件
- 提取播放列表为独立的 `PlaylistPanel` 组件
- 提取黑胶唱片显示为独立的 `VinylRecord` 组件
- 提取折叠悬浮按钮为独立的 `CollapsedWidget` 组件
- 创建共享的类型定义文件
- 提取可复用的自定义 hooks（如 `useLyricsSync`、`useProgressBar`）
- **不改变任何外部 API 或用户可见功能**

## Capabilities

### New Capabilities
无新功能引入。此重构仅改变内部实现结构。

### Modified Capabilities

- `music-player`: 不修改任何行为规范。此重构仅优化组件内部结构，所有现有需求和行为保持不变。

## Impact

- **Affected Code**: `components/music-player/` 目录下的文件结构
  - 将添加多个新组件文件
  - `MusicPlayer.tsx` 将简化为组合组件的主入口
- **No Breaking Changes**: 所有外部导入和使用方式保持不变
- **Tests**: 重构后便于编写单元测试，可独立测试各个子组件
- **Performance**: 预期无性能影响，可能因组件优化略有提升
