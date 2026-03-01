## 1. 数据库迁移

- [x] 1.1 创建 `ai_model_configs` 表 schema 定义（id、name、provider、model、api_key_encrypted、base_url、max_tokens、temperature、enabled、时间戳）
- [x] 1.2 创建 `ai_function_mappings` 表 schema 定义（id、function_name、model_config_id、时间戳）
- [x] 1.3 创建 `ai_call_logs` 表 schema 定义（扩展 model_config_id 字段）
- [x] 1.4 扩展 `posts` 表，添加 `ai_summary`、`ai_summary_generated_at`、`ai_summary_status` 字段
- [x] 1.5 生成并运行数据库迁移
- [x] 1.6 插入初始功能映射数据（summary、cover、search）
- [x] 1.7 验证迁移结果，检查表结构和字段

## 2. 依赖安装与配置

- [x] 2.1 安装 Vercel AI SDK (`ai` 包)
- [x] 2.2 安装 OpenAI 兼容 SDK（用于支持 DeepSeek、GLM 等）
- [x] 2.3 添加环境变量 `ENCRYPTION_KEY`（32 字节随机密钥，用于加密 API Key）
- [x] 2.4 更新 `.env.example` 文件，添加 `ENCRYPTION_KEY` 说明

## 3. AI 服务基础架构

- [x] 3.1 创建 `server/ai/` 目录结构
- [x] 3.2 实现 `server/ai/types.ts` 类型定义（provider 枚举、模型配置类型、函数映射类型）
- [x] 3.3 实现 `server/ai/client.ts` AI 客户端初始化逻辑（支持多提供商）
- [x] 3.4 实现 provider 值映射到 base_url 的逻辑（deepseek、zhipu、qwen、moonshot、baichuan、openai）
- [x] 3.5 实现 `server/ai/services/base.ts` 基础服务类（错误处理、重试、日志）
- [x] 3.6 实现 API Key 加密/解密工具函数（AES-256-GCM）
- [x] 3.7 实现从数据库读取模型配置和功能映射的逻辑
- [x] 3.8 实现按功能名获取对应模型配置的逻辑

## 4. 摘要生成服务

- [x] 4.1 创建 `server/ai/prompts/summary.ts` Prompt 模板（中文摘要，200 字以内）
- [x] 4.2 实现 `server/ai/services/summary.ts` 摘要生成服务
- [x] 4.3 实现文章语言检测功能
- [x] 4.4 实现摘要生成失败时的降级策略（前 200 字）
- [x] 4.5 实现异步非阻塞生成逻辑
- [x] 4.6 添加 Token 使用量跟踪
- [x] 4.7 实现调用日志记录到 `ai_call_logs` 表（包含 model_config_id）

## 5. 数据库查询层

- [x] 5.1 创建 `server/db/queries/ai-model-configs.ts` 模型配置查询
- [x] 5.2 创建 `server/db/queries/ai-function-mappings.ts` 功能映射查询
- [x] 5.3 创建 `server/db/queries/ai-logs.ts` AI 日志查询
- [ ] 5.4 扩展 `server/db/queries/posts.ts`，添加 AI 摘要相关查询
- [x] 5.5 实现模型配置 CRUD 操作（getAll、getById、create、update、delete、toggle）
- [x] 5.6 实现功能映射 CRUD 操作（getAll、getByFunctionName、update）
- [x] 5.7 实现日志查询操作（带分页、按配置筛选、状态筛选）

## 6. API 端点 - 模型配置管理

- [x] 6.1 创建 `app/api/admin/ai/model-configs/route.ts` GET 端点（获取所有配置）
- [x] 6.2 创建 `app/api/admin/ai/model-configs/route.ts` POST 端点（创建配置）
- [x] 6.3 创建 `app/api/admin/ai/model-configs/[id]/route.ts` PUT 端点（更新配置）
- [x] 6.4 创建 `app/api/admin/ai/model-configs/[id]/route.ts` DELETE 端点（删除配置）
- [x] 6.5 创建 `app/api/admin/ai/model-configs/[id]/toggle/route.ts` PATCH 端点（启用/禁用）
- [x] 6.6 创建 `app/api/admin/ai/model-configs/[id]/test/route.ts` POST 端点（测试配置）
- [x] 6.7 实现管理员权限验证中间件
- [x] 6.8 实现 API Key 脱敏返回逻辑
- [x] 6.9 实现配置验证逻辑（名称唯一性、模型格式、Key 格式）
- [x] 6.10 实现删除前的引用检查（是否被功能映射使用）

## 7. API 端点 - 功能映射管理

- [x] 7.1 创建 `app/api/admin/ai/function-mappings/route.ts` GET 端点
- [x] 7.2 创建 `app/api/admin/ai/function-mappings/route.ts` PUT 端点
- [x] 7.3 创建 `app/api/admin/ai/default-models/route.ts` GET 端点（获取各功能的默认模型）

## 8. API 端点 - AI 日志

- [x] 8.1 创建 `app/api/admin/ai/logs/route.ts` GET 端点
- [x] 8.2 实现分页查询逻辑
- [x] 8.3 实现筛选逻辑（modelConfigId、status、日期范围）
- [x] 8.4 实现日志序列化和格式化

## 9. API 端点 - 摘要生成

- [x] 9.1 创建 `app/api/admin/posts/[id]/generate-summary/route.ts` POST 端点
- [x] 9.2 实现生成状态检查（防止重复生成）
- [x] 9.3 实现后台异步触发摘要生成逻辑（根据功能映射获取模型配置）
- [x] 9.4 实现配置未检查时的错误处理
- [x] 9.5 创建 `app/api/admin/posts/[id]/ai-summary-status/route.ts` GET 轮询端点
- [x] 9.6 扩展文章 GET 端点响应，包含 AI 摘要字段
- [x] 9.7 实现生成期间拒绝发布的逻辑
- [x] 9.8 实现生成期间拒绝保存的逻辑

## 10. API 端点 - 统计扩展

- [x] 10.1 扩展 `app/api/admin/stats/route.ts`，添加 AI 统计数据
- [x] 10.2 实现 `aiGeneratedPosts` 统计查询
- [x] 10.3 实现 `aiPendingPosts` 统计查询
- [x] 10.4 实现 `aiFailedPosts` 统计查询
- [x] 10.5 实现 `aiTotalTokens` 统计查询（今日）

## 11. 管理后台 - 设置页面集成 AI 配置

- [x] 11.1 扩展 `app/admin/settings/page.tsx`，添加 AI 配置卡片
- [x] 11.2 实现"AI 模型配置"卡片组件（表格形式，紧凑布局）
- [x] 11.3 实现"添加模型"按钮和模态对话框
- [x] 11.4 实现编辑配置模态对话框
- [x] 11.5 实现提供商选择联动逻辑（选择后显示推荐模型）
- [x] 11.6 实现 API Key 安全显示（脱敏、编辑时留空不修改）
- [x] 11.7 实现"保存配置"功能和成功/失败提示
- [x] 11.8 实现"测试配置"功能和内联结果显示
- [x] 11.9 实现删除配置功能和确认对话框
- [x] 11.10 实现启用/禁用开关
- [x] 11.11 添加表单验证（必需字段、格式验证、名称唯一性）
- [x] 11.12 显示配置使用状态（是否被功能引用）
- [x] 11.13 实现"功能映射"卡片组件
- [x] 11.14 实现模型选择下拉框（只显示启用的配置）
- [x] 11.15 实现选择后自动保存和提示
- [x] 11.16 实现未配置状态提示
- [x] 11.17 为即将推出的功能（封面、搜索）添加"即将推出"标签和禁用状态

## 13. 管理后台 - 文章列表状态显示

- [x] 13.1 扩展文章列表表格，添加摘要状态列
- [x] 13.2 实现状态图标组件（pending、generating、done、failed）
- [x] 13.3 添加状态标识的视觉样式

## 14. 管理后台 - 文章编辑页集成

- [x] 14.1 在文章编辑表单添加"生成 AI 摘要"按钮
- [x] 14.2 实现按钮点击处理逻辑（调用 generate-summary API）
- [x] 14.3 实现摘要生成状态显示（loading、成功、失败）
- [x] 14.4 实现摘要内容展示和编辑
- [x] 14.5 实现摘要状态轮询逻辑（每 3 秒）
- [x] 14.6 实现"重新生成"按钮（生成成功后显示）
- [x] 14.7 实现配置未检查时的提示和引导链接
- [x] 14.8 实现生成期间锁定编辑表单（只读模式）
- [x] 14.9 实现生成期间禁用发布和保存按钮
- [x] 14.10 实现半透明遮罩和锁图标提示
- [x] 14.11 实现生成完成解锁逻辑

## 15. 管理后台 - AI 日志页面

- [x] 15.1 创建 `app/admin/ai/logs/page.tsx` 日志页面
- [x] 15.2 实现日志表格组件
- [x] 15.3 实现分页控件
- [x] 15.4 实现筛选器（按配置、状态）
- [x] 15.5 实现失败详情弹窗
- [x] 15.6 添加 Token 使用量统计显示

## 15. 管理后台 - 导航和首页

- [x] 15.1 在侧边栏导航添加"AI 日志"菜单项（管理员可见）
- [x] 15.2 扩展管理后台首页，显示 AI 统计卡片
- [x] 15.3 实现权限控制（非管理员不显示 AI 日志菜单）
- [x] 15.4 实现首次配置引导提示（当没有可用模型配置时，在设置页显示）

## 16. 管理后台 - AI 日志页面

- [x] 16.1 创建 `app/admin/ai/logs/page.tsx` 日志页面
- [x] 16.2 实现日志表格组件
- [x] 16.3 实现分页控件
- [x] 16.4 实现筛选器（按配置、状态）
- [x] 16.5 实现失败详情弹窗
- [x] 16.6 添加 Token 使用量统计显示

## 17. 国际化（i18n）

- [x] 17.1 添加 AI 相关翻译 key（中文和英文）
- [x] 17.2 翻译设置页面的 AI 配置卡片文案
- [x] 17.3 翻译 AI 日志页面文案
- [x] 17.4 翻译状态提示和错误消息
- [x] 17.5 添加提供商名称翻译（DeepSeek、智谱 GLM、通义千问等）
- [x] 17.6 添加模型名称推荐翻译

## 18. 测试与验证

- [ ] 18.1 单元测试：AI 服务基础架构
- [ ] 18.2 单元测试：摘要生成服务
- [ ] 18.3 单元测试：模型配置 CRUD 操作
- [ ] 18.4 单元测试：功能映射查询
- [ ] 18.5 单元测试：API Key 加密/解密
- [ ] 18.6 集成测试：API 端点
- [ ] 18.7 手动测试：在设置页添加模型配置（DeepSeek）
- [ ] 18.8 手动测试：在设置页配置功能映射
- [ ] 18.9 手动测试：测试配置功能
- [ ] 18.10 手动测试：文章详情页点击按钮生成摘要
- [ ] 18.11 手动测试：异步生成和状态轮询
- [ ] 18.12 手动测试：生成期间锁定编辑和发布
- [ ] 18.13 手动测试：错误处理和重试
- [ ] 18.14 手动测试：权限控制
- [ ] 18.15 手动测试：多模型配置切换
- [ ] 18.15 性能测试：并发发布场景

## 19. 文档

- [x] 19.1 更新 README.md，说明 AI 功能
- [x] 19.2 编写 AI 模型配置使用指南
- [x] 19.3 编写支持的 AI 提供商列表（DeepSeek、GLM、通义千问等）
- [x] 19.4 编写环境变量配置说明（ENCRYPTION_KEY）
- [x] 19.5 编写故障排查指南

## 20. 部署准备

- [x] 20.1 生成并配置 `ENCRYPTION_KEY` 环境变量（32 字节随机密钥）
- [x] 20.2 执行生产数据库迁移
- [x] 20.3 验证生产环境配置
- [x] 20.4 登录管理后台，进入设置页面，配置第一个 AI 模型
- [x] 20.5 在设置页配置功能映射（摘要生成 → 选择模型）
- [x] 20.6 执行冒烟测试（创建文章 → 点击生成摘要按钮 → 验证摘要生成）
