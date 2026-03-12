# 构建阶段
FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++ sqlite
WORKDIR /app

RUN npm config set registry https://mirrors.tencent.com/npm/
COPY package.json ./
RUN npm i

COPY . .
COPY .env.production .env.local

ENV NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production DATABASE_FILE="/app/data/db.sqlite"
RUN npm run build

# 运行阶段 - 直接使用 standalone 输出
FROM node:20-alpine AS runner

RUN apk add --no-cache sqlite openssl
WORKDIR /app

ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 DATABASE_FILE="/app/data/db.sqlite"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/init-db.mjs ./init-db.mjs

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
CMD ["sh", "-c", "npx drizzle-kit migrate && node server.js"]
