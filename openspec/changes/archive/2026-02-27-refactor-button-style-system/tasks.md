## 1. 扩展颜色清单（global.css）

### 1.1 Button 颜色变量

- [ ] 1.1.1 在 `:root` 中为 default 变体添加颜色变量
  - `--btn-default-bg`、`--btn-default-fg`
  - `--btn-default-bg-hover`、`--btn-default-fg-hover`

- [ ] 1.1.2 在 `:root` 中为 destructive 变体添加颜色变量
  - `--btn-destructive-bg`、`--btn-destructive-fg`
  - `--btn-destructive-bg-hover`

- [ ] 1.1.3 在 `:root` 中为 outline 变体添加颜色变量
  - `--btn-outline-bg`（透明）
  - `--btn-outline-fg`、`--btn-outline-border`
  - `--btn-outline-bg-hover`、`--btn-outline-fg-hover`

- [ ] 1.1.4 在 `:root` 中为 secondary 变体添加颜色变量
  - `--btn-secondary-bg`、`--btn-secondary-fg`
  - `--btn-secondary-bg-hover`

- [ ] 1.1.5 在 `:root` 中为 ghost 变体添加颜色变量
  - `--btn-ghost-bg`（透明）
  - `--btn-ghost-fg`
  - `--btn-ghost-bg-hover`、`--btn-ghost-fg-hover`

- [ ] 1.1.6 在 `:root` 中为 link 变体添加颜色变量
  - `--btn-link-bg`（透明）
  - `--btn-link-fg`

### 1.2 Switch 颜色变量

- [ ] 1.2.1 在 `:root` 中添加 Switch 颜色变量
  - `--swt-bg-checked`、`--swt-bg-checked-hover`
  - `--swt-bg-unchecked`、`--swt-border-unchecked`
  - `--swt-thumb-bg`
  - `--swt-ring-color`

### 1.3 Dialog 颜色变量

- [ ] 1.3.1 在 `:root` 中添加 Dialog 颜色变量
  - `--dlg-overlay-bg`
  - `--dlg-content-bg`、`--dlg-content-border`
  - `--dlg-close-bg-hover`、`--dlg-close-fg-hover`
  - `--dlg-title-fg`、`--dlg-desc-fg`
  - `--dlg-ring-color`

### 1.4 Avatar 颜色变量

- [ ] 1.4.1 在 `:root` 中添加 Avatar 颜色变量
  - `--avt-fallback-bg`、`--avt-fallback-fg`

### 1.5 DropdownMenu 颜色变量

- [ ] 1.5.1 在 `:root` 中添加 DropdownMenu 颜色变量
  - `--ddm-content-bg`、`--ddm-content-border`、`--ddm-content-fg`
  - `--ddm-item-bg-hover`、`--ddm-item-fg-hover`
  - `--ddm-separator-bg`
  - `--ddm-label-fg`

### 1.6 Table 颜色变量

- [ ] 1.6.1 在 `:root` 中添加 Table 颜色变量
  - `--tbl-footer-bg`
  - `--tbl-row-bg-hover`、`--tbl-row-bg-selected`
  - `--tbl-head-fg`、`--tbl-caption-fg`

### 1.7 Sheet 颜色变量

- [ ] 1.7.1 在 `:root` 中添加 Sheet 颜色变量
  - `--sht-overlay-bg`
  - `--sht-content-bg`、`--sht-content-border`
  - `--sht-close-bg-hover`
  - `--sht-title-fg`、`--sht-desc-fg`

### 1.8 深色主题变量

- [ ] 1.8.1 在 `.dark` 中重复 1.1.1-1.7.1，使用深色主题的颜色值

## 2. 添加 Tailwind 配置映射

### 2.1 Button 映射

- [ ] 2.1.1 添加 default 变体映射
  - `defaultBg`, `defaultFg`, `defaultBgHover`, `defaultFgHover`

- [ ] 2.1.2 添加 destructive 变体映射
  - `destructiveBg`, `destructiveFg`, `destructiveBgHover`

- [ ] 2.1.3 添加 outline 变体映射
  - `outlineBg`, `outlineFg`, `outlineBorder`, `outlineBgHover`, `outlineFgHover`

- [ ] 2.1.4 添加 secondary 变体映射
  - `secondaryBg`, `secondaryFg`, `secondaryBgHover`

- [ ] 2.1.5 添加 ghost 变体映射
  - `ghostBg`, `ghostFg`, `ghostBgHover`, `ghostFgHover`

- [ ] 2.1.6 添加 link 变体映射
  - `linkBg`, `linkFg`

### 2.2 Switch 映射

- [ ] 2.2.1 添加 Switch 映射
  - `bgChecked`, `bgCheckedHover`, `bgUnchecked`, `borderUnchecked`
  - `thumbBg`, `ringColor`

### 2.3 Dialog 映射

- [ ] 2.3.1 添加 Dialog 映射
  - `overlayBg`
  - `contentBg`, `contentBorder`
  - `closeBgHover`, `closeFgHover`
  - `titleFg`, `descFg`
  - `ringColor`

### 2.4 Avatar 映射

- [ ] 2.4.1 添加 Avatar 映射
  - `fallbackBg`, `fallbackFg`

### 2.5 DropdownMenu 映射

- [ ] 2.5.1 添加 DropdownMenu 映射
  - `contentBg`, `contentBorder`, `contentFg`
  - `itemBgHover`, `itemFgHover`
  - `separatorBg`
  - `labelFg`

### 2.6 Table 映射

- [ ] 2.6.1 添加 Table 映射
  - `footerBg`
  - `rowBgHover`, `rowBgSelected`
  - `headFg`, `captionFg`

### 2.7 Sheet 映射

- [ ] 2.7.1 添加 Sheet 映射
  - `overlayBg`
  - `contentBg`, `contentBorder`
  - `closeBgHover`
  - `titleFg`, `descFg`

## 3. 更新组件样式

### 3.1 Button 组件

- [ ] 3.1.1 更新 default 变体
  - `bg-primary` → `bg-theme-btn-default-bg`
  - `text-primary-foreground` → `text-theme-btn-default-fg`
  - `hover:bg-primary/90` → `hover:bg-theme-btn-default-bg-hover hover:text-theme-btn-default-fg-hover`

- [ ] 3.1.2 更新 destructive 变体
  - `bg-destructive` → `bg-theme-btn-destructive-bg`
  - `text-destructive-foreground` → `text-theme-btn-destructive-fg`
  - `hover:bg-destructive/90` → `hover:bg-theme-btn-destructive-bg-hover`

- [ ] 3.1.3 更新 outline 变体
  - `bg-background` → `bg-theme-btn-outline-bg`
  - `border-border` → `border-theme-btn-outline-border`
  - `hover:bg-accent` → `hover:bg-theme-btn-outline-bg-hover hover:text-theme-btn-outline-fg-hover`

- [ ] 3.1.4 更新 secondary 变体
  - `bg-secondary` → `bg-theme-btn-secondary-bg`
  - `text-secondary-foreground` → `text-theme-btn-secondary-fg`
  - `hover:bg-secondary/80` → `hover:bg-theme-btn-secondary-bg-hover`

- [ ] 3.1.5 更新 ghost 变体
  - `hover:bg-accent` → `hover:bg-theme-btn-ghost-bg-hover hover:text-theme-btn-ghost-fg-hover`

- [ ] 3.1.6 更新 link 变体
  - `text-primary` → `text-theme-btn-link-fg`
  - `bg-transparent` → `bg-theme-btn-link-bg`

### 3.2 Switch 组件

- [ ] 3.2.1 更新 checked 状态
  - `data-[state=checked]:bg-primary` → `data-[state=checked]:bg-theme-swt-bg-checked`

- [ ] 3.2.2 更新 unchecked 状态
  - `data-[state=unchecked]:bg-input` → `data-[state=unchecked]:bg-theme-swt-bg-unchecked`

- [ ] 3.2.3 更新 thumb
  - `bg-background` → `bg-theme-swt-thumb-bg`

- [ ] 3.2.4 更新 ring
  - `focus-visible:ring-ring` → `focus-visible:ring-theme-swt-ring-color`

### 3.3 Dialog 组件

- [ ] 3.3.1 更新 overlay
  - `bg-black/80` → `bg-theme-dlg-overlay-bg`

- [ ] 3.3.2 更新 content
  - `bg-background` → `bg-theme-dlg-content-bg`
  - `border` → `border-theme-dlg-content-border`

- [ ] 3.3.3 更新 close button
  - `hover:bg-accent` → `hover:bg-theme-dlg-close-bg-hover`
  - `ring-offset-background` → `ring-offset-theme-dlg-content-bg`
  - `ring-ring` → `ring-theme-dlg-ring-color`

- [ ] 3.3.4 更新 description
  - `text-muted-foreground` → `text-theme-dlg-desc-fg`

### 3.4 Avatar 组件

- [ ] 3.4.1 更新 fallback
  - `bg-muted` → `bg-theme-avt-fallback-bg`

### 3.5 DropdownMenu 组件

- [ ] 3.5.1 更新 content
  - `bg-popover` → `bg-theme-ddm-content-bg`
  - `text-popover-foreground` → `text-theme-ddm-content-fg`

- [ ] 3.5.2 更新 item
  - `hover:bg-accent` → `hover:bg-theme-ddm-item-bg-hover`
  - `hover:text-accent-foreground` → `hover:text-theme-ddm-item-fg-hover`

- [ ] 3.5.3 更新 separator
  - `bg-muted` → `bg-theme-ddm-separator-bg`

### 3.6 Table 组件

- [ ] 3.6.1 更新 footer
  - `bg-muted/50` → `bg-theme-tbl-footer-bg`

- [ ] 3.6.2 更新 row
  - `hover:bg-muted/50` → `hover:bg-theme-tbl-row-bg-hover`
  - `data-[state=selected]:bg-muted` → `data-[state=selected]:bg-theme-tbl-row-bg-selected`

- [ ] 3.6.3 更新 head
  - `text-muted-foreground` → `text-theme-tbl-head-fg`

- [ ] 3.6.4 更新 caption
  - `text-muted-foreground` → `text-theme-tbl-caption-fg`

### 3.7 Sheet 组件

- [ ] 3.7.1 更新 overlay
  - `bg-black/80` → `bg-theme-sht-overlay-bg`

- [ ] 3.7.2 更新 content
  - `bg-background` → `bg-theme-sht-content-bg`
  - `border` → `border-theme-sht-content-border`

- [ ] 3.7.3 更新 close button
  - `ring-offset-background` → `ring-offset-theme-sht-content-bg`
  - `ring-ring` → `ring-theme-sht-ring-color`
  - `data-[state=open]:bg-secondary` → `data-[state=open]:bg-theme-sht-close-bg-hover`

- [ ] 3.7.4 更新 description
  - `text-muted-foreground` → `text-theme-sht-desc-fg`

## 4. 测试验证

- [ ] 4.1 视觉回归测试 - 浅色主题
  - 检查所有组件的默认状态
  - 检查所有组件的悬停/聚焦状态
  - 确认与重构前外观一致

- [ ] 4.2 视觉回归测试 - 深色主题
  - 切换到深色模式
  - 检查所有组件的默认状态
  - 检查所有组件的悬停/聚焦状态
  - 确认与重构前外观一致

- [ ] 4.3 交互状态测试
  - 测试所有组件的焦点环显示
  - 测试所有组件的点击/激活状态
  - 测试禁用状态

- [ ] 4.4 主题切换测试
  - 在浅色和深色模式间切换
  - 确认所有组件颜色平滑过渡

## 5. 清理工作

- [ ] 5.1 移除 `global.css` 中旧的组件颜色变量
  - 移除 `--btn-bg-primary`、`--btn-text-primary` 等
  - 移除 `--input-bg`、`--input-border` 等（如果未被其他地方使用）

- [ ] 5.2 移除 `tailwind.config.ts` 中旧的 `theme.btn`、`theme.input` 等配置

- [ ] 5.3 验证无控制台错误或警告

- [ ] 5.4 运行类型检查确保无 TypeScript 错误
