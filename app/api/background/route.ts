import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.bimg.cc/random?w=1920&h=1080&mkt=zh-CN",
      {
        redirect: "manual", // 不自动跟随重定向
      }
    );

    // 从响应头中获取重定向 URL
    const redirectUrl = response.headers.get("location");

    if (!redirectUrl) {
      throw new Error("No redirect URL found");
    }

    return NextResponse.json({
      success: true,
      url: redirectUrl,
    });
  } catch (error) {
    console.error("Error fetching background:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch background image",
      },
      { status: 500 }
    );
  }
}
