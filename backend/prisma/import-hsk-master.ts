import 'dotenv/config';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { dbConfig } from '../src/prisma/db-config';
import { mapRow, WordData } from './hsk-master-map';

/**
 * Nhập hsk_master_ultimate.csv vào bảng words mà KHÔNG xoá dữ liệu đang có.
 *
 *   Xem trước (không kết nối database):   npx ts-node prisma/import-hsk-master.ts data/hsk_master_ultimate.csv
 *   Ghi thật (chỉ database local):        npx ts-node prisma/import-hsk-master.ts data/hsk_master_ultimate.csv --apply
 *
 * Tuỳ chọn:
 *   --freq-mode rank|count  rank (mặc định): frequency là thứ hạng, số nhỏ = thông dụng (đúng quy ước của bảng words).
 *                           count: frequency là số lần xuất hiện, sẽ đảo lại để số nhỏ = thông dụng.
 *   --overwrite             ghi đè cả những cột đã có dữ liệu (mặc định chỉ điền cột đang trống)
 *   --allow-remote          cho phép ghi vào database không phải localhost (mặc định BỊ CHẶN để tránh đụng production)
 *
 * Khoá nhận diện: (hanzi, hsk_level). Từ đã có thì chỉ điền các cột trống, từ chưa có thì thêm mới.
 */
const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const flag = (n: string) => args.includes(`--${n}`);
const opt = (n: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };

async function main() {
  if (!file) { console.error('Thiếu đường dẫn file CSV.'); process.exit(1); }
  const freqMode = (opt('freq-mode') ?? 'rank') as 'rank' | 'count';
  if (!['rank', 'count'].includes(freqMode)) { console.error('--freq-mode chỉ nhận rank hoặc count'); process.exit(1); }

  const raw = readFileSync(file, 'utf-8').replace(/^\uFEFF/, '');
  const rows: Record<string, string>[] = parse(raw, { columns: true, skip_empty_lines: true, trim: true });
  const need = ['level', 'hanzi', 'pinyin_tone', 'vietnamese'];
  const missing = need.filter((c) => !(c in (rows[0] ?? {})));
  if (missing.length) { console.error(`CSV thiếu cột: ${missing.join(', ')}. Các cột tìm thấy: ${Object.keys(rows[0] ?? {}).join(', ')}`); process.exit(1); }

  const maxCount = Math.max(0, ...rows.map((r) => Number.parseFloat(r.frequency)).filter(Number.isFinite));
  const items: WordData[] = [];
  const skipped: string[] = [];
  const warns: string[] = [];
  const seen = new Set<string>();
  rows.forEach((r, i) => {
    const { data, warn } = mapRow(r, { freqMode, maxCount });
    warn.forEach((w) => warns.push(`dòng ${i + 2}: ${w}`));
    if (!data) { skipped.push(`dòng ${i + 2}: ${warn.join('; ')}`); return; }
    const k = `${data.hanzi}|${data.hskLevel}`;
    if (seen.has(k)) { skipped.push(`dòng ${i + 2}: trùng ${data.hanzi} (HSK ${data.hskLevel})`); return; }
    seen.add(k); items.push(data);
  });

  const byLevel: Record<number, number> = {};
  items.forEach((w) => { byLevel[w.hskLevel] = (byLevel[w.hskLevel] ?? 0) + 1; });
  const freqs = items.map((w) => w.frequency).filter((f): f is number => f !== null);
  console.log(`Đọc ${rows.length} dòng, hợp lệ ${items.length}, bỏ qua ${skipped.length}, cảnh báo ${warns.length}.`);
  console.log('Theo cấp:', byLevel);
  console.log(`Thiếu: pinyin ${items.filter((w) => !w.pinyin).length}, nghĩa Việt ${items.filter((w) => !w.meaningVi).length}, phồn thể ${items.filter((w) => !w.traditional).length}, âm Hán Việt ${items.filter((w) => !w.hanviet).length}, audio ${items.filter((w) => !w.audioUrl).length}`);
  if (freqs.length) console.log(`frequency (${freqMode}) sau khi ánh xạ: nhỏ nhất ${Math.min(...freqs)}, lớn nhất ${Math.max(...freqs)}. Hãy kiểm tra có đúng quy ước "số nhỏ = thông dụng" không.`);
  skipped.slice(0, 10).forEach((s) => console.log('  bỏ qua', s));
  warns.slice(0, 10).forEach((s) => console.log('  cảnh báo', s));

  if (!flag('apply')) { console.log('\nĐây là bản xem trước, chưa ghi gì vào database. Thêm --apply để ghi.'); return; }

  const url = new URL(process.env.DATABASE_URL as string);
  const local = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(url.hostname);
  if (!local && !flag('allow-remote')) {
    console.error(`DATABASE_URL trỏ tới "${url.hostname}", không phải máy local. Dừng lại để không đụng dữ liệu thật. Nếu chắc chắn, thêm --allow-remote.`);
    process.exit(1);
  }

  const prisma = new PrismaClient({ adapter: new PrismaMariaDb(dbConfig()) });
  try {
    const existing = await prisma.word.findMany();
    const index = new Map(existing.map((w) => [`${w.hanzi}|${w.hskLevel}`, w]));
    const toCreate: WordData[] = [];
    let updated = 0;
    for (const w of items) {
      const cur = index.get(`${w.hanzi}|${w.hskLevel}`);
      if (!cur) { toCreate.push(w); continue; }
      const patch: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(w)) {
        if (v === null || k === 'hanzi' || k === 'hskLevel') continue;
        const old = (cur as Record<string, unknown>)[k];
        if (flag('overwrite') || old === null || old === undefined || old === '') patch[k] = v;
      }
      if (Object.keys(patch).length) { await prisma.word.update({ where: { id: cur.id }, data: patch }); updated++; }
    }
    for (let i = 0; i < toCreate.length; i += 500) await prisma.word.createMany({ data: toCreate.slice(i, i + 500) });
    console.log(`Xong: thêm mới ${toCreate.length} từ, bổ sung dữ liệu cho ${updated} từ đã có. Không xoá bản ghi nào.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
