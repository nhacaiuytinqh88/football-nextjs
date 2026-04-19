import MatchRow from './MatchRow'
import LeagueGroupHeader from './LeagueGroupHeader'
import type { Fixture } from '@/lib/api-football'

interface Props {
  fixtures: Fixture[]
  emptyMessage?: string
  showDate?: boolean // Truyền xuống MatchRow để hiện ngày (dùng trong trang giải đấu/đội bóng)
}

export default function FixtureList({ fixtures, emptyMessage = 'Không có trận đấu nào', showDate = false }: Props) {
  if (fixtures.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-gray-400">
        {emptyMessage}
      </div>
    )
  }

  const grouped = fixtures.reduce<Record<number, Fixture[]>>((acc, fixture) => {
    const id = fixture.league.id
    if (!acc[id]) acc[id] = []
    acc[id].push(fixture)
    return acc
  }, {})

  return (
    <div>
      {Object.values(grouped).map((group) => {
        const { league } = group[0]
        return (
          <div key={league.id}>
            <LeagueGroupHeader
              leagueName={league.name}
              leagueLogo={league.logo}
              country={league.country}
              round={league.round}
            />
            {group.map((fixture) => (
              <MatchRow key={fixture.fixture.id} fixture={fixture} showDate={showDate} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
