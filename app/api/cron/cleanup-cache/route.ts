import { NextResponse } from "next/server";
import {
  githubCacheManager,
  githubCacheMetrics,
} from "@/lib/github/github-cache";

// This endpoint will be triggered by a cron job to clean up expired cache entries
export async function GET() {
  try {
    const startTime = Date.now();

    // Clean up expired cache entries
    await githubCacheManager.cleanup();

    // Calculate execution time
    const executionTime = Date.now() - startTime;

    // Return success response with cache metrics
    return NextResponse.json({
      success: true,
      executionTime: `${executionTime}ms`,
      cacheMetrics: {
        hits: githubCacheMetrics.hits,
        misses: githubCacheMetrics.misses,
        hitRate: githubCacheMetrics.hitRate(),
      },
      message: "Cache cleanup completed successfully",
    });
  } catch (error) {
    console.error("Cache cleanup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clean up cache",
        message: String(error),
      },
      { status: 500 }
    );
  }
}
