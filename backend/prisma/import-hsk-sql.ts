import 'dotenv/config';
import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { dbConfig } from '../src/prisma/db-config';
import { parseInsertTable } from './sql-dump';
import { merge, toHlu, toMaster } from './hsk-sql-merge';

/**
 * Gộp hsk_master_ultimate.sql (cấu trúc, pinyin, âm thanh) với hanzilevelup_vocab.sql (nghĩa tiếng Việt tốt hơn) rồi nhập vào bảng words.
 *
 * Xem trước (không kết nối database, có thể xuất danh sách cần duyệt nghĩa):
 *   npx ts-node prisma/import-hsk-sql.ts --master ../hsk_master_ultimate.sql --hlu ../hanzilevelup_vocab.sql --report ../data/review_meanings.csv
 * Ghi thật (chỉ database local):  thêm --apply
 *
 * Tuỳ chọn:
 *   --overrides file.csv  CSV có cột id,meaning_vi (id = id trong hsk_master_ultimate) để ghi đè nghĩa đã duyệt/dịch lại
 *   --overwrite           ghi đè cả cột đã có dữ liệu ở từ đã tồn tại (mặc định chỉ điền cột trống)
 *   --fresh               XOÁ toàn bộ words (kéo theo tiến độ học, sổ tay yêu thích) rồi nhập mới. Chỉ dùng khi chắc chắn, chỉ chạy được trên local.
 *   --allow-remote        cho phép ghi vào database không phải localhost (mặc định bị chặn)
 */
const args = process.argv.slice(2);
const flag = (k: string) => args.includes(`--${k}`);
const opt = (k: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };

async function main() {
  const masterPath = opt('master'); const hluPath = opt('hlu');
  if (!masterPath || !hluPath) { console.error('Thiếu --master và --hlu'); process.exit(1); }

const masterRows = parseInsertTable(
  readFileSync(masterPath, 'utf-8'),
  'hsk_vocabulary',
);

console.log('Số cột dòng đầu:', masterRows[0]?.length);
console.log('Cột tts_url dòng đầu:', masterRows[0]?.[15]);

const master = masterRows.map(toMaster);

console.log('Audio sau chuyển đổi:', master[0]?.tts);
  const hlu = parseInsertTable(readFileSync(hluPath, 'utf-8'), 'hsk_vocab').map(toHlu);
  const overrides = new Map<number, string>();
  if (opt('overrides')) {
    const rows: Record<string, string>[] = parse(readFileSync(opt('overrides')!, 'utf-8').replace(/^\uFEFF/, ''), { columns: true, skip_empty_lines: true, trim: true });
    rows.forEach((r) => { const id = Number(r.id); if (id && r.meaning_vi) overrides.set(id, r.meaning_vi); });
  }
  const items = merge(master, hlu, overrides);

  const by = (f: (w: (typeof items)[number]) => string | number) => items.reduce<Record<string, number>>((a, w) => { const k = String(f(w)); a[k] = (a[k] ?? 0) + 1; return a; }, {});
  console.log(`master ${master.length} dòng, hanzilevelup ${hlu.length} dòng, ghi đè nghĩa ${overrides.size}.`);
  console.log('Theo cấp HSK:', by((w) => w.hskLevel));
  console.log('Nguồn nghĩa tiếng Việt:', by((w) => w.viSource));
  console.log(`Cần duyệt nghĩa: ${items.filter((w) => w.needsReview).length} từ. Theo cấp:`, by((w) => (w.needsReview ? w.hskLevel : 0)));
  console.log(`Thiếu: phồn thể ${items.filter((w) => !w.traditional).length}, âm Hán Việt ${items.filter((w) => !w.hanviet).length}, loại từ ${items.filter((w) => !w.pos).length}, audio ${items.filter((w) => !w.audioUrl).length}`);

  if (opt('report')) {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = ['id,level,hanzi,pinyin,english,meaning_vi_dang_dung,meaning_vi_hanzilevelup,meaning_vi_master,ly_do,meaning_vi'];
    items.filter((w) => w.needsReview).sort((a, b) => a.hskLevel - b.hskLevel || a.masterId - b.masterId)
      .forEach((w) => lines.push([w.masterId, w.hskLevel, w.hanzi, w.pinyin, w.meaningEn, w.meaningVi, w.viHlu, w.viMaster, w.reason, ''].map(esc).join(',')));
    writeFileSync(opt('report')!, '\uFEFF' + lines.join('\n'), 'utf-8');
    console.log(`Đã ghi danh sách cần duyệt: ${opt('report')} (điền cột cuối "meaning_vi", rồi nạp lại bằng --overrides).`);
  }
  if (!flag('apply')) { console.log('\nĐây là bản xem trước, chưa ghi gì vào database. Thêm --apply để ghi.'); return; }

  const url = new URL(process.env.DATABASE_URL as string);
  const local = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(url.hostname);
  if (!local && !flag('allow-remote')) { console.error(`DATABASE_URL trỏ tới "${url.hostname}", không phải máy local. Dừng lại để không đụng dữ liệu thật.`); process.exit(1); }
  if (flag('fresh') && !local) { console.error('--fresh chỉ chạy được trên database local.'); process.exit(1); }

  const prisma = new PrismaClient({ adapter: new PrismaMariaDb(dbConfig()) });
  try {
    if (flag('fresh')) { const d = await prisma.word.deleteMany(); console.log(`--fresh: đã xoá ${d.count} từ cũ (và dữ liệu phụ thuộc).`); }
    const existing = await prisma.word.findMany();
    const idx = new Map<string, (typeof existing)[number]>();
    existing.forEach((w) => idx.set(`${w.hanzi}|${w.hskLevel}|${(w.pinyin ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '')}`, w));
    const toCreate: Record<string, unknown>[] = []; let updated = 0;
    for (const m of items) {
      const data = { hanzi: m.hanzi, traditional: m.traditional, pinyin: m.pinyin, meaningVi: m.meaningVi, meaningEn: m.meaningEn, pos: m.pos, hanviet: m.hanviet, hskLevel: m.hskLevel, frequency: m.frequency, radical: m.radical, audioUrl: m.audioUrl };
      const key = `${m.hanzi}|${m.hskLevel}|${(m.pinyin ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '')}`;
      const cur = idx.get(key);
      if (!cur) { toCreate.push(data); continue; }
      const patch: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(data)) {
        if (v === null || k === 'hanzi' || k === 'hskLevel') continue;
        const old = (cur as Record<string, unknown>)[k];
        if (flag('overwrite') || old === null || old === undefined || old === '') patch[k] = v;
      }
      if (Object.keys(patch).length) { await prisma.word.update({ where: { id: cur.id }, data: patch }); updated++; }
    }
    for (let i = 0; i < toCreate.length; i += 500) await prisma.word.createMany({ data: toCreate.slice(i, i + 500) as never });
    console.log(`Xong: thêm mới ${toCreate.length} từ, bổ sung dữ liệu cho ${updated} từ đã có.`);
  } finally { await prisma.$disconnect(); }
}
main().catch((e) => { console.error(e); process.exit(1); });
