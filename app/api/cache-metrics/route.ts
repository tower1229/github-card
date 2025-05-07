import { NextResponse } from "next/server";
import { githubCacheMetrics, memoryCache } from "@/lib/github/github-cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export const runtime = "nodejs";
// 标记为动态路由，不进行静态生成
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Only allow admin users to access metrics
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get memory cache stats
    const memoryCacheStats = memoryCache.getStats();

    // Return cache metrics
    return NextResponse.json({
      hits: githubCacheMetrics.hits,
      misses: githubCacheMetrics.misses,
      hitRate: githubCacheMetrics.hitRate(),
      memoryCache: {
        size: memoryCacheStats.size,
        hitRate: memoryCacheStats.hitRate,
      },
      lastReset: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error retrieving cache metrics:", error);
    return NextResponse.json(
      { error: "Failed to retrieve cache metrics", message: String(error) },
      { status: 500 }
    );
  }
}
