# 音乐播放器规范

## MODIFIED Requirements

### Requirement: 播放列表获取
系统 MUST 允许所有用户（包括未登录用户）获取音乐播放列表。

#### Scenario: 未登录用户获取播放列表
- **WHEN** 未登录用户访问播放器
- **THEN** 系统 MUST 能够正常获取播放列表
- **AND** MUST 不返回 401 或 403 错误
- **AND** MUST 显示可播放的音乐列表

#### Scenario: 已登录用户获取播放列表
- **WHEN** 已登录用户访问播放器
- **THEN** 系统 MUST 能够正常获取播放列表
- **AND** MUST 显示可播放的音乐列表

### Requirement: 空播放列表处理
系统 MUST 在没有可播放音乐时显示空状态，而非虚假/示例播放列表。

#### Scenario: 显示空状态
- **WHEN** 播放列表为空时
- **THEN** 系统 MUST 显示友好的空状态提示
- **AND** MUST 不显示任何虚假或示例音乐数据
- **AND** MUST 提示用户当前没有可播放的音乐

#### Scenario: 空状态点击交互
- **WHEN** 用户在空状态下点击播放器
- **THEN** 系统 MUST 显示提示信息（如"暂无音乐"）
- **AND** MUST 不尝试播放不存在的音乐

## REMOVED Requirements

### Requirement: 播放列表权限校验
**Reason**: 音乐播放列表应为公开内容，不需要权限校验
**Migration**: 移除 API 端点的权限中间件，前端移除权限错误处理

### Requirement: 示例播放列表展示
**Reason**: 给用户造成误导，让人以为有音乐可播放但实际无法播放
**Migration**: 移除所有硬编码的示例数据，改为显示空状态

## ADDED Requirements

### Requirement: 全局播放器实例
系统 MUST 在应用根布局中维护单一的全局音乐播放器实例，该实例 SHALL 在页面路由切换时不重新初始化。

#### Scenario: 页面切换保持播放
- **WHEN** 用户正在播放音乐并切换到另一个页面
- **THEN** 音乐 MUST 继续播放不中断
- **AND** 播放进度 MUST 保持连续
- **AND** 播放器状态 MUST 保持同步

### Requirement: 播放器展开收起
播放器 MUST 支持展开和收起两种状态。收起时显示为最小化悬浮控件，展开时显示完整播放界面。

#### Scenario: 收起到最小化
- **WHEN** 用户点击收起按钮或点击播放器外部区域
- **THEN** 播放器 MUST 收起为圆形悬浮控件（60x60px）
- **AND** 悬浮控件 MUST 显示当前播放歌曲的专辑封面缩略图
- **AND** 悬浮控件中心 MUST 显示播放/暂停按钮
- **AND** 音乐播放 MUST 不受影响

#### Scenario: 展开完整界面
- **WHEN** 用户点击收起的悬浮控件
- **THEN** 播放器 MUST 展开为完整界面（360x480px）
- **AND** MUST 显示唱片区域、歌曲信息、控制按钮、歌词和播放列表
- **AND** 播放器 MUST 保持当前播放状态

### Requirement: 播放控制
系统 MUST 提供完整的音乐播放控制功能，包括播放、暂停、上一首、下一首、进度调节和音量控制。

#### Scenario: 播放音乐
- **WHEN** 用户点击播放按钮或选择一首歌曲
- **THEN** 系统 MUST 开始播放选定的歌曲
- **AND** MUST 显示播放状态（播放图标变为暂停图标）
- **AND** MUST 启动唱片旋转动画
- **AND** MUST 启动粒子效果

#### Scenario: 暂停音乐
- **WHEN** 用户点击暂停按钮
- **THEN** 系统 MUST 暂停当前播放的歌曲
- **AND** MUST 显示暂停状态（暂停图标变为播放图标）
- **AND** MUST 停止唱片旋转动画
- **AND** MUST 减弱粒子效果的透明度

#### Scenario: 调节播放进度
- **WHEN** 用户拖动进度条
- **THEN** 音乐播放 MUST 跳转到指定进度位置
- **AND** 歌词 MUST 同步跳转到对应时间
- **AND** 进度条 MUST 显示实时进度

#### Scenario: 切换歌曲
- **WHEN** 用户点击下一首或上一首按钮
- **THEN** 系统 MUST 停止当前歌曲并开始播放目标歌曲
- **AND** MUST 更新唱片、歌曲信息、歌词
- **AND** MUST 重置进度条

### Requirement: 歌词显示
系统 MUST 支持显示和同步滚动歌词。

#### Scenario: 显示歌词
- **WHEN** 用户在展开的播放器中查看歌词面板
- **THEN** 系统 MUST 显示当前播放歌曲的歌词
- **AND** 当前播放时间对应的歌词行 MUST 高亮显示
- **AND** 其他歌词行 MUST 以半透明显示

#### Scenario: 歌词同步滚动
- **WHEN** 音乐播放进度变化
- **THEN** 歌词面板 MUST 自动滚动到当前时间对应的歌词行
- **AND** 当前歌词行 MUST 始终保持在可视区域中央

### Requirement: 播放列表管理
系统 MUST 支持显示和操作播放列表。

#### Scenario: 显示播放列表
- **WHEN** 用户打开播放列表面板
- **THEN** 系统 MUST 显示当前播放列表中的所有歌曲
- **AND** 当前播放的歌曲 MUST 有视觉指示器
- **AND** 每首歌曲 MUST 显示标题和艺术家

#### Scenario: 从播放列表选择歌曲
- **WHEN** 用户点击播放列表中的某首歌曲
- **THEN** 系统 MUST 停止当前歌曲并开始播放选中的歌曲
- **AND** MUST 关闭播放列表面板（可选）

### Requirement: 唱片旋转效果
系统 MUST 在播放时显示旋转的唱片动画，唱片中心显示专辑封面。

#### Scenario: 播放时旋转
- **WHEN** 音乐正在播放
- **THEN** 唱片 MUST 持续顺时针旋转
- **AND** 旋转速度 MUST 保持恒定
- **AND** 唱片中心 MUST 显示专辑封面

#### Scenario: 暂停时停止旋转
- **WHEN** 音乐暂停
- **THEN** 唱片 MUST 停止旋转
- **AND** 唱片 MUST 保持当前角度位置

### Requirement: 响应式设计
播放器 MUST 支持桌面端和移动端的不同布局。

#### Scenario: 移动端布局
- **WHEN** 用户使用移动设备访问（屏幕宽度 < 768px）
- **THEN** 播放器 MUST 调整尺寸适配移动屏幕
- **AND** 收起时悬浮控件 MUST 为 50x50px
- **AND** 展开时 MUST 占据屏幕底部或全屏

#### Scenario: 桌面端布局
- **WHEN** 用户使用桌面设备访问（屏幕宽度 >= 768px）
- **THEN** 播放器 MUST 按照设计的桌面尺寸显示
- **AND** 收起时悬浮控件 MUST 为 60x60px
- **AND** 展开时 MUST 为 360x480px

### Requirement: 状态持久化
系统 MUST 持久化用户的播放偏好和状态。

#### Scenario: 保存播放偏好
- **WHEN** 用户调整音量或播放模式
- **THEN** 系统 MUST 将这些偏好保存到 localStorage
- **AND** 下次访问时 MUST 恢复这些偏好

#### Scenario: 保存当前播放状态
- **WHEN** 用户正在播放音乐
- **THEN** 系统 MUST 在 sessionStorage 中保存当前歌曲 ID 和播放进度
- **AND** 页面刷新后 MUST 尝试恢复播放状态
