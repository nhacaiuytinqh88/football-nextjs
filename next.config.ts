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
  
  // Cấu hình chuyển hướng
  async redirects() {
    return [
      // Chuyển hướng từ Netlify domain cũ sang domain mới
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'football-nextjs.netlify.app',
          },
        ],
        destination: 'https://www.techshift.vn/:path*',
        permanent: true, // 301 redirect
      },
      // Chuyển hướng non-www sang www
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'techshift.vn',
          },
        ],
        destination: 'https://www.techshift.vn/:path*',
        permanent: true,
      },
      // Chuyển hướng domain cũ bongdalive.com nếu có
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'bongdalive.com',
          },
        ],
        destination: 'https://www.techshift.vn/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.bongdalive.com',
          },
        ],
        destination: 'https://www.techshift.vn/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
