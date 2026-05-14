import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  allowedDevOrigins: ["192.168.20.100"],
  images: {
    unoptimized: true, // required for static export
  },
};

export default nextConfig;
