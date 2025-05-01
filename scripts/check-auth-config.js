#!/usr/bin/env node

/**
 * NextAuth GitHub Provider Configuration Checker
 *
 * This script checks if the required environment variables for NextAuth.js GitHub provider
 * are correctly set and provides guidance on how to configure the GitHub OAuth application.
 */

// Check for required environment variables
const requiredEnvVars = [
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "GITHUB_ID",
  "GITHUB_SECRET",
];

let allEnvVarsPresent = true;
const missingEnvVars = [];

console.log(
  "\n🔍 Checking NextAuth.js GitHub authentication configuration...\n"
);

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    allEnvVarsPresent = false;
    missingEnvVars.push(envVar);
  }
}

if (!allEnvVarsPresent) {
  console.log("❌ Missing required environment variables:");
  missingEnvVars.forEach((envVar) => {
    console.log(`   - ${envVar}`);
  });
  console.log("\nPlease add these variables to your .env.local file.");
} else {
  console.log("✅ All required environment variables are present.");
}

// Check NEXTAUTH_URL format
if (process.env.NEXTAUTH_URL) {
  try {
    const url = new URL(process.env.NEXTAUTH_URL);
    console.log(`\n✅ NEXTAUTH_URL is a valid URL: ${url.href}`);

    // Check if we're using localhost
    if (url.hostname === "localhost") {
      console.log("\n⚠️  You are using localhost for development:");
      console.log(
        "   Make sure your GitHub OAuth App is configured with these URLs:"
      );
      console.log(`   - Homepage URL: ${url.href}`);
      console.log(
        `   - Authorization callback URL: ${url.href}/api/auth/callback/github`
      );
    }
  } catch {
    console.log(
      `\n❌ NEXTAUTH_URL is not a valid URL: ${process.env.NEXTAUTH_URL}`
    );
    console.log(
      "   Please provide a complete URL including protocol (http:// or https://)"
    );
  }
}

// Provide GitHub OAuth configuration guidance
console.log("\n📋 GitHub OAuth Configuration Checklist:");
console.log(
  "   1. Go to GitHub Developer Settings: https://github.com/settings/developers"
);
console.log("   2. Select your OAuth App or create a new one");
console.log("   3. Set proper Homepage URL (should match NEXTAUTH_URL)");
console.log("   4. Set Authorization callback URL to:");
console.log(
  `      ${
    process.env.NEXTAUTH_URL || "YOUR_NEXTAUTH_URL"
  }/api/auth/callback/github`
);
console.log(
  "\n   ⚠️  The callback URL must exactly match, including trailing slashes if any!"
);

// NextAuth.js debugging help
console.log("\n🐛 Debugging Tips:");
console.log(
  "   - Set DEBUG=next-auth:* in .env.local to enable NextAuth.js debug logs"
);
console.log("   - Check browser console and server logs for error details");
console.log(
  "   - Ensure your database is properly configured if using an adapter"
);
console.log("   - Try clearing browser cookies and localStorage");

console.log("\n✨ Configuration check complete.\n");
