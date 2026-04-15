import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import FixtureList from '@/components/ui/FixtureList'
import { getFixturesByDate } from '@/lib/services/fixtures'
import { getVNDateString, formatShortDate } from '@/lib/date'

export const metadata: Metadata = {
  title: 'Lịch thi đấu bóng đá hôm nay',
  description: 'Lịch thi đấu bóng đá hôm nay và sắp tới của các giải đấu hàng đầu thế giới.',
}

// Helper lấy ngày VN — dùng từ lib/date
function getVNDate(offsetDays = 0): string {
  return getVNDateString(offsetDays)
}

function formatDisplayDate(dateStr: string): string {
  return formatShortDate(dateStr)
}

// Skeleton
function Skeleton() {
  return (
    <div className="divide-y divide-gray-50">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <div className="h-8 w-10 animate-pulse rounded bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Server Component fetch data
async function FixturesForDate({ date }: { date: string }) {
  const fixtures = await getFixturesByDate(date)
  return <FixtureList fixtures={fixtures} emptyMessage="Không có trận đấu nào ngày này" />
}

// Page nhận searchParams để chọn ngày
export default async function LichThiDauPage(props: PageProps<'/lich-thi-dau'>) {
  const { date: dateParam } = await props.searchParams ?? {}
  const today = getVNDate(0)
  const selectedDate = (typeof dateParam === 'string' && dateParam) ? dateParam : today

  // Tạo dải 7 ngày để chọn (hôm qua, hôm nay, 5 ngày tới)
  const dateRange = Array.from({ length: 7 }, (_, i) => getVNDate(i - 1))

  const prevDate = new Date(selectedDate)
  prevDate.setDate(prevDate.getDate() - 1)
  const nextDate = new Date(selectedDate)
  nextDate.setDate(nextDate.getDate() + 1)

  return (
    <div className="space-y-3">
      {/* Date picker */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 bg-green-700 px-4 py-3">
          <Calendar size={15} className="text-white" />
          <h1 className="text-sm font-semibold text-white">Lịch thi đấu</h1>
        </div>

        {/* Thanh chọn ngày - scrollable trên mobile */}
        <div className="flex items-center border-b border-gray-100">
          <Link
            href={`/lich-thi-dau?date=${prevDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })}`}
            className="flex h-10 w-8 shrink-0 items-center justify-center text-gray-400 hover:text-green-700"
          >
            <ChevronLeft size={16} />
          </Link>

          <div className="flex flex-1 overflow-x-auto scrollbar-hide">
            {dateRange.map((d) => {
              const isSelected = d === selectedDate
              const isToday = d === today
              return (
                <Link
                  key={d}
                  href={`/lich-thi-dau?date=${d}`}
                  className={`flex shrink-0 flex-col items-center justify-center px-3 py-2 text-xs transition-colors ${
                    isSelected
                      ? 'border-b-2 border-green-700 font-semibold text-green-700'
                      : 'text-gray-500 hover:text-green-600'
                  }`}
                >
                  <span>{isToday ? 'Hôm nay' : formatDisplayDate(d)}</span>
                </Link>
              )
            })}
          </div>

          <Link
            href={`/lich-thi-dau?date=${nextDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })}`}
            className="flex h-10 w-8 shrink-0 items-center justify-center text-gray-400 hover:text-green-700"
          >
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Danh sách trận */}
        <Suspense fallback={<Skeleton />}>
          <FixturesForDate date={selectedDate} />
        </Suspense>
      </div>
    </div>
  )
}
