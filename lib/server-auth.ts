import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Server-side API route authentication middleware
export async function withServerAuth(
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>,
  req: NextRequest
) {
  try {
    console.log("withServerAuth: Starting authentication check");
    
    // Debugging information about the request
    console.log("withServerAuth: Request method:", req.method);
    console.log("withServerAuth: Request URL:", req.url);
    
    let session;
    try {
      session = await getServerSession(authOptions);
      console.log("withServerAuth: Session retrieved:", !!session);
      
      if (session?.user) {
        console.log("withServerAuth: User in session:", { 
          hasId: !!session.user.id, 
          hasName: !!session.user.name,
          hasEmail: !!session.user.email
        });
      } else {
        console.log("withServerAuth: No user in session");
      }
    } catch (sessionError) {
      console.error("withServerAuth: Error retrieving session:", sessionError);
      return NextResponse.json({ 
        error: "Authentication error", 
        message: "Failed to retrieve session" 
      }, { status: 500 });
    }

    // Debug session details
    if (session) {
      console.log("Session details:", {
        hasUser: !!session.user,
        userId: session.user?.id,
        userName: session.user?.name,
        userEmail: session.user?.email,
        userImage: session.user?.image,
        username: session.user?.username,
      });
      
      // Log the entire session for debugging
      console.log("Full session object:", JSON.stringify(session));
    }
    
    // Check if user ID exists in session, or use 'sub' as fallback
    // NOTE: This is a temporary workaround until NextAuth session is fully updated
    let userId = session?.user?.id;
    
    if (!userId && session) {
      console.log("No user ID in session, checking token 'sub' value...");
      
      // Try to extract sub from the session token if possible
      try {
        // @ts-expect-error - Accessing internal property for debugging
        if (session.token?.sub) {
          // @ts-expect-error - Using internal property
          userId = session.token.sub;
          console.log("Found sub in session token:", userId);
        }
      } catch (error) {
        console.error("Error accessing session token:", error);
      }
    }
    
    // Final fallback - if user is logged in but we still can't get an ID
    if (!userId && session?.user) {
      // WARNING: Only use this in development for debugging!
      // Using a hardcoded or generated ID is NOT secure for production
      const userEmail = session.user.email;
      if (userEmail) {
        console.log("Using user email hash as temporary ID fallback");
        // Create a deterministic but unique ID from the email
        userId = Buffer.from(userEmail).toString('base64');
      }
    }
    
    if (!userId) {
      console.log("API 鉴权失败: 缺少用户 ID");
      
      // For debugging only - in production this would be a security risk
      // If the user is logged in but missing an ID, we'll log detailed info
      if (session?.user) {
        console.log("User is logged in but missing ID. Session user:", JSON.stringify(session.user));
      }
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.log("Using user ID for auth:", userId);

    try {
      console.log("withServerAuth: Proceeding to handler with userId:", userId);
      return await handler(req, userId);
    } catch (handlerError) {
      console.error("withServerAuth: Error in handler execution:", handlerError);
      return NextResponse.json({ 
        error: "Request handler error", 
        message: String(handlerError) 
      }, { status: 500 });
    }
  } catch (error) {
    // Catch-all for any other errors in the auth middleware
    console.error("withServerAuth: Unexpected error in auth middleware:", error);
    return NextResponse.json({ 
      error: "Server error", 
      message: "An unexpected error occurred in the authentication process" 
    }, { status: 500 });
  }
}
