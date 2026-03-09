## ADDED Requirements

### Requirement: 唱片旋转动画
系统 MUST 在播放时显示旋转的唱片效果，唱片中心显示专辑封面。

#### Scenario: 开始播放时启动旋转
- **WHEN** 音乐开始播放
- **THEN** 唱片 MUST 开始顺时针旋转
- **AND** 旋转 MUST 是平滑的连续动画
- **AND** 旋转速度 MUST 为恒定速度（约 10-15 秒一圈）

#### Scenario: 暂停时停止旋转
- **WHEN** 音乐暂停
- **THEN** 唱片 MUST 立即停止旋转
- **AND** 唱片 MUST 保持当前角度位置
- **AND** 恢复播放时 MUST 从停止的角度继续旋转

#### Scenario: 切换歌曲时更新封面
- **WHEN** 播放器切换到新歌曲
- **THEN** 唱片中心的封面图 MUST 更新为新歌曲的专辑封面
- **AND** 如果没有封面 MUST 显示默认封面图案
- **AND** 旋转动画 MUST 保持连续

### Requirement: 粒子浮动效果
系统 MUST 在唱片周围显示随音乐节奏变化的粒子效果。

#### Scenario: 粒子显示
- **WHEN** 音乐正在播放
- **THEN** 唱片周围 MUST 显示浮动粒子
- **AND** 粒子 MUST 围绕唱片呈圆形分布
- **AND** 粒子大小 MUST 固定为 3-4px（不随音乐变化）

#### Scenario: 粒子响应音乐节奏
- **WHEN** 音乐播放
- **THEN** 粒子透明度 MUST 随音频频率实时变化（范围 0.3-0.8）
- **AND** 粒子位置 MUST 随节奏有轻微的浮动效果
- **AND** 低频部分 MUST 对应靠近唱片的粒子
- **AND** 高频部分 MUST 对应外围的粒子

#### Scenario: 粒子参数可调
- **WHEN** 用户在测试页面调整粒子参数
- **THEN** 系统 MUST 实时更新粒子效果
- **AND** MUST 支持调整粒子颜色
- **AND** MUST 支持调整粒子透明度范围
- **AND** MUST 支持调整粒子数量（20-50 个）

#### Scenario: 暂停时减弱粒子
- **WHEN** 音乐暂停
- **THEN** 粒子效果 MUST 减弱（透明度降低）
- **AND** 粒子浮动 MUST 减缓但不完全停止
- **AND** 恢复播放时粒子 MUST 立即恢复活跃状态

### Requirement: Canvas 渲染优化
系统 MUST 使用 Canvas API 高效渲染可视化效果。

#### Scenario: 使用 requestAnimationFrame
- **WHEN** 渲染动画帧
- **THEN** 系统 MUST 使用 requestAnimationFrame 而非 setInterval
- **AND** 帧率 MUST 适配屏幕刷新率（通常 60fps）
- **AND** 在后台标签页时 MUST 降低渲染频率

#### Scenario: 粒子数量性能优化
- **WHEN** 系统检测到低端设备或性能问题
- **THEN** 系统 MUST 自动减少粒子数量
- **AND** 默认粒子数量 MUST 为 30 个（性能友好）
- **AND** MUST 提供选项让用户手动调整

### Requirement: 音频分析
系统 MUST 使用 Web Audio API 分析音频数据以驱动可视化效果。

#### Scenario: 创建音频分析上下文
- **WHEN** 音乐开始播放
- **THEN** 系统 MUST 创建 AudioContext
- **AND** MUST 创建 AnalyserNode 连接到音频源
- **AND** MUST 配置 FFT 大小为合适值（如 256 或 512）

#### Scenario: 获取频率数据
- **WHEN** 渲染每一帧动画
- **THEN** 系统 MUST 从 AnalyserNode 获取频率数据
- **AND** MUST 将频率数据映射到粒子的透明度和位置
- **AND** MUST 使用平滑处理避免动画闪烁

### Requirement: 测试页面
系统 MUST 提供独立的测试页面用于调试和预览可视化效果。

#### Scenario: 访问测试页面
- **WHEN** 用户访问 `/music-player-demo` 路径
- **THEN** 系统 MUST 显示完整的音乐播放器 UI
- **AND** MUST 使用预置的测试数据（mock 歌曲）
- **AND** MUST 不依赖后端 API

#### Scenario: 实时调节粒子参数
- **WHEN** 用户在测试页面调节粒子参数
- **THEN** 系统 MUST 实时更新可视化效果
- **AND** MUST 提供颜色选择器调整粒子颜色
- **AND** MUST 提供滑块调整粒子数量和透明度
- **AND** MUST 显示当前参数值

#### Scenario: 切换主题测试
- **WHEN** 用户在测试页面切换深色/浅色主题
- **THEN** 播放器 UI MUST 适配当前主题
- **AND** 拟态玻璃效果 MUST 在两种主题下都美观
- **AND** 粒子颜色 MUST 与主题协调

#### Scenario: 响应式测试
- **WHEN** 用户在测试页面切换设备尺寸
- **THEN** 系统 MUST 提供移动端和桌面端预览切换
- **AND** MUST 实时显示不同尺寸下的布局效果

### Requirement: 玻璃拟态效果
播放器 UI MUST 采用玻璃拟态设计风格。

#### Scenario: 背景模糊效果
- **WHEN** 用户查看播放器
- **THEN** 播放器背景 MUST 显示模糊的页面内容
- **AND** backdrop-filter blur 值 MUST 为 20px
- **AND** MUST 添加半透明背景色（rgba 255,255,255,0.1）

#### Scenario: 边框和阴影
- **WHEN** 用户查看播放器
- **THEN** 播放器 MUST 有细微的半透明边框
- **AND** MUST 有柔和的阴影效果（box-shadow）
- **AND** 边框和阴影 MUST 在深色和浅色主题下都清晰可见

### Requirement: 性能监控
系统 MUST 监控可视化效果的性能影响。

#### Scenario: 帧率监控
- **WHEN** 可视化效果运行时
- **THEN** 系统 MUST 监控实际渲染帧率
- **AND** 如果帧率持续低于 30fps MUST 自动降低粒子数量
- **AND** 在测试页面 MUST 显示当前帧率

#### Scenario: 内存使用
- **WHEN** 可视化效果运行时
- **THEN** 系统 MUST 确保 Canvas 渲染不造成内存泄漏
- **AND** 组件卸载时 MUST 清理 Canvas 上下文和事件监听
