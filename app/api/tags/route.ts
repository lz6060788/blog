import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { tags } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// 必须使用 Node.js 运行时（SQLite 需要）
export const runtime = "nodejs";

// GET /api/tags - 获取所有标签
export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "未认证" },
      { status: 401 }
    );
  }

  try {
    const allTags = await db.select().from(tags).orderBy(tags.createdAt);
    return NextResponse.json(allTags);
  } catch (error) {
    console.error("获取标签失败:", error);
    return NextResponse.json(
      { error: "获取标签失败" },
      { status: 500 }
    );
  }
}

// POST /api/tags - 创建标签
export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "未认证" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { name, slug } = body;

    // 验证必填字段
    if (!name || !slug) {
      return NextResponse.json(
        { error: "标签名称和 slug 为必填项" },
        { status: 400 }
      );
    }

    // 检查标签名称是否已存在
    const existingTag = await db
      .select()
      .from(tags)
      .where(eq(tags.name, name))
      .limit(1);

    if (existingTag.length > 0) {
      return NextResponse.json(
        { error: "标签名称已存在" },
        { status: 400 }
      );
    }

    // 检查 slug 是否已存在
    const existingSlug = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);

    if (existingSlug.length > 0) {
      return NextResponse.json(
        { error: "Slug 已存在" },
        { status: 400 }
      );
    }

    // 生成 ID
    const id = crypto.randomUUID();

    // 创建标签
    const [newTag] = await db
      .insert(tags)
      .values({
        id,
        name,
        slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error("创建标签失败:", error);
    return NextResponse.json(
      { error: "创建标签失败" },
      { status: 500 }
    );
  }
}
