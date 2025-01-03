import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  try {
    // 添加缓存控制头
    const headers = new Headers({
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=3600",
    });

    const response = await fetch(
      "https://api.bimg.cc/random?w=1920&h=1080&mkt=zh-CN",
      {
        next: { revalidate: 3600 },
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=3600",
        },
      }
    );

    const data = await response.json();

    return NextResponse.json({ success: true, url: data.url }, { headers });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch background" },
      { status: 500 }
    );
  }
}
