import type { NextConfig } from "next";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const backendUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const frontendDir = path.resolve(__dirname);

const nextConfig: NextConfig = {
  turbopack: {
    root: frontendDir,
  },
  webpack: (config) => {
    config.resolve.modules = [
      path.join(frontendDir, "node_modules"),
      ...(config.resolve.modules || []),
    ];
    return config;
  },
  rewrites: async () => [
    {
      source: "/api/v1/:path*",
      destination: `${backendUrl}/api/v1/:path*`,
    },
  ],
};

export default withNextIntl(nextConfig);
