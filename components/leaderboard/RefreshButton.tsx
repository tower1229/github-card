"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { authFetch } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      // First update the user's own contribution score
      const updateResponse = await authFetch("/api/leaderboard/update", {
        method: "POST",
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        console.error("Update API error:", error);
        throw new Error(error.error || "Failed to update contribution score");
      }

      const updateResult = await updateResponse.json();
      console.log("Update result:", updateResult);

      // Then refresh the entire leaderboard
      const refreshResponse = await authFetch("/api/leaderboard/refresh", {
        method: "GET",
      });

      if (!refreshResponse.ok) {
        const error = await refreshResponse.json();
        console.error("Refresh API error:", error);
        throw new Error(error.error || "Refresh failed");
      }

      const refreshResult = await refreshResponse.json();
      console.log("Refresh result:", refreshResult);

      if (refreshResult.success) {
        if (updateResult.success) {
          const score = updateResult.contributionScore || 0;
          toast.success(
            `Your contribution score has been updated to ${score.toLocaleString()}`
          );
        } else {
          toast.success("The leaderboard data has been updated");
        }
        // Use Next.js router.refresh() to refresh the data without a full page reload
        router.refresh();
      } else {
        throw new Error(refreshResult.error || "Refresh failed");
      }
    } catch (error) {
      console.error("Error during refresh:", error);
      toast.error(error instanceof Error ? error.message : "Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label="Refresh the leaderboard"
    >
      <RefreshCw
        size={16}
        className={`${isRefreshing ? "animate-spin" : ""}`}
      />
      <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
    </button>
  );
}
