import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import { authoringService } from '@/server/services/authoring.service'
import { mcpUploadService } from '@/server/services/mcp-upload.service'

const previewOutputSchema = {
  postId: z.string(),
  draftId: z.string().nullable(),
  sourcePostId: z.string().nullable(),
  documentType: z.enum(['draft', 'published']),
  title: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  published: z.boolean(),
  coverImageUrl: z.string().nullable(),
  editorUrl: z.string(),
  publicUrl: z.string().nullable(),
}

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
})

const createdCategoryOutputSchema = {
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
}

const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
})

const seriesSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
})

const postSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  excerpt: z.string().nullable(),
  published: z.boolean(),
  category: categorySchema.nullable(),
  series: seriesSchema.nullable(),
  seriesOrder: z.number().nullable(),
  hasDraft: z.boolean().optional(),
  tags: z.array(tagSchema),
  readTime: z.number(),
  coverImageUrl: z.string().nullable(),
  publishedDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  editorUrl: z.string(),
  publicUrl: z.string().nullable(),
})

const postDetailOutputSchema = {
  postId: z.string(),
  title: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  published: z.boolean(),
  category: categorySchema.nullable(),
  series: seriesSchema.nullable(),
  seriesOrder: z.number().nullable(),
  tags: z.array(tagSchema),
  readTime: z.number(),
  wordCount: z.number(),
  coverImageUrl: z.string().nullable(),
  publishedDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  editorUrl: z.string(),
  publicUrl: z.string().nullable(),
}

function previewResult(preview: any) {
  const isDraft = preview.post.documentType === 'draft' || !preview.post.published
  return {
    postId: preview.post.id,
    draftId: isDraft ? preview.post.id : null,
    sourcePostId: preview.post.postId || (isDraft ? null : preview.post.id),
    documentType: isDraft ? 'draft' as const : 'published' as const,
    title: preview.post.title,
    content: preview.post.content || '',
    excerpt: preview.post.excerpt || null,
    published: Boolean(preview.post.published),
    coverImageUrl: preview.post.coverImageUrl || null,
    editorUrl: preview.editorUrl,
    publicUrl: preview.publicUrl,
  }
}

function postDetailResult(preview: any) {
  const post = preview.post
  return {
    postId: post.id,
    title: post.title,
    content: post.content || '',
    excerpt: post.excerpt || null,
    published: Boolean(post.published),
    category: post.category || null,
    series: post.series || null,
    seriesOrder: post.seriesOrder ?? null,
    tags: post.tags || [],
    readTime: post.readTime || 0,
    wordCount: post.wordCount || (post.content || '').length,
    coverImageUrl: post.coverImageUrl || null,
    publishedDate: post.publishedDate || null,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    editorUrl: preview.editorUrl,
    publicUrl: preview.publicUrl,
  }
}

function successResult(message: string, structuredContent: Record<string, unknown>) {
  return {
    content: [{ type: 'text' as const, text: message }],
    structuredContent,
  }
}

function errorResult(error: unknown) {
  const message = error instanceof Error ? error.message : '博客工具执行失败'
  return {
    isError: true,
    content: [{ type: 'text' as const, text: message }],
  }
}

export function createBlogMcpServer(userId: string): McpServer {
  const server = new McpServer({
    name: 'personal-blog-authoring',
    version: '0.5.0',
  })

  server.registerTool(
    'get_blog_context',
    {
      title: 'Get blog context',
      description: 'Read the blog language, draft workflow, internal-link syntax, series, categories, tags, and authoring limits before composing a post.',
      outputSchema: {
        language: z.string(),
        contentFormat: z.string(),
        maxTags: z.number(),
        internalLinks: z.object({ authoringStyle: z.string(), storedSyntax: z.string(), note: z.string() }),
        draftWorkflow: z.object({ newArticle: z.string(), revision: z.string() }),
        categories: z.array(z.object({ id: z.string(), name: z.string(), slug: z.string() })),
        tags: z.array(z.object({ id: z.string(), name: z.string(), slug: z.string() })),
        series: z.array(z.object({ id: z.string(), name: z.string(), slug: z.string(), description: z.string().nullable(), postCount: z.number() })),
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async () => {
      try {
        const context = await authoringService.getBlogContext()
        return successResult('已读取博客创作上下文。', context)
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'create_category',
    {
      title: 'Create blog category',
      description: 'Create a reusable blog category. The slug is optional and will be generated from the name when omitted. Use get_blog_context first to avoid duplicates.',
      inputSchema: {
        name: z.string().trim().min(1).max(100),
        slug: z.string().trim().min(1).max(100).optional(),
        description: z.string().trim().max(500).optional(),
      },
      outputSchema: createdCategoryOutputSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    async ({ name, slug, description }) => {
      try {
        const result = await authoringService.createCategory({ name, slug, description })
        return successResult(`分类“${result.name}”已创建。`, result)
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'list_series',
    {
      title: 'List article series',
      description: 'List reusable article series and their current published article counts.',
      inputSchema: {},
      outputSchema: {
        series: z.array(z.object({
          id: z.string(), name: z.string(), slug: z.string(), description: z.string().nullable(),
          postCount: z.number(), createdAt: z.string(), updatedAt: z.string(),
        })),
      },
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async () => {
      try {
        const values = await authoringService.listSeries(userId)
        return successResult('已读取文章专题。', { series: values.map((item) => ({ ...item, postCount: Number(item.postCount) })) })
      } catch (error) { return errorResult(error) }
    },
  )

  server.registerTool(
    'create_series',
    {
      title: 'Create article series',
      description: 'Create a reusable ordered article series. Use its id as seriesId on a draft.',
      inputSchema: {
        name: z.string().trim().min(1).max(120),
        slug: z.string().trim().min(1).max(120).optional(),
        description: z.string().trim().max(1000).optional(),
      },
      outputSchema: { id: z.string(), name: z.string(), slug: z.string(), description: z.string().nullable(), createdAt: z.string(), updatedAt: z.string() },
      annotations: { readOnlyHint: false, openWorldHint: false, destructiveHint: false, idempotentHint: false },
    },
    async (input) => {
      try {
        const result = await authoringService.createSeries(userId, input)
        return successResult(`专题“${result.name}”已创建。`, result)
      } catch (error) { return errorResult(error) }
    },
  )

  server.registerTool(
    'search_internal_posts',
    {
      title: 'Search articles for an internal link',
      description: 'Search published articles and return stable post:UUID Markdown links. Use the returned internalLink directly or replace only its display text.',
      inputSchema: { search: z.string().trim().max(200).optional(), limit: z.number().int().min(1).max(50).optional().default(20) },
      outputSchema: { posts: z.array(z.object({ id: z.string(), title: z.string(), excerpt: z.string().nullable(), category: categorySchema.nullable(), internalLink: z.string() })) },
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async ({ search, limit }) => {
      try {
        const posts = await authoringService.searchInternalPosts(userId, search, limit)
        return successResult(`找到 ${posts.length} 篇可引用文章。`, { posts })
      } catch (error) { return errorResult(error) }
    },
  )

  server.registerTool(
    'create_post_draft',
    {
      title: 'Create blog post draft',
      description: 'Create a private draft after the user asks to save the composed article. Never publishes the article.',
      inputSchema: {
        title: z.string().trim().min(1).max(200),
        content: z.string().trim().min(1).max(300_000).describe('Complete Markdown article body.'),
        excerpt: z.string().trim().min(1).max(500).describe('Short article introduction/summary.'),
        categoryId: z.string().uuid().nullable().optional(),
        seriesId: z.string().uuid().nullable().optional(),
        seriesOrder: z.number().int().min(1).nullable().optional(),
        tags: z.array(z.string().trim().min(1).max(50)).max(3).optional(),
      },
      outputSchema: previewOutputSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    async ({ title, content, excerpt, categoryId, seriesId, seriesOrder, tags }) => {
      try {
        const preview = await authoringService.createDraft(userId, {
          title,
          content,
          excerpt,
          categoryId: categoryId || undefined,
          seriesId: seriesId || undefined,
          seriesOrder: seriesOrder ?? undefined,
          tags,
        })
        const result = previewResult(preview)
        return successResult(`草稿《${result.title}》已创建。`, result)
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'list_posts',
    {
      title: 'List blog posts',
      description: 'List the current author’s published articles, or independent draft instances when status=draft. A published article and its bound revision draft can coexist.',
      inputSchema: {
        status: z.enum(['all', 'draft', 'published']).optional().default('all'),
        search: z.string().trim().max(200).optional(),
        page: z.number().int().min(1).optional().default(1),
        pageSize: z.number().int().min(1).max(100).optional().default(20),
      },
      outputSchema: {
        posts: z.array(postSummarySchema),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async ({ status, search, page, pageSize }) => {
      try {
        const result = await authoringService.listPosts(userId, {
          status,
          search,
          page,
          limit: pageSize,
        })
        return successResult(`已读取第 ${result.page} 页文章，共 ${result.total} 篇。`, result)
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'get_post',
    {
      title: 'Get blog post',
      description: 'Read the complete current author-owned article, including Markdown content, metadata, category, tags, publication state, and updatedAt revision value.',
      inputSchema: { postId: z.string().uuid() },
      outputSchema: postDetailOutputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async ({ postId }) => {
      try {
        const preview = await authoringService.getPost(userId, postId)
        const result = postDetailResult(preview)
        return successResult(`已读取《${result.title}》的完整内容。`, result)
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'update_post',
    {
      title: 'Update blog post',
      description: 'Create or reuse the single revision draft bound to a published article, then apply edits to that draft. The published article remains unchanged until publish_post.',
      inputSchema: {
        postId: z.string().uuid(),
        expectedUpdatedAt: z.string().min(1),
        title: z.string().trim().min(1).max(200).optional(),
        content: z.string().trim().min(1).max(300_000).optional(),
        excerpt: z.string().trim().max(500).optional(),
        categoryId: z.string().uuid().nullable().optional(),
        seriesId: z.string().uuid().nullable().optional(),
        seriesOrder: z.number().int().min(1).nullable().optional(),
        tags: z.array(z.string().trim().min(1).max(50)).max(3).optional(),
      },
      outputSchema: postDetailOutputSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async ({ postId, expectedUpdatedAt, title, content, excerpt, categoryId, seriesId, seriesOrder, tags }) => {
      try {
        const input = { title, content, excerpt, categoryId, seriesId, seriesOrder, tags }
        const changes = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined))
        const preview = await authoringService.updatePost(userId, postId, changes, expectedUpdatedAt)
        const result = postDetailResult(preview)
        return successResult(`文章《${result.title}》已更新。`, result)
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'update_post_draft',
    {
      title: 'Update blog post draft',
      description: 'Update an independent draft instance. postId is the draft instance ID returned by create_post_draft or update_post.',
      inputSchema: {
        postId: z.string().uuid(),
        title: z.string().trim().min(1).max(200).optional(),
        content: z.string().trim().min(1).max(300_000).optional(),
        excerpt: z.string().trim().min(1).max(500).optional(),
        categoryId: z.string().uuid().nullable().optional(),
        seriesId: z.string().uuid().nullable().optional(),
        seriesOrder: z.number().int().min(1).nullable().optional(),
        tags: z.array(z.string().trim().min(1).max(50)).max(3).optional(),
      },
      outputSchema: previewOutputSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async ({ postId, title, content, excerpt, categoryId, seriesId, seriesOrder, tags }) => {
      try {
        const preview = await authoringService.updateDraft(userId, postId, {
          title,
          content,
          excerpt,
          categoryId: categoryId || undefined,
          seriesId: seriesId || undefined,
          seriesOrder: seriesOrder ?? undefined,
          tags,
        })
        const result = previewResult(preview)
        return successResult(`草稿《${result.title}》已更新。`, result)
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  const openAiFileSchema = z.object({
    download_url: z.string().url(),
    file_id: z.string().min(1),
    mime_type: z.string().optional(),
    file_name: z.string().optional(),
  }).strict()

  const base64FileSchema = z.object({
    base64: z.string().min(1).describe('Raw Base64 data or a data:<mime>;base64,... URL.'),
    mime_type: z.string().optional().describe('Required for raw Base64; optional for a typed Data URL.'),
    file_name: z.string().optional(),
  }).strict()

  const mcpFileSchema = z.union([openAiFileSchema, base64FileSchema])

  server.registerTool(
    'upload_post_cover',
    {
      title: 'Upload generated cover to the blog',
      description: 'Upload the final ChatGPT-generated cover image to COS and set posts.coverImageUrl. Use only after image generation and user-requested revisions are complete.',
      inputSchema: {
        postId: z.string().uuid(),
        cover: mcpFileSchema.describe('ChatGPT file reference or Base64 data for the generated cover.'),
        prompt: z.string().trim().max(4000).optional(),
      },
      outputSchema: {
        postId: z.string(),
        url: z.string(),
        key: z.string(),
        filename: z.string(),
        size: z.number(),
        mimeType: z.string(),
        source: z.enum(['chatgpt-file', 'base64']),
        editorUrl: z.string(),
      },
      annotations: {
        readOnlyHint: false,
        openWorldHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
      _meta: {
        'openai/fileParams': ['cover'],
      },
    },
    async ({ postId, cover, prompt }) => {
      try {
        const uploaded = await mcpUploadService.uploadCover({
          postId,
          userId,
          file: cover,
          prompt,
        })
        const preview = await authoringService.getPreview(userId, postId)
        const result = { ...uploaded, editorUrl: preview.editorUrl }
        return successResult('ChatGPT 生成的封面已上传到 COS，并写入文章封面地址。', result)
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'list_post_drafts',
    {
      title: 'List independent post drafts',
      description: 'List new-article drafts and revision drafts. A revision draft includes a non-null postId in its data and does not replace the published article until publication.',
      inputSchema: { search: z.string().trim().max(200).optional(), page: z.number().int().min(1).optional().default(1), pageSize: z.number().int().min(1).max(100).optional().default(20) },
      outputSchema: { posts: z.array(postSummarySchema), total: z.number(), page: z.number(), limit: z.number(), totalPages: z.number(), hasNext: z.boolean(), hasPrev: z.boolean() },
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async ({ search, page, pageSize }) => {
      try {
        const result = await authoringService.listDrafts(userId, { search, page, limit: pageSize })
        return successResult(`已读取 ${result.posts.length} 份草稿。`, result)
      } catch (error) { return errorResult(error) }
    },
  )

  server.registerTool(
    'create_post_revision',
    {
      title: 'Create or get a post revision draft',
      description: 'Create or reuse the one revision draft bound to a published article without changing the live article.',
      inputSchema: { postId: z.string().uuid() },
      outputSchema: postDetailOutputSchema,
      annotations: { readOnlyHint: false, openWorldHint: false, destructiveHint: false, idempotentHint: true },
    },
    async ({ postId }) => {
      try {
        const result = postDetailResult(await authoringService.createRevision(userId, postId))
        return successResult(`已准备《${result.title}》的修订草稿。`, result)
      } catch (error) { return errorResult(error) }
    },
  )

  server.registerTool(
    'get_post_draft',
    {
      title: 'Get post draft',
      description: 'Read one independent draft instance by its draft ID.',
      inputSchema: { draftId: z.string().uuid() },
      outputSchema: postDetailOutputSchema,
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async ({ draftId }) => {
      try {
        const result = postDetailResult(await authoringService.getDraft(userId, draftId))
        return successResult(`已读取草稿《${result.title}》。`, result)
      } catch (error) { return errorResult(error) }
    },
  )

  server.registerTool(
    'upload_file',
    {
      title: 'Upload file to COS',
      description: 'Upload a client-provided file to COS and return only its public URL. Supports common images, audio, video including MP4, and documents. The caller decides how to use the URL.',
      inputSchema: {
        file: mcpFileSchema.describe('Client file reference or Base64 data to upload to COS.'),
      },
      outputSchema: {
        url: z.string(),
      },
      annotations: {
        readOnlyHint: false,
        openWorldHint: true,
        destructiveHint: false,
        idempotentHint: false,
      },
      _meta: {
        'openai/fileParams': ['file'],
      },
    },
    async ({ file }) => {
      try {
        const result = await mcpUploadService.uploadFile(file)
        return successResult('文件已上传到 COS。', result)
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'get_post_preview',
    {
      title: 'Get post preview',
      description: 'Read the current saved article, cover, and preview URLs for final review.',
      inputSchema: { postId: z.string().uuid() },
      outputSchema: previewOutputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async ({ postId }) => {
      try {
        const preview = await authoringService.getPreview(userId, postId)
        const result = previewResult(preview)
        return successResult(`已读取《${result.title}》的最新预览。`, result)
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'publish_post',
    {
      title: 'Publish blog post',
      description: 'Publish a reviewed draft instance. A new-article draft creates the published article; a revision draft atomically updates its bound article; the draft is deleted after success.',
      inputSchema: {
        postId: z.string().uuid(),
        confirm: z.literal(true).describe('Must be true after explicit user confirmation.'),
      },
      outputSchema: previewOutputSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async ({ postId }) => {
      try {
        const preview = await authoringService.publish(userId, postId)
        const result = previewResult(preview)
        return successResult(`《${result.title}》已发布。`, result)
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  return server
}
