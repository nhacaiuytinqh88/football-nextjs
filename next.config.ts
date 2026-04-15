import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Logo đội bóng, giải đấu từ API-Football
        protocol: "https",
        hostname: "media.api-sports.io",
      },
      {
        // Ảnh bìa bài viết lưu trên Supabase Storage
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
