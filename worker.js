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
      const url = new URL(request.url);
      const { pathname } = url;

      console.log(`处理请求: ${request.method} ${pathname}`);

      // 1. 优先处理静态资源
      if (
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/static/") ||
        pathname.match(/\.(ico|png|svg|jpe?g|webp|js|css|json|txt)$/)
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
            }
          );
        } catch (error) {
          console.error(`静态资源错误 [${pathname}]:`, error);
        }
      }

      // 2. 处理API路由
      if (pathname.startsWith("/api/")) {
        // 调用Next.js API路由处理函数
        try {
          // 查找匹配的API路由处理程序
          const apiRoutePath = `./.next/server/pages${pathname}.js`;
          const apiModule = await import(apiRoutePath);

          if (apiModule.default) {
            const apiHandler = apiModule.default;
            const response = await apiHandler(request, env, ctx);
            return response;
          }
        } catch (error) {
          console.error(`API路由错误 [${pathname}]:`, error);
          return new Response(JSON.stringify({ error: "API处理错误" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // 3. 处理预渲染页面 (ISR/SSG)
      const prerenderRoute = false; // 或尝试动态加载manifest
      if (prerenderRoute) {
        try {
          // 构造预渲染页面的路径
          const htmlPath = `./.next/server/pages${pathname}.html`;
          return await getAssetFromKV(
            {
              request: new Request(htmlPath, request),
              waitUntil: ctx.waitUntil.bind(ctx),
            },
            {
              ASSET_NAMESPACE: env.ASSETS,
              ASSET_MANIFEST: env.ASSETS.manifest,
            }
          );
        } catch (error) {
          console.error(`预渲染页面错误 [${pathname}]:`, error);
        }
      }

      // 4. 处理动态路由 (SSR)
      try {
        // 查找匹配的页面处理程序
        const pagePath = `./.next/server/pages${pathname}.js`;
        const pageModule = await import(pagePath);

        if (pageModule.default) {
          const { renderToHTML } = await import("./.next/server/ssr-module.js");
          const html = await renderToHTML(request, {
            env,
            ctx,
            params: {}, // 解析路由参数
          });

          return new Response(html, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        }
      } catch (error) {
        console.error(`SSR页面错误 [${pathname}]:`, error);
      }

      // 5. 如果所有尝试都失败，返回404错误
      return new Response(
        `<!DOCTYPE html>
         <html>
           <head>
             <title>Page Not Found</title>
             <meta charset="UTF-8">
           </head>
           <body>
             <h1>404 - Page Not Found</h1>
             <p>The requested page "${pathname}" could not be found.</p>
           </body>
         </html>`,
        {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    } catch (error) {
      console.error("Worker核心错误:", error);
      return new Response(`服务器错误: ${error.message}`, {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }
  },
};
