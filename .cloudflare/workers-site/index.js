import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

// 适配 Cloudflare Workers 环境运行 Next.js 应用
addEventListener("fetch", (event) => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event) {
  const url = new URL(event.request.url);

  // KV资源处理选项
  const options = {
    mapRequestToAsset: (req) => {
      const url = new URL(req.url);

      // 处理根路径请求，重定向到index.html
      if (url.pathname === "/") {
        return new Request(`${url.origin}/index.html`, req);
      }

      // 处理不带扩展名的路径，假设它们是页面路由
      if (!url.pathname.includes(".")) {
        return new Request(`${url.origin}${url.pathname}.html`, req);
      }

      return req;
    },
  };

  try {
    // 尝试从KV存储获取资源
    return await getAssetFromKV(event, options);
  } catch (e) {
    // 处理资源获取错误
    const pathname = url.pathname;
    console.error(`Error serving ${pathname} from KV:`, e);

    // 返回404页面
    if (pathname.startsWith("/api")) {
      return new Response("API endpoint not found", { status: 404 });
    }

    // 尝试获取自定义404页面
    try {
      return await getAssetFromKV(event, {
        mapRequestToAsset: (req) =>
          new Request(`${new URL(req.url).origin}/404.html`, req),
      });
    } catch (e) {
      // 如果自定义404页面不可用，返回基本响应
      return new Response("Page not found", { status: 404 });
    }
  }
}
