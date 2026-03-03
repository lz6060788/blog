import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import {
  uploadFile as cosUploadFile,
  deleteFile as cosDeleteFile,
  validateFileType,
  validateFileSize,
  getMimeType,
  validateFileMagicNumber,
} from "@/server/services/cos-service";
import { db } from "@/server/db";
import { fileUploads } from "@/server/db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

// 必须使用 Node.js 运行时（COS SDK 和 SQLite 需要）
export const runtime = "nodejs";

// ============================================================================
// 错误代码常量
// ============================================================================

const ERROR_CODES = {
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  INVALID_FILE_CONTENT: "INVALID_FILE_CONTENT",
  UPLOAD_FAILED: "UPLOAD_FAILED",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
} as const;

// ============================================================================
// POST /api/upload - 上传文件
// ============================================================================

/**
 * POST /api/upload
 *
 * 请求格式：multipart/form-data
 * - file: 文件数据
 *
 * 响应格式：
 * {
 *   url: string,        // 文件公开访问 URL
 *   key: string,        // COS 对象键
 *   filename: string,   // 原始文件名
 *   size: number,       // 文件大小（字节）
 *   type: string        // MIME 类型
 * }
 *
 * 错误响应：
 * {
 *   error: string,      // 错误代码
 *   message: string,    // 错误消息
 *   details?: any       // 详细信息
 * }
 */
export async function POST(request: Request) {
  // 1. 认证检查
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: ERROR_CODES.UNAUTHORIZED,
        message: "请先登录",
      },
      { status: 401 }
    );
  }

  try {
    // 2. 解析表单数据
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          error: "INVALID_REQUEST",
          message: "未找到文件数据",
        },
        { status: 400 }
      );
    }

    // 3. 文件类型验证
    if (!validateFileType(file.name)) {
      return NextResponse.json(
        {
          error: ERROR_CODES.INVALID_FILE_TYPE,
          message: "不支持的文件类型",
          details: {
            allowedTypes: ["jpg", "png", "gif", "webp", "svg", "pdf", "doc", "docx", "txt", "md"],
          },
        },
        { status: 400 }
      );
    }

    // 4. 文件大小验证
    if (!validateFileSize(file.size)) {
      return NextResponse.json(
        {
          error: ERROR_CODES.FILE_TOO_LARGE,
          message: "文件大小超过限制",
          details: {
            maxSize: 5 * 1024 * 1024, // 5MB
            actualSize: file.size,
          },
        },
        { status: 400 }
      );
    }

    // 5. 将文件转换为 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. 文件魔数验证（防止恶意文件）
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!validateFileMagicNumber(buffer, fileExtension)) {
      return NextResponse.json(
        {
          error: ERROR_CODES.INVALID_FILE_CONTENT,
          message: "文件内容与扩展名不匹配，可能是恶意文件",
        },
        { status: 400 }
      );
    }

    // 7. 上传到 COS
    const uploadResult = await cosUploadFile(buffer, file.name);

    // 8. 保存元数据到数据库
    const fileRecord = {
      id: nanoid(),
      key: uploadResult.key,
      filename: file.name,
      size: file.size,
      mimeType: getMimeType(file.name),
      uploaderId: session.user.id,
      createdAt: new Date().toISOString(),
    };

    await db.insert(fileUploads).values(fileRecord);

    // 9. 返回成功响应
    return NextResponse.json(
      {
        url: uploadResult.url,
        key: uploadResult.key,
        filename: fileRecord.filename,
        size: fileRecord.size,
        type: fileRecord.mimeType,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("文件上传失败:", error);

    return NextResponse.json(
      {
        error: ERROR_CODES.UPLOAD_FAILED,
        message: error instanceof Error ? error.message : "文件上传失败，请稍后重试",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/upload/:key - 删除文件
// ============================================================================

/**
 * DELETE /api/upload/:key
 *
 * 路径参数：
 * - key: COS 对象键
 *
 * 响应格式：
 * {
 *   message: string  // 成功消息
 * }
 *
 * 错误响应：
 * {
 *   error: string,   // 错误代码
 *   message: string  // 错误消息
 * }
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  // 1. 认证检查
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: ERROR_CODES.UNAUTHORIZED,
        message: "请先登录",
      },
      { status: 401 }
    );
  }

  try {
    // 2. 获取文件键
    const { key } = await params;

    if (!key) {
      return NextResponse.json(
        {
          error: "INVALID_REQUEST",
          message: "缺少文件键",
        },
        { status: 400 }
      );
    }

    // 3. 查询文件记录并验证权限
    const fileRecords = await db
      .select()
      .from(fileUploads)
      .where(eq(fileUploads.key, key))
      .limit(1);

    const fileRecord = fileRecords[0];

    if (!fileRecord) {
      return NextResponse.json(
        {
          error: ERROR_CODES.NOT_FOUND,
          message: "文件不存在",
        },
        { status: 404 }
      );
    }

    // 4. 授权检查（只能删除自己上传的文件）
    if (fileRecord.uploaderId !== session.user.id) {
      return NextResponse.json(
        {
          error: ERROR_CODES.FORBIDDEN,
          message: "无权删除此文件",
        },
        { status: 403 }
      );
    }

    // 5. 从 COS 删除文件
    await cosDeleteFile(key);

    // 6. 从数据库删除记录
    await db.delete(fileUploads).where(eq(fileUploads.key, key));

    // 7. 返回成功响应
    return NextResponse.json(
      {
        message: "文件删除成功",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("文件删除失败:", error);

    return NextResponse.json(
      {
        error: "DELETE_FAILED",
        message: error instanceof Error ? error.message : "文件删除失败",
      },
      { status: 500 }
    );
  }
}
