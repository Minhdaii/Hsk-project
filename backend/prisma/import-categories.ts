import 'dotenv/config';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { dbConfig } from '../src/prisma/db-config';
import { parseInsertTable } from './sql-dump';
import { CategoryDef, CategoryMap, PlanWord, planCategories, toCatRow } from './category-logic';
import { toMaster } from './hsk-sql-merge';

/**
 * Nhập danh mục chủ đề và liên kết từ - danh mục. KHÔNG xoá hay sửa từ vựng; chạy lại nhiều lần không tạo bản ghi trùng.
 *
 * Xem trước (không kết nối database). Chọn nguồn danh sách từ để đối chiếu:
 *   npx ts-node prisma/import-categories.ts --cat-sql ../hanzilevelup_vocab.sql --words-csv ../data/words_import.csv
 *   npx ts-node prisma/import-categories.ts --cat-sql ../hanzilevelup_vocab.sql --words-master ../hsk_master_ultimate.sql
 * Ghi thật (chỉ database local, đối chiếu với bảng words trong DB):  thêm --apply
 *
 *   --categories file.json   cây danh mục cha (mặc định ../data/categories.json)
 *   --map file.json          ánh xạ tên danh mục con -> danh mục cha (mặc định ../data/category_map.json)
 *   --allow-remote           cho phép ghi vào database không phải localhost (mặc định bị chặn)
 */
const args = process.argv.slice(2);
const flag = (k: string) => args.includes(`--${k}`);
const opt = (k: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };

async function main() {
  const catSql = opt('cat-sql');
  if (!catSql) { console.error('Thiếu --cat-sql (hanzilevelup_vocab.sql)'); process.exit(1); }
  const tree: { categories: CategoryDef[] } = JSON.parse(readFileSync(opt('categories') ?? '../data/categories.json', 'utf-8'));
  const cm: CategoryMap = JSON.parse(readFileSync(opt('map') ?? '../data/category_map.json', 'utf-8'));
  const rows = parseInsertTable(readFileSync(catSql, 'utf-8'), 'category_vocab').map(toCatRow);
  const parentSlugs = new Set(tree.categories.map((c) => c.slug));
  const badTargets = Array.from(new Set(Object.values(cm.map))).filter((s) => !parentSlugs.has(s));
  if (badTargets.length) { console.error('category_map.json trỏ tới danh mục cha không tồn tại:', badTargets); process.exit(1); }

  const apply = flag('apply');
  let prisma: PrismaClient | null = null;
  let words: PlanWord[] = [];
  let wordSource = '';
  if (apply) {
    const url = new URL(process.env.DATABASE_URL as string);
    const local = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(url.hostname);
    if (!local && !flag('allow-remote')) { console.error(`DATABASE_URL trỏ tới "${url.hostname}", không phải máy local. Dừng lại để không đụng dữ liệu thật.`); process.exit(1); }
    prisma = new PrismaClient({ adapter: new PrismaMariaDb(dbConfig()) });
    words = (await prisma.word.findMany({ select: { id: true, hanzi: true, pinyin: true } }));
    wordSource = 'bảng words trong database';
  } else if (opt('words-csv')) {
    const recs: Record<string, string>[] = parse(readFileSync(opt('words-csv')!, 'utf-8').replace(/^\uFEFF/, ''), { columns: true, skip_empty_lines: true, trim: true });
    words = recs.map((r, i) => ({ id: i + 1, hanzi: r.hanzi, pinyin: r.pinyin || null }));
    wordSource = `CSV ${opt('words-csv')}`;
  } else if (opt('words-master')) {
    words = parseInsertTable(readFileSync(opt('words-master')!, 'utf-8'), 'hsk_vocabulary').map(toMaster).map((m) => ({ id: m.id, hanzi: m.hanzi, pinyin: m.pinyinTone }));
    wordSource = `hsk_master_ultimate.sql`;
  } else { console.error('Chưa chỉ nguồn từ vựng: dùng --words-csv, --words-master hoặc --apply'); process.exit(1); }

  const plan = planCategories(rows, cm, words);
  const st = plan.stats;
  console.log(`Nguồn danh mục: ${rows.length} dòng. Nguồn từ vựng để đối chiếu: ${wordSource} (${words.length} từ).`);
  console.log(`Danh mục cha (nhóm + chủ đề): ${tree.categories.length}. Danh mục con sẽ tạo: ${st.childCount}.`);
  console.log(`Dòng bị bỏ qua theo danh sách skip: ${st.skippedRows}. Tên chưa phân loại: ${st.unmappedNames.length ? st.unmappedNames.join('; ') : 'không có'}.`);
  console.log(`Khớp với từ vựng: ${st.matchedRows}/${st.rows - st.skippedRows} dòng; không khớp (chưa có trong kho từ): ${st.unmatchedRows}.`);
  console.log(`Liên kết từ - danh mục hợp lệ: ${plan.links.length}; trùng lặp đã loại: ${st.duplicateLinks}; chữ Hán khớp nhiều từ: ${st.ambiguousHanzi}.`);
  if (plan.unmatchedSample.length) console.log('Ví dụ chưa có trong kho từ:', plan.unmatchedSample.join(', '));

  if (!apply || !prisma) { console.log('\nĐây là bản xem trước, chưa ghi gì vào database. Thêm --apply để ghi.'); return; }
  try {
    const bySlug = new Map<string, number>();
    const all = [...tree.categories, ...plan.childDefs];
    // cha trước con sau; upsert theo slug nên chạy lại không tạo trùng
    for (const c of all.sort((a, b) => Number(!!a.parent && !parentSlugs.has(a.parent) ? 2 : a.parent ? 1 : 0) - Number(!!b.parent && !parentSlugs.has(b.parent) ? 2 : b.parent ? 1 : 0))) {
      const parentId = c.parent ? bySlug.get(c.parent) ?? null : null;
      const row = await prisma.category.upsert({
        where: { slug: c.slug },
        create: { slug: c.slug, name: c.name, description: c.description, parentId, sortOrder: c.sortOrder },
        update: { name: c.name, parentId, sortOrder: c.sortOrder }, // không đụng isActive để giữ lựa chọn ẩn/hiện của quản trị viên
      });
      bySlug.set(c.slug, row.id);
    }
    const data = plan.links.map((l) => ({ wordId: l.wordId, categoryId: bySlug.get(l.slug)! }));
    let created = 0;
    for (let i = 0; i < data.length; i += 1000) created += (await prisma.wordCategory.createMany({ data: data.slice(i, i + 1000), skipDuplicates: true })).count;
    console.log(`Xong: ${all.length} danh mục (thêm hoặc cập nhật), thêm mới ${created} liên kết (đã có sẵn ${data.length - created}).`);
  } finally { await prisma.$disconnect(); }
}
main().catch((e) => { console.error(e); process.exit(1); });
