# Web học tiếng Trung HSK 1-3 (Full-stack)

| Tầng | Công nghệ |
|---|---|
| Frontend | Next.js 14 + React + TypeScript + Tailwind CSS |
| Backend | Node.js + NestJS (REST API / JSON, xác thực JWT) |
| Database | MySQL + Prisma ORM |

Tính năng: danh sách & tìm kiếm từ vựng (không phân biệt dấu/hoa thường), flashcard lặp lại ngắt quãng (SM-2), **ngữ pháp HSK 1-3 (39 điểm)**, **bài tập điền từ vào câu / sắp xếp câu / dịch Việt → Hán / gõ pinyin**, quiz (chọn nghĩa / nghe chọn chữ), nghe phát âm, xem thứ tự nét & tập viết, **sổ tay từ yêu thích**, **mục tiêu hằng ngày + biểu đồ 7 ngày**, **bảng xếp hạng XP**, đăng ký/đăng nhập, chuỗi ngày học.
Dữ liệu: 2270 từ (HSK 3.0 cấp 1-3 gồm 2209 từ), nghĩa tiếng Việt từ CVDICT.

```
.
├── backend/    NestJS + Prisma (prisma/schema.prisma, migrations, seed)
├── frontend/   Next.js
├── data/       words_import.csv (dữ liệu từ vựng)
├── scripts/    build_words.py, fetch_hanviet.py
└── docker-compose.yml  (chỉ cần nếu không dùng Laragon)
```

## Chạy trên máy (Node.js 20+ và MySQL, ví dụ Laragon)

**1. Database**: bật MySQL trong Laragon, mở Terminal của Laragon và tạo database:
```
mysql -u root -e "CREATE DATABASE hsk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```
(MySQL của Laragon mặc định user `root`, không mật khẩu. Nếu bạn đặt mật khẩu thì sửa `DATABASE_URL`: `mysql://root:MATKHAU@127.0.0.1:3306/hsk`. Không dùng Laragon: `docker compose up -d`.)

**2. Backend** (cổng 4000)
```
cd backend
copy .env.example .env          # Mac/Linux: cp
npm install
npx prisma migrate deploy       # tạo bảng
npm run seed                    # nạp 2270 từ vựng
npm run start:dev
```
Kiểm tra: http://localhost:4000/health và http://localhost:4000/words/levels

**3. Frontend** (cổng 3000)
```
cd frontend
copy .env.example .env.local
npm install
npm run dev
```
Mở http://localhost:3000

## API chính
| Method | Đường dẫn | Mô tả |
|---|---|---|
| POST | `/auth/register`, `/auth/login` | Trả về `accessToken` (JWT) |
| GET | `/auth/me` 🔒 | Thông tin người dùng |
| GET | `/words?level=&q=&page=&limit=` | Danh sách / tìm kiếm từ |
| GET | `/words/levels` | Số từ mỗi cấp |
| GET | `/words/:id` | Chi tiết từ + ví dụ |
| GET | `/quiz?level=&count=` | Sinh câu hỏi quiz |
| GET | `/study/session?level=` 🔒 | Thẻ cần ôn + từ mới |
| POST | `/study/review` 🔒 | `{wordId, rating 0-3}` → cập nhật SM-2, streak, XP |
| GET | `/study/stats` 🔒 | Số thẻ cần ôn, đã thuộc, streak, XP |
| GET | `/study/activity` 🔒 | Số lượt ôn 7 ngày gần nhất + mục tiêu ngày |
| GET | `/grammar?level=` | Các điểm ngữ pháp kèm ví dụ |
| GET | `/exercises/cloze?level=&count=` | Câu hỏi điền từ vào chỗ trống |
| GET | `/exercises/order?level=&count=` | Câu hỏi sắp xếp từ thành câu |
| GET/POST/DELETE | `/favorites`, `/favorites/ids`, `/favorites/:wordId` 🔒 | Sổ tay từ yêu thích |
| GET | `/leaderboard` | Top 10 XP (tên được rút gọn) |

## Publish
- **Database**: MySQL trên Railway / Aiven / PlanetScale… (lấy `DATABASE_URL` dạng `mysql://user:pass@host:port/db`).
- **Backend**: Render / Railway. Build: `npm install && npx prisma migrate deploy && npm run build`. Start: `npm start`. Đặt `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (địa chỉ frontend). Chạy `npm run seed` một lần.
- **Frontend**: Vercel, thư mục gốc `frontend`, biến `NEXT_PUBLIC_API_URL` = địa chỉ backend.

## Bổ sung dữ liệu (tuỳ chọn)
- **Sửa / thêm ngữ pháp và câu ví dụ**: sửa `data/grammar_src.json` hoặc `data/sentences_src.txt`, chạy `pip install pypinyin` rồi `python scripts/build_content.py`, sau đó trong `backend` chạy `npm run seed` (pinyin do máy tự sinh, nên rà lại).
- **Dựng lại / sửa dữ liệu từ vựng**: `python scripts/build_words.py complete.json CVDICT.u8 data/words_import.csv`, rồi trong `backend` chạy `npm run seed:force` (xoá và nạp lại bảng `words`, tiến độ học cũng bị xoá theo).
- **Âm Hán Việt**: `python scripts/fetch_hanviet.py` tạo `data/hanviet_update.sql`, chạy file này trong MySQL (HeidiSQL hoặc `mysql -u root hsk < data/hanviet_update.sql`).
- **Câu ví dụ**: thêm vào bảng `examples` (trang chi tiết từ tự hiển thị).
- **Audio mp3**: điền URL vào `words.audio_url`, app ưu tiên dùng; mặc định dùng giọng đọc của trình duyệt.

## Ghi nguồn dữ liệu (bắt buộc)
CC-CEDICT & CVDICT (CC BY-SA), complete-hsk-vocabulary (MIT), Hanzi Writer (MIT) — đã có ở trang `/credits`.
