// @ts-ignore
import { relations } from "drizzle-orm";
import { sqliteTable, text as sqliteText, primaryKey, integer } from "drizzle-orm/sqlite-core";

// ============================================================================
// NextAuth.js 表定义 (SQLite)
// ============================================================================

// 用户表
export const users = sqliteTable("users", {
  id: sqliteText("id").primaryKey(),
  name: sqliteText("name").notNull(),
  email: sqliteText("email").notNull(),
  emailVerified: sqliteText("emailVerified"),
  image: sqliteText("image"),
  createdAt: sqliteText("createdAt").notNull().default(new Date().toISOString()),
  updatedAt: sqliteText("updatedAt").notNull().default(new Date().toISOString()),
});

// 会话表
export const sessions = sqliteTable("sessions", {
  sessionToken: sqliteText("sessionToken").primaryKey(),
  userId: sqliteText("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: sqliteText("expires").notNull(),
});

// 账户表 (OAuth 关联)
export const accounts = sqliteTable("accounts", {
  userId: sqliteText("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: sqliteText("type").notNull(),
  provider: sqliteText("provider").notNull(),
  providerAccountId: sqliteText("providerAccountId").notNull(),
  refresh_token: sqliteText("refresh_token"),
  access_token: sqliteText("access_token"),
  expires_at: sqliteText("expires_at"),
  token_type: sqliteText("token_type"),
  scope: sqliteText("scope"),
  id_token: sqliteText("id_token"),
  session_state: sqliteText("session_state"),
}, (table) => ({
  compoundKey: primaryKey({
    columns: [table.provider, table.providerAccountId],
  }),
}));

// 验证令牌表 (用于邮箱验证等功能，暂时保留但不使用)
export const verificationTokens = sqliteTable("verification_token", {
  identifier: sqliteText("identifier").notNull(),
  token: sqliteText("token").notNull(),
  expires: sqliteText("expires").notNull(),
}, (table) => ({
  compoundKey: primaryKey({
    columns: [table.identifier, table.token],
  }),
}));

// ============================================================================
// 分类和标签表定义
// ============================================================================

// 分类表
export const categories = sqliteTable("categories", {
  id: sqliteText("id").primaryKey(),
  name: sqliteText("name").notNull().unique(),
  slug: sqliteText("slug").notNull().unique(),
  description: sqliteText("description"),
  createdAt: sqliteText("createdAt").notNull().default(new Date().toISOString()),
  updatedAt: sqliteText("updatedAt").notNull().default(new Date().toISOString()),
});

// 标签表
export const tags = sqliteTable("tags", {
  id: sqliteText("id").primaryKey(),
  name: sqliteText("name").notNull().unique(),
  slug: sqliteText("slug").notNull().unique(),
  createdAt: sqliteText("createdAt").notNull().default(new Date().toISOString()),
  updatedAt: sqliteText("updatedAt").notNull().default(new Date().toISOString()),
});

// ============================================================================
// 文章表定义
// ============================================================================

// 文章表
export const posts = sqliteTable("posts", {
  id: sqliteText("id").primaryKey(),
  title: sqliteText("title").notNull(),
  content: sqliteText("content").notNull(),
  excerpt: sqliteText("excerpt"),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  authorId: sqliteText("authorId").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: sqliteText("categoryId").references(() => categories.id, { onDelete: "set null" }),
  readTime: integer("read_time").notNull().default(0),
  publishedDate: sqliteText("published_date"),
  // AI 摘要相关字段
  aiSummary: sqliteText("ai_summary"),
  aiSummaryGeneratedAt: sqliteText("ai_summary_generated_at"),
  aiSummaryStatus: sqliteText("ai_summary_status"), // 'pending' | 'generating' | 'done' | 'failed'
  createdAt: sqliteText("createdAt").notNull().default(new Date().toISOString()),
  updatedAt: sqliteText("updatedAt").notNull().default(new Date().toISOString()),
});

// 文章-标签关联表（多对多）
export const postTags = sqliteTable("post_tags", {
  postId: sqliteText("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  tagId: sqliteText("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => ({
  compoundKey: primaryKey({
    columns: [table.postId, table.tagId],
  }),
}));

// ============================================================================
// AI 配置表定义
// ============================================================================

// AI 模型配置表
export const aiModelConfigs = sqliteTable("ai_model_configs", {
  id: sqliteText("id").primaryKey(),
  name: sqliteText("name").notNull(),
  provider: sqliteText("provider").notNull(), // 'deepseek' | 'zhipu' | 'qwen' | 'moonshot' | 'baichuan' | 'openai'
  model: sqliteText("model").notNull(),
  apiKeyEncrypted: sqliteText("api_key_encrypted").notNull(),
  baseUrl: sqliteText("base_url"),
  maxTokens: integer("max_tokens").notNull().default(300),
  temperature: integer("temperature").notNull().default(7), // stored as integer (0-100, divide by 100 for actual value)
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: sqliteText("created_at").notNull().default(new Date().toISOString()),
  updatedAt: sqliteText("updated_at").notNull().default(new Date().toISOString()),
});

// AI 功能映射表
export const aiFunctionMappings = sqliteTable("ai_function_mappings", {
  id: sqliteText("id").primaryKey(),
  functionName: sqliteText("function_name").notNull().unique(), // 'summary' | 'cover' | 'search'
  modelConfigId: sqliteText("model_config_id").references(() => aiModelConfigs.id, { onDelete: "set null" }),
  createdAt: sqliteText("created_at").notNull().default(new Date().toISOString()),
  updatedAt: sqliteText("updated_at").notNull().default(new Date().toISOString()),
});

// AI 调用日志表
export const aiCallLogs = sqliteTable("ai_call_logs", {
  id: sqliteText("id").primaryKey(),
  postId: sqliteText("post_id").references(() => posts.id, { onDelete: "set null" }),
  modelConfigId: sqliteText("model_config_id").references(() => aiModelConfigs.id, { onDelete: "set null" }),
  action: sqliteText("action").notNull(), // 'generate-summary' | 'generate-cover' etc.
  provider: sqliteText("provider"),
  model: sqliteText("model"),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  status: sqliteText("status").notNull(), // 'success' | 'failed' | 'retrying'
  errorMessage: sqliteText("error_message"),
  durationMs: integer("duration_ms"),
  createdAt: sqliteText("created_at").notNull().default(new Date().toISOString()),
});

// ============================================================================
// 设置表定义
// ============================================================================

// 博客设置表（单例模式，只有一条记录）
export const settings = sqliteTable("settings", {
  id: sqliteText("id").primaryKey().$defaultFn(() => 'default'),
  blogName: sqliteText("blog_name").notNull().default('My Blog'),
  blogDescription: sqliteText("blog_description").notNull().default('A personal blog'),
  postsPerPage: integer("posts_per_page").notNull().default(10),
  // 作者信息字段
  authorName: sqliteText("author_name").notNull().default('Alex Chen'),
  authorAvatar: sqliteText("author_avatar").notNull().default('https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=c0aede'),
  authorBio: sqliteText("author_bio").notNull().default('Designer & Developer crafting digital experiences with code and creativity.'),
  authorLocation: sqliteText("author_location").notNull().default('San Francisco, CA'),
  authorZodiac: sqliteText("author_zodiac").notNull().default('Scorpio ♏'),
  authorEmail: sqliteText("author_email").notNull().default('alex@example.com'),
  authorSocialGithub: sqliteText("author_social_github").default('github.com/alexchen'),
  authorSocialTwitter: sqliteText("author_social_twitter").default('twitter.com/alexchen'),
  authorSocialLinkedin: sqliteText("author_social_linkedin"),
  updatedAt: sqliteText("updatedAt").notNull().default(new Date().toISOString()),
});

// 文章关系定义
export const postRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  tags: many(postTags),
}));

// 分类关系定义
export const categoryRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

// 标签关系定义
export const tagRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

// 文章-标签关联关系定义
export const postTagRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

// 关系定义
export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  posts: many(posts),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const schema = {
  users,
  sessions,
  accounts,
  posts,
  settings,
  categories,
  tags,
  postTags,
  aiModelConfigs,
  aiFunctionMappings,
  aiCallLogs,
};
