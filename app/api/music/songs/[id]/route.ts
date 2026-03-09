import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { songs } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// 必须使用 Node.js 运行时（SQLite 需要）
export const runtime = "nodejs";

// GET /api/music/songs/:id - 获取单曲详情
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
    const { id } = params;

    const [song] = await db
      .select()
      .from(songs)
      .where(eq(songs.id, id))
      .limit(1);

    if (!song) {
      return NextResponse.json(
        { error: "歌曲不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(song);
  } catch (error) {
    console.error("获取歌曲详情失败:", error);
    return NextResponse.json(
      { error: "获取歌曲详情失败" },
      { status: 500 }
    );
  }
}

// PUT /api/music/songs/:id - 更新歌曲
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
    const { id } = params;
    const body = await request.json();
    const {
      title,
      artist,
      album,
      duration,
      audioUrl,
      lyrics,
      fileSize,
      fileFormat,
      uploadStatus,
      metadata
    } = body;

    // 检查歌曲是否存在
    const [existingSong] = await db
      .select()
      .from(songs)
      .where(eq(songs.id, id))
      .limit(1);

    if (!existingSong) {
      return NextResponse.json(
        { error: "歌曲不存在" },
        { status: 404 }
      );
    }

    // 更新歌曲
    const [updatedSong] = await db
      .update(songs)
      .set({
        ...(title !== undefined && { title }),
        ...(artist !== undefined && { artist }),
        ...(album !== undefined && { album }),
        ...(duration !== undefined && { duration }),
        ...(audioUrl !== undefined && { audioUrl }),
        ...(lyrics !== undefined && { lyrics }),
        ...(fileSize !== undefined && { fileSize }),
        ...(fileFormat !== undefined && { fileFormat }),
        ...(uploadStatus !== undefined && { uploadStatus }),
        ...(metadata !== undefined && { metadata: JSON.stringify(metadata) }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(songs.id, id))
      .returning();

    return NextResponse.json(updatedSong);
  } catch (error) {
    console.error("更新歌曲失败:", error);
    return NextResponse.json(
      { error: "更新歌曲失败" },
      { status: 500 }
    );
  }
}

// DELETE /api/music/songs/:id - 删除歌曲
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
    const { id } = params;

    // 检查歌曲是否存在
    const [existingSong] = await db
      .select()
      .from(songs)
      .where(eq(songs.id, id))
      .limit(1);

    if (!existingSong) {
      return NextResponse.json(
        { error: "歌曲不存在" },
        { status: 404 }
      );
    }

    // 删除歌曲
    await db.delete(songs).where(eq(songs.id, id));

    return NextResponse.json(
      { message: "歌曲删除成功" },
      { status: 200 }
    );
  } catch (error) {
    console.error("删除歌曲失败:", error);
    return NextResponse.json(
      { error: "删除歌曲失败" },
      { status: 500 }
    );
  }
}
