import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
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

        return {
          ...token,
          accessToken: account.access_token,
          username:
            githubProfile.login ||
            user.name?.toLowerCase().replace(/\s+/g, "") ||
            user.email?.split("@")[0],
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = session.user.name || "user";
        session.user.accessToken = token.accessToken as string;
        session.user.username = token.username as string;
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
