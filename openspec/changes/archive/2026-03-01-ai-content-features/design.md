## Context

当前博客系统基于 Next.js 14 + Drizzle ORM + PostgreSQL 架构，已有完整的文章管理、分类标签系统。管理后台使用 shadcn/ui 组件库，支持文章的增删改查操作。

现有架构特点：
- 服务端代码位于 `server/` 目录，包含数据库查询、API 路由处理
- 前端采用 App Router，支持国际化（i18n）
- 已有完整的用户认证和权限控制（admin 白名单机制）
- 数据库迁移通过 Drizzle Kit 管理

## Goals / Non-Goals

**Goals:**
- 提供可扩展的 AI 服务集成架构，优先支持中国大陆 AI 提供商
- 所有 AI 模型配置在管理后台完成，无需修改环境变量或重启服务
- 支持为不同 AI 功能（摘要、封面、搜索）配置不同的模型
- 通过手动按钮触发摘要生成，用户自主控制生成时机
- 生成期间锁定编辑和发布，防止数据冲突

**Non-Goals:**
- 不实现 AI 搜索功能
- 不实现自动封面生成
- 不使用环境变量存储 AI 配置（完全基于数据库）
- 不支持前端直接调用 AI（所有调用必须通过后端）
- 不实现 AI 内容润色/改写等编辑功能
- 不在文章发布时自动生成摘要

## Decisions

### 1. AI SDK 选择：Vercel AI SDK

**选择理由：**
- 统一接口支持多个提供商，包括兼容 OpenAI 格式的大陆服务商
- 内置流式输出、错误重试、类型安全等生产级特性
- 与 Next.js 深度集成，支持 Edge Runtime
- 社区活跃，维护良好

**支持的 AI 提供商（优先中国大陆）：**
- **DeepSeek** (`deepseek-chat`, `deepseek-coder`) - 性价比高，中文友好
- **智谱 GLM** (`glm-4-flash`, `glm-4-plus`) - 国内主流，稳定可靠
- **通义千问** (`qwen-turbo`, `qwen-plus`) - 阿里云生态，功能丰富
- **月之暗面 Kimi** (`moonshot-v1-8k`) - 长文本处理能力强
- **百川智能** (`Baichuan2-Turbo`) - 多模态能力强
- **OpenAI** (`gpt-4o`, `gpt-4o-mini`) - 国际备选

**替代方案（不采用）：**
- *直接使用各厂商 SDK*：需要为每个提供商单独实现，代码重复度高
- *LangChain*：过于重量级，对于简单摘要生成场景是大材小用
- *自建封装*：增加维护成本，重新发明轮子

### 2. 架构设计：服务层模式

在 `server/` 目录新增 `ai/` 模块，采用分层设计：

```
server/ai/
├── index.ts           # 导出公共接口
├── client.ts          # AI 客户端初始化
├── services/
│   ├── summary.ts     # 摘要生成服务
│   └── base.ts        # 基础服务类
├── prompts/
│   └── summary.ts     # Prompt 模板
└── types.ts           # 类型定义
```

**选择理由：**
- 服务层封装 AI 调用逻辑，与业务代码解耦
- Prompt 模板化管理，便于调整和 A/B 测试
- 基础服务类提供统一的错误处理、重试、日志记录

### 3. 配置存储：完全基于数据库的多模型配置

**配置存储策略：**
- **所有 AI 配置存储在数据库**：无需环境变量，无需重启服务
- **支持多个模型配置**：管理员可添加多个模型配置，每个配置独立
- **功能与模型映射**：为不同 AI 功能（摘要、封面、搜索）分配默认模型
- **API Key 加密存储**：使用 AES 加密，防止数据库泄露导致凭证暴露

**数据库表设计：**
```sql
-- AI 模型配置表（支持多个配置）
CREATE TABLE ai_model_configs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,           -- 配置名称，如"DeepSeek 摘要专用"
  provider VARCHAR(50) NOT NULL,        -- 'deepseek' | 'zhipu' | 'qwen' | 'moonshot' | 'openai'
  model VARCHAR(100) NOT NULL,          -- 模型名称，如 'deepseek-chat'、'glm-4-flash'
  api_key_encrypted TEXT NOT NULL,      -- 加密存储的 API Key
  base_url VARCHAR(255),                -- 自定义 endpoint（可选）
  max_tokens INTEGER DEFAULT 300,       -- 最大 token 数
  temperature DECIMAL(3,2) DEFAULT 0.7, -- 生成温度
  enabled BOOLEAN DEFAULT true,         -- 是否启用
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 功能与模型映射表（未来支持多功能）
CREATE TABLE ai_function_mappings (
  id SERIAL PRIMARY KEY,
  function_name VARCHAR(50) NOT NULL UNIQUE,  -- 'summary' | 'cover' | 'search'
  model_config_id INTEGER REFERENCES ai_model_configs(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**配置读取流程：**
1. 根据 `function_name`（如 'summary'）查询 `ai_function_mappings` 表
2. 获取对应的 `model_config_id`
3. 从 `ai_model_configs` 表读取完整配置
4. 解密 API Key，初始化 AI 客户端
5. 如果配置不存在或被禁用，返回错误提示

**选择理由：**
- 完全基于数据库，管理员可随时修改，无需重启服务
- 支持多模型配置，为不同功能分配不同模型（如摘要用便宜的模型，封面用高质量模型）
- 表驱动设计，未来新增 AI 功能只需添加新映射记录
- 配置命名便于管理（如"DeepSeek 摘要"、"通义千问封面"）

### 4. 摘要生成方式：手动按钮触发 + 生成锁定

**实现策略：**
- 在文章新建页和详情页添加"生成 AI 摘要"按钮
- 用户点击按钮后，调用 `POST /api/admin/posts/[id]/generate-summary` API
- 设置 `ai_summary_status` 为 'generating'
- 后台异步调用 AI 生成摘要
- 生成期间：
  - 禁用文章编辑表单（所有输入框只读）
  - 禁用"发布"和"保存"按钮
  - 显示"摘要生成中..."加载状态
- 生成完成后：
  - 更新 `ai_summary` 和 `ai_summary_generated_at`
  - 设置 `ai_summary_status` 为 'done' 或 'failed'
  - 解锁编辑和发布按钮
  - 显示生成的摘要（成功）或错误提示（失败）

**选择理由：**
- 用户自主控制生成时机，避免不必要的 API 调用
- 生成期间锁定防止数据冲突（用户编辑内容与摘要生成不同步）
- 异步生成避免阻塞 UI，提升体验
- 允许重新生成（用户可多次点击按钮）

**替代方案（不采用）：**
- *发布时自动生成*：用户可能不需要摘要，浪费 API 配额
- *同步生成*：AI 调用慢（3-10秒），阻塞用户操作
- *不锁定编辑*：用户可能在生成期间修改内容，导致摘要与内容不一致

### 5. 错误处理：重试 + 错误提示

**错误处理策略：**
1. AI 服务调用失败 → 重试 2 次（指数退避：1 秒、2 秒）
2. 重试仍失败：
   - 设置 `ai_summary_status` 为 'failed'
   - 记录错误信息到 `ai_call_logs` 表
   - 返回错误提示给用户
   - 解锁编辑和发布按钮
   - 允许用户重试
3. 不自动使用文章前 N 字符作为降级摘要（避免混淆）

**选择理由：**
- 用户明确知道摘要生成失败，可以决定是否重试
- 日志记录帮助识别系统性问题（如配额耗尽、API Key 过期）
- 不自动填充降级内容，保持界面清晰

### 6. 数据库 Schema 设计

**新增表：**
```sql
-- AI 模型配置表（支持多个配置）
CREATE TABLE ai_model_configs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  base_url VARCHAR(255),
  max_tokens INTEGER DEFAULT 300,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 功能与模型映射表
CREATE TABLE ai_function_mappings (
  id SERIAL PRIMARY KEY,
  function_name VARCHAR(50) NOT NULL UNIQUE,
  model_config_id INTEGER REFERENCES ai_model_configs(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AI 调用日志表
CREATE TABLE ai_call_logs (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id),
  model_config_id INTEGER REFERENCES ai_model_configs(id),
  action VARCHAR(50) NOT NULL,
  provider VARCHAR(50),
  model VARCHAR(100),
  input_tokens INTEGER,
  output_tokens INTEGER,
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**扩展现有表：**
```sql
-- posts 表新增字段
ALTER TABLE posts
  ADD COLUMN ai_summary TEXT,
  ADD COLUMN ai_summary_generated_at TIMESTAMP,
  ADD COLUMN ai_summary_status VARCHAR(20) DEFAULT 'pending';
```

**provider 枚举值：**
| 提供商 | provider 值 | 推荐模型 |
|--------|-------------|----------|
| DeepSeek | `deepseek` | `deepseek-chat`, `deepseek-coder` |
| 智谱 GLM | `zhipu` | `glm-4-flash`, `glm-4-plus`, `glm-4-air` |
| 通义千问 | `qwen` | `qwen-turbo`, `qwen-plus`, `qwen-max` |
| 月之暗面 | `moonshot` | `moonshot-v1-8k`, `moonshot-v1-32k` |
| 百川智能 | `baichuan` | `Baichuan2-Turbo`, `Baichuan2-53B` |
| OpenAI | `openai` | `gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo` |

**初始数据迁移：**
```sql
-- 创建默认摘要功能映射（需要管理员先配置模型）
INSERT INTO ai_function_mappings (function_name, model_config_id)
VALUES ('summary', NULL); -- 初始为 NULL，需管理员配置
```

## Risks / Trade-offs

### Risk 1: AI API 费用不可控
**Mitigation:**
- 在配置界面添加 `maxTokens` 限制
- 实现调用频率限制（如每分钟最多 N 次）
- 记录 token 使用量，便于成本监控

### Risk 2: API Key 泄露
**Mitigation:**
- 数据库中使用 AES-256-GCM 加密存储 API Key
- 加密密钥从环境变量 `ENCRYPTION_KEY` 获取（32 字节随机密钥）
- 管理后台配置页面需要管理员权限
- 日志中脱敏 API Key（只显示前 4 位，如 `sk-12****`)
- API Key 只在后端内存中解密，不传递到前端

### Risk 3: AI 生成质量不稳定
**Mitigation:**
- 提供精心设计的 Prompt 模板
- 支持管理员自定义 Prompt
- 摘要生成后允许手动编辑覆盖
- 未来可加入用户反馈机制

### Trade-off 1: 异步生成 vs 实时体验
**Trade-off:** 异步生成导致摘要不会立即显示
**Acceptance:** 发布速度快于等待摘要生成，用户体验更优

### Trade-off 2: 多提供商支持 vs 复杂度
**Trade-off:** 统一接口增加了抽象层复杂度
**Acceptance:** 为未来切换提供商、成本优化提供灵活性，值得额外复杂度

## Migration Plan

### 部署步骤

1. **数据库迁移**
   ```bash
   drizzle-kit generate
   drizzle-kit migrate
   ```

2. **代码部署**
   - 部署新代码（包含 AI 模块）
   - 验证健康检查

3. **管理后台配置**
   - 管理员登录后台，进入"AI 模型配置"页面
   - 添加第一个模型配置（如 DeepSeek）
   - 配置名称、提供商、模型、API Key
   - 点击"测试配置"验证可用性
   - 在"功能映射"页面将摘要功能分配给该模型

4. **功能验证**
   - 创建测试文章，启用"生成 AI 摘要"
   - 验证摘要异步生成
   - 检查日志表记录正常

### 回滚策略

- **数据回滚**：新增字段为可选，不影响现有功能
- **代码回滚**：保留原有发布流程，AI 功能失败不影响文章发布
- **配置回滚**：禁用模型配置后，系统提示"请先配置 AI 模型"

## Open Questions

1. **Prompt 语言**：摘要生成使用中文还是根据文章语言自适应？需要检测文章内容语言。
2. **摘要长度限制**：300 tokens 是否合适？是否需要根据文章长度动态调整？
3. **编辑后重新生成**：文章编辑后是否自动重新生成摘要，还是保留原摘要？
4. **成本预算**：是否需要设置每日/每月调用次数限制防止费用失控？

**待实现前确认：** 需要与产品确认这些问题的答案。
