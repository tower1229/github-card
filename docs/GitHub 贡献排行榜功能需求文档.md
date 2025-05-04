# GitHub 贡献排行榜功能需求文档

## 概述

为 GitHub 用户卡片生成应用添加实时贡献排行榜功能，展示用户按贡献分数排名。排行榜默认显示前 20 名用户，并在当前用户不在前 20 名时在底部额外显示其排名信息。

## 功能需求

### 1. 数据收集

- 用户生成 GitHub 卡片时存储贡献数据
- 记录总贡献数、用户名、头像和生成日期
- 确保同一 GitHub 用户不会重复记录

### 2. 排行榜界面

- 显示按贡献数排名的前 20 名用户
- 对于未进入前 20 名的已登录用户，在底部附加其排名
- 为每个条目显示排名、GitHub 用户名、头像和贡献数
- 包含最后更新时间戳

### 3. 用户体验

- 排行数据缓存 1 小时
- 添加手动刷新按钮
- 实现排名变化的平滑动画
- 突出显示当前用户的条目

## 技术需求

### 数据库设计

#### 现有表结构

根据当前代码库中的表结构，已有以下相关表：

- `user` - 用户信息表，包含 GitHub 用户的基本信息
- `account` - OAuth 账户关联表
- `share_links` - 包含已生成卡片的分享链接数据，其中 `card_data` 字段存储卡片数据
- `user_behaviors` - 记录用户行为数据

#### 新表：`contribution_leaderboard`

```sql
CREATE TABLE "contribution_leaderboard" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "contribution_count" INTEGER NOT NULL,
  "rank" INTEGER,
  "last_updated" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "contribution_leaderboard_contribution_count_idx" ON "contribution_leaderboard" ("contribution_count" DESC);
CREATE INDEX "contribution_leaderboard_userId_idx" ON "contribution_leaderboard" ("userId");
```

Drizzle ORM 结构定义：

```typescript
// 在 schema.ts 中添加
export const contributionLeaderboard = pgTable("contribution_leaderboard", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  contributionCount: integer("contribution_count").notNull(),
  rank: integer("rank"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contributionLeaderboardRelations = relations(
  contributionLeaderboard,
  ({ one }) => ({
    user: one(users, {
      fields: [contributionLeaderboard.userId],
      references: [users.id],
    }),
  })
);

// 添加类型定义
export type ContributionLeaderboard =
  typeof contributionLeaderboard.$inferSelect;
export type NewContributionLeaderboard =
  typeof contributionLeaderboard.$inferInsert;
```

#### 利用现有的 `share_links` 表

我们不需要修改现有表结构，而是使用以下策略：

1. 从 `share_links` 表的 `card_data` JSON 字段中提取贡献数据
2. 当用户生成新卡片时，同时更新 `contribution_leaderboard` 表
3. 使用 `users` 表获取用户信息，如头像和用户名

### API 端点

#### 1. **GET `/api/leaderboard`**

获取贡献排行榜数据。

**请求参数：**

- `limit` (可选): 限制返回的排名数量，默认为 20
- `page` (可选): 用于分页的页码，默认为 1

**响应格式：**

```typescript
{
  leaderboard: Array<{
    rank: number;             // 排名
    userId: string;           // 用户ID
    username: string;         // GitHub用户名
    displayName?: string;     // 显示名称（如果有）
    avatarUrl: string;        // 头像URL
    contributionCount: number; // 贡献总数
  }>;
  currentUser?: {
    rank: number;             // 当前用户排名
    contributionCount: number; // 当前用户贡献总数
  };
  totalUsers: number;         // 排行榜总用户数
  lastUpdated: string;        // 最后更新时间
}
```

#### 2. **POST `/api/leaderboard/update`**

更新用户的贡献数据。该接口在用户生成卡片时自动调用，无需前端显式调用。

**请求体：**

```typescript
{
  userId: string; // 用户ID
  contributionCount: number; // 贡献总数
}
```

**响应格式：**

```typescript
{
  success: boolean;             // 操作是否成功
  rank?: number;                // 更新后的排名
  previousRank?: number;        // 之前的排名（如果有）
}
```

#### 3. **GET `/api/leaderboard/refresh`**

强制刷新排行榜数据。该接口重新计算所有用户的排名。

**响应格式：**

```typescript
{
  success: boolean; // 操作是否成功
  updatedAt: string; // 更新时间
  affectedRows: number; // 受影响的行数
}
```

### 实现计划

#### 1. **数据库迁移**

- 创建 `contribution_leaderboard` 表的迁移脚本
- 在 `schema.ts` 中添加表定义和关系
- 添加类型定义
- 执行 `db:generate` 和 `db:migrate` 命令应用迁移

#### 2. **后端服务**

- 创建 `lib/leaderboard.ts` 服务文件，包含以下功能：
  - `updateUserContribution(userId: string, contributionCount: number)`: 更新用户贡献数据
  - `getLeaderboard(limit: number, page: number)`: 获取排行榜数据
  - `getUserRank(userId: string)`: 获取指定用户的排名
  - `refreshLeaderboard()`: 刷新排行榜数据
- 创建 API 路由处理程序：
  - `/api/leaderboard/route.ts`
  - `/api/leaderboard/update/route.ts`
  - `/api/leaderboard/refresh/route.ts`

#### 3. **卡片生成流程修改**

- 修改 `/app/api/share-links/route.ts` 中的卡片生成逻辑：
  - 提取卡片 JSON 数据中的贡献总数
  - 调用 `updateUserContribution` 更新贡献数据
- 为现有数据进行迁移的脚本：
  - 创建 `scripts/migrate-contribution-data.ts`
  - 从已有的 `share_links` 表中提取贡献数据
  - 导入到新的 `contribution_leaderboard` 表中

#### 4. **前端组件**

- 创建排行榜页面组件 `/app/leaderboard/page.tsx`
- 创建以下共享组件：
  - `app/components/LeaderboardList.tsx`: 排行榜列表组件
  - `app/components/LeaderboardItem.tsx`: 排行榜条目组件
  - `app/components/UserRank.tsx`: 用户当前排名组件
  - `app/components/LeaderboardRefreshButton.tsx`: 刷新按钮组件
- 添加动画效果
  - 使用 Framer Motion 实现排名变化动画
  - 添加首次加载动画

#### 5. **导航和路由**

- 在导航菜单中添加排行榜入口
- 添加相关路由配置
- 添加权限控制，确保只有已登录用户可以查看详细排名

#### 6. **缓存机制**

- 实现排行榜数据的服务器缓存：
  - 使用 Next.js 的 cache() 和 revalidatePath() API
  - 设置缓存时间为 1 小时
  - 手动刷新时清除缓存

## 设计指南

- 使用与现有卡片设计一致的样式
- 实现响应式布局，适应移动端和桌面端
- 为排名变化和更新使用动画
- 包含用户自身排名的视觉指示器

## 测试要求

- 使用具有不同贡献数的各种 GitHub 配置文件进行测试
- 验证重复条目的正确处理
- 测试边缘情况（贡献为 0 的用户，贡献非常高的用户）
- 使用大型用户数据集进行性能测试

## 监控和分析

- 跟踪排行榜页面浏览量
- 监控数据库查询性能
- 跟踪卡片生成到排行榜条目的转化率

## 部署计划

1. 在代码部署前运行数据库迁移
2. 首先部署后端更改
3. 部署前端更改
4. 在初始推出期间监控错误

## 未来增强

- 按时间段筛选（每周、每月、每年）
- 为排行榜位置添加社交分享功能
- 为里程碑贡献实现成就/徽章系统
- 为组织或团队启用自定义排行榜
