# AI 功能配置指南

本指南将帮助您配置博客的 AI 功能，包括文章摘要生成等智能功能。

## 目录

- [前置要求](#前置要求)
- [环境变量配置](#环境变量配置)
- [获取 AI API Key](#获取-ai-api-key)
- [配置 AI 模型](#配置-ai-模型)
- [使用 AI 功能](#使用-ai-功能)
- [故障排查](#故障排查)

## 前置要求

在配置 AI 功能之前，请确保：

1. 已完成数据库迁移
2. 已生成并配置 `ENCRYPTION_KEY` 环境变量
3. 至少拥有一个 AI 提供商的 API Key

## 环境变量配置

### 1. 生成加密密钥

AI 功能需要使用加密密钥来安全存储 API Key。在终端运行：

```bash
# Linux/macOS
openssl rand -hex 32

# Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

### 2. 配置 .env.local

将生成的密钥添加到 `.env.local` 文件：

```bash
# AI API Key 加密密钥（必需，32 字节十六进制）
ENCRYPTION_KEY=your-generated-32-byte-hex-key

# 管理员邮箱列表（可选，逗号分隔）
ADMIN_EMAILS=admin@example.com,user@example.com
```

## 获取 AI API Key

### DeepSeek

1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 进入 "API Keys" 页面
4. 点击 "创建 API Key"
5. 复制 API Key（格式：`sk-...`）

推荐模型：
- `deepseek-chat` - 通用对话模型
- `deepseek-coder` - 代码专用模型

### 智谱 GLM (Zhipu)

1. 访问 [智谱 AI 开放平台](https://open.bigmodel.cn/)
2. 注册/登录账号
3. 进入 "API 管理"
4. 创建 API Key
5. 复制 API Key

推荐模型：
- `glm-4-flash` - 快速响应，成本低
- `glm-4-plus` - 高质量输出
- `glm-4-air` - 平衡性能和成本

### 通义千问 (Qwen)

1. 访问 [阿里云百炼平台](https://bailian.console.aliyun.com/)
2. 注册/登录账号
3. 创建应用并获取 API Key
4. 确保已开通 DashScope 服务

推荐模型：
- `qwen-turbo` - 快速响应
- `qwen-plus` - 平衡性能
- `qwen-max` - 最高质量

### 月之暗面 Kimi (Moonshot)

1. 访问 [Moonshot AI 开放平台](https://platform.moonshot.cn/)
2. 注册/登录账号
3. 创建 API Key
4. 复制 API Key

推荐模型：
- `moonshot-v1-8k` - 8K 上下文
- `moonshot-v1-32k` - 32K 上下文（长文本）

### 百川智能 (Baichuan)

1. 访问 [百川智能开放平台](https://platform.baichuan-ai.com/)
2. 注册/登录账号
3. 获取 API Key

推荐模型：
- `Baichuan2-Turbo` - 快速响应
- `Baichuan2-53B` - 大参数模型

### OpenAI

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册/登录账号
3. 进入 "API Keys" 页面
4. 创建新的 API Key

推荐模型：
- `gpt-4o` - 最新旗舰模型
- `gpt-4o-mini` - 性价比高
- `gpt-3.5-turbo` - 经济实惠

## 配置 AI 模型

### 步骤 1：进入设置页面

登录管理后台后，访问 "设置" 页面。

### 步骤 2：添加模型配置

1. 点击 "AI 模型配置" 卡片中的 "添加模型" 按钮
2. 填写配置信息：
   - **配置名称**：如 "DeepSeek 摘要专用"
   - **AI 提供商**：选择您的提供商
   - **模型**：从推荐列表中选择
   - **API Key**：粘贴您的 API Key
   - **Base URL**：（可选）自定义 API 端点
   - **最大 Tokens**：限制输出长度（默认 300）
   - **温度**：控制生成随机性（0.0-2.0，默认 0.7）
3. 点击 "测试配置" 验证连接
4. 点击 "保存"

### 步骤 3：配置功能映射

1. 在 "功能映射" 卡片中找到 "摘要生成"
2. 从下拉菜单中选择刚配置的模型
3. 系统会自动保存配置

## 使用 AI 功能

### 生成文章摘要

1. 进入文章编辑页面
2. 填写文章标题和内容
3. 点击 "生成 AI 摘要" 按钮
4. 等待生成完成（约 3-10 秒）
5. 生成的摘要会显示在摘要框中
6. 您可以手动编辑生成的摘要

### 重新生成摘要

- 如果对摘要不满意，点击 "重新生成" 按钮即可
- 每次重新生成都会消耗 API 配额

### 查看 AI 日志

管理员可以在 "AI 日志" 页面查看：
- 所有 AI 调用记录
- Token 使用统计
- 成功/失败状态
- 响应时间

## 故障排查

### 问题：测试配置失败

**可能原因**：
- API Key 错误或已过期
- 网络连接问题
- API 服务暂时不可用

**解决方法**：
1. 检查 API Key 是否正确复制
2. 访问提供商控制台确认 API Key 状态
3. 检查账户余额是否充足

### 问题：摘要生成失败

**可能原因**：
- 模型配置被禁用
- 功能映射未正确配置
- 生成过程中出现 API 错误

**解决方法**：
1. 进入设置页面检查模型状态
2. 确认功能映射已配置
3. 查看 AI 日志获取详细错误信息

### 问题：加密密钥错误

如果看到 `ENCRYPTION_KEY` 相关错误：

```bash
# 重新生成密钥
openssl rand -hex 32

# 更新 .env.local 后重启服务
```

### 问题：API Key 格式验证失败

不同的提供商对 API Key 格式有不同要求：

| 提供商 | 前缀 | 最小长度 |
|--------|------|---------|
| DeepSeek | `sk-` | 20 字符 |
| OpenAI | `sk-` | 20 字符 |
| Moonshot | `sk-` | 20 字符 |
| 智谱 GLM | 任意 | 32 字符 |
| 通义千问 | 任意 | 32 字符 |
| 百川 | 任意 | 32 字符 |

## 最佳实践

1. **成本控制**
   - 设置合理的 `maxTokens` 限制
   - 使用经济型模型进行摘要生成
   - 定期检查 Token 使用统计

2. **安全管理**
   - 不要在公共代码仓库中提交 `.env.local`
   - 定期更换 API Key
   - 为不同环境使用不同的 API Key

3. **质量优化**
   - 为文章内容提供充分的上下文
   - 选择适合您语言的模型
   - 调整 `temperature` 参数控制创造性

## API 定价参考

（价格仅供参考，请以官方定价为准）

| 提供商 | 模型 | 输入价格 | 输出价格 |
|--------|------|---------|---------|
| DeepSeek | deepseek-chat | ¥1/1M tokens | ¥2/1M tokens |
| 智谱 GLM | glm-4-flash | ¥0.1/1M tokens | ¥0.1/1M tokens |
| 通义千问 | qwen-turbo | ¥0.3/1M tokens | ¥0.6/1M tokens |

## 技术支持

如遇到问题，请：

1. 查看本指南的故障排查部分
2. 检查 AI 日志获取详细错误信息
3. 访问提供商官方文档

## 更新日志

- **2025-02-28**: 初始版本，支持文章摘要生成功能
