import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import LeftSidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.techshift.vn'

export const viewport: Viewport = {
  themeColor: '#15803d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'TechShift - Cập nhật bóng đá 24/7',
    template: '%s | TechShift',
  },
  description:
    'Nơi cập nhật tin tức bóng đá nhanh nhất Việt Nam. Livescore trực tiếp, kết quả, bảng xếp hạng, tỷ lệ kèo và nhận định chuyên sâu.',
  keywords: ['techshift', 'livescore', 'bóng đá', 'kết quả bóng đá', 'bảng xếp hạng', 'nhận định', 'tỷ lệ kèo', 'premier league', 'la liga'],
  authors: [{ name: 'TechShift' }],
  creator: 'TechShift',
  verification: {
    google: 'PLt30fBQlcTM1BKCaUVZwgHS6447VDbjJjcbbedM4qM',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: BASE_URL,
    siteName: 'TechShift',
    title: 'TechShift - Cập nhật bóng đá 24/7',
    description: 'Nơi cập nhật tin tức bóng đá nhanh nhất Việt Nam. Livescore trực tiếp, kết quả, bảng xếp hạng và nhận định chuyên sâu.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechShift',
    description: 'Cập nhật bóng đá 24/7 - Livescore, kết quả, BXH và nhận định.',
  },
  alternates: {
    canonical: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className="h-full">
      <body className="min-h-full bg-gray-100 dark:bg-gray-900 antialiased">
        <ThemeProvider>
          {/* Header - sticky top */}
          <Header />

          {/* Main wrapper: 3 cột trên Desktop, 1 cột trên Mobile */}
          <div className="mx-auto flex w-full max-w-screen-xl gap-4 px-4 py-4
                          pb-20 md:pb-4">
            {/*
             * LEFT SIDEBAR
             * - Ẩn trên mobile/tablet (lg:flex)
             * - Hiện trên Desktop >= 1024px
             */}
            <LeftSidebar />

            {/*
             * MAIN CONTENT
             * - Chiếm toàn bộ width trên mobile
             * - Chiếm ~55% trên Desktop (flex-1 tự co giãn)
             */}
            <main className="min-w-0 flex-1">
              {children}
            </main>

            {/*
             * RIGHT SIDEBAR
             * - Ẩn trên mobile/tablet (xl:flex)
             * - Hiện trên Desktop >= 1280px
             */}
            <RightSidebar />
          </div>

          {/*
           * BOTTOM NAVIGATION
           * - Chỉ hiển thị trên Mobile (md:hidden trong component)
           * - Fixed bottom, z-index cao
           */}
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  )
}
