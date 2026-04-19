'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { formatMatchTime, formatMatchDate } from '@/lib/date'

// Màu odds - font size chuẩn
function OddsCell({ odd, className = '' }: { odd: string; className?: string }) {
  const v = parseFloat(odd)
  let color = 'text-gray-700'
  if (!isNaN(v) && odd !== '-') {
    if (v < 1.5) color = 'text-green-600 font-semibold'
    else if (v < 2.0) color = 'text-green-500'
    else if (v > 3.5) color = 'text-red-500'
  }
  return <span className={`tabular-nums text-[11px] ${color} ${className}`}>{odd}</span>
}

// Component hiển thị kèo chấp (hệ số + odd ngang hàng, 2 hàng)
function HandicapCell({ values }: { values: Array<{ label: string; odd: string }> }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-1.5">
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-gray-500 font-medium min-w-[22px]">{values[0]?.label || '-'}</span>
        <OddsCell odd={values[0]?.odd || '-'} />
      </div>
      <div className="flex items-center justify-end w-full pr-1">
        <OddsCell odd={values[1]?.odd || '-'} />
      </div>
    </div>
  )
}

// Component hiển thị kèo tài xỉu (hệ số + odd ngang hàng, 2 hàng)
function OverUnderCell({ values }: { values: Array<{ label: string; odd: string }> }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-1.5">
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-gray-500 font-medium min-w-[16px]">{values[0]?.label || '-'}</span>
        <OddsCell odd={values[0]?.odd || '-'} />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-gray-500 font-medium min-w-[16px]">{values[1]?.label || '-'}</span>
        <OddsCell odd={values[1]?.odd || '-'} />
      </div>
    </div>
  )
}

// Component hiển thị kèo 1x2 (3 hàng: 1, X, 2)
function CompactOddsCell({ values }: { values: string[] }) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 py-1.5">
      <OddsCell odd={values[0] || '-'} />
      <OddsCell odd={values[1] || '-'} />
      <OddsCell odd={values[2] || '-'} />
    </div>
  )
}

// Props type
interface OddsData {
  fixtureId: number
  fixtureDate: string
  homeTeam: string
  awayTeam: string
  homeLogo: string
  awayLogo: string
  handicapValues: Array<{ label: string; odd: string }>
  ouValues: Array<{ label: string; odd: string }>
  winnerValues: string[]
  correctScore: Array<{ score: string; odd: string }>
  h1HandicapValues: Array<{ label: string; odd: string }>
  h1OuValues: Array<{ label: string; odd: string }>
  h1WinnerValues: string[]
}

// 1 trận = 1 hàng + toggle cho hiệp 1
export function OddsMatchRow({ data }: { data: OddsData }) {
  const [showH1, setShowH1] = React.useState(false)

  return (
    <div className="border-b border-gray-200">
      <div className="flex items-center min-h-[64px]">
        <Link 
          href={`/tran-dau/${data.fixtureId}`} 
          className="flex items-center hover:bg-blue-50/40 transition-colors flex-1"
        >
          {/* Giờ + Trận đấu với logo */}
          <div className="flex items-center gap-2 px-3 py-2 flex-1 min-w-0">
            <div className="text-center shrink-0 w-11">
              <p className="text-[11px] font-bold text-gray-700 leading-tight">{formatMatchTime(data.fixtureDate)}</p>
              <p className="text-[9px] text-gray-400 leading-tight">{formatMatchDate(data.fixtureDate)}</p>
            </div>
            <div className="flex-1 min-w-0">
              {/* Đội nhà */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="relative w-4 h-4 shrink-0">
                  <Image src={data.homeLogo} alt={data.homeTeam} fill className="object-contain" sizes="16px" />
                </div>
                <p className="text-xs font-semibold text-gray-800 truncate leading-tight">{data.homeTeam}</p>
              </div>
              {/* Đội khách */}
              <div className="flex items-center gap-1.5">
                <div className="relative w-4 h-4 shrink-0">
                  <Image src={data.awayLogo} alt={data.awayTeam} fill className="object-contain" sizes="16px" />
                </div>
                <p className="text-xs text-gray-600 truncate leading-tight">{data.awayTeam}</p>
              </div>
            </div>
          </div>

          {/* Cả trận - 3 cột */}
          <div className="flex shrink-0">
            <div className="w-16 border-l border-gray-200">
              <HandicapCell values={data.handicapValues} />
            </div>
            <div className="w-14 border-l border-gray-200">
              <OverUnderCell values={data.ouValues} />
            </div>
            <div className="w-12 border-l border-gray-200">
              <CompactOddsCell values={data.winnerValues} />
            </div>
          </div>
        </Link>

        {/* Toggle button */}
        <button
          onClick={() => setShowH1(!showH1)}
          className="w-8 border-l border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0"
        >
          <ChevronDown 
            size={14} 
            className={`text-gray-400 transition-transform ${showH1 ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Hiệp 1 - Expandable */}
      {showH1 && (
        <div className="bg-blue-50/30 border-t border-gray-200">
          {/* Kèo Hiệp 1 */}
          <div className="flex items-center">
            <div className="flex items-center gap-2 px-3 py-2 flex-1 min-w-0">
              <div className="w-11"></div>
              <div className="flex-1 text-xs font-semibold text-blue-700">Kèo Hiệp 1</div>
            </div>
            <div className="flex shrink-0">
              <div className="w-16 border-l border-gray-200">
                <HandicapCell values={data.h1HandicapValues} />
              </div>
              <div className="w-14 border-l border-gray-200">
                <OverUnderCell values={data.h1OuValues} />
              </div>
              <div className="w-12 border-l border-gray-200">
                <CompactOddsCell values={data.h1WinnerValues} />
              </div>
            </div>
            <div className="w-8"></div>
          </div>

          {/* Kèo Tỷ Số */}
          <div className="flex items-center border-t border-gray-200">
            <div className="flex items-center gap-2 px-3 py-2 flex-1 min-w-0">
              <div className="w-11"></div>
              <div className="flex-1 text-xs font-semibold text-purple-700">Tỷ số</div>
            </div>
            <div className="flex shrink-0 gap-2 px-2 py-2">
              {data.correctScore.length > 0 ? (
                data.correctScore.map((cs, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] text-gray-600 font-medium">{cs.score}</span>
                    <OddsCell odd={cs.odd} className="text-xs" />
                  </div>
                ))
              ) : (
                <span className="text-[10px] text-gray-400">Không có dữ liệu</span>
              )}
            </div>
            <div className="w-8"></div>
          </div>
        </div>
      )}
    </div>
  )
}
