/**
 * 自定义 Drizzle SQLite 适配器
 * 解决 @auth/drizzle-adapter 的日期序列化问题
 */

import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "@auth/core/adapters";
import { and, eq } from "drizzle-orm";

interface Tables {
  users: any;
  sessions: any;
  accounts: any;
  verificationTokens?: any;
}

// 辅助函数：转换日期为字符串用于数据库存储
function dateToString(date: Date | string | undefined | null): string | null {
  if (!date) return null;
  if (typeof date === 'string') return date;
  return date.toISOString();
}

// 辅助函数：转换字符串为 Date 对象用于返回给 NextAuth
function stringToDate(str: string | null | undefined): Date | null {
  if (!str) return null;
  return new Date(str);
}

export function customDrizzleAdapter(db: any, tables: Tables): Adapter {
  const { users, sessions, accounts, verificationTokens } = tables;

  return {
    async createUser(user) {
      const now = new Date().toISOString();
      const result = await db
        .insert(users)
        .values({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: dateToString(user.emailVerified),
          image: user.image,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      return result[0] as AdapterUser;
    },

    async getUser(id) {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      if (!result[0]) return null;
      return {
        ...result[0],
        emailVerified: stringToDate(result[0].emailVerified),
      } as AdapterUser;
    },

    async getUserByEmail(email) {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (!result[0]) return null;
      return {
        ...result[0],
        emailVerified: stringToDate(result[0].emailVerified),
      } as AdapterUser;
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const result = await db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, providerAccountId),
            eq(accounts.provider, provider)
          )
        )
        .limit(1);

      if (!result[0]) return null;

      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, result[0].userId))
        .limit(1);

      if (!userResult[0]) return null;

      return {
        ...userResult[0],
        emailVerified: stringToDate(userResult[0].emailVerified),
      } as AdapterUser;
    },

    async updateUser(user) {
      const result = await db
        .update(users)
        .set({
          name: user.name,
          email: user.email,
          emailVerified: dateToString(user.emailVerified),
          image: user.image,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(users.id, user.id!))
        .returning();
      return {
        ...result[0],
        emailVerified: stringToDate(result[0].emailVerified),
      } as AdapterUser;
    },

    async deleteUser(userId) {
      await db.delete(users).where(eq(users.id, userId));
    },

    async linkAccount(account) {
      await db.insert(accounts).values({
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at ? String(account.expires_at) : null,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
      });
      return account as AdapterAccount;
    },

    async unlinkAccount({ providerAccountId, provider }) {
      await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, providerAccountId),
            eq(accounts.provider, provider)
          )
        );
    },

    async createSession(session) {
      const sessionData = {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: dateToString(session.expires),
      };

      await db.insert(sessions).values(sessionData);

      // 返回时需要包含 Date 对象
      return session as AdapterSession;
    },

    async getSessionAndUser(sessionToken) {
      const result = await db
        .select()
        .from(sessions)
        .where(eq(sessions.sessionToken, sessionToken))
        .limit(1);

      if (!result[0]) return null;

      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, result[0].userId))
        .limit(1);

      if (!userResult[0]) return null;

      return {
        session: {
          ...result[0],
          expires: stringToDate(result[0].expires)!,
        } as AdapterSession,
        user: {
          ...userResult[0],
          emailVerified: stringToDate(userResult[0].emailVerified),
        } as AdapterUser,
      };
    },

    async updateSession(session) {
      const sessionData = {
        expires: dateToString(session.expires),
      };

      const result = await db
        .update(sessions)
        .set(sessionData)
        .where(eq(sessions.sessionToken, session.sessionToken!))
        .returning();

      return {
        ...result[0],
        expires: stringToDate(result[0].expires)!,
      } as AdapterSession;
    },

    async deleteSession(sessionToken) {
      await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
    },

    async createVerificationToken(token) {
      if (!verificationTokens) return;

      const tokenData = {
        identifier: token.identifier,
        token: token.token,
        expires: dateToString(token.expires),
      };

      const result = await db
        .insert(verificationTokens)
        .values(tokenData)
        .returning();

      return {
        ...result[0],
        expires: stringToDate(result[0].expires)!,
      } as VerificationToken;
    },

    async useVerificationToken({ identifier, token }) {
      if (!verificationTokens) return null;

      const result = await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, identifier),
            eq(verificationTokens.token, token)
          )
        )
        .returning();

      if (!result[0]) return null;

      return {
        ...result[0],
        expires: stringToDate(result[0].expires)!,
      } as VerificationToken;
    },
  };
}
