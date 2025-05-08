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
      // 基本请求信息
      const url = new URL(request.url);
      const { pathname } = url;
      const currentOrigin = url.origin;

      // 处理预检请求
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "86400",
          },
        });
      }

      // 处理静态资源请求
      if (
        pathname.startsWith("/_next/static/") ||
        pathname.startsWith("/static/") ||
        pathname.endsWith(".ico") ||
        pathname.endsWith(".png") ||
        pathname.endsWith(".svg") ||
        pathname.endsWith(".jpg") ||
        pathname.endsWith(".jpeg") ||
        pathname.endsWith(".webp") ||
        (pathname.endsWith(".json") && !pathname.startsWith("/api/"))
      ) {
        try {
          return await getAssetFromKV(
            {
              request,
              waitUntil: ctx.waitUntil.bind(ctx),
            },
            {
              ASSET_NAMESPACE: env.ASSETS,
              ASSET_MANIFEST: env.ASSETS.manifest,
              cacheControl: {
                browserTTL: 60 * 60 * 24 * 7, // 7天浏览器缓存
                edgeTTL: 60 * 60 * 24 * 2, // 2天边缘缓存
                bypassCache: false, // 不跳过缓存
              },
            }
          );
        } catch (error) {
          console.error(`静态资源错误: ${pathname}`, error);
          return new Response("Static asset not found", {
            status: 404,
            headers: { "Content-Type": "text/plain" },
          });
        }
      }

      // API请求处理
      if (pathname.startsWith("/api/")) {
        const apiUrl = env.NEXTAUTH_URL || currentOrigin;
        const apiRequest = new Request(`${apiUrl}${pathname}${url.search}`, {
          method: request.method,
          headers: request.headers,
          body: request.body,
          redirect: request.redirect,
        });

        try {
          const apiResponse = await fetch(apiRequest);

          // 构建响应头，包含CORS设置
          const responseHeaders = new Headers(apiResponse.headers);
          responseHeaders.set("Access-Control-Allow-Origin", "*");
          responseHeaders.set(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
          );
          responseHeaders.set(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
          );

          return new Response(apiResponse.body, {
            status: apiResponse.status,
            statusText: apiResponse.statusText,
            headers: responseHeaders,
          });
        } catch (error) {
          console.error(`API请求错误: ${pathname}`, error);
          return new Response(`API Error: ${error.message}`, {
            status: 500,
            headers: {
              "Content-Type": "text/plain",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      }

      // 页面请求处理
      const appUrl = env.NEXTAUTH_URL || currentOrigin;
      const pageRequest = new Request(`${appUrl}${pathname}${url.search}`, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: request.redirect,
      });

      try {
        const response = await fetch(pageRequest);

        // 对HTML响应添加缓存控制
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("text/html")) {
          const newHeaders = new Headers(response.headers);
          // HTML页面使用较短的缓存时间，确保内容更新及时被用户看到
          newHeaders.set("Cache-Control", "public, max-age=0, s-maxage=600");
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
          });
        }

        return response;
      } catch (error) {
        console.error(`页面请求错误: ${pathname}`, error);

        // 更友好的错误页面
        return new Response(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Error</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  margin: 0;
                  background: #f7f9fc;
                  color: #333;
                }
                .error-container {
                  text-align: center;
                  max-width: 500px;
                  padding: 2rem;
                  border-radius: 8px;
                  background: white;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                h1 { margin: 0 0 1rem; color: #e53e3e; }
                p { margin: 0 0 1rem; line-height: 1.5; }
                .back-button {
                  padding: 8px 16px;
                  background: #4299e1;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  text-decoration: none;
                  display: inline-block;
                  margin-top: 1rem;
                }
              </style>
            </head>
            <body>
              <div class="error-container">
                <h1>Page Not Available</h1>
                <p>Sorry, we're unable to display this page right now.</p>
                <p>Please try again later or contact support if the problem persists.</p>
                <a href="/" class="back-button">Return Home</a>
              </div>
            </body>
          </html>
        `,
          {
            status: 500,
            headers: { "Content-Type": "text/html;charset=UTF-8" },
          }
        );
      }
    } catch (error) {
      console.error("Worker核心错误:", error);

      return new Response(`Internal Server Error: ${error.message}`, {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }
  },
};
