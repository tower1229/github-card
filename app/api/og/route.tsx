import { getUserGitHubData } from "@/lib/server-github";
import { ImageResponse } from "next/og";
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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "1200px",
            height: "630px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 48,
              textAlign: "center",
            }}
          >
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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "1200px",
            height: "630px",
            overflow: "hidden",
            padding: "40px",
            backgroundColor: "#000",
            color: "#fff",
          }}
        >
          {/* Profile Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: "24px",
              width: "100%",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                display: "flex",
                position: "relative",
                width: "128px",
                height: "128px",
                marginBottom: "24px",
              }}
            >
              <img
                src={userData.avatar_url}
                alt="Profile"
                style={{
                  borderRadius: "9999px",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {/* Contribution Grade */}
              <div
                style={{
                  display: "flex",
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "48px",
                    height: "48px",
                    backgroundColor: "#000",
                    borderRadius: "9999px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      background:
                        "linear-gradient(to right, #ffaa40, #9c40ff, #ffaa40)",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {userData.contribution_grade}
                  </span>
                </div>
              </div>
            </div>

            {/* Name */}
            <div
              style={{
                display: "flex",
                fontSize: "30px",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              {userData.name || userData.login}
            </div>

            {/* Bio */}
            <div
              style={{
                display: "flex",
                color: "#e5e5e5",
                fontSize: "16px",
              }}
            >
              {userData.bio || "No bio available"}
            </div>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                gap: "32px",
                marginTop: "40px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "28px",
                    fontWeight: "bold",
                  }}
                >
                  {userData.followers}
                </div>
                <div
                  style={{
                    display: "flex",
                    color: "#aaa",
                    fontSize: "16px",
                  }}
                >
                  Followers
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "28px",
                    fontWeight: "bold",
                  }}
                >
                  {userData.public_repos}
                </div>
                <div
                  style={{
                    display: "flex",
                    color: "#aaa",
                    fontSize: "16px",
                  }}
                >
                  Repositories
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "28px",
                    fontWeight: "bold",
                  }}
                >
                  {userData.total_stars || 0}
                </div>
                <div
                  style={{
                    display: "flex",
                    color: "#aaa",
                    fontSize: "16px",
                  }}
                >
                  Stars
                </div>
              </div>
            </div>
          </div>
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "1200px",
          height: "630px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 48,
            textAlign: "center",
          }}
        >
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
