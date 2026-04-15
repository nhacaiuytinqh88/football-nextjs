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
