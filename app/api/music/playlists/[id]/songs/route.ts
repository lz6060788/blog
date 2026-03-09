import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { playlists, playlistSongs } from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";

// 必须使用 Node.js 运行时（SQLite 需要）
export const runtime = "nodejs";

// POST /api/music/playlists/:id/songs - 添加歌曲到歌单
export async function POST(
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
    const { songId } = body;

    if (!songId) {
      return NextResponse.json(
        { error: "歌曲ID为必填项" },
        { status: 400 }
      );
    }

    // 检查歌单是否存在
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

    // 检查歌曲是否已在歌单中
    const [existingRelation] = await db
      .select()
      .from(playlistSongs)
      .where(
        and(
          eq(playlistSongs.playlistId, id),
          eq(playlistSongs.songId, songId)
        )
      )
      .limit(1);

    if (existingRelation) {
      return NextResponse.json(
        { error: "歌曲已在该歌单中" },
        { status: 400 }
      );
    }

    // 获取当前最大位置
    const [maxPosition] = await db
      .select({ position: playlistSongs.position })
      .from(playlistSongs)
      .where(eq(playlistSongs.playlistId, id))
      .orderBy(desc(playlistSongs.position))
      .limit(1);

    const newPosition = (maxPosition?.position ?? -1) + 1;

    // 添加歌曲到歌单
    await db.insert(playlistSongs).values({
      id: crypto.randomUUID(),
      playlistId: id,
      songId,
      position: newPosition,
    });

    return NextResponse.json(
      { message: "歌曲添加成功" },
      { status: 201 }
    );
  } catch (error) {
    console.error("添加歌曲到歌单失败:", error);
    return NextResponse.json(
      { error: "添加歌曲到歌单失败" },
      { status: 500 }
    );
  }
}
