# OpenSpec Delta Specs 同步摘要

## 同步日期
2026-02-26

## 变更标识
shadcn-ui-integration

## 同步的 Delta Specs

### 1. 新增规范：shadcn-ui-components

**文件路径**: `D:\workspace\git\blog\openspec\specs\shadcn-ui-components\spec.md`

**变更类型**: 新增 (ADDED)

**主要内容**:
- shadcn/ui 组件安装和管理
- Button 组件规范（多种变体和尺寸）
- Input 组件规范
- Card 组件规范
- Label 组件规范
- Dialog 组件规范
- 组件主题适配（深色/浅色模式）
- 组件可访问性（WCAG 2.1 AA）
- 组件类型安全

### 2. 修改规范：theme-system

**文件路径**: `D:\workspace\git\blog\openspec\specs\theme-system\spec.md`

**变更类型**: 修改 (MODIFIED)

**变更详情**:

#### 修改的需求：

1. **CSS 自定义属性**
   - 原需求描述强调使用语义化变量
   - 修改后明确以项目变量为主，不创建 shadcn/ui 别名变量
   - shadcn/ui 组件通过 Tailwind 配置映射到项目变量

2. **Tailwind CSS 集成**
   - 原需求仅支持现有 zinc 色系
   - 修改后新增 shadcn/ui 所需的颜色定义
   - 通过 CSS() 函数引用项目的 CSS 变量
   - 确保新增类名在深色/浅色模式下自动使用正确的变量值

#### 新增的需求：

1. **shadcn/ui 圆角变量**
   - 添加 `--radius` CSS 变量（1rem）
   - 支持组件使用 `rounded-[var(--radius)]` 引用

2. **Tailwind 颜色映射**
   - 配置 shadcn/ui 基础颜色（background、foreground、card 等）
   - 将 shadcn/ui 颜色映射到项目现有的 CSS 变量
   - 支持深色模式下的自动颜色映射

3. **shadcn/ui 配置文件**
   - 生成 `components.json` 配置文件
   - 支持通过 Tailwind 配置映射到项目变量
   - 保持项目 CSS 变量作为唯一的事实来源

## 同步状态

- [x] 创建 shadcn-ui-components 主规范文件
- [x] 更新 theme-system 主规范文件
- [x] 验证所有变更已正确应用

## 影响范围

### 新增文件
- `openspec/specs/shadcn-ui-components/spec.md`

### 修改文件
- `openspec/specs/theme-system/spec.md`

### 无影响的文件
- 其他所有规范文件保持不变

## 验证清单

- [x] shadcn-ui-components 规范已创建
- [x] theme-system 规范已更新
- [x] 所有 ADDED 需求已添加到主规范
- [x] 所有 MODIFIED 需求已更新到主规范
- [x] 无 REMOVED 需求（符合 delta spec）

## 下一步行动

建议在完成同步后：
1. 运行 `openspec-apply-change` 技能应用变更到代码
2. 使用 `openspec-archive-change` 技能归档此变更
