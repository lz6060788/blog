FROM node:20-alpine

RUN sed -i 's|dl-cdn.alpinelinux.org|mirrors.ustc.edu.cn|g' /etc/apk/repositories \
  && apk update \
  && apk add --no-cache python3 make g++ openssl

WORKDIR /app

ENV TZ=Asia/Shanghai
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

ENV NODE_ENV=production

COPY . .

# Windows checkouts may use CRLF; the container entrypoint must be POSIX text.
RUN sed -i 's/\r$//' docker/entrypoint.sh

EXPOSE 3000

CMD ["sh", "docker/entrypoint.sh"]
