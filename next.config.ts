import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Static export: nginx serves ./out/ directly.
  output: "export",

  // /playground/ → /playground/index.html
  trailingSlash: true,

  // Image Optimization API unavailable in export mode.
  images: {
    unoptimized: true,
  },

  // Strict build enforcement.
  typescript: { ignoreBuildErrors: false },

  poweredByHeader: false,
}

export default nextConfig
