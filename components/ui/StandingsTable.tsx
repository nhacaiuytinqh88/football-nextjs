import Image from 'next/image'
import Link from 'next/link'
import type { Standing } from '@/lib/api-football'

interface Props {
  standings: Standing[][]
  leagueId: number
}

// Phân loại hàng theo description → màu dot + màu tên đội
type ZoneType = 'champions' | 'europa' | 'conference' | 'relegation' | 'promotion' | null

function getZone(description: string | null): ZoneType {
  if (!description) return null
  const d = description.toLowerCase()
  if (d.includes('champions league')) return 'champions'
  if (d.includes('europa league')) return 'europa'
  if (d.includes('conference')) return 'conference'
  if (d.includes('relegation') || d.includes('xuống hạng') || d.includes('relegation play-off')) return 'relegation'
  if (d.includes('promotion')) return 'promotion'
  return null
}

const ZONE_STYLES: Record<NonNullable<ZoneType>, { dot: string; name: string; rank: string }> = {
  champions:   { dot: 'bg-blue-500',   name: 'text-blue-700',   rank: 'text-blue-600' },
  europa:      { dot: 'bg-orange-400', name: 'text-orange-600', rank: 'text-orange-500' },
  conference:  { dot: 'bg-teal-400',   name: 'text-teal-600',   rank: 'text-teal-500' },
  promotion:   { dot: 'bg-green-500',  name: 'text-green-700',  rank: 'text-green-600' },
  relegation:  { dot: 'bg-red-500',    name: 'text-red-600',    rank: 'text-red-500' },
}

// Form badge nhỏ (5 trận gần nhất)
function FormDot({ result }: { result: string }) {
  const colors: Record<string, string> = {
    W: 'bg-green-500',
    D: 'bg-gray-300',
    L: 'bg-red-400',
  }
  return (
    <span className={`inline-block h-1.5 w-1.5 rounded-full ${colors[result] ?? 'bg-gray-200'}`} />
  )
}

export default function StandingsTable({ standings, leagueId }: Props) {
  if (!standings || standings.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-gray-400">
        Chưa có dữ liệu bảng xếp hạng
      </div>
    )
  }

  // Hầu hết giải có 1 nhóm, Champions League có nhiều nhóm
  const groups = standings

  return (
    <div>
      {groups.map((table, groupIdx) => (
        <div key={groupIdx}>
          {/* Tên nhóm nếu có nhiều nhóm */}
          {groups.length > 1 && table[0]?.group && (
            <div className="bg-gray-50 px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {table[0].group}
            </div>
          )}

          {/* Header */}
          <div className="grid grid-cols-[28px_1fr_28px_28px_28px_28px_36px_32px] items-center px-3 py-1.5 text-[11px] font-medium text-gray-400">
            <span className="text-center">#</span>
            <span className="pl-1">Đội bóng</span>
            <span className="text-center">Tr</span>
            <span className="text-center">T</span>
            <span className="text-center">H</span>
            <span className="text-center">B</span>
            <span className="text-center">HS</span>
            <span className="text-center font-semibold text-gray-500">Đ</span>
          </div>

          {/* Rows */}
          <div>
            {table.map((row, idx) => {
              const zone = getZone(row.description)
              const zoneStyle = zone ? ZONE_STYLES[zone] : null
              const form = row.form?.slice(-5).split('') ?? []

              // Separator line khi zone thay đổi (không phải hàng đầu)
              const prevZone = idx > 0 ? getZone(table[idx - 1].description) : undefined
              const showSeparator = idx > 0 && prevZone !== zone && (zone !== null || prevZone !== null)

              return (
                <div key={row.team.id}>
                  {showSeparator && (
                    <div className="mx-3 border-t border-dashed border-gray-200" />
                  )}
                  <Link
                    href={`/doi-bong/${row.team.id}?league=${leagueId}`}
                    className="grid grid-cols-[28px_1fr_28px_28px_28px_28px_36px_32px] items-center px-3 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    {/* Rank + zone dot */}
                    <div className="flex items-center justify-center gap-1">
                      {zoneStyle ? (
                        <span className={`h-2 w-2 rounded-full shrink-0 ${zoneStyle.dot}`} />
                      ) : (
                        <span className="h-2 w-2 rounded-full shrink-0 bg-transparent" />
                      )}
                      <span className={`text-xs font-semibold tabular-nums ${zoneStyle ? zoneStyle.rank : 'text-gray-400'}`}>
                        {row.rank}
                      </span>
                    </div>

                    {/* Logo + Tên đội */}
                    <div className="flex items-center gap-2 pl-1 min-w-0">
                      <div className="relative h-5 w-5 shrink-0">
                        <Image
                          src={row.team.logo}
                          alt={row.team.name}
                          fill
                          className="object-contain"
                          sizes="20px"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className={`block truncate text-xs font-medium leading-tight ${zoneStyle ? zoneStyle.name : 'text-gray-800'}`}>
                          {row.team.name}
                        </span>
                        {/* Form dots - chỉ hiện trên desktop */}
                        {form.length > 0 && (
                          <div className="hidden sm:flex items-center gap-0.5 mt-0.5">
                            {form.map((r, i) => <FormDot key={i} result={r} />)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <span className="text-center text-xs text-gray-500 tabular-nums">{row.all.played}</span>
                    <span className="text-center text-xs text-gray-500 tabular-nums">{row.all.win}</span>
                    <span className="text-center text-xs text-gray-500 tabular-nums">{row.all.draw}</span>
                    <span className="text-center text-xs text-gray-500 tabular-nums">{row.all.lose}</span>
                    <span className="text-center text-xs text-gray-400 tabular-nums">
                      {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
                    </span>
                    <span className="text-center text-xs font-bold text-gray-900 tabular-nums">{row.points}</span>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Chú thích zone */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-gray-50 px-4 py-3">
        {[
          { zone: 'champions' as const, label: 'Champions League' },
          { zone: 'europa' as const, label: 'Europa League' },
          { zone: 'conference' as const, label: 'Conference League' },
          { zone: 'promotion' as const, label: 'Lên hạng' },
          { zone: 'relegation' as const, label: 'Xuống hạng' },
        ].map(({ zone, label }) => (
          <div key={zone} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${ZONE_STYLES[zone].dot}`} />
            <span className="text-[10px] text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
