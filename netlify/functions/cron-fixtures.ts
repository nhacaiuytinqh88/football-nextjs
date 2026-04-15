import type { Config } from '@netlify/functions'

// Netlify Scheduled Function - chạy mỗi ngày lúc 00:01
export default async function handler() {
  const baseUrl = process.env.URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const secret = process.env.CRON_SECRET

  const res = await fetch(`${baseUrl}/api/cron/fixtures`, {
    headers: { Authorization: `Bearer ${secret}` },
  })

  const data = await res.json()
  console.log('[cron-fixtures]', new Date().toISOString(), data)
}

export const config: Config = {
  schedule: '1 0 * * *', // mỗi ngày lúc 00:01
}
