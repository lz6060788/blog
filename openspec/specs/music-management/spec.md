# 音乐管理规范

## ADDED Requirements

### Requirement: 音乐上传
管理后台 MUST 允许管理员上传音乐文件到系统。

#### Scenario: 上传单个音乐文件
- **WHEN** 管理员选择一个音频文件（MP3、AAC、OGG）并点击上传
- **THEN** 系统 MUST 提取音频元数据（标题、艺术家、专辑、时长）
- **AND** MUST 将文件上传到 COS 存储
- **AND** MUST 将元数据保存到数据库
- **AND** MUST 显示上传进度
- **AND** 上传完成后 MUST 在音乐列表中显示新上传的歌曲

#### Scenario: 上传大文件
- **WHEN** 管理员上传大于 10MB 的音频文件
- **THEN** 系统 MUST 支持断点续传
- **AND** MUST 显示实时上传进度百分比
- **AND** 上传失败时 MUST 提供重试选项

#### Scenario: 文件格式不支持
- **WHEN** 管理员尝试上传不支持的音频格式
- **THEN** 系统 MUST 显示错误提示，说明支持的格式
- **AND** MUST 阻止上传操作

### Requirement: 音乐列表管理
系统 MUST 提供音乐列表界面，允许管理员查看、搜索和删除音乐。

#### Scenario: 查看音乐列表
- **WHEN** 管理员访问音乐管理页面
- **THEN** 系统 MUST 显示所有已上传的音乐
- **AND** 每首歌曲 MUST 显示标题、艺术家、专辑、时长、上传时间
- **AND** MUST 支持分页或无限滚动

#### Scenario: 搜索音乐
- **WHEN** 管理员在搜索框中输入关键词
- **THEN** 系统 MUST 实时过滤音乐列表
- **AND** MUST 匹配标题、艺术家或专辑名称

#### Scenario: 删除音乐
- **WHEN** 管理员点击删除按钮并确认
- **THEN** 系统 MUST 从数据库中删除该音乐的元数据
- **AND** MUST 从 COS 中删除对应的音频文件
- **AND** MUST 从所有播放列表中移除该歌曲
- **AND** MUST 显示删除成功提示

### Requirement: 音乐元数据编辑
系统 MUST 允许管理员编辑音乐的元数据信息。

#### Scenario: 编辑音乐信息
- **WHEN** 管理员点击编辑按钮并修改歌曲信息
- **THEN** 系统 MUST 保存修改后的元数据到数据库
- **AND** MUST 更新音乐列表显示
- **AND** MUST 显示保存成功提示

#### Scenario: 上传专辑封面
- **WHEN** 管理员为歌曲上传新的专辑封面
- **THEN** 系统 MUST 将封面图片上传到 COS
- **AND** MUST 更新数据库中的封面 URL
- **AND** MUST 在播放器中显示新封面

### Requirement: 歌单管理
系统 MUST 支持创建和管理播放列表。

#### Scenario: 创建歌单
- **WHEN** 管理员输入歌单名称并点击创建
- **THEN** 系统 MUST 在数据库中创建新的播放列表
- **AND** MUST 在歌单列表中显示新创建的列表
- **AND** MUST 显示创建成功提示

#### Scenario: 添加歌曲到歌单
- **WHEN** 管理员从音乐列表中选择歌曲并添加到指定歌单
- **THEN** 系统 MUST 在数据库中创建歌单-歌曲关联
- **AND** MUST 更新歌单的歌曲数量显示
- **AND** MUST 显示添加成功提示

#### Scenario: 从歌单移除歌曲
- **WHEN** 管理员从歌单中移除某首歌曲
- **THEN** 系统 MUST 删除数据库中的歌单-歌曲关联
- **AND** MUST 更新歌单显示
- **AND** MUST 显示移除成功提示

#### Scenario: 删除歌单
- **WHEN** 管理员删除一个歌单
- **THEN** 系统 MUST 删除歌单及其所有歌曲关联
- **AND** MUST 从歌单列表中移除
- **AND** MUST 不影响音乐库中的原始歌曲文件

### Requirement: 歌词管理
系统 MUST 允许管理员为歌曲添加和编辑歌词。

#### Scenario: 上传 LRC 歌词文件
- **WHEN** 管理员为歌曲上传 LRC 格式的歌词文件
- **THEN** 系统 MUST 解析 LRC 文件中的时间标签和歌词文本
- **AND** MUST 将解析后的歌词保存到数据库
- **AND** MUST 在播放器中支持歌词同步显示

#### Scenario: 手动编辑歌词
- **WHEN** 管理员在歌词编辑器中手动输入或修改歌词
- **THEN** 系统 MUST 保存编辑后的歌词到数据库
- **AND** MUST 支持标准 LRC 格式的时间标签（[mm:ss.xx]）
- **AND** MUST 验证时间标签格式的正确性

#### Scenario: 删除歌词
- **WHEN** 管理员删除歌曲的歌词
- **THEN** 系统 MUST 从数据库中清除歌词数据
- **AND** 播放器 MUST 不再显示该歌曲的歌词面板

### Requirement: 批量操作
系统 MUST 支持对音乐进行批量操作。

#### Scenario: 批量删除
- **WHEN** 管理员选择多首歌曲并点击批量删除
- **THEN** 系统 MUST 删除所有选中的歌曲
- **AND** MUST 显示批量操作的进度
- **AND** MUST 显示操作完成后的统计信息

#### Scenario: 批量添加到歌单
- **WHEN** 管理员选择多首歌曲并批量添加到指定歌单
- **THEN** 系统 MUST 将所有选中的歌曲添加到歌单
- **AND** MUST 显示批量添加的进度
- **AND** MUST 显示添加成功的歌曲数量

### Requirement: 音乐预览
管理后台 MUST 支持在线预览音乐。

#### Scenario: 在管理后台播放预览
- **WHEN** 管理员点击音乐列表中的播放按钮
- **THEN** 系统 MUST 在当前页面播放该歌曲
- **AND** MUST 不影响全局播放器的状态
- **AND** MUST 提供基本的播放控制
