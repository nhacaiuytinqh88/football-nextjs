import 'server-only'

const API_BASE = 'https://v3.football.api-sports.io'
const API_KEY = process.env.API_FOOTBALL_KEY!

// Types cơ bản từ API-Football
export interface ApiFootballResponse<T> {
  get: string
  parameters: Record<string, string>
  errors: string[] | Record<string, string>
  results: number
  paging: { current: number; total: number }
  response: T[]
}

export interface Fixture {
  fixture: {
    id: number
    referee: string | null
    timezone: string
    date: string
    timestamp: number
    status: {
      long: string
      short: string // 'NS' | '1H' | 'HT' | '2H' | 'FT' | 'AET' | 'PEN' | 'PST' | 'CANC'
      elapsed: number | null
    }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag: string | null
    season: number
    round: string
  }
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null }
    away: { id: number; name: string; logo: string; winner: boolean | null }
  }
  goals: { home: number | null; away: number | null }
  score: {
    halftime: { home: number | null; away: number | null }
    fulltime: { home: number | null; away: number | null }
    extratime: { home: number | null; away: number | null }
    penalty: { home: number | null; away: number | null }
  }
}

export interface Standing {
  rank: number
  team: { id: number; name: string; logo: string }
  points: number
  goalsDiff: number
  group: string
  form: string
  status: string
  description: string | null
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } }
  home: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } }
  away: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } }
  update: string
}

// Hàm fetch cơ bản - luôn gọi server-side
async function apiFetch<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<ApiFootballResponse<T>> {
  const url = new URL(`${API_BASE}/${endpoint}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))

  const res = await fetch(url.toString(), {
    headers: {
      'x-apisports-key': API_KEY,
    },
    // Không cache ở fetch level - Redis sẽ handle caching
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`API-Football error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

// --- Public API functions ---

/** Lấy các trận đang diễn ra (live) */
export async function fetchLiveFixtures(): Promise<Fixture[]> {
  const data = await apiFetch<Fixture>('fixtures', { live: 'all' })
  return data.response
}

/** Lấy lịch thi đấu theo ngày (YYYY-MM-DD) */
export async function fetchFixturesByDate(date: string): Promise<Fixture[]> {
  const data = await apiFetch<Fixture>('fixtures', { date, timezone: 'Asia/Ho_Chi_Minh' })
  return data.response
}

/** Lấy bảng xếp hạng theo giải đấu và mùa */
export async function fetchStandings(leagueId: number, season: number): Promise<Standing[][]> {
  const data = await apiFetch<{ league: { standings: Standing[][] } }>('standings', {
    league: leagueId,
    season,
  })
  return data.response[0]?.league?.standings ?? []
}

/** Lấy chi tiết 1 trận đấu */
export async function fetchFixtureById(fixtureId: number): Promise<Fixture | null> {
  const data = await apiFetch<Fixture>('fixtures', { id: fixtureId })
  return data.response[0] ?? null
}

// --- Team types ---
export interface Team {
  team: {
    id: number
    name: string
    code: string | null
    country: string
    founded: number | null
    national: boolean
    logo: string
  }
  venue: {
    id: number | null
    name: string | null
    address: string | null
    city: string | null
    capacity: number | null
    surface: string | null
    image: string | null
  }
}

export interface TeamStatistics {
  league: { id: number; name: string; country: string; logo: string; season: number }
  team: { id: number; name: string; logo: string }
  form: string
  fixtures: {
    played: { home: number; away: number; total: number }
    wins: { home: number; away: number; total: number }
    draws: { home: number; away: number; total: number }
    loses: { home: number; away: number; total: number }
  }
  goals: {
    for: { total: { home: number; away: number; total: number }; average: { home: string; away: string; total: string } }
    against: { total: { home: number; away: number; total: number }; average: { home: string; away: string; total: string } }
  }
  biggest: {
    wins: { home: string | null; away: string | null }
    loses: { home: string | null; away: string | null }
    goals: { for: { home: number; away: number }; against: { home: number; away: number } }
  }
  clean_sheet: { home: number; away: number; total: number }
  failed_to_score: { home: number; away: number; total: number }
}

// --- League types ---
export interface League {
  league: {
    id: number
    name: string
    type: string
    logo: string
  }
  country: {
    name: string
    code: string | null
    flag: string | null
  }
  seasons: Array<{
    year: number
    start: string
    end: string
    current: boolean
    coverage: { standings: boolean; fixtures: { events: boolean; lineups: boolean } }
  }>
}

// --- Fetch functions ---

/** Lấy thông tin đội bóng */
export async function fetchTeamById(teamId: number): Promise<Team | null> {
  const data = await apiFetch<Team>('teams', { id: teamId })
  return data.response[0] ?? null
}

/** Lấy thống kê đội bóng theo giải đấu và mùa */
export async function fetchTeamStatistics(
  teamId: number,
  leagueId: number,
  season: number
): Promise<TeamStatistics | null> {
  const data = await apiFetch<TeamStatistics>('teams/statistics', {
    team: teamId,
    league: leagueId,
    season,
  })
  return data.response[0] ?? null
}

/** Lấy lịch thi đấu của đội bóng (10 trận gần nhất + 5 trận tới) */
export async function fetchTeamFixtures(
  teamId: number,
  season: number,
  last = 5,
  next = 5
): Promise<{ last: Fixture[]; next: Fixture[] }> {
  const [lastData, nextData] = await Promise.all([
    apiFetch<Fixture>('fixtures', { team: teamId, season, last, timezone: 'Asia/Ho_Chi_Minh' }),
    apiFetch<Fixture>('fixtures', { team: teamId, season, next, timezone: 'Asia/Ho_Chi_Minh' }),
  ])
  return { last: lastData.response, next: nextData.response }
}

/** Lấy thông tin giải đấu */
export async function fetchLeagueById(leagueId: number): Promise<League | null> {
  const data = await apiFetch<League>('leagues', { id: leagueId })
  return data.response[0] ?? null
}

/** Lấy lịch thi đấu của giải đấu theo vòng */
export async function fetchLeagueFixtures(
  leagueId: number,
  season: number,
  round?: string
): Promise<Fixture[]> {
  const params: Record<string, string | number> = {
    league: leagueId,
    season,
    timezone: 'Asia/Ho_Chi_Minh',
  }
  if (round) params.round = round
  const data = await apiFetch<Fixture>('fixtures', params)
  return data.response
}

/** Lấy danh sách các vòng đấu của giải */
export async function fetchLeagueRounds(leagueId: number, season: number): Promise<string[]> {
  const data = await apiFetch<string>('fixtures/rounds', { league: leagueId, season })
  return data.response
}
