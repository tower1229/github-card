import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

/**
 * 处理请求的主函数
 * @param {Request} request - 传入的请求对象
 * @param {Object} env - 环境变量和绑定
 * @param {Object} ctx - 执行上下文
 */
export default {
  async fetch(request, env, ctx) {
    try {
      // 获取URL和路径信息
      const url = new URL(request.url);
      const { pathname } = url;

      // 静态资源处理
      if (
        pathname.startsWith("/_next/static/") ||
        pathname.startsWith("/static/") ||
        pathname.endsWith(".ico") ||
        pathname.endsWith(".png") ||
        pathname.endsWith(".svg") ||
        pathname.endsWith(".jpg") ||
        pathname.endsWith(".jpeg") ||
        pathname.endsWith(".webp")
      ) {
        try {
          return await getAssetFromKV(
            {
              request,
              waitUntil: ctx.waitUntil.bind(ctx),
            },
            {
              ASSET_NAMESPACE: env.__STATIC_CONTENT,
              ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
              // 添加缓存策略
              cacheControl: {
                browserTTL: 60 * 60 * 24 * 30, // 30天浏览器缓存
                edgeTTL: 60 * 60 * 24 * 2, // 2天边缘缓存
                bypassCache: false, // 不跳过缓存
              },
            }
          );
        } catch (error) {
          console.error("静态资源错误:", error);
          return new Response("Static asset not found", {
            status: 404,
            headers: { "Content-Type": "text/plain" },
          });
        }
      }

      // 从环境变量获取API和应用URL
      const apiUrl = env.NEXTAUTH_URL || "";
      const appUrl = env.NEXTAUTH_URL || "";

      // API请求处理
      if (pathname.startsWith("/api/")) {
        // 创建新的Request对象，保留原始请求的所有属性
        const apiRequest = new Request(`${apiUrl}${pathname}${url.search}`, {
          method: request.method,
          headers: request.headers,
          body: request.body,
          redirect: request.redirect,
        });

        const apiResponse = await fetch(apiRequest);

        // 克隆响应以添加CORS和缓存控制头
        return new Response(apiResponse.body, {
          status: apiResponse.status,
          statusText: apiResponse.statusText,
          headers: {
            ...Object.fromEntries(apiResponse.headers),
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      // 处理预检请求
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
          },
        });
      }

      // 其他请求转发到Next.js应用
      const appRequest = new Request(`${appUrl}${pathname}${url.search}`, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: request.redirect,
      });

      const response = await fetch(appRequest);

      // 如果是HTML响应，可以考虑添加缓存控制
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        const newHeaders = new Headers(response.headers);
        newHeaders.set("Cache-Control", "public, max-age=0, s-maxage=3600");
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }

      return response;
    } catch (error) {
      console.error("Worker错误:", error);

      // 更详细的错误处理
      if (
        error instanceof TypeError &&
        error.message.includes("fetch failed")
      ) {
        return new Response("Service unavailable. Please try again later.", {
          status: 503,
          headers: { "Content-Type": "text/plain", "Retry-After": "30" },
        });
      }

      return new Response(`Internal Server Error: ${error.message}`, {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }
  },
};
