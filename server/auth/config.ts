import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import * as schema from "@/server/db/schema";
import { customDrizzleAdapter } from "./drizzle-adapter";

// 验证必需的环境变量
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
if (!ADMIN_EMAIL) {
  throw new Error(
    "ADMIN_EMAIL environment variable is required. " +
    "Please set it to the email address of the blog administrator."
  );
}

// AUTH_SECRET 用于加密 JWT token
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!AUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET environment variable is required. " +
    "Run 'openssl rand -base64 32' to generate one."
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: AUTH_SECRET,
  adapter: customDrizzleAdapter(db, {
    users: schema.users,
    sessions: schema.sessions,
    accounts: schema.accounts,
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
    strategy: "jwt", // 使用 JWT strategy 以支持 middleware 中的 getToken
  },
  pages: {
    signIn: "/login", // 自定义登录页面路径
  },
  callbacks: {
    // 实现白名单验证和基于邮箱的账号自动关联
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      // 白名单验证 - 只允许配置的管理员邮箱登录
      // 邮箱大小写不敏感比较
      const normalizedUserEmail = user.email.toLowerCase().trim();
      const normalizedAdminEmail = ADMIN_EMAIL.toLowerCase().trim();

      if (normalizedUserEmail !== normalizedAdminEmail) {
        // 非白名单用户，拒绝登录
        console.warn(`Unauthorized login attempt from: ${user.email}`);
        return false;
      }

      // 检查是否已存在相同邮箱的用户
      const existingUser = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, user.email))
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
    // JWT callback - 将用户信息添加到 token
    async jwt({ token, user, account }) {
      console.log('🔑 [JWT Callback]', {
        hasUser: !!user,
        hasAccount: !!account,
        userId: user?.id,
        userEmail: user?.email,
        existingTokenKeys: token ? Object.keys(token) : [],
      })

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        console.log('✅ [JWT Callback] Token updated with user info:', {
          id: token.id,
          email: token.email,
        })
      }
      return token;
    },
    // Session callback - 从 token 中获取用户信息
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
    // 登录成功后重定向到后台
    async redirect({ url, baseUrl }) {
      // 处理登录页的重定向 - 支持带 locale 前缀的情况
      if (url.endsWith('/login') || url === '/login') {
        return `${baseUrl}/admin`;
      }
      // 处理从外部回来的 callbackUrl
      if (url.includes('callbackUrl')) {
        const callbackUrl = new URL(url).searchParams.get('callbackUrl');
        if (callbackUrl) {
          return `${baseUrl}${callbackUrl}`;
        }
      }
      // 默认重定向到后台
      return `${baseUrl}/admin`;
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
