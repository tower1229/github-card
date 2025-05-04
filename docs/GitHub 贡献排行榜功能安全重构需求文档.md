# GitHub 贡献排行榜功能安全重构需求文档

## 概述

当前 GitHub 用户卡片生成与贡献排行榜功能存在数据可靠性问题，由于数据获取和提交均在前端进行，存在数据伪造风险。本次重构旨在将数据获取和处理逻辑迁移至服务端，确保数据真实性和系统安全性。

## 现存问题

1. GitHub 数据获取在前端进行，API 可能被滥用
2. 分享链接生成时前端直接传递 cardData，可能被伪造
3. 贡献排行榜更新接口接受前端传递的贡献数据，可被人为操纵
4. 频繁请求 GitHub API 可能导致性能问题和请求限制

## 重构目标

1. 将 GitHub 数据获取迁移至服务端以保护 API
2. 重构分享链接生成流程，由服务端统一获取真实数据
3. 修改排行榜更新接口，使用服务端数据源
4. 实现 GitHub 数据服务端缓存机制，优化性能

## 功能需求

### 1. 服务端 GitHub 数据获取

- 创建服务端 GitHub API 客户端，用于获取用户数据
- 基于用户鉴权信息获取相应的 GitHub 用户名
- 实现数据获取错误处理和失败重试机制
- 对 GitHub API 响应进行标准化处理

### 2. 分享链接生成流程重构

- 修改分享链接生成接口，仅接收 templateType 参数
- 通过会话获取当前认证用户的 GitHub 用户名
- 服务端调用 GitHub API 获取真实用户数据
- 基于获取的数据生成卡片和分享链接

### 3. 贡献排行榜更新机制重构

- 移除排行榜更新接口的用户输入参数
- 通过用户鉴权获取用户 ID
- 从服务端缓存或 GitHub API 获取用户贡献数据
- 更新贡献排行榜数据并返回最新排名

### 4. GitHub 数据服务端缓存

- 实现内存缓存机制，存储 GitHub 用户数据
- 缓存有效期设置为 1 小时
- 添加缓存命中率监控
- 实现定期缓存清理机制

## 技术方案

### 服务端 GitHub API 客户端

#### 1. 创建 GitHub API 服务

```typescript
// lib/github/api.ts
import { cache } from "react";
import { githubCacheManager } from "./cache";

// 缓存 GitHub API 请求，有效期 1 小时
export const getGitHubUserData = cache(async (username: string) => {
  const cacheKey = `github:user:${username}`;

  // 检查缓存
  const cachedData = githubCacheManager.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // 发起 GitHub API 请求
  const userData = await fetchGitHubUserData(username);

  // 存入缓存
  githubCacheManager.set(cacheKey, userData, 60 * 60 * 1000); // 1小时有效期

  return userData;
});

// 获取用户贡献数据
export const getGitHubContributions = cache(async (username: string) => {
  const cacheKey = `github:contributions:${username}`;

  // 检查缓存
  const cachedData = githubCacheManager.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // 获取贡献数据
  const contributionsData = await fetchGitHubContributions(username);

  // 存入缓存
  githubCacheManager.set(cacheKey, contributionsData, 60 * 60 * 1000);

  return contributionsData;
});

// 实际的 GitHub API 请求函数
async function fetchGitHubUserData(username: string) {
  // GitHub API 请求逻辑
  // ...
}

async function fetchGitHubContributions(username: string) {
  // GitHub 贡献数据获取逻辑
  // ...
}
```

#### 2. 缓存管理器实现

```typescript
// lib/github/cache.ts
import { createEdgeConfigClient } from "@vercel/edge-config";

// 创建Edge Config客户端
const edgeConfig = createEdgeConfigClient(process.env.EDGE_CONFIG);

export class CacheManager {
  private prefix: string;

  constructor(prefix = "github-cache:") {
    this.prefix = prefix;
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      const fullKey = this.prefix + key;
      // 设置缓存值
      await edgeConfig.set(fullKey, {
        value,
        expiry: Date.now() + ttl,
      });
      console.log(`Cache set: ${fullKey}`);
    } catch (error) {
      console.error("Edge Config set error:", error);
      // 静默失败，不影响主功能
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.prefix + key;
      const data = await edgeConfig.get(fullKey);

      if (!data) return null;

      // 检查是否过期
      if (data.expiry < Date.now()) {
        // 尝试删除过期项
        try {
          await edgeConfig.delete(fullKey);
        } catch (e) {
          // 忽略删除错误
        }
        return null;
      }

      return data.value as T;
    } catch (error) {
      console.error("Edge Config get error:", error);
      return null;
    }
  }

  // 清理过期项 - 虽然我们在get时会检查过期，但定期清理仍然有用
  async cleanup(): Promise<void> {
    try {
      // 获取所有以prefix开头的键
      const items = await edgeConfig.items();
      const now = Date.now();
      const expiredKeys = [];

      // 找出所有过期的键
      for (const [key, data] of Object.entries(items)) {
        if (key.startsWith(this.prefix) && data.expiry < now) {
          expiredKeys.push(key);
        }
      }

      // 删除过期项
      if (expiredKeys.length > 0) {
        await Promise.all(expiredKeys.map((key) => edgeConfig.delete(key)));
        console.log(`Cleaned up ${expiredKeys.length} expired items`);
      }
    } catch (error) {
      console.error("Edge Config cleanup error:", error);
    }
  }
}

// 创建缓存管理器实例
export const githubCacheManager = new CacheManager();
```

### API 接口重构

#### 1. 分享链接生成接口

```typescript
// app/api/share-links/route.ts

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getGitHubUserData, getGitHubContributions } from "@/lib/github/api";
import { db } from "@/lib/db";
import { shareLinks } from "@/db/schema";
import { updateUserContribution } from "@/lib/leaderboard";

export async function POST(req: Request) {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // 解析请求体
    const { templateType } = await req.json();
    if (!templateType) {
      return new Response(JSON.stringify({ error: "Missing template type" }), {
        status: 400,
      });
    }

    // 获取用户 GitHub 用户名
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.user.id),
      with: {
        accounts: true,
      },
    });

    if (!user || !user.accounts.length) {
      return new Response(
        JSON.stringify({ error: "GitHub account not found" }),
        {
          status: 404,
        }
      );
    }

    // 提取 GitHub 用户名
    const githubAccount = user.accounts.find(
      (acc) => acc.provider === "github"
    );
    const username = githubAccount?.providerAccountId || user.name;

    if (!username) {
      return new Response(
        JSON.stringify({ error: "GitHub username not found" }),
        {
          status: 404,
        }
      );
    }

    // 获取 GitHub 用户数据
    const userData = await getGitHubUserData(username);
    // 获取贡献数据
    const contributionsData = await getGitHubContributions(username);

    // 组装卡片数据
    const cardData = {
      username,
      name: userData.name,
      avatarUrl: userData.avatar_url,
      followers: userData.followers,
      following: userData.following,
      publicRepos: userData.public_repos,
      contributions: contributionsData.totalContributions,
      // 其他需要的数据...
    };

    // 生成分享链接
    const linkData = await db
      .insert(shareLinks)
      .values({
        userId: session.user.id,
        cardData: cardData,
        templateType,
      })
      .returning();

    // 更新贡献排行榜
    await updateUserContribution(
      session.user.id,
      contributionsData.totalContributions
    );

    return new Response(
      JSON.stringify({
        success: true,
        shareId: linkData[0].id,
        cardData,
      })
    );
  } catch (error) {
    console.error("Error generating share link:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate share link" }),
      {
        status: 500,
      }
    );
  }
}
```

#### 2. 贡献排行榜更新接口

````typescript
// app/api/leaderboard/update/route.ts

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGitHubContributions } from "@/lib/github/api";
import { contributionLeaderboard } from "@/db/schema";

export async function POST();
Continuing with the rest of the requirements document:

```typescript
// app/api/leaderboard/update/route.ts

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGitHubContributions } from "@/lib/github/api";
import { contributionLeaderboard } from "@/db/schema";

export async function POST() {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // 获取用户信息
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.user.id),
      with: {
        accounts: true,
      },
    });

    if (!user || !user.accounts.length) {
      return new Response(JSON.stringify({ error: "User account not found" }), {
        status: 404,
      });
    }

    // 提取 GitHub 用户名
    const githubAccount = user.accounts.find(acc => acc.provider === "github");
    const username = githubAccount?.providerAccountId || user.name;

    if (!username) {
      return new Response(JSON.stringify({ error: "GitHub username not found" }), {
        status: 404,
      });
    }

    // 从服务端获取最新贡献数据
    const contributionsData = await getGitHubContributions(username);
    const contributionScore = contributionsData.totalContributions;

    // 查询用户当前排名
    const currentRank = await db.query.contributionLeaderboard.findFirst({
      where: (leaderboard, { eq }) => eq(leaderboard.userId, session.user.id),
    });

    let previousRank = currentRank?.rank;

    // 更新用户贡献数据
    await db
      .insert(contributionLeaderboard)
      .values({
        userId: session.user.id,
        contribution_score: contributionScore,
        lastUpdated: new Date(),
      })
      .onConflictDoUpdate({
        target: contributionLeaderboard.userId,
        set: {
          contribution_score: contributionScore,
          lastUpdated: new Date(),
        },
      });

    // 重新计算排名
    const updatedRank = await calculateRank(session.user.id);

    return new Response(
      JSON.stringify({
        success: true,
        rank: updatedRank,
        previousRank,
      })
    );
  } catch (error) {
    console.error("Error updating contribution:", error);
    return new Response(JSON.stringify({ error: "Failed to update contribution" }), {
      status: 500,
    });
  }
}

// 计算用户排名
async function calculateRank(userId: string) {
  // 实现排名计算逻辑
  const leaderboardQuery = await db.query.contributionLeaderboard.findMany({
    orderBy: (leaderboard, { desc }) => [desc(leaderboard.contribution_score)],
  });

  // 更新所有排名
  for (let i = 0; i < leaderboardQuery.length; i++) {
    await db
      .update(contributionLeaderboard)
      .set({ rank: i + 1 })
      .where(eq(contributionLeaderboard.id, leaderboardQuery[i].id));
  }

  // 获取用户排名
  const userRank = leaderboardQuery.findIndex(item => item.userId === userId) + 1;
  return userRank > 0 ? userRank : null;
}
````

#### 3. 获取排行榜接口

```typescript
// app/api/leaderboard/route.ts

import { cache } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { contributionLeaderboard, users } from "@/db/schema";

// 缓存获取排行榜数据的函数
const getLeaderboardData = cache(
  async (limit: number = 20, page: number = 1) => {
    const offset = (page - 1) * limit;

    // 获取排行榜数据
    const leaderboardData = await db.query.contributionLeaderboard.findMany({
      orderBy: (leaderboard, { desc }) => [
        desc(leaderboard.contribution_score),
      ],
      limit,
      offset,
      with: {
        user: {
          include: {
            accounts: true,
          },
        },
      },
    });

    // 获取总用户数
    const totalUsers = await db
      .select({ count: count() })
      .from(contributionLeaderboard);

    // 格式化返回数据
    const formattedData = leaderboardData.map((item) => ({
      rank: item.rank,
      userId: item.userId,
      username:
        item.user.accounts.find((acc) => acc.provider === "github")
          ?.providerAccountId || item.user.name,
      displayName: item.user.name,
      avatarUrl: item.user.image,
      contribution_score: item.contribution_score,
    }));

    return {
      leaderboard: formattedData,
      totalUsers: totalUsers[0].count,
      lastUpdated: new Date().toISOString(),
    };
  }
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    // 获取用户会话
    const session = await getServerSession(authOptions);

    // 获取排行榜数据
    const leaderboardData = await getLeaderboardData(limit, page);

    // 如果用户已登录，获取其排名
    if (session?.user) {
      const userRank = await db.query.contributionLeaderboard.findFirst({
        where: (leaderboard, { eq }) => eq(leaderboard.userId, session.user.id),
        with: {
          user: true,
        },
      });

      if (userRank) {
        leaderboardData.currentUser = {
          rank: userRank.rank,
          username: session.user.name,
          displayName: session.user.name,
          avatarUrl: session.user.image,
          contribution_score: userRank.contribution_score,
        };
      }
    }

    return new Response(JSON.stringify(leaderboardData));
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch leaderboard" }),
      {
        status: 500,
      }
    );
  }
}
```

#### 4. 手动刷新排行榜接口

```typescript
// app/api/leaderboard/refresh/route.ts

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { contributionLeaderboard } from "@/db/schema";

export async function GET() {
  try {
    // 获取用户会话并验证权限
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // 重新计算所有用户排名
    const leaderboardQuery = await db.query.contributionLeaderboard.findMany({
      orderBy: (leaderboard, { desc }) => [
        desc(leaderboard.contribution_score),
      ],
    });

    // 批量更新排名
    for (let i = 0; i < leaderboardQuery.length; i++) {
      await db
        .update(contributionLeaderboard)
        .set({
          rank: i + 1,
          lastUpdated: new Date(),
        })
        .where(eq(contributionLeaderboard.id, leaderboardQuery[i].id));
    }

    // 清除相关页面缓存
    revalidatePath("/leaderboard");
    revalidatePath("/api/leaderboard");

    return new Response(
      JSON.stringify({
        success: true,
        updatedAt: new Date().toISOString(),
        affectedRows: leaderboardQuery.length,
      })
    );
  } catch (error) {
    console.error("Error refreshing leaderboard:", error);
    return new Response(
      JSON.stringify({ error: "Failed to refresh leaderboard" }),
      {
        status: 500,
      }
    );
  }
}
```

### 缓存管理优化

```typescript
// lib/github/cache-metrics.ts

interface CacheMetrics {
  hits: number;
  misses: number;
  items: number;
  hitRate: () => number;
  reset: () => void;
}

export class CacheMetrics {
  hits = 0;
  misses = 0;
  items = 0;

  hitRate() {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }

  reset() {
    this.hits = 0;
    this.misses = 0;
    this.items = 0;
  }
}

export const githubCacheMetrics = new CacheMetrics();
```

```typescript
// 改进的缓存管理器
// lib/github/cache.ts

import { githubCacheMetrics } from "./cache-metrics";

interface CacheItem<T> {
  value: T;
  expiry: number;
  lastAccessed: number;
}

export class CacheManager {
  private cache: Map<string, CacheItem<any>> = new Map();
  private maxItems: number;

  constructor(maxItems = 1000) {
    this.maxItems = maxItems;
  }

  set<T>(key: string, value: T, ttl: number): void {
    // 检查缓存是否已满
    if (this.cache.size >= this.maxItems && !this.cache.has(key)) {
      this.evictLRU();
    }

    const expiry = Date.now() + ttl;
    this.cache.set(key, {
      value,
      expiry,
      lastAccessed: Date.now(),
    });

    githubCacheMetrics.items = this.cache.size;
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      githubCacheMetrics.misses += 1;
      return null;
    }

    // 检查是否过期
    if (item.expiry < Date.now()) {
      this.cache.delete(key);
      githubCacheMetrics.misses += 1;
      githubCacheMetrics.items = this.cache.size;
      return null;
    }

    // 更新最后访问时间
    item.lastAccessed = Date.now();
    githubCacheMetrics.hits += 1;
    return item.value;
  }

  // 清理过期项
  cleanup(): number {
    const now = Date.now();
    let deleted = 0;

    for (const [key, item] of this.cache.entries()) {
      if (item.expiry < now) {
        this.cache.delete(key);
        deleted += 1;
      }
    }

    githubCacheMetrics.items = this.cache.size;
    return deleted;
  }

  // LRU 淘汰策略
  private evictLRU(): void {
    let oldest: [string, CacheItem<any>] | null = null;

    for (const entry of this.cache.entries()) {
      if (!oldest || entry[1].lastAccessed < oldest[1].lastAccessed) {
        oldest = entry;
      }
    }

    if (oldest) {
      this.cache.delete(oldest[0]);
    }
  }

  // 获取缓存统计
  getStats() {
    return {
      size: this.cache.size,
      hitRate: githubCacheMetrics.hitRate(),
      hits: githubCacheMetrics.hits,
      misses: githubCacheMetrics.misses,
    };
  }
}

// 创建全局缓存管理器实例
export const githubCacheManager = new CacheManager();
```

## 前端调整

### 1. 分享链接生成组件

```typescript
// app/components/CardGenerator.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CardGenerator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateType, setTemplateType] = useState("default");
  const router = useRouter();

  const generateCard = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/share-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate card");
      }

      // 生成成功，跳转到分享页
      router.push(`/share/${data.shareId}`);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-generator">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Template Style</label>
        <select
          value={templateType}
          onChange={(e) => setTemplateType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="default">Default</option>
          <option value="dark">Dark Theme</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>

      <button
        onClick={generateCard}
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate GitHub Card"}
      </button>

      {error && <div className="mt-2 text-red-500">{error}</div>}
    </div>
  );
}
```

### 2. 排行榜组件更新

```typescript
// app/components/LeaderboardRefreshButton.tsx

import { useState } from "react";
import { FiRefreshCw } from "react-icons/fi";

export function LeaderboardRefreshButton() {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/leaderboard/refresh");

      if (!response.ok) {
        throw new Error("Failed to refresh leaderboard");
      }

      // 刷新页面数据
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="flex items-center p-2 text-sm text-gray-600 hover:text-blue-600 disabled:opacity-50"
    >
      <FiRefreshCw className={`mr-1 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Refreshing..." : "Refresh"}
    </button>
  );
}
```

## 实现计划

### 1. 数据库没有变更

现有数据库结构已经足够支持新的实现方案，无需修改。

### 2. 功能重构步骤

1. 创建 GitHub API 客户端和缓存管理器

   - 编写 `lib/github/api.ts`
   - 实现 `lib/github/cache.ts`
   - 添加 `lib/github/cache-metrics.ts`

2. 重构 API 端点

   - 更新 `/api/share-links/route.ts`
   - 更新 `/api/leaderboard/update/route.ts`
   - 更新 `/api/leaderboard/route.ts`
   - 更新 `/api/leaderboard/refresh/route.ts`

3. 更新前端组件

   - 修改 `CardGenerator` 组件，移除用户数据输入
   - 更新排行榜组件以适应新的数据流
   - 调整 UI 显示逻辑

4. 服务端缓存监控
   - 添加缓存指标页面（可选）
   - 实现缓存状态监控

### 3. 测试计划

1. 单元测试

   - 测试 GitHub API 客户端功能
   - 测试缓存管理器功能
   - 测试排行榜数据处理逻辑

2. 集成测试

   - 测试端到端卡片生成流程
   - 测试排行榜更新流程
   - 测试缓存机制有效性

3. 性能测试
   - 测试高并发场景下的缓存效率
   - 测试 GitHub API 请求限制处理
   - 验证内存使用情况

### 4. 部署策略

1. 开发环境部署

   - 实现功能和单元测试
   - 进行初步性能验证

2. 预发布环境部署

   - 完整集成测试
   - 性能和安全测试
   - 缓存监控验证

3. 生产环境部署
   - 灰度发布，监控系统性能
   - 检查 GitHub API 请求频率和缓存命中率
   - 全量部署后持续监控

## 预期效果

1. 数据安全性

   - 消除前端数据伪造风险
   - GitHub API 访问仅限于服务端

2. 性能优化

   - 减少 GitHub API 请求次数
   - 缩短用户等待时间
   - 降低服务资源占用

3. 用户体验
   - 维持现有功能不变
   - 保持响应速度
   - 确保数据准确性

## 风险管理

1. GitHub API 限制

   - 实现请求限制监控
   - 添加备用 API 密钥
   - 实现请求节流措施

2. 缓存内存占用

   - 监控服务器内存使用
   - 实现 LRU 淘汰机制
   - 设置最大缓存项数量

3. 数据一致性
   - 确保缓存数据有适当的过期时间
   - 实现定期缓存清理
   - 提供手动刷新机制

## 结论

此次重构将显著提高系统安全性，防止数据伪造，并通过缓存机制优化性能。重构后的系统将在保持现有功能和用户体验的同时，提供更加可靠和安全的数据处理流程。服务端数据获取模式既保护了 GitHub API 不被滥用，又确保了排行榜数据的真实性和准确性。

## Edge Config 配置

1. 在 Vercel 控制台中创建新的 Edge Config 存储

   - 导航到项目 > Storage > Create Edge Config
   - 按照指引创建新的 Edge Config 存储

2. 添加以下环境变量到项目

   - `EDGE_CONFIG` - Edge Config 连接字符串，Vercel 会在创建 Edge Config 时自动添加

3. 将之前针对 KV 的代码更新为使用 Edge Config
