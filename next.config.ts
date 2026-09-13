import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/~offline",
  },
});

const nextConfig: NextConfig = {
  output: "standalone",
  // next-pwa injects webpack plugins; silence Next 16 turbopack warning
  turbopack: {},
};

export default withPWA(nextConfig);
