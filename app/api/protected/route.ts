import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// 必须使用 Node.js 运行时（SQLite 需要）
export const runtime = "nodejs";

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "未认证" },
      { status: 401 }
    );
  }

  // 返回受保护的数据
  return NextResponse.json({
    message: "这是受保护的数据",
    user: {
      id: session.user?.id,
      name: session.user?.name,
      email: session.user?.email,
      image: session.user?.image,
    },
  });
}
