import 'server-only'
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis'
import {
  fetchOddsByLeague,
  fetchOddsByFixture,
  type FixtureOdds,
  type OddsValue,
} from '@/lib/api-football'
import { TRACKED_LEAGUES, CURRENT_SEASON } from './standings'

/**
 * Lấy tỷ lệ kèo theo giải đấu (page 1 = ~10 trận sắp tới)
 */
export async function getOddsByLeague(
  leagueId: number,
  season?: number,
  page = 1
): Promise<{ odds: FixtureOdds[]; totalPages: number }> {
  const resolvedSeason = season ?? TRACKED_LEAGUES.find(l => l.id === leagueId)?.season ?? CURRENT_SEASON
  const cacheKey = CACHE_KEYS.ODDS_LEAGUE(leagueId, resolvedSeason, page)

  const cached = await redis.get<{ odds: FixtureOdds[]; totalPages: number }>(cacheKey)
  if (cached) return cached

  const result = await fetchOddsByLeague(leagueId, resolvedSeason, page)
  await redis.set(cacheKey, result, { ex: CACHE_TTL.ODDS })
  return result
}

/**
 * Lấy tỷ lệ kèo theo fixture ID
 */
export async function getOddsByFixture(fixtureId: number): Promise<FixtureOdds | null> {
  const cacheKey = CACHE_KEYS.ODDS_FIXTURE(fixtureId)

  const cached = await redis.get<FixtureOdds>(cacheKey)
  if (cached) return cached

  const odds = await fetchOddsByFixture(fixtureId)
  if (odds) await redis.set(cacheKey, odds, { ex: CACHE_TTL.ODDS })
  return odds
}

// --- Helper functions để parse odds ---

/** Lấy kèo 1x2 (Match Winner) */
export function getMatchWinner(odds: FixtureOdds): { home: string; draw: string; away: string } | null {
  const bet = odds.bookmakers[0]?.bets.find(b => b.name === 'Match Winner')
  if (!bet) return null
  const get = (v: string) => bet.values.find(x => x.value === v)?.odd ?? '-'
  return { home: get('Home'), draw: get('Draw'), away: get('Away') }
}

/** Lấy kèo tài xỉu (Goals Over/Under 2.5) */
export function getOverUnder(odds: FixtureOdds, line = '2.5'): { over: string; under: string } | null {
  const bet = odds.bookmakers[0]?.bets.find(b => b.name === 'Goals Over/Under')
  if (!bet) return null
  const over = bet.values.find(x => x.value === `Over ${line}`)?.odd ?? '-'
  const under = bet.values.find(x => x.value === `Under ${line}`)?.odd ?? '-'
  return { over, under }
}

/** Lấy kèo châu Á (Asian Handicap) — lấy 2 dòng kèo đầu tiên */
export function getAsianHandicap(odds: FixtureOdds): Array<{ home: string; homeOdd: string; away: string; awayOdd: string }> {
  const bet = odds.bookmakers[0]?.bets.find(b => b.name === 'Asian Handicap')
  if (!bet) return []

  // Group theo cặp home/away cùng handicap
  const pairs: Array<{ home: string; homeOdd: string; away: string; awayOdd: string }> = []
  const values = bet.values

  // Tìm các cặp handicap
  const homeValues = values.filter(v => v.value.startsWith('Home'))
  for (const hv of homeValues.slice(0, 2)) {
    const handicap = hv.value.replace('Home ', '')
    const awayMatch = values.find(v => v.value === `Away ${handicap}`)
    if (awayMatch) {
      pairs.push({
        home: hv.value,
        homeOdd: hv.odd,
        away: awayMatch.value,
        awayOdd: awayMatch.odd,
      })
    }
  }
  return pairs
}
