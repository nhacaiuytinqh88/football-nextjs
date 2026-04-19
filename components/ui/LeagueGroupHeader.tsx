import Image from 'next/image'

interface Props {
  leagueName: string
  leagueLogo: string
  country: string
  round?: string
}

// Server Component - header phân nhóm trận theo giải đấu
export default function LeagueGroupHeader({ leagueName, leagueLogo, country, round }: Props) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 border-b border-gray-100">
      <div className="relative h-5 w-5 shrink-0">
        <Image
          src={leagueLogo}
          alt={leagueName}
          fill
          className="object-contain"
          sizes="20px"
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 truncate">{country} · {leagueName}</span>
      {round && (
        <span className="ml-auto text-xs text-gray-400 shrink-0">{round}</span>
      )}
    </div>
  )
}
