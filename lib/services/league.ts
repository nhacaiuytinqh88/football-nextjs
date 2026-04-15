import 'server-only'
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis'
import {
  fetchLeagueById,
  fetchLeagueFixtures,
  fetchLeagueRounds,
  type League,
  type Fixture,
} from '@/lib/api-football'
import { CURRENT_SEASON } from './standings'

export async function getLeagueById(leagueId: number): Promise<League | null> {
  const cacheKey = CACHE_KEYS.LEAGUE(leagueId)
  const cached = await redis.get<League>(cacheKey)
  if (cached) return cached

  const league = await fetchLeagueById(leagueId)
  if (league) await redis.set(cacheKey, league, { ex: CACHE_TTL.LEAGUE })
  return league
}

export async function getLeagueRounds(
  leagueId: number,
  season = CURRENT_SEASON
): Promise<string[]> {
  const cacheKey = CACHE_KEYS.LEAGUE_ROUNDS(leagueId, season)
  const cached = await redis.get<string[]>(cacheKey)
  if (cached) return cached

  const rounds = await fetchLeagueRounds(leagueId, season)
  await redis.set(cacheKey, rounds, { ex: CACHE_TTL.LEAGUE_ROUNDS })
  return rounds
}

export async function getLeagueFixturesByRound(
  leagueId: number,
  season = CURRENT_SEASON,
  round: string
): Promise<Fixture[]> {
  const cacheKey = CACHE_KEYS.LEAGUE_FIXTURES(leagueId, season, round)
  const cached = await redis.get<Fixture[]>(cacheKey)
  if (cached) return cached

  const fixtures = await fetchLeagueFixtures(leagueId, season, round)
  await redis.set(cacheKey, fixtures, { ex: CACHE_TTL.LEAGUE_FIXTURES })
  return fixtures
}

/**
 * Tìm vòng đấu hiện tại thông minh:
 * - Ưu tiên vòng có trận đang LIVE
 * - Nếu không có LIVE, lấy vòng gần nhất có trận đã kết thúc hoặc sắp diễn ra trong 3 ngày tới
 * - Fallback: vòng cuối cùng trong danh sách
 */
export async function getCurrentRound(
  leagueId: number,
  season: number,
  rounds: string[]
): Promise<string> {
  if (rounds.length === 0) return ''

  const now = Date.now()
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000

  // Duyệt từ vòng cuối về đầu để tìm vòng gần nhất có trận
  // Chỉ check 5 vòng gần nhất để tránh gọi API quá nhiều
  const recentRounds = rounds.slice(-5)

  for (let i = recentRounds.length - 1; i >= 0; i--) {
    const round = recentRounds[i]
    try {
      const fixtures = await getLeagueFixturesByRound(leagueId, season, round)
      if (fixtures.length === 0) continue

      // Có trận LIVE → đây là vòng hiện tại
      const hasLive = fixtures.some(f =>
        ['1H', '2H', 'HT', 'ET', 'BT', 'P'].includes(f.fixture.status.short)
      )
      if (hasLive) return round

      // Có trận chưa đá trong 3 ngày tới → vòng sắp diễn ra
      const hasUpcoming = fixtures.some(f => {
        if (f.fixture.status.short !== 'NS') return false
        const diff = new Date(f.fixture.date).getTime() - now
        return diff >= 0 && diff <= threeDaysMs
      })
      if (hasUpcoming) return round

      // Có trận đã kết thúc → đây là vòng gần nhất đã chơi
      const hasFinished = fixtures.some(f =>
        ['FT', 'AET', 'PEN'].includes(f.fixture.status.short)
      )
      if (hasFinished) return round
    } catch {
      continue
    }
  }

  // Fallback: vòng cuối cùng
  return rounds[rounds.length - 1]
}
