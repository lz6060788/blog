import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { uploadMusic } from "@/server/services/music-upload-service";

// 必须使用 Node.js 运行时
export const runtime = "nodejs";

// POST /api/music/upload - 上传音乐文件
export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "未认证" },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "未提供文件" },
        { status: 400 }
      );
    }

    // 获取可选的元数据
    const title = formData.get("title") as string | null;
    const artist = formData.get("artist") as string | null;
    const album = formData.get("album") as string | null;
    const lyrics = formData.get("lyrics") as string | null;
    const durationStr = formData.get("duration") as string | null;

    // 将文件转换为Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 上传音乐
    const result = await uploadMusic(buffer, file.name, {
      title: title || undefined,
      artist: artist || undefined,
      album: album || undefined,
      lyrics: lyrics || undefined,
      duration: durationStr ? parseInt(durationStr, 10) : undefined,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("上传音乐失败:", error);

    const errorMessage = error instanceof Error ? error.message : "上传音乐失败";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
