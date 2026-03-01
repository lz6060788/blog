import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { posts, categories, tags, postTags } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { SummaryStatus } from "@/server/ai/types";

// 必须使用 Node.js 运行时（SQLite 需要）
export const runtime = "nodejs";

// 生成 slug 辅助函数
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/posts/[id] - 获取单个文章（包含 category 和 tags）
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
    const [postData] = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        excerpt: posts.excerpt,
        published: posts.published,
        authorId: posts.authorId,
        categoryId: posts.categoryId,
        readTime: posts.readTime,
        publishedDate: posts.publishedDate,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        // AI 摘要字段
        aiSummary: posts.aiSummary,
        aiSummaryStatus: posts.aiSummaryStatus,
        aiSummaryGeneratedAt: posts.aiSummaryGeneratedAt,
        // Category fields
        categoryId_val: categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(eq(posts.id, params.id))
      .limit(1);

    if (!postData) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      );
    }

    // 获取标签
    const postTagsList = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(postTags)
      .leftJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, params.id));

    // 构建响应
    const { categoryId_val, categoryName, categorySlug, ...postRest } = postData;

    return NextResponse.json({
      ...postRest,
      category: categoryId_val
        ? {
            id: categoryId_val,
            name: categoryName,
            slug: categorySlug,
          }
        : null,
      tags: postTagsList,
    });
  } catch (error) {
    console.error("获取文章失败:", error);
    return NextResponse.json(
      { error: "获取文章失败" },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - 更新文章（支持 category 和 tags）
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
    const {
      title,
      content,
      excerpt,
      published,
      categoryId,
      tags: tagNames,
      readTime,
      publishedDate,
    } = body;

    // 检查文章是否存在
    const [existingPost] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, params.id))
      .limit(1);

    if (!existingPost) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      );
    }

    // 检查是否正在生成摘要（如果是，拒绝更新）
    if (existingPost.aiSummaryStatus === SummaryStatus.GENERATING) {
      return NextResponse.json(
        { error: "AI 摘要生成中，无法更新文章" },
        { status: 400 }
      );
    }

    // 拒绝在生成期间发布文章
    if (published === true && existingPost.aiSummaryStatus === SummaryStatus.GENERATING) {
      return NextResponse.json(
        { error: "AI 摘要生成中，无法发布文章" },
        { status: 400 }
      );
    }

    // 更新文章
    const [updatedPost] = await db
      .update(posts)
      .set({
        title: title ?? existingPost.title,
        content: content ?? existingPost.content,
        excerpt: excerpt !== undefined ? excerpt : existingPost.excerpt,
        published: published !== undefined ? published : existingPost.published,
        categoryId: categoryId !== undefined ? categoryId : existingPost.categoryId,
        readTime: readTime !== undefined ? readTime : existingPost.readTime,
        publishedDate: publishedDate !== undefined ? publishedDate : existingPost.publishedDate,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(posts.id, params.id))
      .returning();

    // 处理标签（增量更新）
    let createdTags: any[] = [];

    if (tagNames !== undefined) {
      // 删除现有的标签关联
      await db.delete(postTags).where(eq(postTags.postId, params.id));

      // 添加新的标签关联
      if (Array.isArray(tagNames) && tagNames.length > 0) {
        for (const tagName of tagNames) {
          if (!tagName || typeof tagName !== "string") continue;

          // 检查标签是否已存在
          const [existingTag] = await db
            .select()
            .from(tags)
            .where(eq(tags.name, tagName.trim()))
            .limit(1);

          let tagId: string;

          if (existingTag) {
            tagId = existingTag.id;
            createdTags.push(existingTag);
          } else {
            // 创建新标签
            const newTagId = crypto.randomUUID();
            const slug = generateSlug(tagName.trim());

            const [newTag] = await db
              .insert(tags)
              .values({
                id: newTagId,
                name: tagName.trim(),
                slug,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
              .returning();

            tagId = newTag.id;
            createdTags.push(newTag);
          }

          // 建立文章-标签关联
          await db.insert(postTags).values({
            postId: params.id,
            tagId,
          });
        }
      }
    }

    // 获取完整的分类信息
    let category = null;
    if (updatedPost.categoryId) {
      const [categoryData] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, updatedPost.categoryId))
        .limit(1);

      if (categoryData) {
        category = {
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug,
        };
      }
    }

    // 如果没有更新标签，获取现有标签
    let finalTags = createdTags;
    if (tagNames === undefined) {
      const existingPostTags = await db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(postTags)
        .leftJoin(tags, eq(postTags.tagId, tags.id))
        .where(eq(postTags.postId, params.id));
      finalTags = existingPostTags;
    }

    return NextResponse.json({
      ...updatedPost,
      category,
      tags: finalTags,
    });
  } catch (error) {
    console.error("更新文章失败:", error);
    return NextResponse.json(
      { error: "更新文章失败" },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - 删除文章
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
    // 检查文章是否存在
    const [existingPost] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, params.id))
      .limit(1);

    if (!existingPost) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      );
    }

    // 检查是否正在生成摘要（如果是，拒绝删除）
    if (existingPost.aiSummaryStatus === SummaryStatus.GENERATING) {
      return NextResponse.json(
        { error: "AI 摘要生成中，无法删除文章" },
        { status: 400 }
      );
    }

    // 删除文章（关联的 post_tags 记录会自动级联删除）
    await db.delete(posts).where(eq(posts.id, params.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("删除文章失败:", error);
    return NextResponse.json(
      { error: "删除文章失败" },
      { status: 500 }
    );
  }
}
