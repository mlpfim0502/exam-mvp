import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "profile.line-scdn.net", // LINE profile pictures
      },
    ],
  },
};

export default nextConfig;
