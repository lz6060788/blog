import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { playlists, songs, playlistSongs } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

// 必须使用 Node.js 运行时（SQLite 需要）
export const runtime = "nodejs";

// GET /api/music/playlists/:id - 获取歌单详情
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

    const [playlist] = await db
      .select()
      .from(playlists)
      .where(eq(playlists.id, id))
      .limit(1);

    if (!playlist) {
      return NextResponse.json(
        { error: "歌单不存在" },
        { status: 404 }
      );
    }

    // 获取歌单中的歌曲
    const songRelations = await db
      .select()
      .from(playlistSongs)
      .where(eq(playlistSongs.playlistId, id))
      .orderBy(playlistSongs.position);

    // 简化处理：逐个获取歌曲
    const playlistSongsData: any[] = [];
    for (const relation of songRelations) {
      const [song] = await db
        .select()
        .from(songs)
        .where(eq(songs.id, relation.songId))
        .limit(1);

      if (song) {
        playlistSongsData.push({
          ...song,
          position: relation.position,
        });
      }
    }

    return NextResponse.json({
      ...playlist,
      songs: playlistSongsData,
    });
  } catch (error) {
    console.error("获取歌单详情失败:", error);
    return NextResponse.json(
      { error: "获取歌单详情失败" },
      { status: 500 }
    );
  }
}

// PUT /api/music/playlists/:id - 更新歌单
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
    const { name, description, coverColor, isPublic } = body;

    // 检查歌单是否存在
    const [existingPlaylist] = await db
      .select()
      .from(playlists)
      .where(eq(playlists.id, id))
      .limit(1);

    if (!existingPlaylist) {
      return NextResponse.json(
        { error: "歌单不存在" },
        { status: 404 }
      );
    }

    // 更新歌单
    const [updatedPlaylist] = await db
      .update(playlists)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(coverColor !== undefined && { coverColor }),
        ...(isPublic !== undefined && { isPublic }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(playlists.id, id))
      .returning();

    return NextResponse.json(updatedPlaylist);
  } catch (error) {
    console.error("更新歌单失败:", error);
    return NextResponse.json(
      { error: "更新歌单失败" },
      { status: 500 }
    );
  }
}

// DELETE /api/music/playlists/:id - 删除歌单
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

    // 检查歌单是否存在
    const [existingPlaylist] = await db
      .select()
      .from(playlists)
      .where(eq(playlists.id, id))
      .limit(1);

    if (!existingPlaylist) {
      return NextResponse.json(
        { error: "歌单不存在" },
        { status: 404 }
      );
    }

    // 删除歌单（级联删除关联的歌曲）
    await db.delete(playlists).where(eq(playlists.id, id));

    return NextResponse.json(
      { message: "歌单删除成功" },
      { status: 200 }
    );
  } catch (error) {
    console.error("删除歌单失败:", error);
    return NextResponse.json(
      { error: "删除歌单失败" },
      { status: 500 }
    );
  }
}
