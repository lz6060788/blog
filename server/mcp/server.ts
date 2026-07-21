import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import { authoringService } from '@/server/services/authoring.service'
import { mcpUploadService } from '@/server/services/mcp-upload.service'

const previewOutputSchema = {
  postId: z.string(),
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

const tagSchema = z.object({
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
  return {
    postId: preview.post.id,
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
    version: '0.3.0',
  })

  server.registerTool(
    'get_blog_context',
    {
      title: 'Get blog context',
      description: 'Read the blog language, content format, categories, tags, and authoring limits before composing a post.',
      outputSchema: {
        language: z.string(),
        contentFormat: z.string(),
        maxTags: z.number(),
        categories: z.array(z.object({ id: z.string(), name: z.string(), slug: z.string() })),
        tags: z.array(z.object({ id: z.string(), name: z.string(), slug: z.string() })),
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
    'create_post_draft',
    {
      title: 'Create blog post draft',
      description: 'Create a private draft after the user asks to save the composed article. Never publishes the article.',
      inputSchema: {
        title: z.string().trim().min(1).max(200),
        content: z.string().trim().min(1).max(300_000).describe('Complete Markdown article body.'),
        excerpt: z.string().trim().min(1).max(500).describe('Short article introduction/summary.'),
        categoryId: z.string().uuid().nullable().optional(),
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
    async ({ title, content, excerpt, categoryId, tags }) => {
      try {
        const preview = await authoringService.createDraft(userId, {
          title,
          content,
          excerpt,
          categoryId: categoryId || undefined,
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
      description: 'List the current author’s posts with pagination. Supports all posts, drafts only, published only, and full-text search. Use this before selecting an article to read or edit.',
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
      description: 'Edit an existing author-owned draft or published article. Read it with get_post first and pass its exact updatedAt as expectedUpdatedAt to prevent overwriting newer changes.',
      inputSchema: {
        postId: z.string().uuid(),
        expectedUpdatedAt: z.string().min(1),
        title: z.string().trim().min(1).max(200).optional(),
        content: z.string().trim().min(1).max(300_000).optional(),
        excerpt: z.string().trim().max(500).optional(),
        categoryId: z.string().uuid().nullable().optional(),
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
    async ({ postId, expectedUpdatedAt, title, content, excerpt, categoryId, tags }) => {
      try {
        const input = { title, content, excerpt, categoryId, tags }
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
      description: 'Update an existing private draft in response to the user’s requested revisions.',
      inputSchema: {
        postId: z.string().uuid(),
        title: z.string().trim().min(1).max(200).optional(),
        content: z.string().trim().min(1).max(300_000).optional(),
        excerpt: z.string().trim().min(1).max(500).optional(),
        categoryId: z.string().uuid().nullable().optional(),
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
    async ({ postId, title, content, excerpt, categoryId, tags }) => {
      try {
        const preview = await authoringService.updateDraft(userId, postId, {
          title,
          content,
          excerpt,
          categoryId: categoryId || undefined,
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
      description: 'Publish a reviewed draft. Call only after the user explicitly confirms publication in the current conversation.',
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
