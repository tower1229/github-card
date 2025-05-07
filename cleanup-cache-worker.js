addEventListener("scheduled", (event) => {
  event.waitUntil(handleScheduled());
});

async function handleScheduled() {
  // 获取你的网站域名下的 API 路径
  const response = await fetch(
    "https://github-card.workers.dev/api/cron/cleanup-cache",
    {
      method: "GET",
    }
  );

  return response;
}

// 可选：如果你想通过访问 worker 也能触发清理
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest());
});

async function handleRequest() {
  await handleScheduled();
  return new Response("Cache cleanup triggered", { status: 200 });
}
