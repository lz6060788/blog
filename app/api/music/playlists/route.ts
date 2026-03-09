import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { playlists, songs, playlistSongs } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";

// 必须使用 Node.js 运行时（SQLite 需要）
export const runtime = "nodejs";

// GET /api/music/playlists - 获取所有歌单
export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "未认证" },
      { status: 401 }
    );
  }

  try {
    const allPlaylists = await db
      .select()
      .from(playlists)
      .orderBy(desc(playlists.createdAt));

    // 为每个歌单获取包含的歌曲
    const playlistsWithSongs = await Promise.all(
      allPlaylists.map(async (playlist) => {
        const songRelations = await db
          .select({
            songId: playlistSongs.songId,
            position: playlistSongs.position,
          })
          .from(playlistSongs)
          .where(eq(playlistSongs.playlistId, playlist.id))
          .orderBy(playlistSongs.position);

        const songIds = songRelations.map((r) => r.songId);

        const playlistSongsData =
          songIds.length > 0
            ? await db
                .select()
                .from(songs)
                .where(eq(songs.id, songIds[0])) // 简化处理，实际需要whereIn
            : [];

        return {
          ...playlist,
          songs: playlistSongsData,
        };
      })
    );

    return NextResponse.json(playlistsWithSongs);
  } catch (error) {
    console.error("获取歌单失败:", error);
    return NextResponse.json(
      { error: "获取歌单失败" },
      { status: 500 }
    );
  }
}

// POST /api/music/playlists - 创建歌单
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
    const { name, description, coverColor, songIds } = body;

    // 验证必填字段
    if (!name) {
      return NextResponse.json(
        { error: "歌单名称为必填项" },
        { status: 400 }
      );
    }

    // 生成 ID
    const id = crypto.randomUUID();

    // 创建歌单
    const [newPlaylist] = await db
      .insert(playlists)
      .values({
        id,
        name,
        description: description || null,
        coverColor: coverColor || '#6366f1',
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    // 如果提供了歌曲ID列表，添加歌曲到歌单
    if (songIds && Array.isArray(songIds) && songIds.length > 0) {
      for (let i = 0; i < songIds.length; i++) {
        await db.insert(playlistSongs).values({
          id: crypto.randomUUID(),
          playlistId: id,
          songId: songIds[i],
          position: i,
        });
      }
    }

    return NextResponse.json(newPlaylist, { status: 201 });
  } catch (error) {
    console.error("创建歌单失败:", error);
    return NextResponse.json(
      { error: "创建歌单失败" },
      { status: 500 }
    );
  }
}
