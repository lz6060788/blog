import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// 必须使用 Node.js 运行时（SQLite 需要）
export const runtime = "nodejs";

// GET /api/categories - 获取所有分类
export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "未认证" },
      { status: 401 }
    );
  }

  try {
    const allCategories = await db.select().from(categories).orderBy(categories.createdAt);
    return NextResponse.json(allCategories);
  } catch (error) {
    console.error("获取分类失败:", error);
    return NextResponse.json(
      { error: "获取分类失败" },
      { status: 500 }
    );
  }
}

// POST /api/categories - 创建分类
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
    const { name, slug, description } = body;

    // 验证必填字段
    if (!name || !slug) {
      return NextResponse.json(
        { error: "分类名称和 slug 为必填项" },
        { status: 400 }
      );
    }

    // 检查分类名称是否已存在
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name))
      .limit(1);

    if (existingCategory.length > 0) {
      return NextResponse.json(
        { error: "分类名称已存在" },
        { status: 400 }
      );
    }

    // 检查 slug 是否已存在
    const existingSlug = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (existingSlug.length > 0) {
      return NextResponse.json(
        { error: "Slug 已存在" },
        { status: 400 }
      );
    }

    // 生成 ID
    const id = crypto.randomUUID();

    // 创建分类
    const [newCategory] = await db
      .insert(categories)
      .values({
        id,
        name,
        slug,
        description: description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("创建分类失败:", error);
    return NextResponse.json(
      { error: "创建分类失败" },
      { status: 500 }
    );
  }
}
