import { NextRequest, NextResponse } from 'next/server'

// Cấu hình chuyển hướng domain
const DOMAIN_REDIRECTS = {
  // Chuyển hướng từ Netlify domain cũ sang domain mới
  'football-nextjs.netlify.app': 'https://www.techshift.vn',
  // Chuyển hướng non-www sang www
  'techshift.vn': 'https://www.techshift.vn',
  // Backup cho các domain cũ khác nếu có
  'bongdalive.com': 'https://www.techshift.vn',
  'www.bongdalive.com': 'https://www.techshift.vn',
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')
  
  if (!hostname) {
    return NextResponse.next()
  }

  // Kiểm tra nếu hostname hiện tại cần chuyển hướng
  const redirectTo = DOMAIN_REDIRECTS[hostname]
  
  if (redirectTo) {
    // Giữ nguyên path và query parameters
    const url = new URL(request.url)
    const newUrl = `${redirectTo}${url.pathname}${url.search}`
    
    // Chuyển hướng 301 (permanent redirect) - tốt cho SEO
    return NextResponse.redirect(newUrl, 301)
  }

  return NextResponse.next()
}

export const config = {
  // Áp dụng middleware cho tất cả các routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}