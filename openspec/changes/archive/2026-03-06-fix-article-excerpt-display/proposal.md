## Why

当前文章详情页在标题下方显示的是文章内容的截断，而不是文章摘要（excerpt）。这导致用户体验不佳，因为摘要通常是精心编写的简短描述，而内容截断可能在不合适的位置断开，显示效果差。需要在标题下方正确显示文章摘要。

## What Changes

- **修改文章详情页布局**：标题下方应显示文章摘要，而不是内容截断
- **调整内容区域**：文章正文内容应在摘要下方单独显示
- **保持现有功能**：封面、元数据、AI 摘要等功能不受影响

## Capabilities

### Modified Capabilities

- `ssr-article-page`: 修改文章详情页内容区域的要求，明确摘要应在标题下方显示

## Impact

**受影响文件**：
- `app/[locale]/post/[id]/page.tsx` - 文章详情页
- `components/public/posts/article-wrapper.tsx` - 文章包装组件

**不影响**：
- SEO 元数据（已正确使用 excerpt）
- 封面显示
- AI 摘要功能
- 其他页面组件
