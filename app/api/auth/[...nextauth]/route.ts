import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      authorization: {
        params: {
          scope: "read:user user user:email",
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
    error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
