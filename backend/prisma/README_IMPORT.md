# Nhập danh mục, ngữ pháp và từ vựng (chạy trên máy local)

Mọi script mặc định chỉ XEM TRƯỚC, không kết nối database. Thêm `--apply` mới ghi, và chỉ ghi khi `DATABASE_URL` là localhost
(ghi nơi khác phải thêm `--allow-remote`, không khuyến khích). Không script nào xoá từ vựng, tiến độ hay bảng.

## 0. Sao lưu và cập nhật schema (local)
    mysqldump -u root -p ten_database > backup_truoc_0003.sql
    # kiểm tra trước, phải trả về 0 dòng:
    #   SELECT grammar_id, hanzi, COUNT(*) c FROM grammar_examples GROUP BY grammar_id, hanzi HAVING c > 1;
    npx prisma migrate deploy        # áp dụng 0003_categories_grammar (chỉ thêm cột và bảng)
    npx prisma generate

## 1. Từ vựng HSK 1-6 (gộp hai file SQL)
    npm run import:hsk-sql -- --master ../hsk_master_ultimate.sql --hlu ../hanzilevelup_vocab.sql --report ../data/review_meanings.csv
    # xem báo cáo, rồi thêm --apply

## 2. Danh mục chủ đề (nhập SAU bước 1 vì liên kết nối theo chữ Hán với từ đã có)
    npm run import:categories -- --cat-sql ../hanzilevelup_vocab.sql --words-master ../hsk_master_ultimate.sql
    npm run import:categories -- --cat-sql ../hanzilevelup_vocab.sql --apply

## 3. Ngữ pháp
    python scripts/build_grammar_extra.py        # tuỳ chọn: sinh lại data/grammar_extra.json (cần pypinyin)
    npm run import:grammar                        # xem trước, ghi data/import_reports/grammar_issues.csv
    npm run import:grammar -- --apply
    npx ts-node --transpile-only prisma/check-grammar-exercises.ts

## 4. Quản trị danh mục
Đặt tài khoản quản trị: UPDATE users SET role='admin' WHERE email='...';
API: GET/POST /admin/categories, PATCH /admin/categories/:id (isActive=false để ẩn), PATCH /admin/categories/reorder.
