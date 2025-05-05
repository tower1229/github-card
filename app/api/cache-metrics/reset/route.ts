import { NextResponse } from "next/server";
import { githubCacheMetrics } from "@/lib/github/github-cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST() {
  try {
    // Only allow admin users to reset metrics
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Reset metrics
    githubCacheMetrics.reset();

    return NextResponse.json({
      success: true,
      message: "Cache metrics reset successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error resetting cache metrics:", error);
    return NextResponse.json(
      { error: "Failed to reset cache metrics", message: String(error) },
      { status: 500 }
    );
  }
}
