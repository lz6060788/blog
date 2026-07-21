# 远程服务器部署更新指南（非首次部署）

本文适用于服务器上已经运行本博客，并通过 Docker Compose 和 Traefik 对外提供服务的场景。首次安装、数据库初始化、Traefik 网络创建和 OAuth 应用配置不在本文范围内。

## 1. 本次更新说明

- 目标分支：`main`
- 目标提交：`179ccc8 refactor: simplify MCP uploads and remove asset table`
- 本次更新不新增数据库表，也没有新的数据库迁移文件。
- `post_assets` 表方案已移除；封面仍写入 `posts.cover_image_url`，通用文件上传到 COS 后仅返回 URL。
- MCP 新增和完善了文章查询、编辑及通用文件上传能力。
- 开发环境和生产环境共用数据库时，本次更新不需要手工执行 `db:generate`，也不要在服务器生成迁移文件。

当前容器启动命令会自动执行 `npx drizzle-kit migrate`。由于本次代码仅保留原有两份基线迁移，已完成基线迁移的数据库不会发生结构变化。

## 2. 更新前检查

登录服务器并进入项目目录。下文的 `/opt/blog` 请替换为服务器上的真实路径：

```bash
cd /opt/blog
git status --short --branch
git branch --show-current
git remote -v
docker compose ps
```

应确认：

- 当前分支为 `main`；
- 工作区没有未提交的服务器本地代码修改；
- `blog` 容器处于运行状态；
- `.env.production` 存在且没有被 Git 跟踪。

检查环境文件是否包含本次 MCP 所需的变量名。以下命令只显示变量名，不显示密钥值：

```bash
grep -E '^(DATABASE_URL|ADMIN_EMAIL|BLOG_PUBLIC_URL|BLOG_MCP_API_TOKEN|MCP_ALLOWED_ORIGINS|MCP_FILE_DOWNLOAD_HOSTS)=' .env.production \
  | cut -d= -f1
```

至少确认：

```dotenv
DATABASE_URL=postgres://...
ADMIN_EMAIL=管理员邮箱
BLOG_PUBLIC_URL=https://blog.theirises.cn
BLOG_MCP_API_TOKEN=至少32字符的独立随机密钥
MCP_ALLOWED_ORIGINS=https://chatgpt.com,https://chat.openai.com
MCP_FILE_DOWNLOAD_HOSTS=允许MCP下载临时文件的域名列表
```

`MCP_FILE_DOWNLOAD_HOSTS` 只填写域名，不填写协议或路径，多个域名使用英文逗号分隔。不要把 `.env.production` 或 Token 提交到 Git。

## 3. 更新前备份

### 3.1 记录当前版本

```bash
git rev-parse HEAD
git log -1 --oneline
```

保存输出的旧提交号，以便故障时回滚。

### 3.2 备份数据库

本次更新没有数据库结构变化，但生产更新前仍建议执行 PostgreSQL 逻辑备份：

```bash
pg_dump --format=custom --file=blog-before-update.dump 'postgres://USER:PASSWORD@HOST:PORT/DBNAME'
```

备份完成后检查文件存在且大小不为 0：

```bash
ls -lh blog-before-update.dump
```

如果数据库由云厂商托管，也可以先创建一次手工快照。由于开发和生产共用同一数据库，只需针对这一个数据库备份一次。

## 4. 拉取代码

先获取远端信息并查看即将部署的提交：

```bash
git fetch origin
git log --oneline HEAD..origin/main
```

确认更新内容后，使用快进方式更新，避免服务器上意外产生合并提交：

```bash
git pull --ff-only origin main
git log -1 --oneline
```

本次更新后，最后一条提交应为：

```text
179ccc8 refactor: simplify MCP uploads and remove asset table
```

再次确认生产环境文件仍然存在：

```bash
test -f .env.production && echo '.env.production exists'
```

## 5. 重建并启动容器

执行：

```bash
docker compose up -d --build blog
```

该命令会构建新镜像并重建 `blog` 容器。新容器启动后会依次执行：

```text
drizzle-kit migrate → next build → next start
```

因此容器刚启动时应用不会立刻可访问。查看日志并等待构建完成：

```bash
docker compose logs --tail=200 -f blog
```

看到 Next.js 已启动且没有迁移、构建或数据库连接错误后，按 `Ctrl+C` 退出日志跟踪。退出日志不会停止容器。

然后检查状态：

```bash
docker compose ps
docker compose logs --tail=100 blog
```

## 6. 部署验收

### 6.1 网站与反向代理

```bash
curl -I https://blog.theirises.cn
```

应返回正常的 HTTP 响应，且不应出现 `502` 或 `503`。

如果需要绕过 Traefik检查容器内部服务：

```bash
docker compose exec blog wget -S -O /dev/null http://127.0.0.1:3000 2>&1
```

### 6.2 MCP 连通性

先发送不带 Token 的 HTTP 请求，确认鉴权入口正常：

```bash
curl -sS -o /dev/null -w '%{http_code}\n' \
  -X POST https://blog.theirises.cn/api/mcp \
  -H 'Content-Type: application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"http-health-check","version":"1.0.0"}}}'
```

预期状态码为 `401`。这表示 HTTP 路由正常，且 Bearer Token 鉴权正在生效。

然后通过终端安全读取 Token，并发送标准 MCP 初始化请求：

```bash
read -rsp 'BLOG_MCP_API_TOKEN: ' BLOG_MCP_CHECK_TOKEN
echo

curl -sS -X POST https://blog.theirises.cn/api/mcp \
  -H "Authorization: Bearer ${BLOG_MCP_CHECK_TOKEN}" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'MCP-Protocol-Version: 2025-11-25' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"http-health-check","version":"1.0.0"}}}'

unset BLOG_MCP_CHECK_TOKEN
```

预期返回 HTTP `200` 和包含以下信息的 JSON：

```text
result.protocolVersion
result.serverInfo.name
result.serverInfo.version
```

该检查只执行 MCP 握手，不创建、修改或发布文章，也不依赖镜像中的本地脚本。

### 6.3 功能检查

建议在管理后台完成以下检查：

- 能正常登录并打开文章列表；
- 能读取和编辑已有草稿；
- 已发布文章正常展示；
- 封面图片仍能正常显示；
- MCP 的 `upload_file` 返回 COS URL，不返回 Markdown，也不写入额外业务表。

## 7. 故障排查

### 容器反复重启

```bash
docker compose ps
docker compose logs --tail=300 blog
```

重点检查 `.env.production`、`DATABASE_URL`、数据库网络连通性、依赖安装和 Next.js 构建错误。

### MCP 返回 401

确认客户端与服务器使用相同的 `BLOG_MCP_API_TOKEN`，请求头格式为：

```http
Authorization: Bearer <BLOG_MCP_API_TOKEN>
```

修改 `.env.production` 后必须重建或重启容器，使环境变量重新载入：

```bash
docker compose up -d --force-recreate blog
```

### MCP 返回 403

确认 `ADMIN_EMAIL` 对应的用户已经登录过博客，并且该邮箱存在于 `users` 表中。

### 文件上传失败

检查：

- COS 相关环境变量是否完整；
- 临时文件 URL 是否为公网 HTTPS 地址；
- 下载域名是否列入 `MCP_FILE_DOWNLOAD_HOSTS`；
- 文件类型和大小是否满足限制；
- 视频不超过 100MB、音频不超过 50MB、图片和文档不超过 10MB。

## 8. 代码回滚

如果新版本无法正常运行，先从第 3.1 节取出更新前记录的旧提交号，然后执行：

```bash
git switch --detach <更新前的提交号>
docker compose up -d --build blog
docker compose logs --tail=200 -f blog
```

确认旧版本恢复后，再决定修复方案。以后重新部署 `main` 时执行：

```bash
git switch main
git pull --ff-only origin main
docker compose up -d --build blog
```

注意：代码回滚不会自动回滚数据库迁移。若未来某次更新包含数据库迁移，应单独评估迁移的向后兼容性和数据库恢复方案。本次 `179ccc8` 更新不包含新迁移，因此不存在新增表结构的回滚问题。

## 9. 本次更新命令速查

确认服务器工作区干净且 `.env.production` 正确后，本次更新的核心命令为：

```bash
cd /opt/blog
git fetch origin
git pull --ff-only origin main
git log -1 --oneline
docker compose up -d --build blog
docker compose logs --tail=200 -f blog
curl -I https://blog.theirises.cn
```

网站正常后，按第 6.2 节通过 `/api/mcp` HTTP 请求完成 MCP 验收。
