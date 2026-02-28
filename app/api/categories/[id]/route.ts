import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { categories, posts } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// 必须使用 Node.js 运行时（SQLite 需要）
export const runtime = "nodejs";

// GET /api/categories/[id] - 获取单个分类
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "未认证" },
      { status: 401 }
    );
  }

  try {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, params.id))
      .limit(1);

    if (!category) {
      return NextResponse.json(
        { error: "分类不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("获取分类失败:", error);
    return NextResponse.json(
      { error: "获取分类失败" },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - 更新分类
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // 检查分类是否存在
    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, params.id))
      .limit(1);

    if (!existingCategory) {
      return NextResponse.json(
        { error: "分类不存在" },
        { status: 404 }
      );
    }

    // 检查名称是否被其他分类使用
    if (name !== existingCategory.name) {
      const duplicateName = await db
        .select()
        .from(categories)
        .where(eq(categories.name, name))
        .limit(1);

      if (duplicateName.length > 0 && duplicateName[0].id !== params.id) {
        return NextResponse.json(
          { error: "分类名称已被使用" },
          { status: 400 }
        );
      }
    }

    // 检查 slug 是否被其他分类使用
    if (slug !== existingCategory.slug) {
      const duplicateSlug = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, slug))
        .limit(1);

      if (duplicateSlug.length > 0 && duplicateSlug[0].id !== params.id) {
        return NextResponse.json(
          { error: "Slug 已被使用" },
          { status: 400 }
        );
      }
    }

    // 更新分类
    const [updatedCategory] = await db
      .update(categories)
      .set({
        name,
        slug,
        description: description || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(categories.id, params.id))
      .returning();

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("更新分类失败:", error);
    return NextResponse.json(
      { error: "更新分类失败" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - 删除分类
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "未认证" },
      { status: 401 }
    );
  }

  try {
    // 检查分类是否存在
    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, params.id))
      .limit(1);

    if (!existingCategory) {
      return NextResponse.json(
        { error: "分类不存在" },
        { status: 404 }
      );
    }

    // 删除分类（关联的文章 categoryId 会自动设为 NULL）
    await db.delete(categories).where(eq(categories.id, params.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("删除分类失败:", error);
    return NextResponse.json(
      { error: "删除分类失败" },
      { status: 500 }
    );
  }
}
