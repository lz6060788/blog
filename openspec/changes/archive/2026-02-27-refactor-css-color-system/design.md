## Context

当前 `app/globals.css` 包含 345 行代码，其中所有颜色值均为硬编码。CSS 变量架构分为三个层次：
- **基础色层**：如 `--bg-canvas: #fafafa`，但实际是硬编码
- **语义色层**：如 `--text-primary: #3f3f46`，直接使用硬编码
- **组件色层**：如 `--btn-default-bg: #18181b`，直接使用硬编码

这种架构导致：
1. 修改颜色需要在多处重复更改（如 `#fafafa` 出现在 30+ 处）
2. 无法轻松切换颜色系统（如从 Zinc 切换到其他色系）
3. 单文件过大，难以维护

## Goals / Non-Goals

**Goals:**
- 建立 Tailwind 风格的基础色板变量系统（`--zinc-50` 到 `--zinc-950` 等）
- 所有语义和组件颜色变量引用基础色板变量
- 按功能域拆分 `globals.css` 为多个模块化文件
- 保持现有 CSS 变量名称不变（向后兼容）

**Non-Goals:**
- 修改现有 CSS 变量命名（仅修改变量值定义方式）
- 引入新的 CSS 预处理器（继续使用原生 CSS 变量）
- 修改 Tailwind 配置（本变更范围限于 CSS 文件）

## Decisions

### 1. 色板命名采用 Tailwind 标准

**决策**：使用 `--zinc-{n}`、`--emerald-{n}` 等格式

**理由**：
- Tailwind 是项目已采用的设计系统
- 标准化命名便于理解和使用
- 未来可轻松扩展到其他色板（slate、neutral 等）

**替代方案**：自定义命名如 `--gray-lightest`
- **拒绝原因**：非标准化，增加学习成本

### 2. 三层颜色系统架构（可扩展设计）

**决策**：建立三层颜色系统以支持主题扩展

**架构层次**：
1. **基础色板层** - 纯色值，无语义含义
   - `--zinc-50` 到 `--zinc-950`
   - `--emerald-50` 到 `--emerald-950`
   - `--red-*`, `--amber-*`, `--blue-*`（状态色）

2. **语义角色层** - 描述用途，而非颜色
   - `--neutral-*` → 中性色角色
   - `--accent-*` → 强调色角色
   - `--success-*`, `--danger-*`, `--warning-*`, `--info-*` → 状态色角色

3. **主题映射层** - 主题定义语义角色到基础色板的映射
   - `:root` 中定义浅色主题映射
   - `.dark` 中定义深色主题映射
   - 未来可添加 `.theme-pink` 等自定义主题

**示例**：
```css
/* 第一层：基础色板 */
:root {
  --emerald-400: #34d399;
  --pink-400: #f472b6;
}

/* 第二层：语义角色 */
:root {
  --accent-400: var(--emerald-400);  /* 浅色主题用绿色 */
}

/* 第三层：主题映射 */
.dark {
  --accent-400: var(--emerald-400);  /* 深色主题保持绿色 */
}

/* 扩展：添加粉色主题 */
.theme-pink {
  --accent-400: var(--pink-400);  /* 粉色主题用粉色 */
}
```

**理由**：
- **可扩展性**：添加新主题只需重新映射语义角色，无需修改组件代码
- **语义一致性**：`--accent-400` 总是表示"强调色400阶"，不管实际是什么颜色
- **组件解耦**：组件使用语义变量（`--accent-600`），不关心具体颜色
- **主题切换**：通过切换 class（`.dark`、`.theme-pink`）即可完全改变颜色方案

**替代方案**：组件直接引用具体色板（如 `--emerald-400`）
- **拒绝原因**：添加新主题时变量名与实际颜色语义不对齐（如 `--emerald-400` 实际显示为粉色）

### 3. CSS 文件组织方案

**决策**：将 CSS 拆分为多个独立文件，在 layout.tsx 中分别导入

**理由**：
- 模块化组织，便于维护和查找
- 每个 CSS 文件职责单一
- 在 Next.js layout.tsx 中使用 import 导入，避免 @import 语句的问题
- 符合 Next.js 最佳实践

**文件结构**：
```
app/
  layout.tsx            # 导入所有 CSS 文件
  globals.css           # @tailwind 指令 + 通用样式
  styles/
    base/               # 基础色板
      colors.css        # 三层颜色系统：基础色板 + 语义角色
      themes.css        # 主题定义注释
    semantic/           # 语义颜色（使用语义角色变量）
      background.css
      text.css
      border.css
      accent.css
    components/         # 组件颜色（使用语义角色变量）
      button.css
      switch.css
      dialog.css
      avatar.css
      dropdown.css
      table.css
      sheet.css
    legacy/             # 向后兼容（使用语义角色变量）
      input.css
      card.css
      nav.css
```

**导入顺序**（在 layout.tsx 中）：
1. globals.css（@tailwind 指令必须最先）
2. base/colors.css（基础色板 + 语义角色，被其他文件引用）
3. base/themes.css
4. semantic/*.css（语义颜色，引用语义角色）
5. components/*.css（组件颜色，引用语义角色）
6. legacy/*.css（向后兼容）

**替代方案**：使用 @import 语句在 CSS 文件中导入
- **拒绝原因**：CSS @import 与 @tailwind 指令存在加载顺序冲突，导致深色主题样式不生效和 Jest worker 错误

### 4. 主题定义方式

**决策**：基础色板在 `:root` 和 `.dark` 中分别定义完整值

**示例**：
```css
:root {
  --zinc-50: #fafafa;
  --zinc-900: #18181b;
}
.dark {
  --zinc-50: #09090b;  /* 深色模式下 50 变深 */
  --zinc-900: #fafafa;  /* 深色模式下 900 变浅 */
}
```

**理由**：
- 主题切换时无需运行时计算
- 性能最优，浏览器直接读取变量值

**替代方案**：仅在 `.dark` 中覆盖差异值
- **拒绝原因**：增加复杂度，难以维护哪些值被覆盖

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| CSS 变量引用链过长可能影响渲染性能 | 保持引用链不超过 3 层，现代浏览器性能影响可忽略 |
| 拆分文件后忘记导入新模块 | 在 `layout.tsx` 中保持导入顺序清晰 |
| 硬编码颜色值提取遗漏 | 使用正则搜索 `#[0-9a-fA-F]{3,6}` 确保全部提取 |
| 添加新主题时需覆盖大量变量 | 建立完整的语义角色系统，新主题只需覆盖语义角色映射 |

## Migration Plan

1. **创建基础色板变量**：在 `styles/base/colors.css` 中定义所有色板
2. **重构语义颜色**：将语义色变量改为引用基础色板
3. **重构组件颜色**：将组件颜色变量改为引用基础色板或语义色
4. **拆分文件**：按功能域将代码拆分到对应文件
5. **更新导入**：修改 `app/layout.tsx` 中的 CSS 导入路径
6. **验证主题切换**：确保浅色/深色模式正常工作
7. **验证组件渲染**：确保所有组件样式正确

**回滚策略**：保留原有 `globals.css` 备份，可通过 git revert 快速回滚

## Open Questions

- 无（三层颜色系统架构已解决扩展性问题）
