# 登录注册页面实现任务

## 1. 认证布局组件

- [x] 1.1 创建 `components/auth/AuthLayout.tsx` - 布局容器组件，使用 `motion.div` 和现有主题变量
- [x] 1.2 创建 `components/auth/VisualSection.tsx` - 视觉区域组件（品牌展示）
- [x] 1.3 创建 `components/auth/AuthSection.tsx` - 功能区域组件（登录表单卡片）
- [x] 1.4 实现 `components/auth/BrandMessaging.tsx` - 品牌文案和装饰元素

## 2. OAuth 登录组件

- [x] 2.1 创建 `components/auth/OAuthButton.tsx` - 通用 OAuth 登录按钮（支持 GitHub 和 Google）
- [x] 2.2 创建 `components/auth/OAuthButtons.tsx` - 按钮组容器，使用 framer-motion variants
- [x] 2.3 创建 `components/auth/FooterLinks.tsx` - 页脚链接组件（用户协议、隐私政策）

## 3. 登录页面实现

- [x] 3.1 创建 `app/login/page.tsx` - 登录页面主组件（客户端组件）
- [x] 3.2 实现会话状态检测（使用 `useSession` hook）
- [x] 3.3 实现已登录用户自动重定向到首页
- [x] 3.4 实现登录成功后的重定向逻辑（包括 callbackUrl 支持）
- [x] 3.5 添加页面元数据（metadata export，包括标题、描述、OG 标签）

## 4. 动画实现（使用 framer-motion）

- [x] 4.1 创建动画 variants 对象（container + item 模式）
- [x] 4.2 实现页面元素 staggered 入场动画（使用 `staggerChildren`）
- [x] 4.3 实现按钮悬停效果（`whileHover={{ y: -2 }}`）
- [x] 4.4 实现按钮点击反馈（`whileTap={{ scale: 0.97 }}`）
- [x] 4.5 添加装饰性循环动画（参考 AuthorCard 的状态指示器）
- [ ] 4.6 实现 prefers-reduced-motion 支持（禁用动画）

## 5. 错误处理与用户反馈

- [ ] 5.1 创建 `components/auth/ErrorMessage.tsx` - 错误提示组件
- [ ] 5.2 实现 OAuth 授权失败的错误处理和提示
- [ ] 5.3 实现网络错误的错误处理
- [ ] 5.4 实现加载状态（loading skeleton）

## 6. 响应式设计

- [x] 6.1 实现移动端布局（< 1024px）- 垂直堆叠，视觉区域 30-35%
- [x] 6.2 实现桌面端布局（≥ 1024px）- 分屏布局（左侧 55%，右侧 45%）
- [x] 6.3 调整移动端的字体大小和间距
- [x] 6.4 确保触控目标尺寸 ≥ 44px
- [x] 6.5 优化平板端布局（768px - 1023px）

## 7. 样式与主题集成

- [x] 7.1 使用现有主题变量（`bg-theme-bg-canvas`、`text-theme-text-canvas` 等）
- [x] 7.2 使用现有字体系统（Outfit + JetBrains Mono）
- [x] 7.3 使用现有卡片样式（`bg-theme-card-bg border border-theme-card shadow-card rounded-[2rem]`）
- [x] 7.4 使用现有按钮样式（`bg-theme-btn-*` 变量）
- [x] 7.5 确保深色/浅色主题切换正常工作（使用现有主题系统）

## 8. 可访问性实现

- [x] 8.1 添加语义化 HTML 结构
- [x] 8.2 为所有交互元素添加 ARIA 标签
- [x] 8.3 实现键盘导航支持（Tab 键顺序）
- [x] 8.4 添加焦点环样式（focus-visible）
- [x] 8.5 验证色彩对比度 ≥ 4.5:1（使用现有主题配色）
- [x] 8.6 确保屏幕阅读器兼容性

## 9. 图标集成

- [x] 9.1 从 @phosphor-icons/react 导入所需图标（GithubLogo、GoogleLogo、Sparkle 等）
- [x] 9.2 配置图标样式（weight="bold" 或 "fill"）
- [x] 9.3 确保图标在不同主题下的显示正常

## 10. 国际化支持

- [x] 10.1 创建 `locales/zh/common.json` - 添加登录相关中文翻译
- [x] 10.2 创建 `locales/en/common.json` - 添加登录相关英文翻译
- [x] 10.3 在组件中集成 `useTranslations` hook
- [x] 10.4 确保所有文本都支持多语言

## 11. 导航集成

- [x] 11.1 更新 `components/auth/LoginButton.tsx` - 链接到新登录页面
- [x] 11.2 确保移动端和桌面端都能正确跳转到登录页
- [ ] 11.3 测试从各个页面跳转到登录页的路径（需要运行时测试）

## 12. 测试与验证

- [ ] 12.1 手动测试 GitHub OAuth 登录流程
- [ ] 12.2 手动测试 Google OAuth 登录流程
- [ ] 12.3 测试已登录用户访问登录页的重定向
- [ ] 12.4 测试登录成功后的重定向（包括 callbackUrl）
- [ ] 12.5 测试错误场景（取消授权、网络错误、配置错误）
- [ ] 12.6 使用 Lighthouse 进行性能测试（目标 ≥ 90 分）
- [ ] 12.7 使用 axe DevTools 进行可访问性测试
- [ ] 12.8 在移动设备和桌面设备上进行视觉回归测试
- [ ] 12.9 测试键盘导航和屏幕阅读器兼容性
- [ ] 12.10 测试深色/浅色主题切换

## 13. 文档与部署

- [ ] 13.1 更新相关文档，说明新登录页面
- [ ] 13.2 验证生产环境配置（OAuth 凭据、环境变量）
- [ ] 13.3 部署到预发布环境进行最终验证
- [ ] 13.4 监控错误日志和用户反馈
- [ ] 13.5 部署到生产环境

## 14. 可选增强（未来迭代）

- [ ] 14.1 添加视觉区域的装饰性图形动画
- [ ] 14.2 添加社交证明功能（显示用户数量）
- [ ] 14.3 添加更多 OAuth 提供商（如 Twitter、Microsoft）
- [ ] 14.4 优化移动端视觉区域的视觉效果
