// @ts-ignore
import { relations } from "drizzle-orm";
import { sqliteTable, text as sqliteText, primaryKey } from "drizzle-orm/sqlite-core";

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

// 关系定义
export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
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
  verificationTokens,
};
