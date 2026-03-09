import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { playlists, playlistSongs } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

// 必须使用 Node.js 运行时（SQLite 需要）
export const runtime = "nodejs";

// DELETE /api/music/playlists/:id/songs/:songId - 从歌单移除歌曲
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; songId: string } }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "未认证" },
      { status: 401 }
    );
  }

  try {
    const { id, songId } = params;

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

    // 检查歌曲是否在歌单中
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

    if (!existingRelation) {
      return NextResponse.json(
        { error: "歌曲不在该歌单中" },
        { status: 404 }
      );
    }

    // 从歌单移除歌曲
    await db
      .delete(playlistSongs)
      .where(
        and(
          eq(playlistSongs.playlistId, id),
          eq(playlistSongs.songId, songId)
        )
      );

    return NextResponse.json(
      { message: "歌曲移除成功" },
      { status: 200 }
    );
  } catch (error) {
    console.error("从歌单移除歌曲失败:", error);
    return NextResponse.json(
      { error: "从歌单移除歌曲失败" },
      { status: 500 }
    );
  }
}
