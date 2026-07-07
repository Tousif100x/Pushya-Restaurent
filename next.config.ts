import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      }
    ],
  },
  allowedDevOrigins: ["172.19.46.220", "localhost"],
};

const withPWAConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  fallbacks: {
    document: "/~offline",
  },
  workboxOptions: {
    disableDevLogs: true,
  }
});

const finalConfig = withPWAConfig(nextConfig);
// Ensure allowedDevOrigins is not stripped by plugins
(finalConfig as any).allowedDevOrigins = ["172.19.46.220", "localhost", "0.0.0.0"];

export default finalConfig;
