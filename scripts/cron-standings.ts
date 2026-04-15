/**
 * Script chạy cronjob refresh bảng xếp hạng
 * Schedule: 0 * * * * (mỗi giờ)
 */
export {}

const BASE_URL = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

const CRON_SECRET = process.env.CRON_SECRET

async function main() {
  const res = await fetch(`${BASE_URL}/api/cron/standings`, {
    headers: { Authorization: `Bearer ${CRON_SECRET}` },
  })
  const data = await res.json()
  console.log('[cron-standings]', new Date().toISOString(), data)
}

main().catch(console.error)
