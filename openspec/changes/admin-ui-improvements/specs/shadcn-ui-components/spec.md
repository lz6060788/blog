## MODIFIED Requirements

### Requirement: Input 组件样式系统
系统 SHALL 为 shadcn/ui Input 组件提供完整的主题化支持，确保与项目颜色系统集成。

#### Scenario: Input 组件颜色变量
- **WHEN** 使用 Input 组件
- **THEN** 组件 SHALL 使用项目的 HSL 颜色变量
- **包括**: `--background`, `--foreground`, `--primary`, `--border` 等

#### Scenario: 支持的 Input 变体
- **WHEN** 开发者使用不同变体的 Input
- **THEN** 系统 SHALL 支持 `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` 变体
- **AND** 每个变体 SHALL 自动适配主题颜色

### Requirement: Select 组件支持
系统 SHALL 扩展 shadcn/ui 组件库以支持 Select 组件，用于分类选择等场景。

#### Scenario: Select 组件引入
- **WHEN** 项目需要下拉选择功能
- **THEN** 系统 SHALL 使用 `npx shadcn@latest add select` 引入 Select 组件
- **AND** Select 组件 SHALL 完全适配项目主题

#### Scenario: Select 组件样式覆盖
- **WHEN** Select 组件默认样式不符合需求
- **THEN** 系统 SHALL 通过 CSS 变量覆盖默认样式
- **AND** 保持组件的功能不变
