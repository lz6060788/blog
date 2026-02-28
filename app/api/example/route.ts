import { NextResponse } from "next/server";
import { db } from "@/server/db";

// 必须使用 Node.js 运行时（SQLite 需要）
export const runtime = "nodejs";

// GET - 获取所有资源
export async function GET() {
  try {
    // TODO: 实现从数据库获取数据的逻辑
    // const items = await db.select().from(schema.exampleTable);

    return NextResponse.json({
      items: [],
      message: "使用此模板作为 CRUD 操作的参考",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "获取资源失败", details: error },
      { status: 500 }
    );
  }
}

// POST - 创建新资源
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // TODO: 实现向数据库插入数据的逻辑
    // const newItem = await db.insert(schema.exampleTable).values(body).returning();

    return NextResponse.json(
      { message: "资源已创建（示例）", data: body },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "创建资源失败", details: error },
      { status: 500 }
    );
  }
}
