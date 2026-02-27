# Implementation Tasks

## 1. 主页用户菜单修改
**File**: `components/auth/UserMenu.tsx`

- [x] 将"个人资料"菜单项改为"管理端"
- [x] 使用 `Link` 组件包装，导航到 `/admin`
- [x] 移除 `User` 图标，可使用 `Layout` 或 `Settings` 图标
- [x] 更新菜单项文本

**位置**: 第53-58行

```tsx
// 当前代码:
<DropdownMenuItem asChild>
  <button className="flex w-full items-center gap-2">
    <User className="h-4 w-4" />
    个人资料
  </button>
</DropdownMenuItem>

// 修改为:
import Link from 'next/link'
import { Layout } from '@phosphor-icons/react'

<DropdownMenuItem asChild>
  <Link href="/admin" className="flex w-full items-center gap-2">
    <Layout className="h-4 w-4" />
    管理端
  </Link>
</DropdownMenuItem>
```

## 2. 管理端顶部导航栏修改
**File**: `components/admin/top-bar.tsx`

- [x] 添加 `useSession` hook 导入
- [x] 移除硬编码的 `user` 对象（第38-43行）
- [x] 使用 `const { data: session } = useSession()` 获取用户信息
- [x] 更新所有 `user.name` 和 `user.email` 引用为 `session.user.name` 和 `session.user.email`
- [x] 移除"个人资料"菜单项（第106-112行）
- [x] 添加空值处理（`session?.user`）

**位置**:
- 导入区（第1-17行）
- User 对象定义（第38-43行）
- 用户信息引用（第45-50行、第82-87行、第99-100行）
- 个人资料菜单项（第106-112行）

```tsx
// 修改导入
import { useSession } from 'next-auth/react'

// 替换 user 对象
const { data: session } = useSession()
const user = session?.user || { name: 'User', email: '', image: null }

// 移除第106-112行的个人资料菜单项及其分隔线
```

## 3. 管理端首页快捷操作悬浮样式
**File**: `app/admin/page.tsx`

- [x] 为快捷操作卡片的标题添加 `group-hover:text-theme-text-canvas`
- [x] 为快捷操作卡片的描述添加 `group-hover:text-theme-text-secondary`

**位置**: 第96-106行

```tsx
// 当前代码:
<h3 className="font-medium text-theme-text-canvas">{action.label}</h3>
<p className="text-sm text-theme-text-tertiary">{action.description}</p>

// 修改为:
<h3 className="font-medium text-theme-text-canvas group-hover:text-theme-text-canvas transition-colors">
  {action.label}
</h3>
<p className="text-sm text-theme-text-tertiary group-hover:text-theme-text-secondary transition-colors">
  {action.description}
</p>
```

## 4. 测试验证
- [ ] 主页登录后点击用户头像，验证"管理端"选项显示且可正常跳转
- [ ] 管理端顶部导航栏显示正确的用户信息（名称和邮箱）
- [ ] 管理端用户菜单不包含"个人资料"选项
- [ ] 管理端首页快捷操作卡片悬浮时，文字颜色变化且保持可读性
- [ ] 退出登录功能正常工作
