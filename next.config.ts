import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    domains: ["profile.line-scdn.net"], // LINE profile pictures
  },
};

export default nextConfig;
