import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "web.laplatasystems.com.ar", pathname: "/assets/**" },
    ],
  },
};

export default nextConfig;