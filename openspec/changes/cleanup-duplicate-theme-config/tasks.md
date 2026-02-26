# 清理重复主题配置实现任务

## 1. 验证与分析

- [x] 1.1 搜索代码库确认 `theme.config.ts` 无任何引用
- [x] 1.2 检查 `globals.css` 中的原子类（`.bg-canvas`, `.text-canvas` 等）是否被使用
- [x] 1.3 确认代码使用的是 `bg-theme-*` 而非 `bg-*` 类名
- [x] 1.4 验证 `tailwind.config.ts` 配置正确

## 2. 删除冗余配置

- [x] 2.1 删除 `theme.config.ts` 文件
- [x] 2.2 删除 `globals.css` 中的 `@layer base` 原子类定义（第 197-221 行）
- [x] 2.3 保留 CSS 变量定义（`:root` 和 `.dark`）

## 3. 更新文档

- [x] 3.1 更新 OpenSpec 规范中的引用
- [ ] 3.2 检查并更新归档变更中的文档引用（可选，归档文档保留历史）
- [x] 3.3 确保文档说明 `globals.css` CSS 变量为唯一主题配置源

## 4. 验证功能

- [ ] 4.1 运行 `npm run build` 确保编译成功（⚠️ 存在预先存在的 Drizzle 类型错误，与主题清理无关）
- [x] 4.2 运行 `npm run dev` 启动开发服务器
- [x] 4.3 测试深色/浅色主题切换功能（删除未使用配置不影响）
- [x] 4.4 检查 Tailwind 类名（`bg-theme-*`）正常工作
- [x] 4.5 验证 shadcn/ui 组件样式正确（使用项目 CSS 变量）

## 5. 提交变更

- [ ] 5.1 提交删除的文件
- [ ] 5.2 提交 globals.css 更新
- [ ] 5.3 提交文档更新
- [ ] 5.4 创建清晰的 commit message
