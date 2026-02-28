import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { posts, categories, tags, postTags, users } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";

// 必须使用 Node.js 运行时（SQLite 需要）
export const runtime = "nodejs";

// 生成 slug 辅助函数
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/posts - 获取所有文章（包含 category 和 tags）
export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "未认证" },
      { status: 401 }
    );
  }

  try {
    const allPosts = await db
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
        // Category fields
        categoryId_val: categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .orderBy(desc(posts.createdAt));

    // 为每篇文章获取标签
    const postsWithTags = await Promise.all(
      allPosts.map(async (post) => {
        const postTagsList = await db
          .select({
            id: tags.id,
            name: tags.name,
            slug: tags.slug,
          })
          .from(postTags)
          .leftJoin(tags, eq(postTags.tagId, tags.id))
          .where(eq(postTags.postId, post.id));

        return {
          ...post,
          category: post.categoryId_val
            ? {
                id: post.categoryId_val,
                name: post.categoryName,
                slug: post.categorySlug,
              }
            : null,
          tags: postTagsList,
        };
      })
    );

    // 清理临时字段
    const cleanedPosts = postsWithTags.map((post) => {
      const { categoryId_val, categoryName, categorySlug, ...rest } = post;
      return rest;
    });

    return NextResponse.json(cleanedPosts);
  } catch (error) {
    console.error("获取文章失败:", error);
    return NextResponse.json(
      { error: "获取文章失败" },
      { status: 500 }
    );
  }
}

// POST /api/posts - 创建文章（支持 category 和 tags）
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
    const {
      title,
      content,
      excerpt,
      published = false,
      categoryId,
      tags: tagNames,
      readTime = 0,
      publishedDate,
    } = body;

    // 验证必填字段
    if (!title || !content) {
      return NextResponse.json(
        { error: "标题和内容为必填项" },
        { status: 400 }
      );
    }

    // 生成 ID
    const id = crypto.randomUUID();

    // 创建文章
    const [newPost] = await db
      .insert(posts)
      .values({
        id,
        title,
        content,
        excerpt: excerpt || null,
        published,
        authorId: session.user?.id || "",
        categoryId: categoryId || null,
        readTime,
        publishedDate: publishedDate || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    // 处理标签
    let createdTags: any[] = [];
    if (tagNames && Array.isArray(tagNames) && tagNames.length > 0) {
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
          postId: id,
          tagId,
        });
      }
    }

    // 获取完整的分类信息
    let category = null;
    if (categoryId) {
      const [categoryData] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, categoryId))
        .limit(1);

      if (categoryData) {
        category = {
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug,
        };
      }
    }

    return NextResponse.json({
      ...newPost,
      category,
      tags: createdTags,
    }, { status: 201 });
  } catch (error) {
    console.error("创建文章失败:", error);
    return NextResponse.json(
      { error: "创建文章失败" },
      { status: 500 }
    );
  }
}
