'use client'

import { useRouter, usePathname } from 'next/navigation'
import type { Bookmaker } from '@/lib/api-football'

export function BookmakerSelect({ 
  bookmakers, 
  selectedId,
  currentLeague 
}: { 
  bookmakers: Bookmaker[]
  selectedId: number
  currentLeague: number
}) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <select
      value={selectedId}
      onChange={(e) => {
        const params = new URLSearchParams()
        params.set('bookmaker', e.target.value)
        params.set('league', currentLeague.toString())
        router.push(`${pathname}?${params.toString()}`)
      }}
      className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-900"
    >
      {bookmakers.map((bm) => (
        <option key={bm.id} value={bm.id}>
          {bm.name}
        </option>
      ))}
    </select>
  )
}
