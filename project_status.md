# BÓNG ĐÁ LIVE - PROJECT STATUS & KNOWLEDGE BASE

## 1. Project Overview
- **Mục tiêu:** Xây dựng website dữ liệu bóng đá (Livescore, BXH, Lịch thi đấu, KQ, Tỷ lệ kèo) và tin tức nhận định. Tối ưu cực độ cho tốc độ tải trang và SEO.
- **Đối tượng:** Ưu tiên số 1 là người dùng Mobile (Giao diện App-like).
- **Nguồn dữ liệu:** `api-football.com`.

## 2. Tech Stack & Architecture
- **Frontend Framework:** Next.js (App Router) - Bắt buộc dùng Server Components (RSC) tối đa để tối ưu JS bundle.
- **Styling:** Tailwind CSS + Shadcn UI (nếu cần components nhanh).
- **Database & Auth (CMS/Admin):** Supabase (PostgreSQL). Quản lý bài viết tin tức, nhận định gắn với ID trận đấu.
- **Caching & Realtime:** Redis (Upstash). Dùng để cache dữ liệu API-Football tránh Rate Limit và phục vụ Livescore tốc độ cao.
- **State Management:** Zustand (chỉ dùng cho Client State nếu thật sự cần).

## 3. Core Rules (AI MUST READ AND FOLLOW)
1. **Mobile-First UI:** Luôn code giao diện Mobile trước. Cấu trúc Desktop là 3 cột (Left Sidebar 20% - Main 55% - Right Sidebar 25%). Trên Mobile: Left/Right Sidebar bị ẩn, dùng Bottom Navigation Bar và Drawer/Swipeable Carousel thay thế.
2. **API-Football Rule:** KHÔNG BAO GIỜ gọi trực tiếp từ Client. Flow chuẩn: Cronjob/Next API -> Gọi API-Football -> Lưu vào Redis/Supabase -> Next.js Frontend lấy data từ Redis/Supabase.
3. **SEO Rule:** Sử dụng Dynamic Meta Tags, JSON-LD cho tất cả các trang giải đấu, trận đấu. Tận dụng ISR (Incremental Static Regeneration) của Next.js cho lịch thi đấu/kết quả.
4. **Single Source of Truth:** Tiến độ, lỗi, cấu trúc Database PHẢI được cập nhật liên tục vào file `project_status.md` này. Cấm tạo file theo dõi khác.

## 4. Database Schema (Draft)
- **Supabase:** 
  - `articles`: id, title, slug, content, match_id (nếu là nhận định trận), author, created_at.
  - `admin_users`: Quản lý tài khoản đăng nhập Admin.
- **Redis Cache Keys:**
  - `live_matches`: Chứa array các trận đang đá.
  - `standings_{league_id}_{season}`: Cập nhật mỗi giờ.
  - `fixtures_{date}`: Cập nhật mỗi ngày.

## 5. Task Progress
- [x] **Phase 1: Khởi tạo & Cấu trúc (Project Setup)** ✅ HOÀN THÀNH
  - [x] Init Next.js 16.2.3 (App Router, TypeScript, Tailwind v4).
  - [x] Cài dependencies: `@supabase/supabase-js`, `@upstash/redis`, `lucide-react`.
  - [x] Tạo `lib/supabase.ts` (Supabase client) và `lib/redis.ts` (Upstash Redis client + CACHE_KEYS + CACHE_TTL constants).
  - [x] Tạo `.env.local` với template các biến môi trường cần điền.
  - [x] Tạo Main Layout: `app/layout.tsx` (3 cột Desktop, 1 cột Mobile + padding bottom cho BottomNav).
  - [x] Tạo `components/layout/Header.tsx` (sticky, Server Component).
  - [x] Tạo `components/layout/BottomNav.tsx` (fixed bottom, Client Component, active state).
  - [x] Tạo `components/layout/LeftSidebar.tsx` (ẩn < lg, danh sách giải đấu).
  - [x] Tạo `components/layout/RightSidebar.tsx` (ẩn < xl, tin HOT + kèo nổi bật).
  - [x] Tạo các route placeholder: `/`, `/lich-thi-dau`, `/bang-xep-hang`, `/nhan-dinh`, `/ty-le-keo`.
  - [x] Build thành công, 6 static routes, 0 lỗi.
- [x] **Phase 2: Database & Backend Core** ✅ HOÀN THÀNH
  - [x] Tạo `lib/supabase-server.ts` — Admin client dùng `SUPABASE_SECRET_KEY` (server-only, import 'server-only').
  - [x] Tạo `lib/api-football.ts` — Base fetch + Types (Fixture, Standing) + các hàm: `fetchLiveFixtures`, `fetchFixturesByDate`, `fetchStandings`, `fetchFixtureById`.
  - [x] Tạo `lib/services/live.ts` — `getLiveMatches()`, `refreshLiveMatches()` với Redis cache 60s.
  - [x] Tạo `lib/services/fixtures.ts` — `getFixturesByDate()`, `getTodayFixtures()`, `getFixtureDetail()`, `refreshFixturesByDate()` với Redis cache 1 ngày.
  - [x] Tạo `lib/services/standings.ts` — `getStandings()`, `refreshStandings()`, `refreshAllStandings()` với Redis cache 1 giờ.
  - [x] Tạo `app/api/cron/live/route.ts` — Cronjob refresh livescore (bảo vệ bằng CRON_SECRET).
  - [x] Tạo `app/api/cron/fixtures/route.ts` — Cronjob refresh lịch thi đấu hôm nay + ngày mai.
  - [x] Tạo `app/api/cron/standings/route.ts` — Cronjob refresh BXH tất cả giải đấu.
  - [x] Tạo `supabase/schema.sql` — Schema bảng `articles` với RLS policies, indexes, trigger auto-update.
  - [x] Thêm `CRON_SECRET` vào `.env.local`.
  - [x] Build thành công: 9 routes (6 static + 3 dynamic cronjob), 0 lỗi.
- [x] **Phase 3: Giao diện Người dùng (Frontend - UI/UX)** ✅ HOÀN THÀNH
  - [x] ... (như trên)
  - [x] Fix `next.config.ts` — thêm `media.api-sports.io` và `*.supabase.co` vào `remotePatterns`.
  - [x] Build thành công: 11 routes (3 static + 8 dynamic), 0 lỗi.
- [x] **Phase 4: Admin CMS** ✅ HOÀN THÀNH
  - [x] Cài `@supabase/ssr` để handle auth cookie đúng chuẩn Next.js App Router.
  - [x] `lib/supabase-browser.ts`, `lib/supabase-middleware.ts`, `proxy.ts` — Auth + session guard.
  - [x] Fix redirect loop: proxy chỉ match các routes cần bảo vệ, không match `/admin/login`.
  - [x] Admin layout, AdminShell, Login form, Dashboard, CRUD bài viết.
  - [x] Build thành công: 18 routes, 0 lỗi, 0 warning.
- [x] **Phase 5: Tối ưu & SEO** ✅ HOÀN THÀNH
  - [x] `app/robots.ts` — Tự động generate `/robots.txt`, block `/admin` và `/api/`.
  - [x] `app/sitemap.ts` — Tự động generate `/sitemap.xml` gồm static routes + bài viết từ Supabase.
  - [x] `lib/json-ld.ts` — Helpers tạo JSON-LD: `websiteJsonLd`, `fixtureJsonLd` (SportsEvent), `articleJsonLd` (NewsArticle).
  - [x] `app/opengraph-image.tsx` — OG image tĩnh cho trang chủ (gradient xanh + logo).
  - [x] `app/nhan-dinh/[slug]/opengraph-image.tsx` — OG image động cho từng bài viết (tiêu đề + tác giả).
  - [x] `vercel.json` — Cấu hình cronjob: live mỗi phút, fixtures mỗi ngày 00:01, standings mỗi giờ.
  - [x] `app/layout.tsx` — Metadata đầy đủ: `metadataBase`, `viewport`, `themeColor`, OpenGraph, Twitter Card, robots.
  - [x] Thêm `NEXT_PUBLIC_SITE_URL` vào `.env.local`.
  - [x] Build thành công: 22 routes, 0 lỗi, 0 warning.

## 6. Installed Dependencies
```json
{
  "dependencies": {
    "next": "16.2.3",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "@supabase/supabase-js": "latest",
    "@upstash/redis": "latest",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4",
    "typescript": "^5"
  }
}
```

## 7. Project Structure
```
/
├── app/
│   ├── layout.tsx                    # Root layout: Header + 3-col + BottomNav
│   ├── page.tsx                      # Trang chủ: LiveSection + TodaySection
│   ├── globals.css
│   ├── lich-thi-dau/page.tsx         # Date picker 7 ngày + danh sách trận
│   ├── bang-xep-hang/page.tsx        # Tab giải đấu + bảng xếp hạng
│   ├── nhan-dinh/
│   │   ├── page.tsx                  # Danh sách bài viết từ Supabase
│   │   └── [slug]/page.tsx           # Chi tiết bài viết + mini scoreboard
│   ├── tran-dau/[id]/page.tsx        # Chi tiết trận + bài nhận định
│   ├── ty-le-keo/page.tsx
│   └── api/cron/
│       ├── live/route.ts
│       ├── fixtures/route.ts
│       └── standings/route.ts
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   ├── LeftSidebar.tsx
│   │   └── RightSidebar.tsx
│   └── ui/
│       ├── MatchStatusBadge.tsx      # Badge LIVE/giờ/KT/Hoãn
│       ├── LeagueGroupHeader.tsx     # Header nhóm theo giải
│       ├── MatchRow.tsx              # 1 hàng trận đấu
│       └── FixtureList.tsx           # Danh sách trận (dùng chung)
├── lib/
│   ├── supabase.ts
│   ├── supabase-server.ts
│   ├── redis.ts
│   ├── api-football.ts
│   └── services/
│       ├── live.ts
│       ├── fixtures.ts
│       └── standings.ts
├── supabase/schema.sql
└── .env.local
```

## 8. Current Context & Next Step
- **Current Status:** ✅ TẤT CẢ 5 PHASE HOÀN THÀNH. Đã deploy lên **Netlify** thành công. 3 Scheduled Functions đang hoạt động. Timezone đã được chuẩn hóa toàn bộ về UTC+7.
- **Timezone:** Tất cả xử lý ngày/giờ tập trung tại `lib/date.ts`. Không còn inline `toLocaleString` rải rác.
- **Next Step:** Tiếp tục hoàn thiện theo yêu cầu của người dùng.