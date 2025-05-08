/** @type {import('next').NextConfig} */
// import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig = {
  // Enable output compression
  compress: true,

  // Reduce output size with production settings
  productionBrowserSourceMaps: false,

  // Disable static optimization if not needed
  reactStrictMode: true,

  // Enable SWC minification
  swcMinify: true,

  // 更改为标准输出模式，更适合Cloudflare Worker
  // output: "standalone",

  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bing.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.bing.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cn.bing.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.bimg.cc",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "github.com",
        port: "",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    typedRoutes: true,
    webpackBuildWorker: true,
    optimizeCss: true,
  },
  webpack: (config, { dev, isServer }) => {
    // Fix 'self is not defined' error in server bundle
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };

      // Exclude browser-specific modules from server build
      config.externals = [
        ...(config.externals || []),
        "react-github-calendar",
        "html-to-image",
        "framer-motion",
        "motion",
        "vaul",
      ];
    }

    if (!dev) {
      // Production optimizations
      config.optimization.minimize = true;

      // Clean cache during build to reduce disk usage
      config.cache = false;

      if (!isServer) {
        // Bundle optimization
        config.resolve.alias = {
          ...(config.resolve.alias || {}),
          moment$: "moment/moment.js",
        };

        // Aggressively optimize JavaScript
        config.optimization.minimizer.forEach((minimizer) => {
          if (minimizer.constructor.name === "TerserPlugin") {
            minimizer.options.terserOptions = {
              ...minimizer.options.terserOptions,
              compress: {
                ...minimizer.options.terserOptions.compress,
                drop_console: true,
                passes: 2,
              },
              mangle: true,
            };
          }
        });
      }
    }

    return config;
  },
  // Purge temporary files during build
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 2,
  },
};

// 移除 OpenNext 初始化
// initOpenNextCloudflareForDev();

export default nextConfig;
