import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { dbConfig } from '../src/prisma/db-config';

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(dbConfig()) });
const DATA = join(__dirname, '../../data');
const SOURCE = 'tự biên soạn';
const num = (v: string) => (v === '' || v == null ? null : Number.parseInt(v, 10));
const str = (v: string) => (v === '' || v == null ? null : v);

async function seedWords() {
  const existing = await prisma.word.count();
  if (existing > 0 && !process.env.FORCE && !process.argv.includes('--force')) {
    console.log(`Bảng words đã có ${existing} từ, giữ nguyên. Chạy npm run seed:force để xoá và nạp lại.`);
    return;
  }
  if (existing > 0) await prisma.word.deleteMany();

  const rows: Record<string, string>[] = parse(readFileSync(join(DATA, 'words_import.csv'), 'utf-8'), { columns: true, skip_empty_lines: true });
  const data = rows.map((r) => ({
    hanzi: r.hanzi,
    traditional: str(r.traditional),
    pinyin: str(r.pinyin),
    meaningVi: str(r.meaning_vi),
    meaningEn: str(r.meaning_en),
    pos: str(r.pos),
    hskLevel: num(r.hsk_level),
    hskOld: num(r.hsk_old),
    frequency: num(r.frequency) ?? 999999999, // chưa có dữ liệu: xếp cuối
    radical: str(r.radical),
  }));
  for (let i = 0; i < data.length; i += 500) await prisma.word.createMany({ data: data.slice(i, i + 500) });
  console.log(`Đã nạp ${data.length} từ vựng.`);
}

type Sentence = { word: string; level: number; hanzi: string; tokens: string; pinyin: string; meaningVi: string };
type GrammarSrc = {
  level: number; order: number; title: string; pattern: string; explanation: string; notes: string | null;
  examples: { hanzi: string; pinyin: string; meaningVi: string }[];
};

async function seedContent() {
  // Câu ví dụ (dùng cho bài điền từ, sắp xếp câu và trang chi tiết từ)
  const words = await prisma.word.findMany({ select: { id: true, hanzi: true, hskLevel: true }, orderBy: { id: 'asc' } });
  const byHanzi = new Map<string, number>();
  for (const w of words) if (w.hskLevel && w.hskLevel <= 3 && !byHanzi.has(w.hanzi)) byHanzi.set(w.hanzi, w.id);

  const sentences: Sentence[] = JSON.parse(readFileSync(join(DATA, 'sentences.json'), 'utf-8'));
  await prisma.example.deleteMany({ where: { source: SOURCE } });
  const examples = sentences
    .filter((s) => byHanzi.has(s.word))
    .map((s) => ({ wordId: byHanzi.get(s.word) as number, hanzi: s.hanzi, pinyin: s.pinyin, meaningVi: s.meaningVi, tokens: s.tokens, source: SOURCE }));
  if (examples.length) await prisma.example.createMany({ data: examples });
  console.log(`Đã nạp ${examples.length} câu ví dụ.`);

  // Ngữ pháp
  const grammar: GrammarSrc[] = JSON.parse(readFileSync(join(DATA, 'grammar.json'), 'utf-8'));
  // Bảo vệ dữ liệu: nếu đã có ngữ pháp (kể cả bản nhập bằng import-grammar) thì không xoá nạp lại.
  // Muốn nạp lại từ đầu hãy xoá bảng grammar_points thủ công hoặc dùng `npm run import:grammar`.
  if ((await prisma.grammarPoint.count()) > 0) {
    console.log('Đã có dữ liệu ngữ pháp, bỏ qua bước nạp ngữ pháp trong seed.');
    return;
  }
  for (const g of grammar) {
    await prisma.grammarPoint.create({
      data: {
        level: g.level, sortOrder: g.order, title: g.title, pattern: g.pattern,
        explanation: g.explanation, notes: g.notes ?? null,
        examples: { create: g.examples.map((e) => ({ hanzi: e.hanzi, pinyin: e.pinyin, meaningVi: e.meaningVi })) },
      },
    });
  }
  console.log(`Đã nạp ${grammar.length} điểm ngữ pháp.`);
}

async function main() {
  await seedWords();
  await seedContent();
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
