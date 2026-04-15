import 'server-only'
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis'
import { fetchFixturesByDate, fetchFixtureById, type Fixture } from '@/lib/api-football'
import { getVNDateString } from '@/lib/date'

/**
 * Lấy lịch thi đấu theo ngày.
 * Flow: Redis cache (1 ngày) -> API-Football -> lưu Redis -> trả về
 */
export async function getFixturesByDate(date: string): Promise<Fixture[]> {
  const cacheKey = CACHE_KEYS.FIXTURES(date)

  const cached = await redis.get<Fixture[]>(cacheKey)
  if (cached) return cached

  const fixtures = await fetchFixturesByDate(date)
  await redis.set(cacheKey, fixtures, { ex: CACHE_TTL.FIXTURES })

  return fixtures
}

/**
 * Lấy lịch thi đấu hôm nay (timezone Asia/Ho_Chi_Minh)
 */
export async function getTodayFixtures(): Promise<Fixture[]> {
  const today = getVNDateString(0)
  return getFixturesByDate(today)
}

/**
 * Lấy chi tiết 1 trận đấu.
 * Cache 5 phút - trận đang diễn ra sẽ được refresh thường xuyên hơn qua cronjob live
 */
export async function getFixtureDetail(fixtureId: number): Promise<Fixture | null> {
  const cacheKey = CACHE_KEYS.FIXTURE_DETAIL(fixtureId)

  const cached = await redis.get<Fixture>(cacheKey)
  if (cached) return cached

  const fixture = await fetchFixtureById(fixtureId)
  if (fixture) {
    await redis.set(cacheKey, fixture, { ex: CACHE_TTL.FIXTURE_DETAIL })
  }

  return fixture
}

/**
 * Force refresh lịch thi đấu theo ngày (dùng cho cronjob)
 */
export async function refreshFixturesByDate(date: string): Promise<Fixture[]> {
  const fixtures = await fetchFixturesByDate(date)
  await redis.set(CACHE_KEYS.FIXTURES(date), fixtures, { ex: CACHE_TTL.FIXTURES })
  return fixtures
}
