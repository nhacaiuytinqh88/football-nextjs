import Image from 'next/image'
import Link from 'next/link'
import type { Standing } from '@/lib/api-football'

interface Props {
  standings: Standing[][]
  leagueId: number
}

// Form dot nhỏ (5 trận gần nhất)
function FormDot({ result }: { result: string }) {
  const colors: Record<string, string> = {
    W: 'bg-green-500',
    D: 'bg-gray-300',
    L: 'bg-red-400',
  }
  return (
    <span className={`inline-block h-1.5 w-1.5 rounded-full shrink-0 ${colors[result] ?? 'bg-gray-200'}`} />
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

  const groups = standings

  return (
    <div>
      {groups.map((table, groupIdx) => (
        <div key={groupIdx}>
          {/* Tên nhóm nếu có nhiều nhóm (Champions League group stage) */}
          {groups.length > 1 && table[0]?.group && (
            <div className="bg-gray-50 px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {table[0].group}
            </div>
          )}

          {/* Header — thêm cột Form chỉ hiện trên sm+ */}
          <div className="grid grid-cols-[28px_1fr_28px_28px_28px_28px_36px_32px] sm:grid-cols-[28px_1fr_60px_28px_28px_28px_28px_36px_32px] items-center px-3 py-1.5 text-[11px] font-medium text-gray-400">
            <span className="text-center">#</span>
            <span className="pl-1">Đội bóng</span>
            <span className="hidden sm:block text-center">Phong độ</span>
            <span className="text-center">Tr</span>
            <span className="text-center">T</span>
            <span className="text-center">H</span>
            <span className="text-center">B</span>
            <span className="text-center">HS</span>
            <span className="text-center font-semibold text-gray-500">Đ</span>
          </div>

          {/* Rows */}
          <div>
            {table.map((row) => {
              const form = row.form?.slice(-5).split('') ?? []

              return (
                <Link
                  key={row.team.id}
                  href={`/doi-bong/${row.team.id}?league=${leagueId}`}
                  className="grid grid-cols-[28px_1fr_28px_28px_28px_28px_36px_32px] sm:grid-cols-[28px_1fr_60px_28px_28px_28px_28px_36px_32px] items-center px-3 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  {/* Rank */}
                  <span className="text-center text-xs font-semibold text-gray-400 tabular-nums">
                    {row.rank}
                  </span>

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
                    <span className="truncate text-xs font-medium text-gray-800">
                      {row.team.name}
                    </span>
                  </div>

                  {/* Form dots — cột riêng, chỉ hiện trên sm+ */}
                  <div className="hidden sm:flex items-center justify-center gap-0.5">
                    {form.map((r, i) => <FormDot key={i} result={r} />)}
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
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
