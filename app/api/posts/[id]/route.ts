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

// GET /api/posts/[id] - 获取单个文章
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "未认证" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const postService = createPostService();
    const post = await postService.getPostById(id, session.user.id);

    if (!post) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("获取文章失败:", error);

    // 处理权限错误
    if (error instanceof Error && error.message === "无权访问此文章") {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "获取文章失败" },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - 更新文章
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "未认证" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      published,
      categoryId,
      tags,
      readTime,
      publishedDate,
    } = body;

    const postService = createPostService();
    await postService.updatePost(id, session.user.id, {
      title,
      content,
      excerpt,
      published,
      categoryId,
      tags,
      readTime,
      publishedDate,
    });

    // 获取更新后的文章
    const updatedPost = await postService.getPostById(id, session.user.id);

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("更新文章失败:", error);

    // 处理业务逻辑错误
    if (error instanceof Error) {
      const statusCode =
        error.message.includes("不存在") ? 404 :
        error.message.includes("摘要生成中") ? 400 :
        error.message.includes("无权") ? 403 :
        500;

      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: "更新文章失败" },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - 删除文章
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "未认证" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const postService = createPostService();
    await postService.deletePost(id, session.user.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("删除文章失败:", error);

    // 处理业务逻辑错误
    if (error instanceof Error) {
      const statusCode =
        error.message.includes("不存在") ? 404 :
        error.message.includes("无权") ? 403 :
        500;

      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: "删除文章失败" },
      { status: 500 }
    );
  }
}
