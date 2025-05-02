import { db } from "@/lib/db";
import { users, accounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  console.log("开始修复用户的 GitHub ID...");

  try {
    // 1. 获取所有用户
    const allUsers = await db.query.users.findMany();
    console.log(`找到 ${allUsers.length} 个用户`);

    for (const user of allUsers) {
      // 检查用户是否有 githubId
      if (!user.githubId) {
        console.log(`用户 ${user.id} 缺少 GitHub ID，尝试修复...`);

        // 查找该用户的 GitHub 账户关联
        const userAccounts = await db.query.accounts.findMany({
          where: and(
            eq(accounts.provider, "github"),
            eq(accounts.userId, user.id)
          ),
        });

        if (userAccounts.length > 0) {
          const githubAccount = userAccounts[0];

          // 更新用户的 githubId
          await db
            .update(users)
            .set({
              githubId: githubAccount.providerAccountId,
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

          console.log(
            `已修复：用户 ${user.id} 的 GitHub ID 已设置为 ${githubAccount.providerAccountId}`
          );
        } else {
          console.log(`无法修复：用户 ${user.id} 没有关联的 GitHub 账户`);
        }
      }
    }

    // 2. 确保所有 GitHub 账户都有正确的用户关联
    const allGithubAccounts = await db.query.accounts.findMany({
      where: eq(accounts.provider, "github"),
    });

    console.log(`找到 ${allGithubAccounts.length} 个 GitHub 账户`);

    for (const account of allGithubAccounts) {
      // 查找对应的用户
      const user = await db.query.users.findFirst({
        where: eq(users.id, account.userId),
      });

      if (user) {
        // 确保用户的 githubId 与账户的 providerAccountId 一致
        if (user.githubId !== account.providerAccountId) {
          console.log(
            `不一致：用户 ${user.id} 的 GitHub ID (${user.githubId}) 与账户 ID (${account.providerAccountId}) 不匹配，进行更新...`
          );

          await db
            .update(users)
            .set({
              githubId: account.providerAccountId,
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

          console.log(
            `已修复：用户 ${user.id} 的 GitHub ID 已更新为 ${account.providerAccountId}`
          );
        }
      } else {
        console.log(
          `孤立账户：GitHub 账户 ${account.providerAccountId} 没有关联用户`
        );
      }
    }

    console.log("GitHub ID 修复完成！");
  } catch (error) {
    console.error("修复过程中发生错误:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("程序执行失败:", err);
    process.exit(1);
  });
