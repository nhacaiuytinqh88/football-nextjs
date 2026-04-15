/**
 * Tất cả xử lý ngày/giờ đều quy về múi giờ Việt Nam (UTC+7)
 * Đây là file duy nhất được phép xử lý timezone trong toàn dự án.
 */

export const VN_TIMEZONE = 'Asia/Ho_Chi_Minh'
export const VN_LOCALE = 'vi-VN'

/**
 * Lấy ngày hiện tại theo giờ VN, format YYYY-MM-DD
 * Dùng cho: getTodayFixtures, date picker
 */
export function getVNDateString(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toLocaleDateString('en-CA', { timeZone: VN_TIMEZONE })
}

/**
 * Format giờ thi đấu từ ISO string → "21:00" (giờ VN)
 * Dùng cho: MatchStatusBadge, MatchRow
 */
export function formatMatchTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString(VN_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: VN_TIMEZONE,
  })
}

/**
 * Format ngày + giờ đầy đủ → "21:00 - 15/06/2025" (giờ VN)
 * Dùng cho: chi tiết trận đấu
 */
export function formatMatchDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString(VN_LOCALE, {
    timeZone: VN_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format ngày ngắn cho date picker → "T2, 15/06"
 * Dùng cho: thanh chọn ngày trang lịch thi đấu
 */
export function formatShortDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00+07:00').toLocaleDateString(VN_LOCALE, {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    timeZone: VN_TIMEZONE,
  })
}

/**
 * Format ngày cho bài viết → "15/06/2025"
 * Dùng cho: trang nhận định, admin
 */
export function formatArticleDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(VN_LOCALE, {
    timeZone: VN_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Format ngày + giờ cho bài viết → "15/06/2025 21:00"
 * Dùng cho: chi tiết bài viết
 */
export function formatArticleDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString(VN_LOCALE, {
    timeZone: VN_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format ngày cho admin table → "15/06/2025"
 */
export function formatAdminDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(VN_LOCALE, {
    timeZone: VN_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
