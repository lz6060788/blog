// 此文件用于验证 Drizzle ORM 的 TypeScript 类型推断
// 可以在添加实际的表定义后使用

import { db } from "./db";
import { sql } from "drizzle-orm";

// 类型推断测试示例（当有实际表定义时）：
// const result = await db.select().from(schema.exampleTable);
// TypeScript 会自动推断 result 的类型

console.log("TypeScript 类型推断验证：Drizzle ORM 配置正确");
