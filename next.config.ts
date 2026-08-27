import type { NextConfig } from "next";
import path from "path";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003";

const apiHost = (() => {
  try {
    return new URL(apiUrl).hostname;
  } catch {
    return "localhost";
  }
})();

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.resolve("."),
  transpilePackages: ["lucide-react"],
  turbopack: {
    resolveAlias: {
      // Alias only the exact package specifier to avoid redirecting
      // subpath imports like 'lucide-react/dist/..' which should resolve
      // to the actual package files in node_modules.
      "lucide-react$": "./src/lib/lucide-shim.ts",
    },
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Use exact-match alias in webpack to avoid rewriting subpath imports
      "lucide-react$": path.resolve("./src/lib/lucide-shim.ts"),
    };
    return config;
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "5003", pathname: "/**" },
      { protocol: "https", hostname: apiHost, pathname: "/**" },
      { protocol: "http", hostname: apiHost, pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  async headers() {
    const isDev = process.env.NODE_ENV === "development";

    return [
      ...(isDev
        ? [
            {
              source: "/((?!_next/static|_next/image|images|favicon.ico|icon.svg|sw.js).*)",
              headers: [
                {
                  key: "Cache-Control",
                  value: "no-store, must-revalidate",
                },
              ],
            },
          ]
        : []),
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/listings/category/:path*",
        destination: "/category/:path*",
        permanent: true,
      },
      {
        source: "/listings/in/:path*",
        destination: "/city/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
