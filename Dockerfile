# 多阶段构建 - 依赖安装阶段
FROM node:20-alpine AS deps

# 安装构建 better-sqlite3 所需的依赖
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite

# 设置工作目录
WORKDIR /app

# 配置 npm 使用淘宝镜像源
RUN npm config set registry https://mirrors.tencent.com/npm/

# 复制 package 文件
COPY package.json ./

# 安装依赖
RUN npm i

# 多阶段构建 - 构建阶段
FROM node:20-alpine AS builder

# 安装构建工具和运行时依赖
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite

# 设置工作目录
WORKDIR /app

# 配置 npm 使用淘宝镜像源
RUN npm config set registry https://mirrors.tencent.com/npm/

# 从 deps 阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY . .

COPY .env.production .env.local

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_FILE="/app/data/db.sqlite"

# 构建应用
RUN npm run build

# 多阶段构建 - 运行阶段
FROM node:20-alpine AS runner

# 安装运行时依赖
RUN apk add --no-cache sqlite openssl

# 设置工作目录
WORKDIR /app

# 复制 package 文件并安装生产依赖（不再从 builder 拷贝 node_modules）
COPY package.json ./
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm config set registry https://mirrors.tencent.com/npm/ \
    && npm i --omit=dev \
    && npm cache clean --force \
    && apk del .build-deps

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_FILE="/app/data/db.sqlite"

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 复制数据库配置和初始化脚本
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/init-db.mjs ./init-db.mjs

# 更改文件所有者
RUN chown -R nextjs:nodejs /app

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 启动前仅执行数据库迁移
CMD ["sh", "-c", "npx drizzle-kit migrate && node server.js"]
