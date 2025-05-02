import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's database ID */
      id?: string;
      /** The user's username */
      username?: string;
      /** The user's GitHub access token */
      accessToken?: string;
    } & DefaultSession["user"];
  }

  interface User {
    /** The user's username */
    username?: string;
    /** GitHub login username */
    login?: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** The user's database ID */
    id?: string;
    /** The user's username */
    username?: string;
    /** The user's display name */
    displayName?: string;
    /** The user's GitHub access token */
    accessToken?: string;
  }
}
