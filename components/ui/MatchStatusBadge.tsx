import { formatMatchTime, formatMatchDate, isToday } from '@/lib/date'

// Server Component - hiển thị trạng thái trận đấu
interface Props {
  status: string  // 'NS' | '1H' | 'HT' | '2H' | 'FT' | 'AET' | 'PEN' | 'PST' | 'CANC'
  elapsed: number | null
  date: string    // ISO string từ API-Football (UTC)
  showDate?: boolean // Bắt buộc hiện ngày (dùng trong trang đội bóng/giải đấu)
}

export default function MatchStatusBadge({ status, elapsed, date, showDate = false }: Props) {
  const matchIsToday = isToday(date)
  // Hiện ngày nếu: được yêu cầu (showDate) HOẶC trận không phải hôm nay
  const shouldShowDate = showDate || !matchIsToday

  // Trận đang diễn ra
  if (['1H', '2H', 'ET', 'BT', 'P'].includes(status)) {
    return (
      <div className="flex flex-col items-center min-w-[44px]">
        <span className="text-xs font-bold text-red-500 animate-pulse leading-none">
          {elapsed}&apos;
        </span>
        <span className="text-[10px] text-red-400 font-medium">LIVE</span>
      </div>
    )
  }

  // Nghỉ giữa hiệp
  if (status === 'HT') {
    return (
      <div className="flex flex-col items-center min-w-[44px]">
        <span className="text-xs font-bold text-orange-500 leading-none">HT</span>
        <span className="text-[10px] text-orange-400">Nghỉ</span>
      </div>
    )
  }

  // Kết thúc
  if (['FT', 'AET', 'PEN'].includes(status)) {
    return (
      <div className="flex flex-col items-center min-w-[44px]">
        <span className="text-xs font-semibold text-gray-500 leading-none">KT</span>
        {status !== 'FT' && (
          <span className="text-[10px] text-gray-400">{status}</span>
        )}
        {shouldShowDate && (
          <span className="text-[10px] text-gray-400 leading-none mt-0.5">
            {formatMatchDate(date)}
          </span>
        )}
      </div>
    )
  }

  // Chưa bắt đầu
  if (status === 'NS') {
    const time = formatMatchTime(date)
    return (
      <div className="flex flex-col items-center min-w-[44px]">
        <span className="text-sm font-semibold text-gray-700 leading-none">{time}</span>
        {shouldShowDate && (
          <span className="text-[10px] text-gray-400 leading-none mt-0.5">
            {formatMatchDate(date)}
          </span>
        )}
      </div>
    )
  }

  // Hoãn / Hủy
  if (['PST', 'CANC', 'ABD', 'AWD', 'WO'].includes(status)) {
    const label = status === 'PST' ? 'Hoãn' : 'Hủy'
    return (
      <div className="flex flex-col items-center min-w-[44px]">
        <span className="text-[10px] font-semibold text-gray-400 leading-none">{label}</span>
        {shouldShowDate && (
          <span className="text-[10px] text-gray-400 leading-none mt-0.5">
            {formatMatchDate(date)}
          </span>
        )}
      </div>
    )
  }

  return <div className="min-w-[44px]" />
}
