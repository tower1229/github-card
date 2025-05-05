import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Server component helper function to get the session
export function auth() {
  return getServerSession(authOptions);
}

// Default export for compatibility
export default auth;
