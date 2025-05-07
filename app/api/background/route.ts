import { NextResponse } from "next/server";
import { kvClient as kv } from "../../../lib/cloudflare/kv-service";

export const runtime = "edge";

const CACHE_KEY = "background_images";
const MAX_CACHE_SIZE = 10;
const CACHE_TTL = 86400 * 1000; // 1 day in milliseconds
const BACKUP_APIS = [
  "https://api.bimg.cc/random?w=1920&h=1080&mkt=zh-CN",
  "https://picsum.photos/1920/1080",
];

interface CachedImage {
  imageUrl: string;
  imageData: string;
  contentType: string;
  timestamp: number;
  expiry: number;
}

export async function GET() {
  try {
    // Explicitly type the array
    let cachedImages =
      (await kv.get<CachedImage[]>(CACHE_KEY)) || ([] as CachedImage[]);

    // Filter out expired images
    const now = Date.now();
    const validImages = cachedImages.filter((img) => img.expiry > now);
    console.log(
      "cachedImages: ",
      validImages.map((img) => img.imageUrl)
    );
    // If we have more than MAX_CACHE_SIZE valid images, trim the oldest ones
    if (validImages.length > MAX_CACHE_SIZE) {
      // Sort by timestamp (oldest first) and keep only the newest MAX_CACHE_SIZE images
      validImages.sort((a, b) => a.timestamp - b.timestamp);
      validImages.splice(0, validImages.length - MAX_CACHE_SIZE);
    }

    // Update the cache if images were expired/removed or if we trimmed excess images
    if (validImages.length !== cachedImages.length) {
      cachedImages = validImages;
      await kv.set(CACHE_KEY, cachedImages);
    }

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

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    const { refreshToken } = body;

    // Check for a security token if needed
    const expectedToken = process.env.REFRESH_CACHE_TOKEN;
    if (expectedToken && refreshToken !== expectedToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Clear existing cache and create a fresh one
    const freshCache: CachedImage[] = [];
    await fillCache(freshCache);

    return NextResponse.json({
      success: true,
      message: "Cache refreshed successfully",
      count: freshCache.length,
    });
  } catch (err) {
    console.error("Error refreshing background cache:", err);
    return NextResponse.json(
      { success: false, error: "Failed to refresh cache" },
      { status: 500 }
    );
  }
}

async function fillCache(cachedImages: CachedImage[]) {
  const targetCount = MAX_CACHE_SIZE;

  // Only try to add the number of images needed to reach MAX_CACHE_SIZE
  for (let i = cachedImages.length; i < targetCount; i++) {
    try {
      const imageUrl = await fetchRandomImageUrl();
      const { imageData, contentType } = await fetchImageData(imageUrl);

      cachedImages.push({
        imageUrl,
        imageData: Buffer.from(imageData).toString("base64"),
        contentType,
        timestamp: Date.now(),
        expiry: Date.now() + CACHE_TTL,
      });
    } catch (error) {
      console.error("Error filling cache:", error);
      // 继续尝试下一个
    }
  }

  // Ensure we only keep MAX_CACHE_SIZE images, removing oldest first if we have too many
  if (cachedImages.length > targetCount) {
    cachedImages.sort((a, b) => a.timestamp - b.timestamp);
    cachedImages.splice(0, cachedImages.length - targetCount);
  }

  // 设置缓存，不再使用ex选项
  await kv.set(CACHE_KEY, cachedImages);
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
