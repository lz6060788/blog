# AI 模型配置 - capability_type 自动识别

## 问题描述

在添加 AI 模型配置时，如果用户选择了图像生成模型（如 `qwen-image-plus`），但忘记手动切换"能力类型"为"图像生成"，系统会按默认的"文本生成"类型保存。这导致该模型无法在功能映射页的"封面生成"功能中显示。

## 根本原因

### 原有代码逻辑

1. **默认值问题**：添加新模型时，`capabilityType` 默认为 `'text'`
2. **提供商类型**：通义千问的 `type` 是 `'text'`，选择该提供商会自动设置为文本类型
3. **手动依赖**：用户需要手动将"能力类型"切换为"图像生成"才能看到和选择图像模型

### 用户操作场景

用户可能的操作流程：
1. 选择提供商"通义千问" → `capabilityType` 自动设为 `'text'`
2. 从模型下拉列表选择 `qwen-image-plus`
3. **忘记**手动切换"能力类型"为"图像生成"
4. 保存 → 系统按 `text` 类型保存
5. **结果**：该模型无法用于封面生成

## 解决方案

### 智能识别功能

添加了模型选择时的智能识别逻辑：

```typescript
<Select
  value={formData.model}
  onValueChange={(value) => {
    // 智能识别：如果选择的模型在图像模型列表中，自动切换到图像生成类型
    const isImageModel = selectedProvider?.imageModels?.includes(value)
    const newCapabilityType = isImageModel ? 'image' : formData.capabilityType

    setFormData({
      ...formData,
      model: value,
      capabilityType: newCapabilityType,
    })
  }}
>
```

### 工作原理

1. 当用户从下拉列表选择模型时
2. 系统检查该模型是否在当前提供商的 `imageModels` 列表中
3. 如果是图像模型，自动将 `capabilityType` 切换为 `'image'`
4. 如果不是，保持当前的 `capabilityType`

## 测试验证

### 修复前的行为

1. 选择提供商"通义千问"
2. 能力类型：`text`（默认）
3. 选择模型：`qwen-image-plus`
4. 保存 → `capability_type = 'text'` ❌

### 修复后的行为

1. 选择提供商"通义千问"
2. 能力类型：`text`（默认）
3. 选择模型：`qwen-image-plus`
4. 系统自动将能力类型切换为 `image` ✅
5. 保存 → `capability_type = 'image'` ✅

## 检查和修复工具

如果仍有历史配置存在问题，可以使用以下脚本检查和修复：

```bash
node scripts/check-model-capability.js
```

该脚本会：
- 扫描所有 AI 模型配置
- 根据模型名称识别图像模型（包含 `image`、`wanx`、`dall-e`、`imagen` 关键词）
- 自动修复错误的 `capability_type` 设置

## 代码改动

**文件**: `components/admin/ai/ai-config-card.tsx`

**位置**: 第 600-614 行

**改动**: 在模型选择的 `onValueChange` 中添加智能识别逻辑

## 影响范围

- ✅ 不影响现有功能
- ✅ 提升用户体验，减少手动操作
- ✅ 避免用户错误配置
- ✅ 向后兼容（不影响手动编辑能力类型的用户）
