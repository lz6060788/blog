# 项目规范

## 数据库迁移 - 强制规则

⚠️ **本项目使用 `drizzle-kit migrate` 管理数据库版本**

### 禁止操作
- ❌ **禁止使用 `drizzle-kit push`** - 这会破坏迁移历史
- ❌ **禁止手动修改生产数据库** - 所有变更必须通过迁移文件

### 正确流程

#### 开发新功能（需要数据库变更）
```bash
# 1. 修改 schema.ts
# 2. 生成迁移文件
npx drizzle-kit generate

# 3. 本地测试迁移
npx drizzle-kit migrate

# 4. 提交迁移文件到 git
git add drizzle/XX_*.sql
```

#### 清空本地数据库（开发时）
```bash
# 删除数据库文件，重新运行迁移
rm ./data/db.sqlite
npx drizzle-kit migrate
```

#### 生产环境部署
```bash
# Docker 容器启动时会自动执行
npx drizzle-kit migrate  # 只执行未执行的迁移
```

### AI 辅助时注意
如果你是 AI 助手，遇到数据库相关任务时：
1. 优先使用 `drizzle-kit generate` 生成迁移文件
2. 永远不要建议使用 `drizzle-kit push`
3. 迁移文件必须提交到版本控制

### 迁移历史修复
如果数据库状态与迁移历史不同步，使用：
```bash
# 检查迁移状态
sqlite3 ./data/db.sqlite "SELECT * FROM __drizzle_migrations"

# 如果为空，说明数据库是用 push 创建的，需要：
# 选项1：删除数据库重新 migrate（推荐，会丢失数据）
rm ./data/db.sqlite
npx drizzle-kit migrate

# 选项2：手动填充迁移记录（保留数据）
node fix-migration-tracking.js  # 需要预先创建此脚本
```
