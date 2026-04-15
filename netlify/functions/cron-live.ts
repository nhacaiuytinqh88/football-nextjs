import type { Config } from '@netlify/functions'

// Netlify Scheduled Function - chạy mỗi 1 phút
export default async function handler() {
  const baseUrl = process.env.URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const secret = process.env.CRON_SECRET

  const res = await fetch(`${baseUrl}/api/cron/live`, {
    headers: { Authorization: `Bearer ${secret}` },
  })

  const data = await res.json()
  console.log('[cron-live]', new Date().toISOString(), data)
}

export const config: Config = {
  schedule: '* * * * *', // mỗi 1 phút
}
