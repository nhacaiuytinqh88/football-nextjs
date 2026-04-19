import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'

const HOT_LEAGUES = [
  { id: 39,  name: 'Premier League',   country: 'England',  logo: 'https://media.api-sports.io/football/leagues/39.png' },
  { id: 140, name: 'La Liga',          country: 'Spain',    logo: 'https://media.api-sports.io/football/leagues/140.png' },
  { id: 135, name: 'Serie A',          country: 'Italy',    logo: 'https://media.api-sports.io/football/leagues/135.png' },
  { id: 78,  name: 'Bundesliga',       country: 'Germany',  logo: 'https://media.api-sports.io/football/leagues/78.png' },
  { id: 61,  name: 'Ligue 1',          country: 'France',   logo: 'https://media.api-sports.io/football/leagues/61.png' },
  { id: 2,   name: 'Champions League', country: 'UEFA',     logo: 'https://media.api-sports.io/football/leagues/2.png' },
  { id: 3,   name: 'Europa League',    country: 'UEFA',     logo: 'https://media.api-sports.io/football/leagues/3.png' },
  { id: 1,   name: 'World Cup 2026',   country: 'FIFA',     logo: 'https://media.api-sports.io/football/leagues/1.png' },
  { id: 4,   name: 'Euro 2024',        country: 'UEFA',     logo: 'https://media.api-sports.io/football/leagues/4.png' },
  { id: 340, name: 'V.League 1',       country: 'Vietnam',  logo: 'https://media.api-sports.io/football/leagues/340.png' },
]

export default function LeftSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-[20%] min-w-[180px] max-w-[240px] shrink-0">
      <div className="sticky top-[72px] space-y-4">
        {/* Giải đấu hot */}
        <div className="rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 bg-red-600 px-4 py-3">
            <Star size={14} className="text-yellow-400" />
            <h2 className="text-sm font-semibold text-white">Giải đấu hot</h2>
          </div>
          <ul>
            {HOT_LEAGUES.map((league) => (
              <li key={league.id}>
                <Link
                  href={league.id === 1 ? '/world-cup-2026' : `/giai-dau/${league.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors"
                >
                  <div className="relative h-5 w-5 shrink-0">
                    <Image src={league.logo} alt={league.name} fill className="object-contain" sizes="20px" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-700">{league.name}</p>
                    <p className="text-xs text-gray-400">{league.country}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}
