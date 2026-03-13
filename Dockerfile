
FROM node:20-alpine

RUN apk add --no-cache python3 make g++ sqlite openssl
WORKDIR /app

# 设置时区等环境
ENV TZ=Asia/Shanghai
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 复制依赖定义
COPY package.json ./

RUN npm ci

# 复制源码
COPY . .

# 暴露端口
EXPOSE 3000

CMD ["sh", "-c", "npx drizzle-kit migrate && npm run build && npm start"]
