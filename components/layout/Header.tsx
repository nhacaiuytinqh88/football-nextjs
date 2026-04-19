import Link from 'next/link'
import Image from 'next/image'
import { Search, Bell } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'

// Server Component - không cần 'use client'
export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-green-700 dark:bg-green-800 text-white shadow-md">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Image
            src="/bongdawap-logo-techshift.png"
            alt="BongDaWap Logo"
            width={32}
            height={32}
            className="rounded-md"
          />
          <span className="hidden sm:inline">BongDa<span className="text-yellow-400 dark:text-yellow-300">Wap</span></span>
          <span className="sm:hidden">BD<span className="text-yellow-400 dark:text-yellow-300">W</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-yellow-300 dark:hover:text-yellow-200 transition-colors">
            Trang chủ
          </Link>
          <Link href="/livescore" className="hover:text-yellow-300 dark:hover:text-yellow-200 transition-colors">
            Livescore
          </Link>
          <Link href="/lich-thi-dau" className="hover:text-yellow-300 dark:hover:text-yellow-200 transition-colors">
            Lịch thi đấu
          </Link>
          <Link href="/bang-xep-hang" className="hover:text-yellow-300 dark:hover:text-yellow-200 transition-colors">
            Bảng xếp hạng
          </Link>
          <Link href="/nhan-dinh" className="hover:text-yellow-300 dark:hover:text-yellow-200 transition-colors">
            Nhận định
          </Link>
          <Link href="/ty-le-keo" className="hover:text-yellow-300 dark:hover:text-yellow-200 transition-colors">
            Tỷ lệ kèo
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/tim-kiem"
            aria-label="Tìm kiếm"
            className="rounded-full p-2 hover:bg-green-600 transition-colors"
          >
            <Search size={20} />
          </Link>
          <ThemeToggle />
          <button
            aria-label="Thông báo"
            className="rounded-full p-2 hover:bg-green-600 transition-colors"
          >
            <Bell size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
