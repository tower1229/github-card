# 排行榜数据结构迁移文档

## 概述

本次迁移的目的是删除 `contribution_leaderboard` 表，并修改排行榜相关的请求方法，使其直接从 `contribute_data` 表中获取所需数据。这将简化数据库结构并消除数据冗余。

## 迁移内容

1. 删除 `contribution_leaderboard` 表
2. 修改 `leaderboard.ts` 中的函数，使用 `contribute_data` 表中的 `githubData.contributionScore` 字段
3. 更新排行榜计算方式，直接基于 `contribute_data` 表中的数据进行排序

## 迁移步骤

按照以下步骤执行迁移：

### 1. 备份数据库

在执行迁移之前，请务必备份您的数据库。

### 2. 运行迁移脚本

使用以下命令运行迁移脚本：

```bash
yarn db:update-leaderboard
```

### 3. 验证迁移

迁移完成后，请验证以下功能正常工作：

- 排行榜页面正确显示数据
- 用户排名正确显示
- 用户更新贡献数据后排名正确更新

## 代码修改说明

### 删除的表和字段

- 删除 `contribution_leaderboard` 表
- 删除 `refreshLeaderboard` 函数，因为不再需要更新静态排名

### 修改的函数

- `updateUserContribution`: 现在直接更新 `contribute_data` 表中的 githubData
- `getUserRank`: 现在基于 `contribute_data` 表计算排名
- `getLeaderboard`: 从 `contribute_data` 表获取数据并计算排名
- `getFullLeaderboard`: 使用修改后的方法获取数据

## 注意事项

- 此次迁移不会影响用户数据，只是改变了存储和查询方式
- 排名现在是动态计算的，而不是存储在数据库中
- 如果遇到问题，可以查看服务器日志了解详细错误信息

## 回滚计划

如果需要回滚，请恢复备份的数据库，并恢复代码到迁移前的版本。
