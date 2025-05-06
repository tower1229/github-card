# Cloudflare 部署指南

本文档介绍如何将 GitHub Card 项目部署到 Cloudflare Pages。

## 前提条件

- Cloudflare 账号
- GitHub 仓库中的项目代码
- 已配置的环境变量（参见`docs/env-setup.md`）

## 部署步骤

### 1. 创建 Cloudflare Pages 项目

1. 登录[Cloudflare 控制台](https://dash.cloudflare.com/)
2. 导航到`Workers & Pages` > `Create application` > `Pages`
3. 选择`Connect to Git`并连接您的 GitHub 账号
4. 选择包含 GitHub Card 项目的仓库
5. 配置构建设置：
   - 框架预设: `Next.js`
   - 构建命令: `yarn build`
   - 构建输出目录: `.next`
   - 根目录: `/` (默认)
   - 环境变量: 添加所有必要的环境变量（详见`docs/env-setup.md`）

### 2. 创建并配置 KV 命名空间

1. 在 Cloudflare 控制台，导航到`Workers & Pages` > `KV`
2. 点击`Create namespace`，命名为`github-card-kv`或其他您喜欢的名称
3. 复制生成的 Namespace ID
4. 返回 Pages 项目 > `Settings` > `Functions` > `KV namespace bindings`
5. 点击`Add binding`，配置：
   - Variable name: `KV`
   - KV namespace: 选择您刚创建的命名空间

### 3. 修改 wrangler.toml

1. 编辑项目根目录的`wrangler.toml`文件
2. 更新 KV 命名空间 ID：
   ```toml
   [[kv_namespaces]]
   binding = "KV"
   id = "您的KV命名空间ID"
   ```
3. 可选：根据需要自定义其他配置项

### 4. 配置数据库

1. 确保 Neon 数据库已设置并可从 Cloudflare 访问
2. 验证`DATABASE_URL`环境变量是否正确配置

### 5. 部署项目

1. 提交并推送所有更改到 GitHub 仓库
2. Cloudflare Pages 将自动检测更改并开始构建
3. 在`Workers & Pages` > 您的项目中监控部署状态
4. 部署完成后，点击生成的 URL 查看您的应用

### 6. 设置自定义域名 (可选)

1. 在项目设置中，导航到`Custom domains`
2. 点击`Set up a custom domain`
3. 输入您的域名并按照提示进行配置
4. 更新 DNS 记录以指向 Cloudflare Pages

## 故障排除

### 部署失败

1. 查看构建日志以了解详细错误信息
2. 确保所有环境变量已正确设置
3. 验证 wrangler.toml 配置是否正确

### KV 服务问题

1. 检查 KV 绑定是否正确配置
2. 确认 API 令牌具有足够的权限
3. 验证代码中的 KV 访问路径

### 数据库连接问题

1. 确保数据库可以从 Cloudflare 网络访问
2. 验证数据库连接字符串格式正确
3. 检查数据库防火墙设置

## 监控和日志

1. 在 Cloudflare 控制台 > `Workers & Pages` > 您的项目 > `Logs`中查看应用日志
2. 启用更详细的日志记录以进行调试
3. 配置警报以监控应用程序性能和错误

## 更新和维护

1. 推送到 Git 仓库的更改将触发自动部署
2. 使用预览部署测试更改
3. 定期检查依赖项更新

## 结论

通过 Cloudflare Pages 部署 GitHub Card 项目提供了高性能和可靠性，同时利用 Cloudflare 的全球网络提供快速加载时间。如果遇到任何问题，请参考 Cloudflare 官方文档或联系支持团队。
