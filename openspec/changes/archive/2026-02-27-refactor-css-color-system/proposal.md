## Why

当前 `app/globals.css` 中存在以下问题：
1. 所有颜色值均为硬编码（如 `#fafafa`、`#18181b`），缺乏统一的色板变量系统
2. 添加新颜色或修改主题时需要在多处重复修改相同的颜色值
3. `globals.css` 文件过大（345 行），包含所有组件的颜色定义，维护困难
4. 无法快速切换或扩展颜色系统（如从 Zinc 切换到 Slate）

## What Changes

- **新增基础色板变量系统**：定义 Tailwind 风格的基础色板变量（如 `--zinc-50`、`--zinc-100`...`--zinc-950`）
- **重构语义颜色变量**：所有语义颜色变量改为引用基础色板变量，而非硬编码颜色值
- **重构组件颜色变量**：所有组件颜色变量改为引用基础色板变量或语义颜色变量
- **拆分 global.css**：将单一大文件拆分为多个模块化文件，按功能域组织

## Capabilities

### New Capabilities
- `base-color-palette`: 基础色板变量系统，提供 Tailwind 风格的颜色阶梯
- `css-modularity`: CSS 模块化组织，支持按域拆分样式文件

### Modified Capabilities
- `component-color-system`: 组件颜色系统将改为引用基础色板变量，而非硬编码颜色值

## Impact

- **受影响文件**：
  - `app/globals.css` → 拆分为多个文件
  - `app/layout.tsx` → 需要更新 CSS 导入路径
- **依赖关系**：无外部依赖变更
- **兼容性**：
  - 保持所有现有 CSS 变量名称不变（向后兼容）
  - 仅变更变量值的定义方式（从硬编码改为引用）
