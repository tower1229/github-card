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

      // 输出调试信息
      console.log(`处理请求: ${request.method} ${pathname}`);
      console.log(`当前源: ${currentOrigin}`);

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
        pathname.endsWith(".js") ||
        pathname.endsWith(".css") ||
        (pathname.endsWith(".json") && !pathname.startsWith("/api/"))
      ) {
        console.log(`尝试从KV获取静态资源: ${pathname}`);
        try {
          const asset = await getAssetFromKV(
            {
              request,
              waitUntil: ctx.waitUntil.bind(ctx),
            },
            {
              ASSET_NAMESPACE: env.ASSETS,
              ASSET_MANIFEST: env.ASSETS.manifest,
            }
          );
          console.log(`KV静态资源获取成功: ${pathname}`);
          return asset;
        } catch (error) {
          console.error(`静态资源错误 [${pathname}]:`, error);
          return new Response(
            `Static asset error: ${error.message} for path: ${pathname}`,
            {
              status: 404,
              headers: { "Content-Type": "text/plain" },
            }
          );
        }
      }

      // 如果是根路径，返回一个简单页面用于测试
      if (pathname === "/") {
        console.log("返回首页测试页面");
        return new Response(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Root Page</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: system-ui, sans-serif;
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 2rem;
                }
                pre {
                  background: #f1f1f1;
                  padding: 1rem;
                  overflow: auto;
                  border-radius: 4px;
                }
              </style>
            </head>
            <body>
              <h1>Worker is running!</h1>
              <p>This is a temporary test page to verify worker functionality.</p>

              <h2>Request Information:</h2>
              <pre>
              URL: ${url}
              Path: ${pathname}
              Method: ${request.method}
              User-Agent: ${request.headers.get("user-agent")}
              </pre>

              <h2>Binding Information:</h2>
              <pre>
              ASSETS binding exists: ${Boolean(env.ASSETS)}
              GITHUB_CARD_KV binding exists: ${Boolean(env.GITHUB_CARD_KV)}
              DB binding exists: ${Boolean(env.DB)}
              </pre>

              <p>If this page displays correctly, the worker is functioning. The Next.js app routing needs configuration.</p>

              <p>Try accessing: <a href="/static/test.txt">Static resource test</a></p>
            </body>
          </html>
        `,
          {
            headers: {
              "Content-Type": "text/html;charset=UTF-8",
            },
          }
        );
      }

      // 其他路径尝试直接转发到同源
      console.log(`转发请求到同源: ${pathname}`);
      try {
        const appRequest = new Request(
          `${currentOrigin}${pathname}${url.search}`,
          {
            method: request.method,
            headers: request.headers,
            body: request.body,
            redirect: request.redirect,
          }
        );

        console.log(`请求转发目标: ${currentOrigin}${pathname}${url.search}`);
        const response = await fetch(appRequest);
        console.log(`响应状态: ${response.status}`);

        return response;
      } catch (error) {
        console.error(`请求转发错误:`, error);

        // 返回诊断页面
        return new Response(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Request Error</title>
              <meta charset="UTF-8">
              <style>
                body { font-family: system-ui, sans-serif; padding: 2rem; }
                .error { color: #e53e3e; }
                pre { background: #f1f1f1; padding: 1rem; }
              </style>
            </head>
            <body>
              <h1 class="error">Request Error</h1>
              <p>An error occurred while processing your request.</p>

              <h2>Error Details:</h2>
              <pre>${error.message}</pre>

              <h2>Request Information:</h2>
              <pre>
              Path: ${pathname}
              Method: ${request.method}
              </pre>

              <p>This is a diagnostic page. Please contact support with these details.</p>
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

      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Worker Error</title>
            <meta charset="UTF-8">
            <style>
              body { font-family: system-ui, sans-serif; padding: 2rem; }
              .error { color: #e53e3e; }
              pre { background: #f1f1f1; padding: 1rem; }
            </style>
          </head>
          <body>
            <h1 class="error">Worker Error</h1>
            <p>A critical error occurred in the worker.</p>

            <h2>Error Details:</h2>
            <pre>${error.message}</pre>

            <p>This is a diagnostic page. Please contact support with these details.</p>
          </body>
        </html>
      `,
        {
          status: 500,
          headers: { "Content-Type": "text/html;charset=UTF-8" },
        }
      );
    }
  },
};
