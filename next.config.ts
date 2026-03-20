import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["1e3773b31c98c0.lhr.life"],
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
