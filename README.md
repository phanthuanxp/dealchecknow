# Taxi Ninh Bình

Website production-ready cho dịch vụ taxi và xe du lịch Ninh Bình (`https://taxininhbinh.com`).

## Công nghệ sử dụng

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Auth.js (NextAuth credentials) cho AdminCP

## Cấu trúc thư mục chính

```text
app/
components/
lib/
prisma/
```

## 1) Cài dependency

```bash
npm install
```

## 2) Cấu hình biến môi trường

Sao chép file mẫu:

```bash
cp .env.example .env
```

Giá trị cần có trong `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taxininhbinh?schema=public"
AUTH_SECRET="replace_with_a_long_random_secret"
NEXT_PUBLIC_SITE_URL="https://taxininhbinh.com"
TELEGRAM_BOT_TOKEN="replace_with_telegram_bot_token"
TELEGRAM_CHAT_ID="replace_with_telegram_chat_id"
```

Ghi chú:

- `DATABASE_URL`: bắt buộc.
- `AUTH_SECRET`: bắt buộc cho đăng nhập AdminCP.
- `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`: cần để nhận lead qua Telegram.

## 3) Generate Prisma Client

```bash
npm run prisma:generate
```

## 4) Migrate database

Khi phát triển local:

```bash
npm run prisma:migrate -- --name init
```

Khi deploy production:

```bash
npm run prisma:migrate:deploy
```

## 5) Seed dữ liệu ban đầu

```bash
npm run prisma:seed
```

Seed sẽ tạo:

- User admin mặc định.
- Dữ liệu khởi tạo cho block trang chủ, bảng giá, FAQ, testimonial, blog category/blog post, site settings.

## 6) Tạo admin ban đầu

Sau khi chạy seed, tài khoản mặc định:

- Email: `admin@taxininhbinh.com`
- Password: `Admin@123456`
- Role: `ADMIN`

Khuyến nghị production:

1. Đăng nhập AdminCP bằng tài khoản seed.
2. Đổi mật khẩu ngay (hoặc cập nhật `passwordHash` bằng Prisma Studio/SQL theo quy trình nội bộ).

## 7) Chạy local

```bash
npm run dev
```

Truy cập:

- Public site: [http://localhost:3000](http://localhost:3000)
- Admin login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## 8) Deploy lên Vercel

1. Push code lên GitHub.
2. Import project vào Vercel.
3. Cấu hình đầy đủ env trên Vercel:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_SITE_URL`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
4. Deploy.
5. Chạy migrate production:
   - qua CI/CD hoặc chạy `npm run prisma:migrate:deploy` trong môi trường production.

## 9) PostgreSQL ngoài để không mất dữ liệu khi redeploy

Không dùng SQLite/local file cho production.

Khuyến nghị dùng PostgreSQL managed (Neon, Supabase, Railway Postgres, RDS...):

1. Tạo database PostgreSQL ngoài.
2. Lấy connection string và gán vào `DATABASE_URL` trên Vercel.
3. Chạy `prisma migrate deploy`.
4. (Tuỳ chọn) chạy `prisma:seed` lần đầu để có dữ liệu mặc định.

Với cách này, dữ liệu không bị mất khi redeploy.

## 10) Cấu hình Telegram bot

1. Tạo bot qua BotFather để lấy `TELEGRAM_BOT_TOKEN`.
2. Lấy `TELEGRAM_CHAT_ID` của group/user nhận thông báo.
3. Set 2 env này trên local + Vercel.
4. Khi có lead mới từ form báo giá:
   - Lead luôn lưu vào SQL trước.
   - Telegram gửi sau; nếu gửi lỗi thì lead vẫn được giữ trong DB.

## 11) Chỉnh hotline/email/Zalo/site settings trong AdminCP

Vào:

- `/admin/settings`

Có thể chỉnh:

- Tên website
- Domain
- Tagline
- Hotline chuẩn + hotline hiển thị
- Email
- Số Zalo

Public site đọc các giá trị này từ SQL (`SiteSetting`), không hardcode ở phần vận hành chính.

## Ghi chú kỹ thuật

- Form báo giá API: `POST /api/quote`.
- Hệ thống validate cả client và server.
- Các nội dung editable quan trọng được lưu PostgreSQL qua Prisma.
