import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { tags } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// 必须使用 Node.js 运行时（SQLite 需要）
export const runtime = "nodejs";

// GET /api/tags/[id] - 获取单个标签
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
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, params.id))
      .limit(1);

    if (!tag) {
      return NextResponse.json(
        { error: "标签不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error("获取标签失败:", error);
    return NextResponse.json(
      { error: "获取标签失败" },
      { status: 500 }
    );
  }
}

// PUT /api/tags/[id] - 更新标签
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
    const { name, slug } = body;

    // 验证必填字段
    if (!name || !slug) {
      return NextResponse.json(
        { error: "标签名称和 slug 为必填项" },
        { status: 400 }
      );
    }

    // 检查标签是否存在
    const [existingTag] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, params.id))
      .limit(1);

    if (!existingTag) {
      return NextResponse.json(
        { error: "标签不存在" },
        { status: 404 }
      );
    }

    // 检查名称是否被其他标签使用
    if (name !== existingTag.name) {
      const duplicateName = await db
        .select()
        .from(tags)
        .where(eq(tags.name, name))
        .limit(1);

      if (duplicateName.length > 0 && duplicateName[0].id !== params.id) {
        return NextResponse.json(
          { error: "标签名称已被使用" },
          { status: 400 }
        );
      }
    }

    // 检查 slug 是否被其他标签使用
    if (slug !== existingTag.slug) {
      const duplicateSlug = await db
        .select()
        .from(tags)
        .where(eq(tags.slug, slug))
        .limit(1);

      if (duplicateSlug.length > 0 && duplicateSlug[0].id !== params.id) {
        return NextResponse.json(
          { error: "Slug 已被使用" },
          { status: 400 }
        );
      }
    }

    // 更新标签
    const [updatedTag] = await db
      .update(tags)
      .set({
        name,
        slug,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tags.id, params.id))
      .returning();

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error("更新标签失败:", error);
    return NextResponse.json(
      { error: "更新标签失败" },
      { status: 500 }
    );
  }
}

// DELETE /api/tags/[id] - 删除标签
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
    // 检查标签是否存在
    const [existingTag] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, params.id))
      .limit(1);

    if (!existingTag) {
      return NextResponse.json(
        { error: "标签不存在" },
        { status: 404 }
      );
    }

    // 删除标签（关联的 post_tags 记录会自动级联删除）
    await db.delete(tags).where(eq(tags.id, params.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("删除标签失败:", error);
    return NextResponse.json(
      { error: "删除标签失败" },
      { status: 500 }
    );
  }
}
