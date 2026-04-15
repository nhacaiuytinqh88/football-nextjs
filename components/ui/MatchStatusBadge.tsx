import { formatMatchTime } from '@/lib/date'

// Server Component - hiển thị trạng thái trận đấu
interface Props {
  status: string
  elapsed: number | null
  date: string    // ISO string từ API-Football (UTC)
}

export default function MatchStatusBadge({ status, elapsed, date }: Props) {
  // Trận đang diễn ra
  if (['1H', '2H', 'ET', 'BT', 'P'].includes(status)) {
    return (
      <div className="flex flex-col items-center min-w-[40px]">
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
      <div className="flex flex-col items-center min-w-[40px]">
        <span className="text-xs font-bold text-orange-500 leading-none">HT</span>
        <span className="text-[10px] text-orange-400">Nghỉ</span>
      </div>
    )
  }

  // Kết thúc
  if (['FT', 'AET', 'PEN'].includes(status)) {
    return (
      <div className="flex flex-col items-center min-w-[40px]">
        <span className="text-xs font-semibold text-gray-500 leading-none">KT</span>
        {status !== 'FT' && (
          <span className="text-[10px] text-gray-400">{status}</span>
        )}
      </div>
    )
  }

  // Chưa bắt đầu - hiển thị giờ VN
  if (status === 'NS') {
    const time = formatMatchTime(date)
    return (
      <div className="flex flex-col items-center min-w-[40px]">
        <span className="text-sm font-semibold text-gray-700 leading-none">{time}</span>
      </div>
    )
  }

  // Hoãn / Hủy
  if (['PST', 'CANC', 'ABD', 'AWD', 'WO'].includes(status)) {
    const label = status === 'PST' ? 'Hoãn' : 'Hủy'
    return (
      <div className="flex flex-col items-center min-w-[40px]">
        <span className="text-[10px] font-semibold text-gray-400 leading-none">{label}</span>
      </div>
    )
  }

  return <div className="min-w-[40px]" />
}
