import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { songs } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";

// 必须使用 Node.js 运行时（SQLite 需要）
export const runtime = "nodejs";

// GET /api/music/songs - 获取所有歌曲
export async function GET(request: Request) {
  // 移除权限校验，允许所有用户访问音乐列表
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const allSongs = await db
      .select()
      .from(songs)
      .orderBy(desc(songs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      data: allSongs,
      pagination: {
        page,
        limit,
        total: allSongs.length
      }
    });
  } catch (error) {
    console.error("获取歌曲失败:", error);
    return NextResponse.json(
      { error: "获取歌曲失败" },
      { status: 500 }
    );
  }
}

// POST /api/music/songs - 创建歌曲
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
      artist,
      album,
      duration,
      audioUrl,
      lyrics,
      fileSize,
      fileFormat,
      metadata
    } = body;

    // 验证必填字段
    if (!title || !artist || !duration || !audioUrl) {
      return NextResponse.json(
        { error: "歌曲标题、艺术家、时长和音频URL为必填项" },
        { status: 400 }
      );
    }

    // 生成 ID
    const id = crypto.randomUUID();

    // 创建歌曲
    const [newSong] = await db
      .insert(songs)
      .values({
        id,
        title,
        artist,
        album: album || null,
        duration,
        audioUrl,
        lyrics: lyrics || null,
        fileSize: fileSize || null,
        fileFormat: fileFormat || null,
        uploadStatus: 'completed',
        metadata: metadata ? JSON.stringify(metadata) : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newSong, { status: 201 });
  } catch (error) {
    console.error("创建歌曲失败:", error);
    return NextResponse.json(
      { error: "创建歌曲失败" },
      { status: 500 }
    );
  }
}
