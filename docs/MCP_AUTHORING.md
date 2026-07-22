# ChatGPT / Codex 博客创作 MCP

博客提供一个基于 Streamable HTTP 的 MCP 端点，让 ChatGPT 或 Codex 创建、修改和发布文章，并将对话中生成的封面上传到腾讯云 COS。

## 端点

```text
POST /api/mcp
GET /api/mcp
DELETE /api/mcp
```

请求必须携带：

```http
Authorization: Bearer <BLOG_MCP_API_TOKEN>
```

第一版使用独立 Bearer Token，适用于私有 Codex 或开发连接。公开的 ChatGPT App 上线前，应把认证层替换为 OAuth 2.0 + PKCE；工具名称和参数不需要改变。

## 环境变量

```dotenv
BLOG_MCP_API_TOKEN=<至少 32 字符的随机密钥>
BLOG_PUBLIC_URL=https://your-blog.example.com
MCP_ALLOWED_ORIGINS=https://chatgpt.com,https://chat.openai.com
MCP_FILE_DOWNLOAD_HOSTS=
```

管理员必须先通过博客登录一次，确保 `ADMIN_EMAIL` 对应的用户已经存在于数据库。

## Codex 本地连接

项目内的 `.codex/config.toml` 已注册 `blog_authoring` MCP。本地连接也使用 Streamable HTTP，通过 `http://localhost:3000/api/mcp` 访问与线上相同的 Next.js 路由和 Bearer Token 鉴权。

先启动博客，再运行只读检查：

```bash
npm run dev
npm run mcp:check
```

`.env.local` 中的 `BLOG_MCP_API_TOKEN` 供博客服务端校验；启动 Codex 前，同名环境变量必须包含相同 Token。随后重启 Codex并重新打开此项目。线上或跨机器连接同样使用 `/api/mcp` 和 Bearer Token。

## 可用工具

| 工具 | 作用 | 是否产生写入 |
| --- | --- | --- |
| `get_blog_context` | 获取语言、分类、标签和限制 | 否 |
| `create_category` | 创建可复用的文章分类 | 是 |
| `list_posts` | 按状态、关键词和分页查询当前作者的文章 | 否 |
| `get_post` | 获取文章完整 Markdown 内容与元数据 | 否 |
| `update_post` | 编辑当前作者的草稿或已发布文章 | 是 |
| `create_post_draft` | 创建 Markdown 草稿 | 是 |
| `update_post_draft` | 修改未发布草稿 | 是 |
| `upload_post_cover` | 接收 ChatGPT 文件并上传 COS | 是 |
| `upload_file` | 上传通用文件到 COS，仅返回 URL | 是 |
| `get_post_preview` | 获取当前文章与预览地址 | 否 |
| `publish_post` | 发布已确认的文章 | 是 |

`create_category` 接受必填的 `name`，以及可选的 `slug` 和 `description`。省略 `slug` 时会根据名称自动生成；分类名称或 slug 已存在时会拒绝重复创建。创建成功后返回分类的 `id`、`name`、`slug`、`description`、`createdAt` 和 `updatedAt`。

`publish_post` 的 `confirm` 参数必须为 `true`，并且工具描述要求仅在用户于当前对话明确确认发布后调用。

编辑文章时应先调用 `get_post`，然后把返回的 `updatedAt` 原样作为 `update_post.expectedUpdatedAt`。如果文章在读取后被其他客户端修改，MCP 会拒绝覆盖并要求重新读取。

## 文件传输

`upload_post_cover` 和 `upload_file` 均支持两种输入方式。

### ChatGPT 临时文件引用

两个工具分别将顶层 `cover` 和 `file` 参数声明为 `_meta["openai/fileParams"]`。ChatGPT 可以传入：

```json
{
  "download_url": "https://temporary-file-url.example/...",
  "file_id": "file_...",
  "mime_type": "image/png",
  "file_name": "cover.png"
}
```

使用临时文件引用时，服务端只接受 HTTPS 地址；封面只支持 JPEG、PNG 和 WebP，限制为 10MB，并检查 DNS、重定向、MIME 与文件魔数。验证通过后，文件会上传 COS，封面 URL 直接写入现有的 `posts.cover_image_url`。

### Base64

调用方也可以直接传入原始 Base64：

```json
{
  "file": {
    "base64": "iVBORw0KGgoAAA...",
    "mime_type": "image/png",
    "file_name": "diagram.png"
  }
}
```

或传入带 MIME 的 Data URL，此时 `mime_type` 可以省略：

```json
{
  "file": {
    "base64": "data:image/png;base64,iVBORw0KGgoAAA...",
    "file_name": "diagram.png"
  }
}
```

封面上传时将顶层 `file` 攺为 `cover`，并同时传入 `postId`。Base64 会经过格式、MIME、大小与文件魔数校验；不接受 Base64URL 字符集或包含空白的编码内容。

`upload_file` 是通用文件上传工具，支持常用图片、音频、视频（MP4、MOV、WebM）和文档。工具只返回 COS 公开 URL，不判断 URL 应用于 Markdown、视频、附件还是其他场景；具体用法由 MCP 调用方决定。视频上限为 100MB，音频为 50MB，图片和文档为 10MB。

Base64 编码会增加约三分之一的请求体积并占用更多内存，因此大体积音视频仍建议使用临时 HTTPS 文件引用。

本次 MCP 图片能力复用现有 `posts` 和 COS，不新增数据表，也不需要数据库迁移。
