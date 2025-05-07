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
            }
          );
        } catch (error) {
          // 静态资源未找到，返回404
          return new Response("Static asset not found", { status: 404 });
        }
      }

      // API请求处理
      if (pathname.startsWith("/api/")) {
        // 这里应该实现API路由处理逻辑
        // 示例: 将请求转发到Next.js API路由
        const apiResponse = await fetch(
          `https://your-next-app-url${pathname}`,
          request
        );
        return apiResponse;
      }

      // 其他请求转发到Next.js应用
      // 注意: 这里需要根据部署情况调整转发目标
      return await fetch(
        `https://your-next-app-url${pathname}${url.search}`,
        request
      );
    } catch (error) {
      // 捕获并处理错误
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  },
};
