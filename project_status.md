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
- [x] **Phase 1-5:** ✅ HOÀN THÀNH
- [x] **Post-launch improvements:**
  - [x] Timezone UTC+7, fix stale cache, season 2025/2026, V.League ID 340
  - [x] Trang `/giai-dau/[id]`: BXH + lịch vòng + tab Nhận định theo giải
  - [x] Trang `/doi-bong/[id]`: giải đấu thực tế, thống kê đầy đủ, lịch thi đấu
  - [x] Trang `/tran-dau/[id]`: Events, Statistics, Lineups
  - [x] Redesign BXH: StandingsTable, form dots cột riêng desktop
  - [x] `ArticleCard` component dùng chung, filter bài viết theo giải
  - [x] Fix team statistics API (response là object không phải array)
- [ ] **Đang thực hiện:**
  - [ ] Trang `/ty-le-keo`: tỷ lệ kèo 1x2, châu Á, tài xỉu theo giải đấu

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
- **Current Status:** ✅ Deploy Netlify. Trang giải đấu và đội bóng đã hoàn thiện.
- **Routes mới:** `/giai-dau/[id]` (BXH + lịch theo vòng), `/doi-bong/[id]` (thống kê + lịch thi đấu).
- **Next Step:** Tiếp tục hoàn thiện theo yêu cầu.