/** @type {import('next').NextConfig} */
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
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
  compress: true,
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
      // 移除自定义的 splitChunks 配置，使用 Next.js 默认配置

      config.optimization.minimize = true;

      if (!isServer) {
        config.resolve.alias = {
          ...(config.resolve.alias || {}),
          moment$: "moment/moment.js",
        };

        config.optimization.minimizer.forEach((minimizer) => {
          if (minimizer.constructor.name === "TerserPlugin") {
            minimizer.options.terserOptions = {
              ...minimizer.options.terserOptions,
              compress: {
                ...minimizer.options.terserOptions.compress,
                drop_console: true,
              },
            };
          }
        });
      }
    }

    return config;
  },
  output: "export",
  distDir: ".output",
  poweredByHeader: false,
  reactStrictMode: true,
};

export default withBundleAnalyzer(nextConfig);
