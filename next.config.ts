import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Versioned PDF.js worker/fonts/CMaps (scripts/copy-pdfjs-assets.mjs): the path changes with the version.
        source: "/pdfjs/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Local stand-ins for Sanity PDF assets. Raw files carry no banner or
        // navigation, so keep them out of search results where we control headers.
        source: "/pdfs/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },
};

export default nextConfig;
