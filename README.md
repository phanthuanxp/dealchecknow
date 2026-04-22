# Taxi Ninh Binh

Website production-ready cho dich vu taxi va xe du lich Ninh Binh (`https://taxininhbinh.com`).

## Cong nghe su dung

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Auth.js (NextAuth credentials) cho AdminCP

## Cau truc thu muc chinh

```text
app/
components/
lib/
prisma/
```

## 1) Cai dependency

```bash
npm install
```

## 2) Cau hinh bien moi truong

Sao chep file mau:

```bash
cp .env.example .env
```

Gia tri can co trong `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taxininhbinh?schema=public"
AUTH_SECRET="replace_with_a_long_random_secret"
NEXT_PUBLIC_SITE_URL="https://taxininhbinh.com"
TELEGRAM_BOT_TOKEN="replace_with_telegram_bot_token"
TELEGRAM_CHAT_ID="replace_with_telegram_chat_id"
BLOB_READ_WRITE_TOKEN="replace_with_vercel_blob_read_write_token"
```

## 3) Generate Prisma Client

```bash
npm run prisma:generate
```

## 4) Migrate database

Khi phat trien local:

```bash
npm run prisma:migrate -- --name init
```

Khi deploy production:

```bash
npm run prisma:migrate:deploy
```

Neu da chuyen sang che do single-site va muon don bang CMS cu:

```sql
-- Run script: prisma/manual-single-site-cleanup.sql
```

## 5) Seed du lieu ban dau

```bash
npm run prisma:seed
```

Seed tao du lieu khoi tao cho:

- Tai khoan admin mac dinh
- Block trang chu
- Bang gia, FAQ, testimonial
- Blog category/blog post
- Site settings

## 6) Tai khoan AdminCP mac dinh

- Email: `admin@taxininhbinh.com`
- Password: `Admin@123456`
- Role: `ADMIN`

Sau khi dang nhap lan dau, nen doi mat khau ngay.

## 7) Chay local

```bash
npm run dev
```

- Public site: [http://localhost:3000](http://localhost:3000)
- Admin login: [http://localhost:3000/admincp/login](http://localhost:3000/admincp/login)

## 8) Deploy len Vercel

1. Push code len GitHub.
2. Import project vao Vercel.
3. Cau hinh env tren Vercel:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_SITE_URL`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `BLOB_READ_WRITE_TOKEN`
4. Deploy.
5. Chay migrate production (`npm run prisma:migrate:deploy`).

## 9) PostgreSQL ngoai de khong mat du lieu khi redeploy

Khuyen nghi dung PostgreSQL managed (Neon, Supabase, Railway, RDS...):

1. Tao database.
2. Gan connection string vao `DATABASE_URL` tren Vercel.
3. Chay `prisma migrate deploy`.
4. Chay `npm run prisma:seed` lan dau neu can.

## 10) Telegram lead notifications

Khi co lead moi tu form bao gia:

- Lead luon duoc luu SQL truoc.
- Telegram gui sau.
- Neu Telegram loi, lead van duoc giu trong DB.

## 11) Chinh hotline/email/Zalo/site settings trong AdminCP

Vao `/admincp/settings` de cap nhat:

- Ten website
- Domain
- Tagline
- Hotline (hien thi + tel)
- Email
- So Zalo

Public site doc cac gia tri nay tu SQL (`SiteSetting`), khong hardcode o van hanh chinh.
