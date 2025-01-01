/** @type {import('next').NextConfig} */
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
    ],
  },
  metadata: {
    title: "Github Card",
    description: "Github Card",
    keywords: "Github Card",
  },
};

module.exports = nextConfig;
