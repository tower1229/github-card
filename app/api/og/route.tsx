import { getUserGitHubData } from "@/lib/server-github";
import { ImageResponse } from "next/og";
import { ProfileTotal } from "@/components/profile-total";
import { GitHubData } from "@/lib/types";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "block",
            width: "1200px",
            height: "630px",
            overflow: "hidden",
          }}
        >
          <div style={{ fontSize: 48, textAlign: "center", marginTop: 260 }}>
            Username is required
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  // Use the server action instead of making a direct API call
  const result = await getUserGitHubData(username);

  if (result.success && result.data) {
    const userData: GitHubData = result.data;
    return new ImageResponse(
      (
        <div
          style={{
            display: "block",
            width: "1200px",
            height: "630px",
            overflow: "hidden",
          }}
        >
          <ProfileTotal userData={userData} />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "block",
          width: "1200px",
          height: "630px",
          overflow: "hidden",
        }}
      >
        <div style={{ fontSize: 48, textAlign: "center", marginTop: 260 }}>
          User not found
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
