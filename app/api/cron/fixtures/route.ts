import { NextRequest } from 'next/server'
import { refreshFixturesByDate } from '@/lib/services/fixtures'
import { getVNDateString } from '@/lib/date'

// Cronjob chạy mỗi ngày lúc 00:01 để cập nhật lịch thi đấu hôm nay và ngày mai
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = getVNDateString(0)
    const tomorrow = getVNDateString(1)

    const [todayFixtures, tomorrowFixtures] = await Promise.all([
      refreshFixturesByDate(today),
      refreshFixturesByDate(tomorrow),
    ])

    return Response.json({
      success: true,
      today: { date: today, count: todayFixtures.length },
      tomorrow: { date: tomorrow, count: tomorrowFixtures.length },
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[CRON/fixtures] Error:', error)
    return Response.json({ error: 'Failed to refresh fixtures' }, { status: 500 })
  }
}
