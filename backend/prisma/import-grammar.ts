import 'dotenv/config';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { dbConfig } from '../src/prisma/db-config';
import { BasePoint, Extra, buildPoints } from './grammar-logic';

/**
 * Nhập ngữ pháp: gộp data/grammar.json (39 cấu trúc có sẵn) với data/grammar_extra.json (slug, tên chữ Hán, loại, lỗi sai, cấu cấu trúc mới).
 * Chạy lại nhiều lần an toàn: cấu trúc khớp theo slug (hoặc theo tiêu đề nếu bản ghi cũ chưa có slug), ví dụ khớp theo (cấu trúc, câu).
 * KHÔNG xoá cấu trúc hay ví dụ nào đang có.
 *
 *   Xem trước (không kết nối database):  npx ts-node prisma/import-grammar.ts
 *   Ghi thật (chỉ database local):       npx ts-node prisma/import-grammar.ts --apply
 *
 *   --grammar file.json  --extra file.json  --report file.csv (danh sách lỗi và cảnh báo, mặc định ../data/import_reports/grammar_issues.csv)
 *   --words-csv file.csv  đối chiếu từ khoá với danh sách từ (khi xem trước)
 *   --allow-remote        cho phép ghi vào database không phải localhost (mặc định bị chặn)
 */
const args = process.argv.slice(2);
const flag = (k: string) => args.includes(`--${k}`);
const opt = (k: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };

async function main() {
  const base: BasePoint[] = JSON.parse(readFileSync(opt('grammar') ?? '../data/grammar.json', 'utf-8'));
  const extra: Extra = JSON.parse(readFileSync(opt('extra') ?? '../data/grammar_extra.json', 'utf-8'));
  const { points, issues } = buildPoints(base, extra);
  const errors = issues.filter((i) => i.level === 'error');
  const warns = issues.filter((i) => i.level === 'warn');
  const ex = points.flatMap((p) => p.examples);
  console.log(`Cấu trúc: ${points.length} (có sẵn ${points.filter((p) => p.source === 'imported').length}, soạn mới ${points.filter((p) => p.source === 'authored').length}).`);
  console.log(`Ví dụ: ${ex.length} (đúng ${ex.filter((e) => e.isCorrect).length}, câu sai kèm giải thích ${ex.filter((e) => !e.isCorrect).length}).`);
  const byLv = points.reduce<Record<number, number>>((a, p) => { a[p.level] = (a[p.level] ?? 0) + 1; return a; }, {});
  console.log('Theo cấp (0 = ngoài HSK 1-3):', byLv);
  console.log(`Lỗi: ${errors.length}, cảnh báo: ${warns.length}.`);
  [...errors, ...warns].slice(0, 12).forEach((i) => console.log(`  [${i.level}] ${i.slug}: ${i.message}`));
  const report = opt('report') ?? '../data/import_reports/grammar_issues.csv';
  mkdirSync(dirname(report), { recursive: true });
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  writeFileSync(report, '\uFEFF' + ['muc_do,slug,noi_dung', ...issues.map((i) => [i.level, i.slug, i.message].map(esc).join(','))].join('\n'), 'utf-8');
  console.log(`Đã ghi báo cáo: ${report}`);
  console.log('Lưu ý: toàn bộ nội dung chưa được giáo viên hoặc người bản ngữ xác minh (verified = false).');

  if (errors.length) { console.error('\nCó lỗi nghiêm trọng, dừng lại. Sửa dữ liệu rồi chạy lại.'); process.exit(1); }
  if (!flag('apply')) { console.log('\nĐây là bản xem trước, chưa ghi gì vào database. Thêm --apply để ghi.'); return; }

  const url = new URL(process.env.DATABASE_URL as string);
  const local = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(url.hostname);
  if (!local && !flag('allow-remote')) { console.error(`DATABASE_URL trỏ tới "${url.hostname}", không phải máy local. Dừng lại để không đụng dữ liệu thật.`); process.exit(1); }
  const prisma = new PrismaClient({ adapter: new PrismaMariaDb(dbConfig()) });
  try {
    const idBySlug = new Map<string, number>();
    let createdP = 0, updatedP = 0, createdE = 0, updatedE = 0;
    for (const p of points) {
      const data = {
        level: p.level, sortOrder: p.sortOrder, title: p.title, titleZh: p.titleZh, category: p.category, keywords: p.keywords || null, pattern: p.pattern,
        explanation: p.explanation, notes: p.notes, commonMistakes: p.commonMistakes, source: p.source,
      };
      // khớp theo slug; bản ghi cũ chưa có slug thì khớp theo tiêu đề để không nhân đôi
      const found = (await prisma.grammarPoint.findUnique({ where: { slug: p.slug } })) ?? (await prisma.grammarPoint.findFirst({ where: { slug: null, title: p.title } }));
      let id: number;
      if (found) { id = found.id; await prisma.grammarPoint.update({ where: { id }, data: { ...data, slug: p.slug } }); updatedP++; }
      else { id = (await prisma.grammarPoint.create({ data: { ...data, slug: p.slug } })).id; createdP++; }
      idBySlug.set(p.slug, id);
      for (const e of p.examples) {
        const edata = { tokens: e.tokens, pinyin: e.pinyin, meaningVi: e.meaningVi, explanationVi: e.explanationVi, isCorrect: e.isCorrect, correctedHanzi: e.correctedHanzi, errorExplanation: e.errorExplanation, sortOrder: e.sortOrder };
        let cur = await prisma.grammarExample.findUnique({ where: { grammarId_hanzi: { grammarId: id, hanzi: e.hanzi } } });
        // bản ghi cũ còn dấu câu ASCII: cập nhật thành câu đã chuẩn hoá thay vì tạo bản trùng
        if (!cur && e.legacyHanzi) cur = await prisma.grammarExample.findUnique({ where: { grammarId_hanzi: { grammarId: id, hanzi: e.legacyHanzi } } });
        if (cur) { await prisma.grammarExample.update({ where: { id: cur.id }, data: { ...edata, hanzi: e.hanzi } }); updatedE++; }
        else { await prisma.grammarExample.create({ data: { grammarId: id, hanzi: e.hanzi, ...edata } }); createdE++; }
      }
    }
    // cấu trúc liên quan (có hướng, khử trùng bằng skipDuplicates)
    const rels = points.flatMap((p) => p.related.map((r) => ({ grammarId: idBySlug.get(p.slug)!, relatedId: idBySlug.get(r)! })));
    const relRes = await prisma.grammarRelation.createMany({ data: rels, skipDuplicates: true });
    // từ vựng quan trọng: nối với từ đã có theo chữ Hán
    const wantWords = Array.from(new Set(points.flatMap((p) => p.keywords.split(' ').filter(Boolean))));
    const words = await prisma.word.findMany({ where: { hanzi: { in: wantWords } }, select: { id: true, hanzi: true } });
    const wByHanzi = new Map<string, number[]>();
    words.forEach((w) => (wByHanzi.get(w.hanzi) ?? wByHanzi.set(w.hanzi, []).get(w.hanzi)!).push(w.id));
    const gw = points.flatMap((p) => p.keywords.split(' ').filter(Boolean).flatMap((k) => (wByHanzi.get(k) ?? []).map((wid) => ({ grammarId: idBySlug.get(p.slug)!, wordId: wid }))));
    const gwRes = await prisma.grammarWord.createMany({ data: gw, skipDuplicates: true });
    const missing = wantWords.filter((k) => !wByHanzi.has(k));
    console.log(`Xong: cấu trúc thêm ${createdP}, cập nhật ${updatedP}; ví dụ thêm ${createdE}, cập nhật ${updatedE}; liên kết liên quan mới ${relRes.count}; liên kết từ vựng mới ${gwRes.count}.`);
    if (missing.length) console.log(`Từ khoá chưa có trong kho từ vựng (không nối được): ${missing.join(' ')}`);
  } finally { await prisma.$disconnect(); }
}
main().catch((e) => { console.error(e); process.exit(1); });
