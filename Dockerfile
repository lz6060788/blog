
FROM node:20-alpine

RUN apk add --no-cache python3 make g++ sqlite openssl
WORKDIR /app

# 设置时区等环境
ENV TZ=Asia/Shanghai
# 先不设置 NODE_ENV=production，因为这会导致 npm i 忽略 devDependencies
# ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 复制依赖定义
COPY package.json ./

# 安装所有依赖（包括 devDependencies，因为 build 需要它们）
RUN npm i

# 恢复生产环境变量（如果在运行时需要）
ENV NODE_ENV=production

# 复制源码
COPY . .

# 暴露端口
EXPOSE 3000

CMD ["sh", "-c", "npx drizzle-kit migrate && npm run build && npm start"]
