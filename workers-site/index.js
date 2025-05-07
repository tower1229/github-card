import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import manifestJSON from "../.next/server/middleware-manifest.json";

addEventListener("fetch", (event) => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event) {
  let options = {};

  try {
    // 尝试从KV获取静态资源
    return await getAssetFromKV(event, options);
  } catch (e) {
    // 如果找不到静态资源，回退到Next.js服务器
    let pathname = new URL(event.request.url).pathname;
    return new Response(`Next.js middleware handling: ${pathname}`, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  }
}
