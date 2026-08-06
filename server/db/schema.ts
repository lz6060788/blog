// @ts-ignore
import { relations } from "drizzle-orm";
import { pgTable, text, primaryKey, integer, uniqueIndex, boolean } from "drizzle-orm/pg-core";

// ============================================================================
// NextAuth.js 表定义 (SQLite)
// ============================================================================

// 用户表
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: text("emailVerified"),
  image: text("image"),
  createdAt: text("createdAt").notNull().default(new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().default(new Date().toISOString()),
});

// 会话表
export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: text("expires").notNull(),
});

// 账户表 (OAuth 关联)
export const accounts = pgTable("accounts", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: text("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => ({
  compoundKey: primaryKey({
    columns: [table.provider, table.providerAccountId],
  }),
}));

// 验证令牌表 (用于邮箱验证等功能，暂时保留但不使用)
export const verificationTokens = pgTable("verification_token", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: text("expires").notNull(),
}, (table) => ({
  compoundKey: primaryKey({
    columns: [table.identifier, table.token],
  }),
}));

// ============================================================================
// 分类和标签表定义
// ============================================================================

// 分类表
export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: text("createdAt").notNull().default(new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().default(new Date().toISOString()),
});

// 标签表
export const tags = pgTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: text("createdAt").notNull().default(new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().default(new Date().toISOString()),
});

// ============================================================================
// 文章表定义
// ============================================================================

// 专题/系列表
export const series = pgTable("series", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

// 文章表
export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  published: boolean("published").notNull().default(false),
  authorId: text("authorId").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: text("categoryId").references(() => categories.id, { onDelete: "set null" }),
  seriesId: text("series_id").references(() => series.id, { onDelete: "set null" }),
  seriesOrder: integer("series_order"),
  readTime: integer("read_time").notNull().default(0),
  publishedDate: text("published_date"),
  // AI 封面相关字段
  coverImageUrl: text("cover_image_url"),
  aiCoverStatus: text("ai_cover_status"), // 'pending' | 'generating' | 'done' | 'failed' | 'manual'
  aiCoverGeneratedAt: text("ai_cover_generated_at"),
  aiCoverPrompt: text("ai_cover_prompt"), // 记录生成封面时使用的 Prompt
  createdAt: text("createdAt").notNull().default(new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().default(new Date().toISOString()),
});

// 草稿是独立于已发布文章的编辑实例。postId 为空时是新文章草稿，否则是文章修订草稿。
export const postDrafts = pgTable("post_drafts", {
  id: text("id").primaryKey(),
  postId: text("post_id").references(() => posts.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
  seriesId: text("series_id").references(() => series.id, { onDelete: "set null" }),
  seriesOrder: integer("series_order"),
  readTime: integer("read_time").notNull().default(0),
  coverImageUrl: text("cover_image_url"),
  aiCoverStatus: text("ai_cover_status"),
  aiCoverGeneratedAt: text("ai_cover_generated_at"),
  aiCoverPrompt: text("ai_cover_prompt"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
}, (table) => ({
  oneDraftPerPost: uniqueIndex("post_drafts_post_id_unique").on(table.postId),
}));

// 文章-标签关联表（多对多）
export const postTags = pgTable("post_tags", {
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => ({
  compoundKey: primaryKey({
    columns: [table.postId, table.tagId],
  }),
}));

export const postDraftTags = pgTable("post_draft_tags", {
  draftId: text("draft_id").notNull().references(() => postDrafts.id, { onDelete: "cascade" }),
  tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => ({
  compoundKey: primaryKey({
    columns: [table.draftId, table.tagId],
  }),
}));

// ============================================================================
// AI 配置表定义
// ============================================================================

// AI 模型配置表
export const aiModelConfigs = pgTable("ai_model_configs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(), // 'deepseek' | 'zhipu' | 'qwen' | 'moonshot' | 'baichuan' | 'openai'
  model: text("model").notNull(),
  apiKeyEncrypted: text("api_key_encrypted").notNull(),
  baseUrl: text("base_url"),
  maxTokens: integer("max_tokens").notNull().default(300),
  temperature: integer("temperature").notNull().default(7), // stored as integer (0-100, divide by 100 for actual value)
  capabilityType: text("capability_type").notNull().default('text'), // 'text' | 'image' - 区分文本生成和图像生成能力
  enabled: boolean("enabled").notNull().default(true),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

// AI 功能映射表
export const aiFunctionMappings = pgTable("ai_function_mappings", {
  id: text("id").primaryKey(),
  functionName: text("function_name").notNull().unique(), // 'summary' | 'cover' | 'search'
  modelConfigId: text("model_config_id").references(() => aiModelConfigs.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

// AI 调用日志表
export const aiCallLogs = pgTable("ai_call_logs", {
  id: text("id").primaryKey(),
  postId: text("post_id").references(() => posts.id, { onDelete: "set null" }),
  draftId: text("draft_id").references(() => postDrafts.id, { onDelete: "set null" }),
  modelConfigId: text("model_config_id").references(() => aiModelConfigs.id, { onDelete: "set null" }),
  action: text("action").notNull(), // 'generate-summary' | 'generate-cover' etc.
  provider: text("provider"),
  model: text("model"),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  status: text("status").notNull(), // 'success' | 'failed' | 'retrying'
  errorMessage: text("error_message"),
  durationMs: integer("duration_ms"),
  // 图像生成相关字段
  imageSize: text("image_size"), // e.g., '1024x1024', '1792x1024'
  imageFormat: text("image_format"), // e.g., 'png', 'jpg'
  imageCost: integer("image_cost"), // 图像生成成本（以分为单位）
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// ============================================================================
// 文件上传表定义
// ============================================================================

// 文件上传记录表
export const fileUploads = pgTable("file_uploads", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(), // COS 对象键
  filename: text("filename").notNull(), // 原始文件名
  size: integer("size").notNull(), // 文件大小（字节）
  mimeType: text("mime_type").notNull(), // MIME 类型
  uploaderId: text("uploader_id").notNull().references(() => users.id, { onDelete: "cascade" }), // 上传者用户 ID
  createdAt: text("created_at").notNull().default(new Date().toISOString()), // 上传时间
});

// ============================================================================
// 设置表定义
// ============================================================================

// ============================================================================
// 音乐播放器表定义
// ============================================================================

// 歌曲表
export const songs = pgTable("songs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  duration: integer("duration").notNull(), // 时长（秒）
  audioUrl: text("audio_url").notNull(), // 音频文件URL（COS）
  lyrics: text("lyrics"), // LRC格式歌词
  fileSize: integer("file_size"), // 文件大小（字节）
  fileFormat: text("file_format"), // 文件格式（mp3, ogg等）
  uploadStatus: text("upload_status").notNull().default('pending'), // pending, uploading, completed, failed
  metadata: text("metadata"), // JSON格式：其他音频元数据（比特率、采样率等）
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

// 歌单表
export const playlists = pgTable("playlists", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  coverColor: text("cover_color").notNull().default('#6366f1'), // 封面渐变色
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

// 歌单-歌曲关联表（多对多）
export const playlistSongs = pgTable("playlist_songs", {
  id: text("id").primaryKey(),
  playlistId: text("playlist_id").notNull().references(() => playlists.id, { onDelete: "cascade" }),
  songId: text("song_id").notNull().references(() => songs.id, { onDelete: "cascade" }),
  position: integer("position").notNull(), // 在歌单中的位置顺序
}, (table) => ({
  uniquePlaylistSong: uniqueIndex("unique_playlist_song").on(table.playlistId, table.songId),
}));

// ============================================================================
// 设置表定义
// ============================================================================

// 博客设置表（单例模式，只有一条记录）
export const settings = pgTable("settings", {
  id: text("id").primaryKey().$defaultFn(() => 'default'),
  blogName: text("blog_name").notNull().default('My Blog'),
  blogDescription: text("blog_description").notNull().default('A personal blog'),
  postsPerPage: integer("posts_per_page").notNull().default(10),
  // 作者信息字段
  authorName: text("author_name").notNull().default('Alex Chen'),
  authorAvatar: text("author_avatar").notNull().default('https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=c0aede'),
  authorBio: text("author_bio").notNull().default('Designer & Developer crafting digital experiences with code and creativity.'),
  authorLocation: text("author_location").notNull().default('San Francisco, CA'),
  authorZodiac: text("author_zodiac").notNull().default('Scorpio ♏'),
  authorEmail: text("author_email").notNull().default('alex@example.com'),
  authorSocialGithub: text("author_social_github").default('github.com/alexchen'),
  authorSocialTwitter: text("author_social_twitter").default('twitter.com/alexchen'),
  authorSocialLinkedin: text("author_social_linkedin"),
  updatedAt: text("updatedAt").notNull().default(new Date().toISOString()),
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
  series: one(series, {
    fields: [posts.seriesId],
    references: [series.id],
  }),
  draft: one(postDrafts),
  tags: many(postTags),
}));

export const postDraftRelations = relations(postDrafts, ({ one, many }) => ({
  post: one(posts, {
    fields: [postDrafts.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [postDrafts.authorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [postDrafts.categoryId],
    references: [categories.id],
  }),
  series: one(series, {
    fields: [postDrafts.seriesId],
    references: [series.id],
  }),
  tags: many(postDraftTags),
}));

export const seriesRelations = relations(series, ({ one, many }) => ({
  author: one(users, {
    fields: [series.authorId],
    references: [users.id],
  }),
  posts: many(posts),
  drafts: many(postDrafts),
}));

// 分类关系定义
export const categoryRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
  drafts: many(postDrafts),
}));

// 标签关系定义
export const tagRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
  postDraftTags: many(postDraftTags),
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

export const postDraftTagRelations = relations(postDraftTags, ({ one }) => ({
  draft: one(postDrafts, {
    fields: [postDraftTags.draftId],
    references: [postDrafts.id],
  }),
  tag: one(tags, {
    fields: [postDraftTags.tagId],
    references: [tags.id],
  }),
}));

// 文件上传关系定义
export const fileUploadRelations = relations(fileUploads, ({ one }) => ({
  uploader: one(users, {
    fields: [fileUploads.uploaderId],
    references: [users.id],
  }),
}));

// ============================================================================
// 音乐播放器关系定义
// ============================================================================

// 歌曲关系定义
export const songRelations = relations(songs, ({ many }) => ({
  playlistSongs: many(playlistSongs),
}));

// 歌单关系定义
export const playlistRelations = relations(playlists, ({ many }) => ({
  playlistSongs: many(playlistSongs),
}));

// 歌单-歌曲关联关系定义
export const playlistSongRelations = relations(playlistSongs, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistSongs.playlistId],
    references: [playlists.id],
  }),
  song: one(songs, {
    fields: [playlistSongs.songId],
    references: [songs.id],
  }),
}));

// 关系定义
export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  posts: many(posts),
  drafts: many(postDrafts),
  series: many(series),
  fileUploads: many(fileUploads),
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
  postDrafts,
  series,
  settings,
  categories,
  tags,
  postTags,
  postDraftTags,
  aiModelConfigs,
  aiFunctionMappings,
  aiCallLogs,
  fileUploads,
  songs,
  playlists,
  playlistSongs,
};
