import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { refreshLeaderboard } from "@/lib/leaderboard";

export async function GET() {
  try {
    // Get user session and validate permissions
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Recalculate all user ranks
    const result = await refreshLeaderboard();

    // Clear related page caches
    revalidatePath("/leaderboard");
    revalidatePath("/api/leaderboard");

    return NextResponse.json({
      success: true,
      updatedAt: new Date().toISOString(),
      affectedRows: result.affectedRows || 0,
      message: "Leaderboard refreshed successfully",
    });
  } catch (error) {
    console.error("Error refreshing leaderboard:", error);
    return NextResponse.json(
      {
        error: "Failed to refresh leaderboard",
        message: String(error),
      },
      { status: 500 }
    );
  }
}
