# GitHub Card 项目技术升级需求文档

## 1. 项目概述

GitHub Card 是一个允许用户创建展示 GitHub 个人资料卡片的应用。当前项目需要技术升级，主要包括实现 GitHub 登录功能以及完成从首页到卡片生成页面的流程打通。

## 2. 需求分析

### 2.1 核心流程

按照 QuickStart 组件展示的流程，用户需要:

1. 使用 GitHub 账号登录
2. 选择卡片模板
3. 分享和导出卡片

目前项目已有卡片模板和模板预览页面，但缺少用户认证和完整的导航流程。

### 2.2 具体需求

#### 2.2.1 GitHub 登录功能

- 实现 GitHub OAuth 认证流程
- 创建必要的 API 路由处理 GitHub 回调
- 存储用户会话和认证状态
- 在用户登录后显示个性化内容

#### 2.2.2 导航流程优化

- 从首页 "Sign in with GitHub" 按钮连接到 GitHub 登录
- 登录成功后导航至模板选择页面
- 当选择模板后，导航至 `/${username}?template=${templateName}` 页面
- 实现完整的用户体验流程，包括加载状态和错误处理

## 3. 技术方案

### 3.1 GitHub OAuth 认证实现

#### 3.1.1 创建 GitHub OAuth 应用

- 在 GitHub 开发者设置中创建 OAuth 应用
- 配置回调 URL (例如: `https://[domain]/api/auth/callback/github`)
- 获取 Client ID 和 Client Secret

#### 3.1.2 安装认证依赖

使用 NextAuth.js (现在称为 Auth.js) 实现 GitHub OAuth:

```
yarn add next-auth
```

#### 3.1.3 实现认证 API 路由

- 创建 `/app/api/auth/[...nextauth]/route.ts` 处理认证路由
- 配置 GitHub 认证提供者
- 实现会话管理

#### 3.1.4 创建认证上下文组件

- 创建认证状态提供者组件
- 实现用户信息和认证状态的访问方法

### 3.2 用户界面升级

#### 3.2.1 导航组件升级

- 更新 navbar 组件，根据认证状态显示不同内容
- 已登录用户显示用户头像和下拉菜单
- 未登录用户显示 "Sign in with GitHub" 按钮

#### 3.2.2 模板选择流程优化

- 更新 TemplateShowcase 组件实现模板选择功能
- 实现 "Use Template" 按钮点击后的导航逻辑
- 导航至 `/${username}?template=${templateName}` 页面

#### 3.2.3 首页响应式设计优化

- 更新 QuickStart 组件，根据用户登录状态动态显示当前步骤
- 为已完成步骤添加视觉标识

## 4. 技术实现细节

### 4.1 文件结构

```
/app
  /api
    /auth
      /[...nextauth]
        route.ts      # NextAuth 路由处理
  /[username]
    page.tsx         # 用户卡片页面 (现有)
/components
  /auth
    auth-provider.tsx  # 认证上下文提供者
    github-button.tsx  # GitHub 登录按钮组件
  navbar.tsx         # 更新导航栏，支持认证状态
  template-card.tsx  # 优化模板卡片组件
  quick-start.tsx   # 更新快速开始组件
/lib
  auth.ts            # 认证工具函数
  session.ts         # 会话管理工具
```

### 4.2 环境变量

```
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
```

## 5. 实现步骤

1. 配置环境变量和 GitHub OAuth 应用
2. 安装并配置 NextAuth.js
3. 实现认证 API 路由和认证逻辑
4. 创建认证上下文提供者组件
5. 更新导航栏和登录按钮
6. 实现模板选择页面和导航逻辑
7. 更新 QuickStart 组件，支持认证状态
8. 测试完整流程
9. 部署和上线

## 6. 测试计划

### 6.1 单元测试

- 测试认证组件和工具函数
- 测试导航逻辑
- 测试模板选择功能

### 6.2 集成测试

- 测试 GitHub 登录流程
- 测试从登录到选择模板到生成卡片的完整流程
- 测试错误处理和边界情况

### 6.3 用户验收测试

- 检查用户体验流程是否流畅
- 验证所有功能是否符合预期
- 确认移动端和桌面端体验一致性

## 7. 时间计划

- 环境配置和基础架构: 1 天
- 认证功能实现: 2 天
- 用户界面升级: 2 天
- 测试和优化: 1 天
- 文档和部署: 1 天

总计: 7 天工作时间

## 8. 风险评估

- GitHub API 限流可能影响用户体验
- OAuth 重定向在某些浏览器可能存在问题
- 需关注用户数据安全和隐私保护
- 服务器负载增加可能需要扩展基础设施

## 9. 后续优化

- 添加更多认证提供者（如 GitLab, Bitbucket）
- 实现用户卡片历史记录和管理
- 增加更多自定义选项和模板
- 优化性能和加载速度
- 添加分析和用户行为追踪

此需求文档提供了技术升级的整体框架，后续可根据项目进展进行调整和扩展。
