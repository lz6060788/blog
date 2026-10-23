# 博客访问统计

公开页面由 `components/analytics/analytics-tracker.tsx` 采集，管理端 `/admin/analytics` 通过服务端鉴权读取 PostgreSQL 聚合结果。数据从接入之后开始累计，不回填历史访问量。

## 模块边界

页面仅通过 SDK 的 Reporter 发送 HTTP 事件。后端接收、统计存储和聚合查询各自承担独立职责：

```text
浏览器 SDK / Reporter
  → POST /api/analytics/events                    HTTP 入口
  → server/analytics/ingestion.ts                 来源、大小、字段、登录状态与限流校验
  → server/analytics/repository.ts · collect()    幂等落库与累计阅读更新
  → PostgreSQL analytics_events

/admin/analytics
  → 管理员鉴权
  → server/analytics/repository.ts · report()     统计聚合
  → AnalyticsDashboard                           可视化呈现
```

浏览器模块不引用数据库、数据库凭证或服务端 Repository。接收模块通过依赖注入调用统计存储，管理端只读取聚合结果；采集 HTTP 接口不提供读取能力。

## 接入与迁移

1. 安装依赖 `npm ci`，确认 `DATABASE_URL`、`ADMIN_EMAIL` 和认证配置有效。
2. 使用既有流程执行 `npm run db:migrate`。`0004_thick_sinister_six.sql` 仅新增 `analytics_events` 及索引。
3. `app/[locale]/layout.tsx` 已挂载 `<AnalyticsTracker />`，无需额外 SessionProvider。
4. 阅读进度以公开文章正文的 `data-article-content` 容器为范围，兼容回退到 `article` 元素。
5. 使用未登录浏览器访问公开页面、打开文章并停留/滚动，再登录 `/admin/analytics` 查看。检查日期范围、空数据和手机视图。

SDK 固定为 [`@irises/front-tracker-sdk@1.0.5`](https://github.com/lz6060788/front-tracker-sdk)。已核对 `Tracker`、`TrackerReporter` 真实源码。使用 `new Tracker()` 与自定义 Reporter：SDK 的 `submit('action', data)` 会附加完整 URL、UA、标题与 referrer，自定义 Reporter 只复制经过严格白名单验证的 `data`。内置 Reporter 默认 image、持久化原始队列，本接入使用同源 JSON POST、有限内存队列、三次失败上限以及隐藏/离开时的 sendBeacon。

## 指标口径

- **PV**：每次进入已知公开路由计一次，语言前缀合并；SPA 路由切换计新访问，query/hash 变化不另计。
- **匿名访客**：sessionStorage 随机 ID，同一标签页访问间隔 30 分钟内复用。跨标签页、浏览器、设备不合并，因此是匿名会话估算，不等于独立自然人。
- **文章阅读**：每 15 秒、页面隐藏/离开、路由卸载时上报可见停留与最大进度。每次阅读使用同一事件 ID，数据库只保留最大累计值，避免重试与晚到请求重复累计。平均值只覆盖收到阅读样本的访问。
- **点击**：只记录打开文章、公开导航、外部 HTTP(S) 链接三类，不记录链接目的地、文本或输入内容。
- **来源/设备**：来源只保留域名、直接访问或站内跳转；设备按视口分为手机、平板、桌面。来源分布取前 8 个来源，页面排行取前 10 个页面。
- **日期**：北京时间自然日，支持近 7 / 30 / 90 天，包含当天。

任何登录用户均不采集；服务端也排除已登录请求。管理端页面在查询前执行 `auth()` 并核对 `ADMIN_EMAIL`，没有公开读取明细的 API。采集支持 DNT/GPC；`localStorage.setItem('blog.analytics.disabled', 'true')` 可在当前浏览器禁用，刷新后生效。未启用 console、错误文本、资源 URL 或全量自动点击插件。

## 采集接口与运维

`POST /api/analytics/events` 接收 `{ events: [...] }`。每批最多 20 条、24 KiB，要求同源 Origin、JSON、同一会话和批内唯一 ID；字段类型、公开路径、设备、点击类别和数值范围严格验证。事件时间采用服务端接收时间。事件 ID 幂等；阅读更新还核对会话、访问和路径。页面浏览不受阅读 checkpoint 更新影响。

接口有按来源地址哈希的进程内限流（每分钟 120 次请求、最多 2000 个短期 key）；地址不写库。多实例部署需在可信反向代理配置独立限流，并覆盖客户端传入的 `X-Real-IP` / `X-Forwarded-For`。此公开匿名接口的流量仍可能被自动化伪造，适合博客运营参考，不用于计费。没有数据库 IP、登录身份或原始 SDK 元数据。

当前原始事件表不自动清理。按站点保留策略可定期执行 `DELETE FROM analytics_events WHERE created_at < now() - interval '180 days';`，清理会同步影响历史统计。数据库备份和索引维护沿用现有 PostgreSQL 运维流程。新功能没有改动历史 `posts.views` 字段，其历史含义不并入埋点统计。

## 验证

`npx tsx --test tests/analytics.test.ts` 在内存 PGlite 中执行全部迁移，覆盖源/字段/体积校验、登录排除、Reporter 白名单与请求并发、重复与乱序 checkpoint、PV/匿名会话去重、日期窗口和真实聚合。测试不会读取 `.env` 或连接真实数据库。
