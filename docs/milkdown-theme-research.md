# Milkdown 主题研究文档

> **日期**: 2025-03-19
> **目的**: 研究 Milkdown 的主题系统，确定简单的主题色注入方案

## 研究结论

**Milkdown 确实支持简单的主题色注入！**

通过使用 `@milkdown/crepe/theme` 包，我们可以：

1. ✅ 使用预构建的主题（Crepe、Nord、Frame）
2. ✅ 通过 CSS 变量轻松覆盖颜色
3. ✅ 无需从零构建复杂的自定义样式

## 官方主题包

### 安装

```bash
npm install @milkdown/crepe/theme
```

### 可用主题

- **Crepe** (light/dark) - 通用主题
- **Nord** (light/dark) - Nord 配色方案
- **Frame** (light/dark) - 框架风格主题

### 使用方法

```typescript
// 导入基础样式
import "@milkdown/crepe/theme/common/style.css";

// 选择一个主题（例如 Crepe）
import "@milkdown/crepe/theme/crepe.css";

// 或者使用深色主题
import "@milkdown/crepe/theme/crepe-dark.css";
```

## CSS 变量覆盖

### 颜色变量

```css
.crepe .milkdown {
  /* 背景色 */
  --crepe-color-background: #fffdfb;      /* 主背景 */
  --crepe-color-surface: #fff8f4;          /* 卡片/面板背景 */
  --crepe-color-surface-low: #fff1e5;      /* 深度背景 */

  /* 文本色 */
  --crepe-color-on-background: #1f1b16;    /* 背景上的文本 */
  --crepe-color-on-surface: #201b13;        /* 表面上的文本 */
  --crepe-color-on-surface-variant: #4f4539; /* 次要文本 */

  /* 强调色 */
  --crepe-color-primary: #805610;           /* 品牌主色 */
  --crepe-color-secondary: #fbdebc;         /* 次要强调色 */
  --crepe-color-on-secondary: #271904;      /* 次要色上的文本 */

  /* UI 色 */
  --crepe-color-outline: #817567;           /* 边框/轮廓 */
  --crepe-color-error: #ba1a1a;             /* 错误状态 */
  --crepe-color-inline-code: #ba1a1a;       /* 行内代码 */

  /* 交互色 */
  --crepe-color-hover: #f9ecdf;             /* 悬停状态 */
  --crepe-color-selected: #ede0d4;          /* 选中状态 */
}
```

### 字体变量

```css
.crepe .milkdown {
  --crepe-font-title: Georgia, Cambria, "Times New Roman", Times, serif;
  --crepe-font-default: "Open Sans", Arial, Helvetica, sans-serif;
  --crepe-font-code: Fira Code, Menlo, Monaco, "Courier New", Courier, monospace;
}
```

### 阴影变量

```css
.crepe .milkdown {
  --crepe-shadow-1: 0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3);
  --crepe-shadow-2: 0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3);
}
```

## 项目集成方案

### 方案选择

**推荐方案**：使用 Crepe 主题 + CSS 变量覆盖

理由：
- ✅ **简单快速** - 直接使用预构建主题
- ✅ **易于维护** - 跟随上游更新
- ✅ **灵活定制** - 只需覆盖需要的变量
- ✅ **支持深色模式** - 内置 light/dark 变体

### 与项目主题系统集成

```css
/* components/editor/milkdown/milkdown-theme.css */

/* 浅色模式 */
:root,
[data-theme="light"] {
  .crepe .milkdown {
    /* 映射项目的 CSS 变量到 Crepe 变量 */
    --crepe-color-background: var(--theme-background);
    --crepe-color-surface: var(--theme-background-secondary);
    --crepe-color-on-background: var(--theme-text-primary);
    --crepe-color-on-surface: var(--theme-text-primary);
    --crepe-color-primary: var(--theme-primary);
    --crepe-color-outline: var(--theme-border);
  }
}

/* 深色模式 */
[data-theme="dark"] {
  .crepe .milkdown {
    --crepe-color-background: var(--theme-background);
    --crepe-color-surface: var(--theme-background-secondary);
    --crepe-color-on-background: var(--theme-text-primary);
    --crepe-color-on-surface: var(--theme-text-primary);
    --crepe-color-primary: var(--theme-primary);
    --crepe-color-outline: var(--theme-border);
  }
}
```

## 实施建议

### 阶段 1：基础集成（MVP）

1. 安装 `@milkdown/crepe/theme`
2. 使用默认的 Crepe 或 Nord 主题
3. 验证功能和 SSR 支持

### 阶段 2：主题适配

1. 创建 CSS 变量映射文件
2. 覆盖关键颜色变量
3. 测试深色/浅色模式切换

### 阶段 3：细节优化（可选）

1. 调整字体变量
2. 自定义阴影效果
3. 优化移动端样式

## 参考资料

- [Milkdown 官方样式文档](https://milkdown.dev/docs/guide/styling)
- [Milkdown 示例仓库](https://github.com/Milkdown/examples)
- [Crepe 主题包文档](https://milkdown.dev/docs/guide/styling#styling-crepe-theme)

## 关键发现总结

| 问题 | 答案 |
|------|------|
| 是否支持简单的主题色注入？ | ✅ 是，通过 CSS 变量 |
| 是否需要从零构建样式？ | ❌ 否，有预构建主题 |
| 深色模式支持如何？ | ✅ 内置 light/dark 变体 |
| 是否支持 SSR？ | ✅ 是，这是 Milkdown 的优势 |
| 维护成本如何？ | 低，跟随上游更新 |

---

**更新记录**：
- 2025-03-19: 初始研究，确定使用 Crepe 主题方案
