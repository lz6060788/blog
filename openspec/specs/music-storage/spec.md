# 音乐存储规范

## ADDED Requirements

### Requirement: COS 文件上传
系统 MUST 将音频文件上传到腾讯云 COS 对象存储。

#### Scenario: 上传音频文件到 COS
- **WHEN** 管理员上传音乐文件
- **THEN** 系统 MUST 将文件上传到 COS 路径 `music/{year}/{month}/{songId}.{ext}`
- **AND** MUST 使用文件唯一标识符作为文件名的一部分
- **AND** MUST 返回文件的 COS URL

#### Scenario: 上传专辑封面到 COS
- **WHEN** 管理员上传专辑封面
- **THEN** 系统 MUST 将封面转换为 WebP 格式
- **AND** MUST 上传到 COS 路径 `music/covers/{songId}.webp`
- **AND** MUST 返回封面图片的 COS URL

### Requirement: 临时签名 URL
系统 MUST 为音频文件生成临时签名 URL，避免长期暴露存储桶。

#### Scenario: 生成播放 URL
- **WHEN** 前端请求播放某首歌曲
- **THEN** 系统 MUST 为该歌曲的 COS 文件生成临时签名 URL
- **AND** URL 有效期 MUST 为 5 分钟
- **AND** URL 过期后 MUST 重新生成

#### Scenario: URL 缓存
- **WHEN** 系统生成某首歌曲的签名 URL
- **THEN** 系统 MUST 在内存中缓存该 URL 5 分钟
- **AND** 缓存期间内重复请求 MUST 返回缓存的 URL
- **AND** 缓存过期后 MUST 重新生成

### Requirement: 断点续传
系统 MUST 支持大文件的分片上传和断点续传。

#### Scenario: 分片上传
- **WHEN** 上传的音频文件大于 10MB
- **THEN** 系统 MUST 将文件分片上传
- **AND** 每个分片大小 MUST 为 1-5MB
- **AND** 所有分片上传完成后 MUST 合并为完整文件

#### Scenario: 断点恢复
- **WHEN** 上传过程中网络中断
- **THEN** 系统 MUST 保存已上传的分片信息
- **AND** 恢复上传时 MUST 从上次中断的位置继续
- **AND** MUST 不重复上传已完成的分片

### Requirement: 文件验证
系统 MUST 在上传前验证文件的合法性和安全性。

#### Scenario: 验证音频格式
- **WHEN** 用户选择音频文件上传
- **THEN** 系统 MUST 验证文件格式为支持的类型（MP3、AAC、OGG）
- **AND** MUST 验证文件的 MIME 类型正确
- **AND** 不支持的格式 MUST 被拒绝并返回错误

#### Scenario: 验证文件大小
- **WHEN** 用户选择文件上传
- **THEN** 系统 MUST 检查文件大小
- **AND** 文件大小超过 50MB MUST 被拒绝
- **AND** MUST 显示友好的错误提示

#### Scenario: 验证音频内容
- **WHEN** 文件上传到服务端
- **THEN** 系统 MUST 验证文件为有效的音频文件
- **AND** MUST 提取音频元数据（时长、比特率等）
- **AND** 无效或损坏的音频文件 MUST 被拒绝

### Requirement: CORS 配置
COS 存储桶 MUST 配置正确的 CORS 规则以允许浏览器访问。

#### Scenario: 浏览器直接访问音频
- **WHEN** 前端使用 Audio 元素播放 COS 中的音频文件
- **THEN** COS MUST 返回正确的 CORS 头部
- **AND** MUST 允许来自博客域名的跨域请求
- **AND** MUST 不产生 CORS 错误

### Requirement: 文件删除
系统 MUST 从 COS 中删除已移除的音乐文件。

#### Scenario: 删除音频文件
- **WHEN** 管理员删除某首歌曲
- **THEN** 系统 MUST 从 COS 中删除对应的音频文件
- **AND** MUST 同时删除专辑封面文件（如果存在）
- **AND** MUST 清理相关的签名 URL 缓存

#### Scenario: 批量删除
- **WHEN** 管理员批量删除多首歌曲
- **THEN** 系统 MUST 删除所有歌曲对应的 COS 文件
- **AND** MUST 在后台异步执行删除操作
- **AND** MUST 返回操作结果

### Requirement: 文件元数据存储
系统 MUST 在数据库中存储音乐文件的元数据信息。

#### Scenario: 保存元数据
- **WHEN** 音乐文件上传成功
- **THEN** 系统 MUST 在 `songs` 表中创建记录
- **AND** MUST 存储以下信息：标题、艺术家、专辑、时长、COS URL、封面 URL、上传时间
- **AND** MUST 为歌曲生成唯一标识符

#### Scenario: 更新元数据
- **WHEN** 管理员修改歌曲信息
- **THEN** 系统 MUST 更新数据库中的元数据记录
- **AND** MUST 不修改 COS 中的原始文件

### Requirement: CDN 加速
音频文件 MUST 通过 CDN 分发以提升播放性能。

#### Scenario: CDN 访问
- **WHEN** 用户播放音乐
- **THEN** 系统生成的签名 URL MUST 指向 CDN 加速域名
- **AND** MUST 利用 CDN 就近节点分发
- **AND** MUST 减少播放延迟
