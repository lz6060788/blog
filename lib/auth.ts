import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "database", // 使用数据库会话以便可以主动撤销
  },
  pages: {
    signIn: "/auth/signin", // 自定义登录页面（可选）
  },
  callbacks: {
    // 实现基于邮箱的账号自动关联
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      // 检查是否已存在相同邮箱的用户
      const existingUser = await db
        .select()
        .from(schema.users)
        .where((users: any) => users.email === user.email)
        .limit(1);

      if (existingUser.length > 0) {
        const existingUserId = existingUser[0].id;

        // 如果是新 provider 登录但邮箱已存在
        // Drizzle adapter 会自动处理账号关联
        // 我们只需要确保 user.id 指向现有用户
        user.id = existingUserId;
      }

      return true;
    },
    async session({ session, user }) {
      // 将 user.id 添加到 session 中
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    // 可选：添加自定义事件处理
    async createUser({ user }) {
      console.log("新用户创建:", user.email);
    },
  },
  debug: process.env.NODE_ENV === "development",
});
