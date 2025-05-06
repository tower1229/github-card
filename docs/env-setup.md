# 环境变量设置指南

本项目从 Vercel 迁移到 Cloudflare 时，需要配置以下环境变量。

## 基本环境变量

```bash
# Authentication
NEXTAUTH_URL=https://github-card.refined-x.com
NEXTAUTH_SECRET=your-secret-key-here  # 生成: openssl rand -base64 32

# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
GITHUB_ACCESS_TOKEN=your-github-access-token  # 可选: 用于提高API访问限制

# Database (Neon Postgres)
DATABASE_URL=postgresql://username:password@db.example.neon.tech/database

# Cloudflare KV配置 (替代Vercel Edge Config)
CLOUDFLARE_KV_NAMESPACE=39e20a24bbd44f4b9e87eba2da4684aa
CLOUDFLARE_API_TOKEN=Sft0IvFI008o8h7CCHLwRimHvjCe6oynRIIDMSCm
CLOUDFLARE_ACCOUNT_ID=b74b5f1383b4c12d7d98a26b462e7c22
```

## 本地开发设置

1. 创建一个名为`.env.local`的文件
2. 复制上面的环境变量模板并填入实际值
3. 运行`yarn dev`启动本地开发服务器

## Cloudflare Pages 环境变量设置

在 Cloudflare Pages 部署时，需要在项目设置中配置环境变量：

1. 登录 Cloudflare 控制台
2. 导航到`Pages` > 你的项目 > `Settings` > `Environment variables`
3. 添加所有上述环境变量
4. 对于生产环境和预览环境，可以设置不同的变量值

## 获取 Cloudflare KV 凭据

1. 创建 KV 命名空间:

   - 进入 Cloudflare 控制台 > `Workers & Pages` > `KV`
   - 点击"Create namespace"创建新的命名空间
   - 命名为"github-card-kv"或自定义名称
   - 复制生成的 Namespace ID 作为`CLOUDFLARE_KV_NAMESPACE`

2. 创建 API 令牌:

   - 进入 Cloudflare 控制台 > `My Profile` > `API Tokens`
   - 点击"Create Token"
   - 选择"Create Custom Token"
   - 添加"Account.Workers KV Storage:Edit"权限
   - 生成令牌并复制为`CLOUDFLARE_API_TOKEN`

3. 获取账户 ID:
   - 在 Cloudflare 控制台右侧边栏找到并复制 Account ID
   - 这将作为`CLOUDFLARE_ACCOUNT_ID`使用

## 注意事项

- 确保 API 令牌具有正确的权限，否则 KV 操作将失败
- 定期轮换敏感凭据如`NEXTAUTH_SECRET`和`CLOUDFLARE_API_TOKEN`
- 生产环境中请使用安全的方式管理这些敏感凭据
