// Cloudflare Pages Functions 中间件
export async function onRequest(context) {
  // 从请求上下文中获取必要的信息
  const { request, env, params, next } = context;

  try {
    // 尝试使用内置的Pages路由处理逻辑
    return await next();
  } catch (err) {
    // 如果发生错误，返回适当的错误响应
    return new Response(`Error: ${err.message || "Unknown error"}`, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
