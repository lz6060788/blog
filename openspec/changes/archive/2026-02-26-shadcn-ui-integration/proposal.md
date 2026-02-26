# 提案：shadcn/ui 组件库集成

## Why

当前项目存在 UI 组件库使用不一致的问题：`UserMenu.tsx` 导入了不存在的 `Button` 组件导致报错，且项目仅有零散的 UI 组件（DropdownMenu、Avatar）。需要集成成熟的 shadcn/ui 组件系统来统一 UI 开发体验，同时保持项目现有的主题设计语言。

## What Changes

- **新增** shadcn/ui CLI 工具配置和组件初始化
- **新增** 缺失的 UI 组件（Button、Input、Label、Card 等）
- **扩展** Tailwind 配置，将 shadcn/ui 颜色名映射到项目现有 CSS 变量
- **新增** `--radius` 圆角变量（其他颜色使用项目现有变量）
- **保持** 项目 CSS 变量作为唯一的事实来源（不创建 shadcn/ui 别名）
- **修复** UserMenu.tsx 的 Button 导入报错
- **统一** 所有 UI 组件使用项目主题变量，确保深色/浅色模式切换一致

## Capabilities

### New Capabilities

- `shadcn-ui-components`: shadcn/ui 基础组件库，包括 Button、Input、Label、Card、Dialog、DropdownMenu 等

### Modified Capabilities

- `theme-system`: 扩展现有主题系统，添加 shadcn/ui 所需的 CSS 变量

## Impact

- **新增文件**:
  - `components.json` - shadcn/ui CLI 配置文件
  - `components/ui/*.tsx` - shadcn/ui 组件（Button、Input、Label、Card、Dialog 等）
  - `lib/utils.ts` - cn 工具函数（已存在，需验证）
- **修改文件**:
  - `app/globals.css` - 添加 shadcn/ui 所需的 CSS 变量
  - `tailwind.config.ts` - 可能需要更新主题配置
  - `components/auth/UserMenu.tsx` - 修复 Button 导入
- **新增依赖**:
  - `class-variance-authority` - CVA 用于组件变体管理
  - `@radix-ui/*` - Radix UI 原语组件（shadcn/ui 依赖）
  - `tailwind-merge` - 用于合并 Tailwind 类名
- **设计约束**:
  - 必须使用现有项目的 zinc + emerald 配色
  - 必须保持现有的 `rounded-[2rem]` 圆角风格
  - 必须支持深色/浅色主题切换
