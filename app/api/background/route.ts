import { NextResponse } from "next/server";

export const runtime = "edge";

// 备用图片API列表
const BACKUP_APIS = [
  "https://api.bimg.cc/random?w=1920&h=1080&mkt=zh-CN",
  "https://picsum.photos/1920/1080",
];

export async function GET() {
  try {
    // 尝试从不同API获取随机图片
    let imageUrl = "";
    let fetchSuccess = false;

    // 依次尝试所有API
    for (const api of BACKUP_APIS) {
      try {
        const response = await fetch(api, {
          next: { revalidate: 60 },
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
          },
          redirect: "follow",
          signal: AbortSignal.timeout(5000), // 5秒超时
        });

        if (response.ok) {
          imageUrl = response.url;
          fetchSuccess = true;
          break;
        }
      } catch (error) {
        console.log(`Failed to fetch from ${api}:`, error);
        // 继续尝试下一个API
      }
    }

    // 如果所有API都失败，返回错误
    if (!fetchSuccess) {
      throw new Error("All image APIs failed");
    }

    // 使用获取到的URL请求实际的图片数据
    try {
      const imageResponse = await fetch(imageUrl, {
        next: { revalidate: 86400 },
        headers: {
          "Cache-Control":
            "public, s-maxage=86400, stale-while-revalidate=86400",
        },
        signal: AbortSignal.timeout(10000), // 10秒超时
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.arrayBuffer();

        // 返回图片数据
        return new NextResponse(imageData, {
          headers: {
            "Content-Type":
              imageResponse.headers.get("Content-Type") || "image/jpeg",
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
            "Access-Control-Allow-Origin":
              process.env.NEXT_PUBLIC_APP_URL || "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      } else {
        throw new Error(`Failed to fetch image data: ${imageResponse.status}`);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Error processing image: ${errorMessage}`);
    }
  } catch (err) {
    console.error("Error fetching background:", err);

    // 出错时返回JSON错误响应
    return NextResponse.json(
      { success: false, error: "Failed to fetch background" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}
