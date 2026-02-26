import { auth } from "./auth";
import { NextResponse } from "next/server";

/**
 * 保护 API 路由的辅助函数
 * 如果用户未认证，返回 401 响应
 *
 * @example
 * ```ts
 * import { requireAuth } from "@/lib/middleware-auth";
 *
 * export async function GET() {
 *   const session = await requireAuth();
 *   // session 现在保证不为 null
 *   return NextResponse.json({ data: "protected data for " + session.user.email });
 * }
 * ```
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return session;
}

/**
 * 可选认证辅助函数
 * 返回 session（可能为 null），不抛出错误
 */
export async function getOptionalAuth() {
  return await auth();
}

/**
 * 创建受保护的路由处理器包装器
 *
 * @example
 * ```ts
 * import { withAuth } from "@/lib/middleware-auth";
 *
 * export const GET = withAuth(async (session) => {
 *   return NextResponse.json({ user: session.user });
 * });
 * ```
 */
export function withAuth<T extends any[]>(
  handler: (session: Awaited<ReturnType<typeof auth>>, ...args: T) => Promise<Response>
) {
  return async (...args: T) => {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "未认证" }, { status: 401 });
    }

    // @ts-ignore
    return handler(session, ...args);
  };
}
