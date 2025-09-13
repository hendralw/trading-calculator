import type { NextConfig } from "next";

// Konfigurasi untuk GitHub Pages (static export)
const isProd = process.env.NODE_ENV === "production";
const repo = "trading-calculator";

const nextConfig: NextConfig = {
  // Hasil build menjadi site statis di folder `out/`
  output: "export",
  // Optimasi gambar dinonaktifkan agar cocok untuk static hosting (Pages)
  images: { unoptimized: true },
  // Saat produksi (di GitHub Pages), app akan diserve di sub-path repo
  basePath: isProd ? `/${repo}` : undefined,
  assetPrefix: isProd ? `/${repo}/` : undefined,
};

export default nextConfig;
