import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  try {
    // 首先获取随机图片的URL
    const response = await fetch(
      "https://api.bimg.cc/random?w=1920&h=1080&mkt=zh-CN",
      {
        next: { revalidate: 60 },
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
        },
        redirect: "follow",
      }
    );

    const imageUrl = response.url;

    // 使用获取到的URL再次请求实际的图片数据
    const imageResponse = await fetch(imageUrl, {
      next: { revalidate: 86400 },
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
      },
    });
    const imageData = await imageResponse.arrayBuffer();

    // 返回图片数据
    return new NextResponse(imageData, {
      headers: {
        "Content-Type":
          imageResponse.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (err) {
    console.error("Error fetching background:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch background" },
      { status: 500 }
    );
  }
}
