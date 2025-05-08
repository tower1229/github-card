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
      const currentOrigin = url.origin;

      // 处理静态资源请求 - 更新匹配模式
      if (
        pathname.startsWith("/_next/static/") ||
        pathname.startsWith("/static/") ||
        pathname.endsWith(".ico") ||
        pathname.endsWith(".png") ||
        pathname.endsWith(".svg") ||
        pathname.endsWith(".jpg") ||
        pathname.endsWith(".jpeg")
      ) {
        try {
          console.log(`处理静态资源: ${pathname}`);
          return await getAssetFromKV(
            {
              request,
              waitUntil: ctx.waitUntil.bind(ctx),
            },
            {
              ASSET_NAMESPACE: env.ASSETS,
              ASSET_MANIFEST: env.ASSETS.manifest,
            }
          );
        } catch (error) {
          console.error("Static asset error:", error);
          return new Response("Static asset not found", { status: 404 });
        }
      }

      // 检查是否为API请求
      if (pathname.startsWith("/api/")) {
        return new Response("API endpoint not implemented", {
          status: 501,
          headers: { "Content-Type": "text/plain" },
        });
      }

      // 返回默认HTML页面 (测试用)
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test Page</title>
            <meta charset="UTF-8">
          </head>
          <body>
            <h1>Worker is running!</h1>
            <p>Requested path: ${pathname}</p>
            <p>Current time: ${new Date().toISOString()}</p>
            <p>Try accessing: <a href="/_next/static/chunks/pages/_app.js">Static resource test</a></p>
          </body>
        </html>
      `,
        {
          headers: {
            "Content-Type": "text/html;charset=UTF-8",
          },
        }
      );
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }
  },
};
