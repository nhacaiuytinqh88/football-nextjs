import Link from 'next/link'
import Image from 'next/image'

// Component hiển thị kèo dạng compact cho sidebar và chi tiết trận đấu
// Format giống bảng tỷ lệ kèo chính
interface OddsCompactRowProps {
  fixtureId: number
  homeTeam: string
  awayTeam: string
  homeLogo: string
  awayLogo: string
  handicap?: { label: string; homeOdd: string; awayOdd: string }
  overUnder?: { label: string; over: string; under: string }
  winner?: { home: string; draw: string; away: string }
}

function OddsCell({ odd, className = '' }: { odd: string; className?: string }) {
  const v = parseFloat(odd)
  let color = 'text-gray-700'
  if (!isNaN(v) && odd !== '-') {
    if (v < 1.5) color = 'text-green-600 font-semibold'
    else if (v < 2.0) color = 'text-green-500'
    else if (v > 3.5) color = 'text-red-500'
  }
  return <span className={`tabular-nums text-[11px] ${color} ${className}`}>{odd}</span>
}

// Component hiển thị kèo chấp (hệ số + odd ngang hàng, 2 hàng)
function HandicapCell({ values }: { values: { label: string; homeOdd: string; awayOdd: string } }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-1.5">
      {/* Hàng 1: Hệ số chấp + Odd đội nhà */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-gray-500 font-medium min-w-[22px]">{values.label || '-'}</span>
        <OddsCell odd={values.homeOdd || '-'} />
      </div>
      {/* Hàng 2: Odd đội khách (căn phải) */}
      <div className="flex items-center justify-end w-full pr-1">
        <OddsCell odd={values.awayOdd || '-'} />
      </div>
    </div>
  )
}

// Component hiển thị kèo tài xỉu (hệ số + odd ngang hàng, 2 hàng)
function OverUnderCell({ values }: { values: { label: string; over: string; under: string } }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-1.5">
      {/* Hàng 1: Hệ số + Odd Tài */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-gray-500 font-medium min-w-[16px]">{values.label || '-'}</span>
        <OddsCell odd={values.over || '-'} />
      </div>
      {/* Hàng 2: U + Odd Xỉu */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-gray-500 font-medium min-w-[16px]">U</span>
        <OddsCell odd={values.under || '-'} />
      </div>
    </div>
  )
}

// Component hiển thị kèo 1x2 (3 hàng: 1, X, 2)
function WinnerCell({ values }: { values: { home: string; draw: string; away: string } }) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 py-1.5">
      <OddsCell odd={values.home || '-'} />
      <OddsCell odd={values.draw || '-'} />
      <OddsCell odd={values.away || '-'} />
    </div>
  )
}

export default function OddsCompactRow({
  fixtureId,
  homeTeam,
  awayTeam,
  homeLogo,
  awayLogo,
  handicap,
  overUnder,
  winner,
}: OddsCompactRowProps) {
  return (
    <Link
      href={`/tran-dau/${fixtureId}`}
      className="flex items-center hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
    >
      {/* Tên đội */}
      <div className="flex items-center gap-2 px-3 py-2 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="relative w-3.5 h-3.5 shrink-0">
              <Image src={homeLogo} alt={homeTeam} fill className="object-contain" sizes="14px" />
            </div>
            <p className="text-xs font-semibold text-gray-800 truncate leading-tight">{homeTeam}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative w-3.5 h-3.5 shrink-0">
              <Image src={awayLogo} alt={awayTeam} fill className="object-contain" sizes="14px" />
            </div>
            <p className="text-xs text-gray-600 truncate leading-tight">{awayTeam}</p>
          </div>
        </div>
      </div>

      {/* 3 cột kèo - giống bảng tỷ lệ kèo chính */}
      <div className="flex shrink-0">
        {/* Kèo châu Á */}
        <div className="w-14 border-l border-gray-200">
          {handicap ? (
            <HandicapCell values={handicap} />
          ) : (
            <div className="py-1.5 text-center text-[11px] text-gray-300">-</div>
          )}
        </div>

        {/* Kèo tài xỉu */}
        <div className="w-12 border-l border-gray-200">
          {overUnder ? (
            <OverUnderCell values={overUnder} />
          ) : (
            <div className="py-1.5 text-center text-[11px] text-gray-300">-</div>
          )}
        </div>

        {/* Kèo 1x2 */}
        <div className="w-10 border-l border-gray-200">
          {winner ? (
            <WinnerCell values={winner} />
          ) : (
            <div className="py-1.5 text-center text-[11px] text-gray-300">-</div>
          )}
        </div>
      </div>
    </Link>
  )
}
