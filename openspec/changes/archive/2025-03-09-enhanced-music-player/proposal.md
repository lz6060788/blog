## Why

当前博客仅提供文章阅读功能，内容形式较为单一。希望通过添加音乐播放功能，让博客更加生动有趣，展示个人音乐品味，同时为读者提供更丰富的浏览体验。

## What Changes

- 添加全局悬浮音乐播放器，支持收起/展开
- 实现唱片旋转动画 + 粒子浮动可视化效果
- 创建音乐管理后台，支持上传、编辑、删除音乐
- 创建和管理播放列表功能
- 集成歌词显示和同步功能
- 音乐文件通过 COS 自托管存储
- 播放器状态使用 Zustand 管理，页面切换不中断

## Capabilities

### New Capabilities
- `music-player`: 全局音乐播放器，支持播放控制、歌词显示、播放列表管理
- `music-management`: 音乐管理后台，支持音乐上传、元数据编辑、歌单管理
- `music-storage`: 音乐文件存储服务，集成 COS 上传和签名 URL 生成
- `music-visualization`: 音乐可视化效果，包括唱片旋转和粒子动画

### Modified Capabilities
（无现有 capabilities 的需求变更）

## Impact

**新增依赖**
- Zustand（全局状态管理）
- Web Audio API（音频分析）
- Canvas API（粒子效果渲染）

**新增 API 端点**
- `/api/music/songs` - 歌曲列表/详情/删除
- `/api/music/upload` - 音乐上传
- `/api/music/playlists` - 歌单管理
- `/api/music/lyrics` - 歌词管理

**数据库变更**
- 新增 `songs` 表
- 新增 `playlists` 表
- 新增 `playlist_songs` 关联表

**UI 组件**
- 全局 MusicPlayer 组件（在 layout.tsx 中挂载）
- 音乐管理页面 `/admin/music`
- 音乐播放器测试页面 `/music-player-demo`
