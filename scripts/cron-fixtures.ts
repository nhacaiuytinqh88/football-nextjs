/**
 * Script chạy cronjob refresh lịch thi đấu
 * Schedule: 1 0 * * * (mỗi ngày lúc 00:01)
 */
export {}

const BASE_URL = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

const CRON_SECRET = process.env.CRON_SECRET

async function main() {
  const res = await fetch(`${BASE_URL}/api/cron/fixtures`, {
    headers: { Authorization: `Bearer ${CRON_SECRET}` },
  })
  const data = await res.json()
  console.log('[cron-fixtures]', new Date().toISOString(), data)
}

main().catch(console.error)
