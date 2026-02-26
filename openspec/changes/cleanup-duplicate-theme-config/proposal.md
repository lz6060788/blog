# 提案：清理重复的主题配置

## Why

项目中存在多处冗余的主题配置：
1. `theme.config.ts` 定义了与 `app/globals.css` 完全相同的颜色值，但未被任何代码使用
2. `globals.css` 中定义了原子类（`.bg-canvas`, `.text-canvas` 等），但代码实际使用的是 Tailwind 配置生成的 `bg-theme-bg-canvas` 等类名

这些冗余配置造成维护负担，容易导致配置不一致。需要在保持现有功能的前提下，清理所有冗余配置。

## What Changes

- **删除** `theme.config.ts` 文件（未使用的重复配置）
- **删除** `globals.css` 中的 `@layer base` 原子类定义（第 197-221 行，未使用）
- **保留** `app/globals.css` 的 CSS 变量定义作为唯一的事实来源
- **保留** `tailwind.config.ts` 正确引用 CSS 变量
- **验证** 确保删除后项目正常运行
- **更新** 相关文档，移除对冗余配置的引用

## Capabilities

### Modified Capabilities

- `theme-system`: 移除冗余的配置文件和未使用的原子类，统一使用 Tailwind 配置生成的类名和 CSS 变量

## Impact

- **删除文件**: `theme.config.ts`
- **验证范围**: 确保项目编译和运行正常
- **文档更新**: 移除规范和文档中对 `theme.config.ts` 的引用
- **无破坏性变更**: `theme.config.ts` 未被实际使用，删除不影响任何功能
