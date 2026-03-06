# AI 模型配置重构 - 方案A实施完成

## 重构概述

采用方案A：每个模型独立定义类型，移除提供商级别的 `type` 字段。

## 数据结构变更

### 旧结构（提供商级别类型）
```typescript
const PROVIDERS = [
  {
    value: 'qwen',
    label: '通义千问',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-long'],
    type: 'text',                    // ❌ 提供商级别类型
    imageModels: ['qwen-image-max', 'qwen-image-plus', 'wanx-v1']
  },
]
```

### 新结构（模型级别类型）
```typescript
interface ModelDefinition {
  name: string
  type: 'text' | 'image'             // ✅ 模型级别类型
}

const PROVIDERS: Provider[] = [
  {
    value: 'qwen',
    label: '通义千问',
    models: [
      { name: 'qwen-turbo', type: 'text' },
      { name: 'qwen-plus', type: 'text' },
      { name: 'qwen-max', type: 'text' },
      { name: 'qwen-long', type: 'text' },
      { name: 'qwen-image-max', type: 'image' },
      { name: 'qwen-image-plus', type: 'image' },
      { name: 'wanx-v1', type: 'image' },
    ],
  },
]
```

## 修改的文件

### 1. `components/admin/ai/ai-config-card.tsx`

#### 数据结构重构
- 定义 `ModelDefinition` 接口
- 重构 `PROVIDERS` 数组，每个模型独立定义类型
- 移除 `provider.type`、`provider.imageModels` 字段

#### AIConfigModal 组件更新
- **提供商选择**（第 596-614 行）：
  - 从第一个模型获取类型
  - 自动设置 capabilityType

- **能力类型选择**（第 621-638 行）：
  - 根据选择的类型筛选对应模型
  - 自动切换到第一个匹配的模型

- **模型选择**（第 659-671 行）：
  - 智能识别：根据选择的模型自动更新能力类型
  - 从模型定义中读取类型

- **模型列表渲染**（第 677-690 行）：
  - 根据 capabilityType 筛选显示模型
  - 动态提示该提供商是否支持某种类型

### 2. `hooks/use-ai-configs.ts`

#### 接口更新
- `ModelConfig` 接口添加 `capabilityType: string` 字段

## 功能验证

### 1. 添加模型流程

**场景A：添加文本模型**
1. 选择提供商"通义千问"
2. 系统自动选择第一个文本模型 `qwen-turbo`
3. 能力类型自动设为 `text`
4. 保存 ✅

**场景B：添加图像模型**
1. 选择提供商"通义千问"
2. 能力类型默认为 `text`（第一个模型的类型）
3. 切换能力类型为"图像生成"
4. 系统自动选择第一个图像模型 `qwen-image-max`
5. 或者直接从下拉列表选择 `qwen-image-plus`
6. 系统自动将能力类型切换为 `image`
7. 保存 ✅

### 2. 编辑模型流程

1. 打开编辑对话框
2. 切换提供商 → 重新选择模型和类型
3. 切换能力类型 → 自动选择匹配的模型
4. 切换模型 → 自动更新能力类型
5. 保存 ✅

### 3. 测试连通性

- 文本模型：发送简单文本请求，测量响应时间
- 图像模型：生成测试图片，返回图片 URL

### 4. 功能映射

- 摘要生成：只显示 `capabilityType = 'text'` 的模型
- 封面生成：只显示 `capabilityType = 'image'` 的模型

## 优势

### 相比旧方案
1. ✅ **类型准确**：每个模型明确定义类型，不会出错
2. ✅ **自动识别**：选择模型时自动设置正确的类型
3. ✅ **扩展性强**：同一提供商可以有不同类型的模型
4. ✅ **用户友好**：减少手动操作步骤

### 相比方案B
1. ✅ **更精确**：模型级别比提供商级别更精确
2. ✅ **更简单**：不需要 `types` 数组，数据结构更清晰
3. ✅ **类型安全**：TypeScript 可以提供更好的类型检查

## 向后兼容性

### 现有配置
- 数据库中已有 `capability_type` 字段
- 测试连通性代码有后备逻辑（根据模型名称判断类型）
- 旧配置会自动适配新 UI

### 修复工具
- `scripts/check-model-capability.js` 可以检查和修复错误的类型设置

## 未来扩展

### 添加新模型
```typescript
{
  value: 'new-provider',
  label: '新提供商',
  models: [
    { name: 'text-model-1', type: 'text' },
    { name: 'text-model-2', type: 'text' },
    { name: 'image-model-1', type: 'image' },
    { name: 'image-model-2', type: 'image' },
    // 未来可以添加更多类型
    // { name: 'video-model-1', type: 'video' },
    // { name: 'audio-model-1', type: 'audio' },
  ],
}
```

### 添加新能力类型
1. 更新 `ModelDefinition.type` 类型定义
2. 在 PROVIDERS 中添加对应模型
3. 更新 AI 服务层支持新类型
4. 在功能映射中添加对应功能

## 测试清单

- [x] 添加文本模型配置
- [x] 添加图像模型配置
- [x] 切换提供商时自动更新模型和类型
- [x] 切换能力类型时自动筛选模型
- [x] 切换模型时自动更新能力类型
- [x] 文本模型测试连通性
- [x] 图像模型测试连通性
- [x] 功能映射页正确筛选模型
- [x] 编辑现有配置

## 已知问题

无重大问题。

## 后续优化建议

1. **添加模型验证**：在前端添加模型名称的格式验证
2. **智能推荐**：根据用户选择的功能自动推荐合适的模型
3. **批量配置**：支持一次性配置多个模型
4. **配置模板**：提供常见配置的模板，一键应用

## 完成时间

2026-03-03

## 相关文档

- [AI 模型配置修复记录](./ai-model-configuration-fix.md)
- [AI Cover Generation 功能规格](../openspec/changes/ai-cover-generation/specs/ai-cover-generation/spec.md)
