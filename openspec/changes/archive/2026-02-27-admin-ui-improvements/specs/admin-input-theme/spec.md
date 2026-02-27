## ADDED Requirements

### Requirement: Input 组件样式主题化
系统 SHALL 为所有 input 类组件（input、textarea、select）提供统一的样式主题，使用项目的三层颜色系统。

#### Scenario: 创建主题化的 Input 组件
- **WHEN** 开发者在项目中使用 Input 组件
- **THEN** 组件 SHALL 自动应用项目的颜色主题变量
- **AND** 组件 SHALL 支持亮色和暗色主题切换

#### Scenario: 替换原生 input 元素
- **WHEN** 代码中使用原生 `<input>` 或 `<textarea>` 元素
- **THEN** 系统 SHALL 替换为 shadcn/ui 的 Input 或 Textarea 组件
- **AND** 替换后的组件 SHALL 保持原有的功能（placeholder、defaultValue、onChange 等）

### Requirement: 样式一致性保证
系统 SHALL 确保所有管理端页面的输入组件样式一致，包括颜色、圆角、边框、阴影等。

#### Scenario: 跨页面样式一致性
- **WHEN** 用户在不同管理端页面看到输入框
- **THEN** 所有输入框 SHALL 具有相同的视觉样式
- **AND** hover、focus 状态 SHALL 保持一致

#### Scenario: 响应式适配
- **WHEN** 用户在不同尺寸的屏幕上查看
- **THEN** 输入组件 SHALL 保持良好的响应式布局
- **AND** 不会出现水平滚动条或溢出
