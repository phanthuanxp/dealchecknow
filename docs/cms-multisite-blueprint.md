# CMS Multi-Site Blueprint (30NICE)

Tài liệu này là chuẩn triển khai cho team dev tiếp theo để nâng cấp hệ thống từ 1 website taxi sang hệ thống CMS quản lý nhiều website/domain.

## 1) Mục tiêu sản phẩm

- Một CMS trung tâm tại `cms.30nice.vn`.
- Quản lý nhiều website taxi theo tenant: `taxininhbinh.com`, `domain1.com`, `domain2.com`...
- Mỗi tenant có dữ liệu riêng:
  - bố cục block riêng
  - blog riêng
  - FAQ riêng
  - bảng giá riêng
  - theme riêng
  - SEO riêng
- Có vòng đời hoạt động website:
  - hoạt động
  - tạm dừng
  - hết hạn
  - gia hạn theo kỳ tháng/năm

## 2) DNS và domain chuẩn

### Domain chính

- `A` record về `76.76.21.21`
- `www` là `CNAME` về `cname.vercel-dns.com`

### Subdomain

- `CNAME` về `cname.vercel-dns.com`

### Quy trình thêm domain mới

1. Add domain vào project Vercel.
2. Trỏ DNS đúng như trên.
3. Tạo tenant trong `AdminCP > Website`.
4. Gắn `domain chính` + `domain phụ`.
5. Publish nội dung tenant.

## 3) Trạng thái hiện tại (đã làm)

### Sprint 1 (đã triển khai)

- Module `AdminCP > Website` đã có:
  - tạo website mới
  - sửa domain
  - trạng thái hoạt động
  - cấu hình vòng đời:
    - trạng thái thủ công (ACTIVE/PAUSED)
    - ngày bắt đầu
    - ngày hết hạn
    - số ngày grace
- Public layout đã chặn tenant bị `PAUSED/EXPIRED`, hiển thị trang thông báo vận hành.
- Lifecycle lưu trong `SiteSetting` key `tenant_lifecycle` để tránh migration phá production.

## 4) Sprint tiếp theo cho team dev

## Sprint 2 - Theme per tenant

- Thêm bảng `TenantTheme` (hoặc lưu JSON setting có version).
- Token hoá giao diện:
  - primary/secondary/accent
  - font heading/body
  - radius, shadow, spacing scale
- Tạo UI preset theme + custom override trong `AdminCP`.
- Áp theme động theo tenant ở `app/(public)/layout.tsx`.

## Sprint 3 - Page Builder theo tenant

- Chuẩn hoá block instance theo từng trang:
  - `SitePage` (slug/page type)
  - `PageBlock` (sort, type, content schema)
- Drag-sort block theo trang.
- Cấu hình hiển thị desktop/mobile riêng cho block.
- Có preview trước khi publish.

## Sprint 4 - API Credentials Hub

- Bảng mới: `ApiCredential`
  - tenantId
  - provider (telegram, openai, serpapi...)
  - encryptedSecret
  - maskedValue
  - lastValidatedAt
  - isActive
- Mã hoá secret bằng `ENCRYPTION_MASTER_KEY`.
- Tạo UI kiểm tra key hợp lệ ngay trong AdminCP.
- Tách quyền:
  - ADMIN đọc/ghi
  - EDITOR không xem secret thô

## Sprint 5 - Auto Blog v1 (không dùng n8n)

- Queue job trong app:
  - generate keyword cluster
  - viết nháp bài
  - tự tạo meta/slug/schema
  - đẩy trạng thái review
- Nhận lệnh qua Telegram bot:
  - `/tenant taxininhbinh`
  - `/autoblog on|off`
  - `/create "keyword"`
- Gửi báo cáo kết quả qua Telegram.

## Sprint 6 - QA, bảo mật, vận hành

- Audit log cho mọi thao tác quan trọng.
- Backup lịch sử content + rollback.
- Monitoring:
  - lỗi API
  - lỗi build/deploy
  - lỗi job auto blog
- Chặn brute-force login + giới hạn tần suất API.

## 5) Rule kỹ thuật bắt buộc

- Không hardcode dữ liệu tenant trong frontend.
- Luôn resolve tenant bằng host/domain mapping.
- Không để tenant A đọc dữ liệu tenant B.
- Nội dung public chỉ load từ SQL.
- Kiểm thử build/lint/tsc trước mọi deploy production.

## 6) Checklist release mỗi sprint

1. `npm run lint`
2. `npx tsc --noEmit`
3. `npm run build`
4. Kiểm tra route:
   - `/admincp/websites`
   - `/`
   - `/dich-vu`
   - `/blog`
5. Kiểm tra domain live của ít nhất 2 tenant.
6. Chốt log thay đổi + link deployment.
