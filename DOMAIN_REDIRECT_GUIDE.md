# Hướng dẫn thiết lập chuyển hướng domain

## Cấu hình hiện tại
- **Domain cũ:** `football-nextjs.netlify.app`
- **Domain mới:** `www.techshift.vn`
- **Chuyển hướng:** 301 (permanent redirect)

## 1. Sử dụng Next.js (Đã cấu hình)

### Middleware (middleware.ts) ✅
- Chuyển hướng `football-nextjs.netlify.app` → `www.techshift.vn`
- Chuyển hướng `techshift.vn` → `www.techshift.vn` (non-www to www)
- Chuyển hướng các domain cũ khác nếu có

### Next.js Config (next.config.ts) ✅
- Cấu hình redirects trong next.config.ts
- Hỗ trợ chuyển hướng dựa trên hostname

## 2. Cấu hình Netlify (Cho domain cũ)

### _redirects file (Tạo trong public/)
```
# Chuyển hướng toàn bộ site
https://football-nextjs.netlify.app/* https://www.techshift.vn/:splat 301!
```

### netlify.toml
```toml
[[redirects]]
  from = "https://football-nextjs.netlify.app/*"
  to = "https://www.techshift.vn/:splat"
  status = 301
  force = true
```

## 3. Cấu hình Server (Nginx/Apache) cho domain mới

### Nginx
```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name techshift.vn;
    
    return 301 https://www.techshift.vn$request_uri;
}

server {
    listen 80;
    listen 443 ssl;
    server_name football-nextjs.netlify.app;
    
    return 301 https://www.techshift.vn$request_uri;
}
```

## 4. Cấu hình DNS
1. Trỏ `techshift.vn` và `www.techshift.vn` về server mới
2. A record: `www.techshift.vn` → IP server
3. CNAME: `techshift.vn` → `www.techshift.vn`

## 5. Kiểm tra chuyển hướng
```bash
# Kiểm tra Netlify domain cũ
curl -I https://football-nextjs.netlify.app

# Kiểm tra non-www
curl -I https://techshift.vn

# Kết quả mong đợi: HTTP/1.1 301 Moved Permanently
# Location: https://www.techshift.vn/
```

## 6. SEO Checklist
- ✅ Sử dụng 301 redirect (permanent)
- ⏳ Cập nhật Google Search Console với domain mới
- ⏳ Submit sitemap mới: `https://www.techshift.vn/sitemap.xml`
- ⏳ Cập nhật Google Analytics
- ⏳ Thông báo thay đổi domain cho các backlinks quan trọng

## 7. Monitoring
- Theo dõi traffic chuyển hướng
- Kiểm tra 404 errors
- Monitor SEO rankings sau khi chuyển domain