# 博客创作 MCP 接入指南

本文说明如何把本项目提供的博客创作 MCP 接入 Codex、其他 MCP 客户端或自建脚本，并完成从读取博客上下文、创建草稿、上传封面到人工确认发布的完整流程。

## 1. 接口概览

博客通过 Next.js Route Handler 暴露 Streamable HTTP MCP：

```text
本地：http://localhost:3000/api/mcp
线上：https://你的博客域名/api/mcp
```

端点接受：

```text
GET /api/mcp
POST /api/mcp
DELETE /api/mcp
OPTIONS /api/mcp
```

每个请求都必须携带 Bearer Token：

```http
Authorization: Bearer <BLOG_MCP_API_TOKEN>
```

一次请求的主要链路如下：

```text
MCP 客户端
  → /api/mcp
  → Bearer Token 鉴权
  → 根据 ADMIN_EMAIL 定位博客管理员
  → 调用博客 Service / Repository
  → PostgreSQL、腾讯云 COS
```

当前实现适合个人使用、可信设备和私有客户端。若要公开发布为第三方 ChatGPT App，应将固定 Bearer Token 替换为 OAuth 2.0 + PKCE。

## 2. 前置条件

接入前确认：

- PostgreSQL 已配置，且迁移已经执行；
- `ADMIN_EMAIL` 对应的管理员至少登录博客一次，`users` 表中已经有该用户；
- 本地依赖已通过 `npm install` 安装；
- 上传封面时，腾讯云 COS 环境变量完整；
- MCP Token 至少 32 个字符。

## 3. 配置博客服务端

在 `.env.local` 或生产环境变量中配置：

```dotenv
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB
ADMIN_EMAIL=your_admin@example.com

# 独立的 MCP Bearer Token，至少 32 字符
BLOG_MCP_API_TOKEN=<随机密钥>

# 用于 MCP 返回编辑链接和文章链接
BLOG_PUBLIC_URL=http://localhost:3000

# 浏览器客户端允许的 Origin
MCP_ALLOWED_ORIGINS=https://chatgpt.com,https://chat.openai.com

# 可选：限制临时图片 URL 的下载域名
MCP_FILE_DOWNLOAD_HOSTS=
```

不要复用数据库密码、OAuth Secret 或 `AUTH_SECRET` 作为 MCP Token。

### 3.1 生成 Token

使用 OpenSSL：

```bash
openssl rand -hex 32
```

使用 PowerShell：

```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToHexString($bytes).ToLowerInvariant()
```

将生成值写入博客服务端的 `BLOG_MCP_API_TOKEN`。不要提交到 Git。

### 3.2 初始化数据库与管理员

```bash
npm run db:migrate
npm run dev
```

随后使用 `ADMIN_EMAIL` 对应账号登录一次博客。MCP 鉴权不仅检查 Token，还会在数据库中寻找这个管理员；若用户不存在，接口会返回 HTTP 403。

## 4. 在 Codex 中接入

在项目的 `.codex/config.toml` 中加入：

```toml
[mcp_servers.blog_authoring]
url = "http://localhost:3000/api/mcp"
bearer_token_env_var = "BLOG_MCP_API_TOKEN"
startup_timeout_sec = 30
tool_timeout_sec = 120
default_tools_approval_mode = "writes"
```

关键点：`bearer_token_env_var` 的值是**环境变量名称**，不能直接填写 Token。

在启动 Codex 的同一环境中设置 Token：

PowerShell：

```powershell
$env:BLOG_MCP_API_TOKEN = "与服务端相同的 Token"
```

Bash：

```bash
export BLOG_MCP_API_TOKEN="与服务端相同的 Token"
```

然后从这个终端启动 Codex，或者确保桌面应用进程能够继承该变量。配置变更后需要完全重启 Codex，并重新打开项目。

线上连接只需替换 URL：

```toml
url = "https://your-blog.example.com/api/mcp"
```

Token 仍通过环境变量提供，不要写入 TOML。

## 5. 使用 SDK 接入自建客户端

项目使用 `@modelcontextprotocol/sdk`。下面是最小只读检查：

```ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const token = process.env.BLOG_MCP_API_TOKEN
if (!token) throw new Error('BLOG_MCP_API_TOKEN 未配置')

const transport = new StreamableHTTPClientTransport(
  new URL('http://localhost:3000/api/mcp'),
  {
    requestInit: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  },
)

const client = new Client({
  name: 'blog-mcp-client',
  version: '0.1.0',
})

try {
  await client.connect(transport)

  const tools = await client.listTools()
  console.log(tools.tools.map((tool) => tool.name))

  const context = await client.callTool({
    name: 'get_blog_context',
    arguments: {},
  })
  console.log(context)
} finally {
  await client.close()
}
```

仓库已提供检查命令：

```bash
npm run mcp:check
```

成功时应发现 9 个工具，并完成 `get_blog_context`、`list_posts` 和 `get_post` 只读调用。

## 6. 可用工具

| 工具 | 用途 | 写入 | 关键限制 |
| --- | --- | --- | --- |
| `get_blog_context` | 查询语言、Markdown 格式、分类、标签和限制 | 否 | 写文章前优先调用 |
| `list_posts` | 按状态、关键词和分页查询当前作者的文章 | 否 | 只返回当前管理员自己的文章 |
| `get_post` | 读取文章完整 Markdown 与元数据 | 否 | 返回编辑所需的 `updatedAt` |
| `update_post` | 编辑草稿或已发布文章 | 是 | 先读取文章，并传入匹配的 `expectedUpdatedAt` |
| `create_post_draft` | 创建私有草稿 | 是 | 标题最多 200 字，正文最多 300,000 字符，摘要最多 500 字 |
| `update_post_draft` | 更新未发布草稿 | 是 | 不能修改已发布文章 |
| `upload_post_cover` | 下载临时图片、上传 COS 并绑定封面 | 是 | 仅 HTTPS；PNG/JPEG/WebP；最大 10MB |
| `get_post_preview` | 回读已保存的文章与预览链接 | 否 | 需要文章 UUID |
| `publish_post` | 发布已审核草稿 | 是 | 必须传入 `confirm: true`，且用户需在当前对话明确确认 |

每篇文章最多 3 个标签。不存在的标签会在创建草稿时自动创建。

编辑已有文章时，先调用 `get_post`，再把返回的 `updatedAt` 原样传给 `update_post.expectedUpdatedAt`。若文章已被其他客户端修改，服务端会拒绝覆盖并要求重新读取。

## 7. 推荐创作流程

不要跳过预览与确认：

```text
1. get_blog_context
2. list_posts / get_post（编辑已有文章时）
3. 生成和人工审阅 Markdown
4. create_post_draft / update_post
5. upload_post_cover（可选）
6. get_post_preview
7. 用户明确确认发布
8. publish_post
```

### 7.1 创建草稿示例

```json
{
  "title": "文章标题",
  "content": "# Markdown 正文",
  "excerpt": "不超过 500 字的摘要",
  "categoryId": null,
  "tags": ["Three.js", "WebGL"]
}
```

`create_post_draft` 永远只创建草稿，不会自动发布。

### 7.2 更新草稿示例

```json
{
  "postId": "文章 UUID",
  "title": "修改后的标题",
  "content": "# 修改后的正文",
  "tags": ["Three.js", "WebGL", "GPU粒子"]
}
```

### 7.3 发布示例

只有用户在当前对话明确说“确认发布”之后才能调用：

```json
{
  "postId": "文章 UUID",
  "confirm": true
}
```

## 8. 封面上传参数

`upload_post_cover` 不接受本地路径或 Base64。它接受客户端提供的临时 HTTPS 文件引用：

```json
{
  "postId": "文章 UUID",
  "cover": {
    "download_url": "https://temporary-host.example/cover.png",
    "file_id": "file_xxx",
    "mime_type": "image/png",
    "file_name": "cover.png"
  },
  "alt": "封面替代文本",
  "prompt": "生成封面时使用的提示词",
  "idempotencyKey": "article-cover-v1-unique-key"
}
```

服务端会执行：

1. 验证 URL 必须是 HTTPS，且不能指向内网；
2. 检查 DNS 解析和最多 3 次重定向；
3. 校验下载域名白名单；
4. 限制图片为 JPEG、PNG 或 WebP，最大 10MB；
5. 校验响应 MIME 与文件魔数；
6. 上传至腾讯云 COS；
7. 写入 `file_uploads`、`post_assets` 并更新文章封面；
8. 相同 `idempotencyKey` 重试时返回原结果，避免重复上传。

若使用的客户端只能生成本地文件，需要先把文件放到一个临时、公开、HTTPS 可下载的位置，再调用此工具；完成后应删除临时对象。

## 9. CORS 与生产环境

浏览器客户端的 Origin 必须出现在 `MCP_ALLOWED_ORIGINS` 中。服务端允许并暴露以下 MCP 头：

```text
Authorization
Content-Type
MCP-Protocol-Version
MCP-Session-Id
Last-Event-ID
```

生产环境还应做到：

- 仅通过 HTTPS 暴露 `/api/mcp`；
- 定期轮换 `BLOG_MCP_API_TOKEN`；
- 为 MCP Token 使用独立权限边界；
- 在公开多用户场景中改用 OAuth 2.0 + PKCE；
- 为 `MCP_FILE_DOWNLOAD_HOSTS` 配置可信临时文件域名；
- 保留写操作日志和数据库备份；
- 将发布动作保留为显式人工确认。

## 10. 常见错误

### HTTP 401：无效的 MCP Bearer Token

- 客户端 Token 与服务端不一致；
- `Authorization` 没有使用 `Bearer ` 前缀；
- Codex 没有继承 `BLOG_MCP_API_TOKEN`；
- `.codex/config.toml` 把 Token 值误写到了 `bearer_token_env_var`。

### HTTP 403：找不到管理员用户

确认 `ADMIN_EMAIL` 正确，并先使用该邮箱登录博客一次。

### HTTP 503：Token 或管理员邮箱未配置

确认 `BLOG_MCP_API_TOKEN` 至少 32 字符，并设置了 `ADMIN_EMAIL`。

### Codex 中没有出现工具

按顺序检查：

1. `npm run dev` 是否正在运行；
2. `npm run mcp:check` 是否通过；
3. `.codex/config.toml` 是否位于当前项目；
4. `bearer_token_env_var` 是否填写环境变量名；
5. Codex 进程是否继承了同名环境变量；
6. 是否在配置后完全重启 Codex并重新打开项目。

### 封面下载失败

- 地址不是 HTTPS；
- 域名解析到内网地址；
- 域名不在 `MCP_FILE_DOWNLOAD_HOSTS`；
- 图片超过 10MB；
- MIME、扩展名和文件内容不一致；
- 临时 URL 已经过期。

## 11. 验收清单

- [ ] 服务端环境变量已配置且未提交到 Git；
- [ ] 管理员已登录并存在于数据库；
- [ ] `npm run mcp:check` 通过；
- [ ] 客户端能够列出 9 个工具；
- [ ] `get_blog_context` 返回 `zh-CN` 和 `markdown`；
- [ ] 可以创建并回读未发布草稿；
- [ ] 封面上传能够安全写入 COS；
- [ ] 未经明确确认不会调用 `publish_post`；
- [ ] 写操作前已有可验证的数据库备份。
