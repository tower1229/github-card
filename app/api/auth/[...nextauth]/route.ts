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
    if (typeof window === "undefined") {
      await db.insert(userBehaviors).values({
        userId,
        actionType,
        actionData: actionData ? actionData : undefined,
        performedAt: new Date(),
      });
    }
  } catch (error) {
    console.error("Failed to log user behavior:", error);
  }
}

// Server-side only check - prevents client-side execution errors
const isServer = typeof window === "undefined";

// 创建NextAuth配置
export const authOptions: NextAuthOptions = {
  // Only use adapter on the server side
  ...(isServer && { adapter: DrizzleAdapter(db) }),
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
      if (account?.provider !== "github") return false;
      if (!profile) return false;

      try {
        if (isServer) {
          const githubProfile = profile as GitHubProfile;
          const userId = user.id;

          const existingUserResult = await db
            .select()
            .from(users)
            .where(eq(users.id, userId));

          const existingUser = existingUserResult[0];

          if (existingUser) {
            await db
              .update(users)
              .set({
                username: githubProfile.login || "",
                displayName: githubProfile.name || "",
                avatarUrl: githubProfile.avatar_url || "",
                updatedAt: new Date(),
              })
              .where(eq(users.id, userId));

            await logUserBehavior(userId, "login");
            console.log("用户登录:", userId);
          } else {
            await logUserBehavior(userId, "signup");
            console.log("新用户首次登录:", userId);

            await db
              .update(users)
              .set({
                githubId: githubProfile.id,
                username: githubProfile.login || "",
                displayName: githubProfile.name || "",
                avatarUrl: githubProfile.avatar_url || "",
              })
              .where(eq(users.id, userId));
          }
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return true;
      }
    },
    async jwt({ token, user, account, profile }) {
      if (account && user && profile) {
        const githubProfile = profile as {
          login?: string;
          name?: string;
          email?: string;
        };

        return {
          ...token,
          accessToken: account.access_token,
          username:
            user.login || githubProfile.login || user.email?.split("@")[0],
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
      if (session.user) {
        session.user.name =
          (token.displayName as string) || session.user.name || "user";
        session.user.accessToken = token.accessToken as string;
        session.user.username = token.username as string;
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
