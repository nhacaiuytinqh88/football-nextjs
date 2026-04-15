import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Railway inject PORT tự động, Next.js cần biết để listen đúng port
  // Không cần set cứng — Railway tự handle qua env PORT
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
  // Output standalone giúp Railway deploy nhanh hơn, ít dung lượng hơn
  output: "standalone",
};

export default nextConfig;
