import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { PostRepository } from "@/server/repositories/post.repository";
import { PostService } from "@/server/services/post.service";

// 必须使用 Node.js 运行时（SQLite 需要）
export const runtime = "nodejs";

// 创建 Service 实例
function createPostService() {
  const postRepository = new PostRepository();
  return new PostService(postRepository);
}

/**
 * GET /api/posts - 获取文章列表
 *
 * 查询参数：
 * - page: 页码（默认 1）
 * - limit: 每页数量（默认 20，最大 100）
 * - search: 搜索关键词
 * - published: 是否只显示已发布文章
 * - drafts: 是否只显示草稿
 *
 * 响应格式：
 * {
 *   data: Post[],
 *   total: number,
 *   page: number,
 *   limit: number,
 *   totalPages: number,
 *   hasNext: boolean,
 *   hasPrev: boolean
 * }
 */
export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "未认证" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || undefined;
    const publishedOnly = searchParams.get("published") === "true";
    const draftsOnly = searchParams.get("drafts") === "true";

    const postService = createPostService();
    const result = await postService.listPublishedPosts({
      page,
      limit,
      search,
      publishedOnly,
      draftsOnly,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("获取文章失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "获取文章失败" },
      { status: 500 }
    );
  }
}

// POST /api/posts - 创建文章
export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "未认证" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const {
      title,
      content,
      excerpt,
      published = false,
      categoryId,
      tags,
      readTime = 0,
      publishedDate,
    } = body;

    const postService = createPostService();
    const result = await postService.createPost(session.user.id, {
      title,
      content,
      excerpt,
      published,
      categoryId,
      tags,
      readTime,
      publishedDate,
    });

    return NextResponse.json(
      { id: result.id, message: "文章创建成功" },
      { status: 201 }
    );
  } catch (error) {
    console.error("创建文章失败:", error);

    // 处理业务逻辑错误
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "创建文章失败" },
      { status: 500 }
    );
  }
}
