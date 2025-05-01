import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users, userBehaviors } from "@/lib/db/schema";

// Define GitHub profile interface
interface GitHubProfile {
  id: string;
  login?: string;
  name?: string;
  email?: string;
  avatar_url?: string;
}

// Log user behavior function
async function logUserBehavior(
  userId: string,
  actionType: string,
  actionData?: Record<string, unknown>
) {
  try {
    await db.insert(userBehaviors).values({
      userId,
      actionType,
      actionData: actionData ? actionData : undefined,
      performedAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to log user behavior:", error);
  }
}

// 创建NextAuth配置
const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      authorization: {
        params: {
          scope: "read:user",
        },
      },
      profile(profile) {
        console.log(
          "Complete GitHub profile:",
          JSON.stringify(profile, null, 2)
        );
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          login: profile.login,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn callback triggered", { user, account, profile });

      if (!user || !profile) return false;

      try {
        const githubProfile = profile as GitHubProfile;

        // 简化逻辑：只通过GitHub ID查找用户
        const existingUser = await db.query.users.findFirst({
          where: eq(users.githubId, githubProfile.id),
        });

        if (existingUser) {
          // 更新现有用户信息
          await db
            .update(users)
            .set({
              username: githubProfile.login || "",
              displayName: githubProfile.name || "",
              avatarUrl: githubProfile.avatar_url || "",
              email: githubProfile.email,
              name: githubProfile.name || githubProfile.login || "",
              image: githubProfile.avatar_url || "",
              updatedAt: new Date(),
            })
            .where(eq(users.githubId, githubProfile.id));

          // 记录登录行为
          await logUserBehavior(existingUser.id, "login");
          console.log("用户登录:", existingUser.id);
        } else {
          // 创建新用户
          const newUser = await db
            .insert(users)
            .values({
              githubId: githubProfile.id,
              username: githubProfile.login || "",
              displayName: githubProfile.name || "",
              avatarUrl: githubProfile.avatar_url || "",
              email: githubProfile.email || "",
              name: githubProfile.name || githubProfile.login || "",
              image: githubProfile.avatar_url || "",
            })
            .returning();

          if (newUser && newUser[0]) {
            // 记录首次登录
            await logUserBehavior(newUser[0].id, "signup");
            console.log("创建了新用户:", newUser[0].id);
          }
        }

        // 始终允许登录
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return true; // 即使自定义逻辑失败也允许登录
      }
    },
    async jwt({ token, user, account, profile }) {
      if (account && user && profile) {
        const githubProfile = profile as {
          login?: string;
          name?: string;
          email?: string;
        };

        interface GithubUser {
          id: string;
          name?: string | null;
          email?: string | null;
          image?: string;
          login?: string;
        }

        console.log(
          "GitHub profile in JWT callback:",
          JSON.stringify(githubProfile, null, 2)
        );
        console.log(
          "User object in JWT callback:",
          JSON.stringify(user, null, 2)
        );

        const githubLogin = (user as GithubUser).login || githubProfile.login;

        return {
          ...token,
          accessToken: account.access_token,
          username: githubLogin || user.email?.split("@")[0],
          displayName:
            user.name ||
            githubProfile.name ||
            user.email?.split("@")[0] ||
            "user",
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Log token for debugging
      console.log("Token in session callback:", JSON.stringify(token, null, 2));

      if (session.user) {
        session.user.name =
          (token.displayName as string) || session.user.name || "user";
        session.user.accessToken = token.accessToken as string;
        session.user.username = token.username as string;

        // Log what we're setting for username
        console.log("Setting session.user.username to:", token.username);
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
};

// 创建handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
