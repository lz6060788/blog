# React + shadcn/ui + Tailwind CSS 主题色规范
## 一、主题色样式规范
### 1.1 变量分层定义（核心）
遵循「原始色值 → 主题变量 → 语义化变量」三层结构，核心差异为：将原集中在 `globals.css` 中的组件语义化变量拆分到 `styles/components` 目录，按组件维度管理样式，解决单文件过大问题。

| 层级         | 作用                                                                 | 定义位置                          | 命名规范                          |
|--------------|----------------------------------------------------------------------|-----------------------------------|-----------------------------------|
| 原始色值层   | 存储品牌基础色库，不直接被组件使用                                   | `src/styles/globals.css`          | `--color-brand-[色系]-[明度]`（如 `--color-brand-blue-500`） |
| 主题变量层   | 按 light/dark/brand 等主题映射原始色值，作为语义层的基础             | `src/styles/themes.css`           | `--theme-[属性]`（如 `--theme-primary`） |
| 语义化变量层 | 绑定到具体组件/场景，组件直接使用的核心层                             | `src/styles/components/[组件].css`| `--color-[组件]-[状态]-[属性]`（如 `--color-button-primary-bg`） |

### 1.2 样式文件拆分结构
```
src/styles/
├── globals.css          # 入口文件（引入所有样式）+ 原始色值层
├── themes.css           # 主题变量层（light/dark/brand 基础映射）
├── base.css             # Tailwind base 层配置（全局基础样式）
└── components/          # 组件语义化变量层（按组件拆分）
    ├── button.css       # 按钮组件语义变量
    ├── input.css        # 输入框组件语义变量
    ├── card.css         # 卡片组件语义变量
    └── index.css        # 组件语义变量入口（统一引入所有组件样式）
```

#### 1.2.1 入口文件（globals.css）
```css
/* 引入所有拆分的样式文件 */
@import "./base.css";
@import "./themes.css";
@import "./components/index.css";

/* ========== 1. 原始色值层（品牌基础色库） ========== */
:root {
  /* 基础配置 */
  --font-sans: Inter, system-ui, sans-serif;
  --radius: 0.5rem;

  /* 品牌色库（按设计规范定义，仅维护这里的原始色） */
  --color-brand-blue-400: 221.2 83.2% 63.3%;
  --color-brand-blue-500: 221.2 83.2% 53.3%;
  --color-brand-blue-600: 221.2 83.2% 43.3%;
  --color-brand-gray-100: 240 4.8% 95.9%;
  --color-brand-gray-200: 240 5.9% 90%;
  --color-brand-gray-900: 240 10% 3.9%;
  
  /* 功能色库 */
  --color-success-500: 142.1 76.2% 36.3%;
  --color-warning-500: 247 91% 66%;
  --color-error-500: 0 84.2% 60.2%;
}

/* Tailwind 核心指令（必须放在最后） */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### 1.2.2 主题变量层（themes.css）
```css
/* ========== 2. 主题变量层（按主题映射原始色） ========== */
/* 亮色主题（默认） */
.theme-light {
  --theme-background: 0 0% 100%;
  --theme-foreground: var(--color-brand-gray-900);
  --theme-primary: var(--color-brand-blue-500);
  --theme-secondary: var(--color-brand-gray-100);
  --theme-success: var(--color-success-500);
  --theme-warning: var(--color-warning-500);
  --theme-error: var(--color-error-500);
}

/* 暗色主题 */
.theme-dark {
  --theme-background: var(--color-brand-gray-900);
  --theme-foreground: 0 0% 98%;
  --theme-primary: 0 0% 98%;
  --theme-secondary: 240 3.7% 15.9%;
  --theme-success: var(--color-success-500);
  --theme-warning: var(--color-warning-500);
  --theme-error: var(--color-error-500);
}

/* 品牌主题（定制化） */
.theme-brand {
  --theme-background: 0 0% 100%;
  --theme-foreground: var(--color-brand-gray-900);
  --theme-primary: var(--color-brand-blue-600);
  --theme-secondary: var(--color-brand-gray-200);
  --theme-success: var(--color-success-500);
  --theme-warning: var(--color-warning-500);
  --theme-error: var(--color-error-500);
}
```

#### 1.2.3 基础样式层（base.css）
```css
/* ========== Tailwind Base 层配置 ========== */
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer utilities {
  .content-auto { content-visibility: auto; }
}
```

#### 1.2.4 组件语义变量 - 按钮（components/button.css）
```css
/* ========== 按钮组件语义化变量 ========== */
.theme-light, .theme-dark, .theme-brand {
  --color-button-primary-bg: var(--theme-primary);
  --color-button-primary-text: hsl(var(--theme-background) / 98%);
  --color-button-secondary-bg: var(--theme-secondary);
  --color-button-secondary-text: var(--theme-foreground);
  --color-button-success-bg: var(--theme-success);
  --color-button-success-text: 0 0% 98%;
  --color-button-error-bg: var(--theme-error);
  --color-button-error-text: 0 0% 98%;
}

/* 特殊主题覆盖 */
.theme-dark {
  --color-button-primary-text: var(--theme-background);
}

/* 按钮语义化工具类 */
@layer components {
  .btn-primary { @apply bg-[hsl(var(--color-button-primary-bg))] text-[hsl(var(--color-button-primary-text))]; }
  .btn-secondary { @apply bg-[hsl(var(--color-button-secondary-bg))] text-[hsl(var(--color-button-secondary-text))]; }
  .btn-success { @apply bg-[hsl(var(--color-button-success-bg))] text-[hsl(var(--color-button-success-text))]; }
  .btn-error { @apply bg-[hsl(var(--color-button-error-bg))] text-[hsl(var(--color-button-error-text))]; }
}
```

#### 1.2.5 组件语义变量 - 输入框（components/input.css）
```css
/* ========== 输入框组件语义化变量 ========== */
.theme-light, .theme-dark, .theme-brand {
  --color-input-bg: var(--theme-background);
  --color-input-border: var(--theme-secondary);
  --color-input-text: var(--theme-foreground);
  --color-input-placeholder: hsl(var(--theme-foreground) / 50%);
}

/* 特殊主题覆盖 */
.theme-dark {
  --color-input-placeholder: hsl(var(--theme-foreground) / 40%);
}

/* 输入框语义化工具类 */
@layer components {
  .input-base { @apply bg-[hsl(var(--color-input-bg))] border-[hsl(var(--color-input-border))] text-[hsl(var(--color-input-text))]; }
  .input-placeholder { @apply placeholder:text-[hsl(var(--color-input-placeholder))]; }
}
```

#### 1.2.6 组件语义变量 - 卡片（components/card.css）
```css
/* ========== 卡片组件语义化变量 ========== */
.theme-light, .theme-dark, .theme-brand {
  --color-card-bg: var(--theme-background);
  --color-card-border: var(--theme-secondary);
  --color-card-text: var(--theme-foreground);
}

/* 卡片语义化工具类 */
@layer components {
  .card-base { @apply bg-[hsl(var(--color-card-bg))] border-[hsl(var(--color-card-border))] text-[hsl(var(--color-card-text))]; }
}
```

#### 1.2.7 组件语义变量入口（components/index.css）
```css
/* 统一引入所有组件语义变量 */
@import "./button.css";
@import "./input.css";
@import "./card.css";
/* 新增组件样式时，在此处引入 */
```

#### 1.2.8 Tailwind 配置文件（tailwind.config.js）
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 基于类名切换主题（必须）
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@shadcn/ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // 映射语义化变量到 Tailwind 颜色体系
      colors: {
        border: "hsl(var(--color-input-border))",
        input: "hsl(var(--color-input-bg))",
        ring: "hsl(var(--theme-primary) / 20%)",
        background: "hsl(var(--theme-background))",
        foreground: "hsl(var(--theme-foreground))",
        
        // 组件级语义化颜色（供组件直接使用）
        btn: {
          primary: {
            DEFAULT: "hsl(var(--color-button-primary-bg))",
            foreground: "hsl(var(--color-button-primary-text))",
          },
          secondary: {
            DEFAULT: "hsl(var(--color-button-secondary-bg))",
            foreground: "hsl(var(--color-button-secondary-text))",
          },
          success: {
            DEFAULT: "hsl(var(--color-button-success-bg))",
            foreground: "hsl(var(--color-button-success-text))",
          },
          error: {
            DEFAULT: "hsl(var(--color-button-error-bg))",
            foreground: "hsl(var(--color-button-error-text))",
          },
        },
        input: {
          DEFAULT: "hsl(var(--color-input-bg))",
          border: "hsl(var(--color-input-border))",
          text: "hsl(var(--color-input-text))",
          placeholder: "hsl(var(--color-input-placeholder))",
        },
        card: {
          DEFAULT: "hsl(var(--color-card-bg))",
          border: "hsl(var(--color-card-border))",
          text: "hsl(var(--color-card-text))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};
```

### 1.3 组件样式使用规范（无变更）
#### 1.3.1 基础规则
1. **禁止硬编码色值**：所有组件样式必须使用语义化变量/Tailwind 语义类，禁止直接使用 `bg-blue-500`/`#1e40af` 等硬编码值；
2. **优先使用语义化工具类**：组件样式优先使用 `btn-primary`/`input-base` 等预定义工具类，其次使用 `bg-btn-primary`/`border-input-border` 等 Tailwind 语义颜色；
3. **支持主题适配**：组件无需单独处理 dark/light 逻辑，完全依赖 CSS 变量的主题映射；
4. **类名合并规范**：使用 shadcn/ui 提供的 `cn` 工具函数合并默认类名和自定义类名。

#### 1.3.2 组件示例（按钮组件）
```tsx
// src/components/ui/button/index.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "success" | "error";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => {
    // 基础样式
    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50";
    
    // 尺寸样式
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };
    
    // 变体样式（复用语义化工具类）
    const variantClasses = {
      primary: "btn-primary hover:bg-btn-primary/90",
      secondary: "btn-secondary hover:bg-btn-secondary/90",
      success: "bg-btn-success text-btn-success-foreground hover:bg-btn-success/90",
      error: "bg-btn-error text-btn-error-foreground hover:bg-btn-error/90",
    };

    return (
      <button
        className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
```

## 二、主题色结构要求
### 2.1 目录结构规范（更新拆分后结构）
```
src/
├── styles/                  # 样式核心目录（拆分版）
│   ├── globals.css          # 样式入口 + 原始色值层
│   ├── themes.css           # 主题变量层
│   ├── base.css             # Tailwind base 层配置
│   └── components/          # 组件语义变量层（按组件拆分）
│       ├── index.css        # 组件语义变量入口
│       ├── button.css       # 按钮组件语义变量
│       ├── input.css        # 输入框组件语义变量
│       ├── card.css         # 卡片组件语义变量
│       └── [组件名].css      # 新增组件语义变量文件
├── contexts/                # 主题状态管理
│   └── ThemeContext.tsx     # 主题切换上下文
├── components/              # 组件目录
│   ├── ui/                  # 通用UI组件（和shadcn/ui对齐）
│   │   ├── button/          # 单个组件目录
│   │   │   ├── index.tsx    # 组件实现
│   │   │   └── types.ts     # 类型定义（可选）
│   │   ├── input/           # 输入框组件
│   │   └── ...              # 其他组件
│   └── ThemeSwitch.tsx      # 主题切换组件
├── lib/
│   └── utils.ts             # 工具函数（如cn）
├── tailwind.config.js       # Tailwind配置
└── main.tsx                 # 入口文件（挂载ThemeProvider）
```

### 2.2 主题状态管理结构（无变更）
#### 2.2.1 主题上下文（ThemeContext.tsx）
```tsx
// src/contexts/ThemeContext.tsx
import { createContext, useContext, useEffect, useState } from "react";

// 支持的主题类型（和globals.css中的theme-*类名对齐）
export type Theme = "light" | "dark" | "brand";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean; // 快捷判断是否为暗色主题
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 主题Provider（必须包裹整个应用）
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 初始化主题：优先localStorage → 系统偏好 → 默认light
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) return savedTheme;

    // 系统偏好暗色
    const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return isSystemDark ? "dark" : "light";
  });

  // 切换主题时更新根元素类名 + 持久化
  useEffect(() => {
    const root = document.documentElement;
    // 清除所有旧主题类名
    root.classList.remove("theme-light", "theme-dark", "theme-brand");
    // 添加当前主题类名
    root.classList.add(`theme-${theme}`);
    // 持久化到localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 快捷判断是否为暗色主题
  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 自定义Hook（组件中使用主题）
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
```

#### 2.2.2 入口文件挂载（main.tsx）
```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./contexts/ThemeContext";
import App from "./App";
import "./styles/globals.css"; // 仅需引入入口文件

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

### 2.3 新增组件结构规范（补充样式文件要求）
1. **目录要求**：单个组件一个独立文件夹，放在 `src/components/ui/` 下，必须包含 `index.tsx`，复杂组件可拆分 `types.ts`/`styles.css`；
2. **样式文件要求**：
   - 新增组件时，需在 `src/styles/components/` 下创建 `[组件名].css` 文件，定义该组件的语义化变量和工具类；
   - 在 `src/styles/components/index.css` 中引入该样式文件；
   - 组件语义变量命名必须遵循 `--color-[组件名]-[状态]-[属性]` 规范；
3. **命名要求**：
   - 组件名：PascalCase（如 `CustomCard`）；
   - 文件夹名：kebab-case（如 `custom-card`）；
   - 样式文件名：kebab-case（如 `custom-card.css`）；
   - Props 名：camelCase（如 `buttonVariant`）；
4. **类型要求**：所有组件必须使用 TypeScript 定义 Props，必填属性标注 `required`，可选属性设置默认值；
5. **依赖要求**：优先复用 shadcn/ui 基础组件（如 `Button`/`Input`），避免重复造轮子；
6. **扩展要求**：所有组件必须支持 `className` 属性，用于覆盖默认样式。

## 三、主题色变更规范（补充拆分后变更规则）
### 3.1 变更原则
1. **最小扩散原则**：修改仅影响目标组件/场景，禁止直接修改底层原始色值影响全量组件；
2. **单一数据源原则**：所有色值变更仅在对应层级文件操作，禁止跨层级修改；
3. **版本兼容原则**：重大主题变更需版本化（如 `theme-light-v2`），逐步迁移组件，避免一次性全量修改；
4. **文件隔离原则**：组件样式变更仅修改对应 `styles/components/[组件名].css` 文件，不影响其他组件样式文件。

### 3.2 变更流程
#### 3.2.1 组件样式微调（仅修改单个组件）
1. 定位目标组件对应的样式文件（如按钮对应 `styles/components/button.css`）；
2. 在该文件中修改组件的语义化变量映射值（仅修改目标主题下的变量）；
3. 验证：切换所有主题，确认仅目标组件样式变更，其他组件不受影响；
4. 记录：在变更日志中注明修改的样式文件、语义化变量及影响范围。

**示例**：修改亮色主题下按钮主色从蓝色 500 改为 600
```css
/* styles/themes.css */
.theme-light {
  --theme-primary: var(--color-brand-blue-600); /* 仅修改这一行 */
  /* 其他变量不变 */
}
```

#### 3.2.2 新增组件样式
1. 在 `styles/components/` 下创建 `[组件名].css` 文件，定义该组件的语义化变量和工具类；
2. 遵循命名规范：变量名 `--color-[组件名]-[状态]-[属性]`，工具类名 `[组件名]-[状态]`；
3. 在 `styles/components/index.css` 中引入该新样式文件；
4. 在 `tailwind.config.js` 中扩展 `colors` 配置，添加该组件的语义化颜色映射；
5. 验证：组件使用新定义的语义化类名，切换所有主题样式正常；
6. 文档：在组件 README 中注明使用的语义化类名和主题适配规则。

#### 3.2.3 新增主题（如新增「圣诞主题」）
1. 在 `styles/themes.css` 中新增 `theme-christmas` 主题变量层，映射原始色值；
2. 在各组件样式文件（`button.css`/`input.css` 等）中为 `theme-christmas` 定义组件语义变量（仅修改差异项）；
3. 更新 `ThemeContext.tsx` 中的 `Theme` 类型，新增 `christmas` 选项；
4. 更新主题切换组件，添加「圣诞主题」切换按钮；
5. 验证：切换所有主题，确认新主题样式符合预期，原有主题不受影响；
6. 文档：补充新主题的变量说明和使用场景。

#### 3.2.4 原始色值升级（品牌色调整）
1. 在 `styles/globals.css` 的「原始色值层」新增新版本色值（如 `--color-brand-blue-500-v2`）；
2. 在 `styles/themes.css` 中创建新版本主题（如 `theme-light-v2`），映射到新原始色值；
3. 逐步在各组件样式文件中适配新版本主题的语义变量；
4. 旧版本主题保留 1-2 个迭代周期，确保全量组件迁移完成后删除；
5. 清理：删除旧版本色值和主题变量，完成升级。

### 3.3 变更验证清单
1. ✅ 所有主题切换后，目标组件样式符合预期；
2. ✅ 非目标组件样式无变更；
3. ✅ 响应式场景（移动端/桌面端）样式正常；
4. ✅ 组件交互状态（hover/active/disabled）样式正常；
5. ✅ localStorage 持久化生效，刷新页面主题不丢失；
6. ✅ 系统偏好主题适配正常（首次加载）；
7. ✅ 样式文件拆分后，无重复定义、无样式冲突；
8. ✅ 新增样式文件已正确引入到 `components/index.css`。

### 总结
1. **样式拆分核心**：将原集中的 `globals.css` 拆分为「入口+原始色值」`globals.css`、「主题变量」`themes.css`、「基础样式」`base.css` 和「组件语义变量」`components/` 目录，按组件维度管理样式，解决单文件过大问题；
2. **新增组件核心**：新增组件需同步在 `styles/components/` 下创建对应样式文件，定义专属语义变量，并在入口文件引入，确保样式隔离；
3. **变更核心**：组件样式变更仅修改对应组件的样式文件，遵循「文件隔离+最小扩散」原则，避免修改扩散影响全量组件。