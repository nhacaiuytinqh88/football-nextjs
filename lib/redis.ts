import { Redis } from '@upstash/redis'

// Upstash Redis client - dùng REST API, không cần persistent connection
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Cache keys constants
export const CACHE_KEYS = {
  LIVE_MATCHES: 'live_matches',
  STANDINGS: (leagueId: number, season: number) =>
    `standings_${leagueId}_${season}`,
  FIXTURES: (date: string) => `fixtures_${date}`,
  FIXTURE_DETAIL: (fixtureId: number) => `fixture_${fixtureId}`,
  TEAM: (teamId: number) => `team_${teamId}`,
  TEAM_STATS: (teamId: number, leagueId: number, season: number) =>
    `team_stats_v2_${teamId}_${leagueId}_${season}`,
  TEAM_FIXTURES: (teamId: number, season: number) =>
    `team_fixtures_${teamId}_${season}`,
  TEAM_LEAGUES: (teamId: number, season: number) =>
    `team_leagues_${teamId}_${season}`,
  FIXTURE_DETAIL_FULL: (fixtureId: number) => `fixture_full_${fixtureId}`,
  ODDS_LEAGUE: (leagueId: number, season: number, page: number) =>
    `odds_league_${leagueId}_${season}_p${page}`,
  ODDS_FIXTURE: (fixtureId: number) => `odds_fixture_${fixtureId}`,
  LEAGUE: (leagueId: number) => `league_${leagueId}`,
  LEAGUE_FIXTURES: (leagueId: number, season: number, round: string) =>
    `league_fixtures_${leagueId}_${season}_${round}`,
  LEAGUE_ROUNDS: (leagueId: number, season: number) =>
    `league_rounds_${leagueId}_${season}`,
} as const

// TTL constants (giây)
export const CACHE_TTL = {
  LIVE: 60,            // 1 phút - livescore
  STANDINGS: 3600,     // 1 giờ - bảng xếp hạng
  FIXTURES_TODAY: 300, // 5 phút - lịch hôm nay
  FIXTURES: 86400,     // 1 ngày - lịch ngày khác
  FIXTURE_DETAIL: 300, // 5 phút - chi tiết trận
  TEAM: 86400 * 7,     // 7 ngày - thông tin đội (ít thay đổi)
  TEAM_STATS: 3600,    // 1 giờ - thống kê đội
  TEAM_FIXTURES: 3600, // 1 giờ - lịch đội
  TEAM_LEAGUES: 86400, // 1 ngày - giải đấu của đội
  FIXTURE_DETAIL_FULL: 300, // 5 phút - chi tiết đầy đủ trận (events/lineups/stats)
  ODDS: 1800,              // 30 phút - tỷ lệ kèo (cập nhật thường xuyên trước trận)
  LEAGUE: 86400 * 7,   // 7 ngày - thông tin giải (ít thay đổi)
  LEAGUE_FIXTURES: 300,// 5 phút - lịch giải theo vòng
  LEAGUE_ROUNDS: 86400,// 1 ngày - danh sách vòng đấu
} as const
