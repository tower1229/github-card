import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  console.log("开始修复 OAuth 账户关联问题...");

  try {
    // 1. 获取所有用户
    const allUsers = await db.query.users.findMany();
    console.log(`找到 ${allUsers.length} 个用户`);

    // 2. 检查每个用户的 GitHub 账户关联
    for (const user of allUsers) {
      // 查找该用户的 GitHub 账户
      const userAccounts = await db.query.accounts.findMany({
        where: and(
          eq(accounts.provider, "github"),
          eq(accounts.userId, user.id)
        ),
      });

      if (userAccounts.length === 0) {
        console.log(
          `用户 ${user.id} (${user.username}) 没有关联的 GitHub 账户，尝试创建...`
        );

        // 查找是否有与该用户 GitHub ID 匹配但未关联的账户
        if (user.githubId) {
          // 创建新的账户关联
          await db.insert(accounts).values({
            provider: "github",
            providerAccountId: user.githubId,
            type: "oauth",
            userId: user.id,
          });
          console.log(`为用户 ${user.id} 创建了新的 GitHub 账户关联`);
        } else {
          console.log(`用户 ${user.id} 没有 GitHub ID，无法创建关联`);
        }
      } else {
        console.log(
          `用户 ${user.id} 已有 ${userAccounts.length} 个 GitHub 账户关联`
        );

        // 确保 providerAccountId 与 githubId 匹配
        for (const account of userAccounts) {
          if (account.providerAccountId !== user.githubId) {
            console.log(
              `修复用户 ${user.id} 的账户关联，更新 providerAccountId 从 ${account.providerAccountId} 到 ${user.githubId}`
            );

            await db
              .update(accounts)
              .set({ providerAccountId: user.githubId })
              .where(
                and(
                  eq(accounts.provider, "github"),
                  eq(accounts.userId, user.id),
                  eq(accounts.providerAccountId, account.providerAccountId)
                )
              );
          }
        }
      }
    }

    console.log("OAuth 账户关联修复完成！");
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
