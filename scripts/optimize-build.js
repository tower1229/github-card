#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// ANSI color codes for better console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    crimson: "\x1b[38m",
  },
  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
    crimson: "\x1b[48m",
  },
};

console.log(
  `${colors.bright}${colors.fg.green}=== Next.js Build Optimization Script ===${colors.reset}\n`
);

// Step 1: Clean up previous build artifacts
console.log(
  `${colors.fg.cyan}Step 1: Cleaning previous build artifacts...${colors.reset}`
);
try {
  const nextDir = path.join(process.cwd(), ".next");
  if (fs.existsSync(nextDir)) {
    // Use rimraf-like approach for Windows compatibility
    if (process.platform === "win32") {
      execSync("rd /s /q .next", { stdio: "inherit" });
    } else {
      execSync("rm -rf .next", { stdio: "inherit" });
    }
  }
  console.log(`${colors.fg.green}✓ Cleaned successfully${colors.reset}\n`);
} catch (error) {
  console.error(
    `${colors.fg.red}× Failed to clean: ${error.message}${colors.reset}\n`
  );
  process.exit(1);
}

// Step 2: Run build with bundle analyzer
console.log(
  `${colors.fg.cyan}Step 2: Running production build with bundle analyzer...${colors.reset}`
);
try {
  // Cross-platform environment variable setting
  if (process.platform === "win32") {
    execSync("yarn build:analyze", { stdio: "inherit" });
  } else {
    execSync("ANALYZE=true yarn build", { stdio: "inherit" });
  }
  console.log(`${colors.fg.green}✓ Build complete${colors.reset}\n`);
} catch (error) {
  console.error(
    `${colors.fg.red}× Build failed: ${error.message}${colors.reset}\n`
  );
  process.exit(1);
}

// Step 3: Check output size
console.log(`${colors.fg.cyan}Step 3: Checking output size...${colors.reset}`);
try {
  // Get the total size of the client and server builds
  const clientDir = path.join(process.cwd(), ".next/static");
  let totalSize = 0;
  let largeFiles = [];

  function calculateDirSize(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dir, file.name);

      if (file.isDirectory()) {
        calculateDirSize(filePath);
      } else {
        const fileSize = fs.statSync(filePath).size;
        totalSize += fileSize;

        // Track files over 500KB
        if (fileSize > 500 * 1024) {
          largeFiles.push({
            path: filePath.replace(process.cwd(), ""),
            size: (fileSize / (1024 * 1024)).toFixed(2) + " MB",
          });
        }
      }
    }
  }

  if (fs.existsSync(clientDir)) {
    calculateDirSize(clientDir);
  }

  console.log(
    `${colors.fg.green}Total build size: ${(totalSize / (1024 * 1024)).toFixed(
      2
    )} MB${colors.reset}`
  );

  if (largeFiles.length > 0) {
    console.log(`\n${colors.fg.yellow}Large files detected:${colors.reset}`);
    largeFiles.forEach((file) => {
      console.log(
        `${colors.fg.yellow}- ${file.path}: ${file.size}${colors.reset}`
      );
    });
  }

  console.log("\n");
} catch (error) {
  console.error(
    `${colors.fg.red}× Failed to check output size: ${error.message}${colors.reset}\n`
  );
}

// Step 4: Provide recommendations
console.log(
  `${colors.fg.cyan}Step 4: Optimization recommendations:${colors.reset}`
);
console.log(`
${colors.fg.white}1. Check the bundle analyzer report at .next/analyze/client.html
2. Look for large dependencies and consider replacing or code-splitting them
3. Implement dynamic imports for all large components
4. Optimize images using next/image with proper sizing
5. Remove unused dependencies from package.json
6. Consider implementing tree-shaking for large libraries
7. For Cloudflare Pages, ensure your bundles are <25MB total${colors.reset}
`);

console.log(
  `${colors.bright}${colors.fg.green}=== Optimization complete ===${colors.reset}`
);
