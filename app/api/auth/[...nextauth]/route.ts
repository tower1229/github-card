import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

export const runtime = 'nodejs';

// Using the direct re-export pattern recommended for App Router
// This bypasses some of the typing issues with Next.js 15
const handler = NextAuth(authOptions);

// Export the handler methods directly
export { handler as GET, handler as POST };

