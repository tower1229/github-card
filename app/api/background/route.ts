import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "edge";

const CACHE_KEY = "background_images";
const MAX_CACHE_SIZE = 10;
const BACKUP_APIS = [
  "https://api.bimg.cc/random?w=1920&h=1080&mkt=zh-CN",
  "https://picsum.photos/1920/1080",
];

interface CachedImage {
  imageUrl: string;
  imageData: string;
  contentType: string;
  timestamp: number;
}

export async function GET() {
  try {
    // Explicitly type the array
    const cachedImages =
      (await kv.get<CachedImage[]>(CACHE_KEY)) || ([] as CachedImage[]);
    console.log("cachedImages", cachedImages);
    // 如果缓存不足10组，补充新图片
    if (cachedImages.length < MAX_CACHE_SIZE) {
      await fillCache(cachedImages);
    }

    // 随机选择一张图片
    const randomIndex = Math.floor(Math.random() * cachedImages.length);
    const { imageData, contentType } = cachedImages[randomIndex];

    // 返回图片数据
    return new NextResponse(Buffer.from(imageData, "base64"), {
      headers: {
        "Content-Type": contentType || "image/jpeg",
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

async function fillCache(cachedImages: CachedImage[]) {
  for (let i = cachedImages.length; i < MAX_CACHE_SIZE; i++) {
    try {
      const imageUrl = await fetchRandomImageUrl();
      const { imageData, contentType } = await fetchImageData(imageUrl);

      cachedImages.push({
        imageUrl,
        imageData: Buffer.from(imageData).toString("base64"),
        contentType,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error filling cache:", error);
      // 继续尝试下一个
    }
  }

  // 设置24小时过期
  await kv.set(CACHE_KEY, cachedImages, { ex: 86400 });
}

async function fetchRandomImageUrl() {
  for (const api of BACKUP_APIS) {
    try {
      const response = await fetch(api, {
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        return response.url;
      }
    } catch (error) {
      console.log(`Failed to fetch from ${api}:`, error);
    }
  }
  throw new Error("All image APIs failed");
}

async function fetchImageData(imageUrl: string) {
  const response = await fetch(imageUrl, {
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const imageData = await response.arrayBuffer();
  return {
    imageData,
    contentType: response.headers.get("Content-Type") || "image/jpeg",
  };
}
