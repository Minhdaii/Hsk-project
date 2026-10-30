import { Cell } from './sql-dump';

// category_vocab (hanzilevelup_vocab.sql): id, en_name, vi_name, hanzi, pinyin, meaning_vi, meaning_en, han_viet, level
export type CatRow = { enName: string | null; viName: string; hanzi: string; pinyin: string | null };
export const toCatRow = (r: Cell[]): CatRow => ({
  enName: typeof r[1] === 'string' ? r[1] : null, viName: String(r[2] ?? '').trim(), hanzi: String(r[3] ?? '').trim(), pinyin: typeof r[4] === 'string' ? r[4] : null,
});

export type CategoryDef = { slug: string; name: string; parent: string | null; sortOrder: number; description: string | null };
export type CategoryMap = { map: Record<string, string>; skip: string[] };

/** Bỏ dấu tiếng Việt và ký tự lạ để tạo slug ổn định, dùng được trong URL */
export const slugify = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
    .replace(/&/g, ' va ').replace(/[^a-z0-9\u3400-\u9fff]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'muc';

export const pyKey = (p: string | null | undefined) => (p ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');

export type PlanWord = { id: number; hanzi: string; pinyin: string | null };
export type Plan = {
  childDefs: CategoryDef[];                     // danh mục con sẽ tạo
  links: { wordId: number; slug: string }[];    // liên kết từ - danh mục (đã khử trùng)
  stats: {
    rows: number; skippedRows: number; unmappedNames: string[]; childCount: number;
    matchedRows: number; unmatchedRows: number; duplicateLinks: number; ambiguousHanzi: number;
  };
  unmatchedSample: string[];
};

/**
 * Lập kế hoạch nhập danh mục (hàm thuần, không đụng database):
 * - danh mục con = mỗi tên trong category_vocab đã ánh xạ, đặt dưới danh mục cha tương ứng
 * - từ trong danh mục được nối với từ vựng đã có theo chữ Hán (ưu tiên khớp cả pinyin)
 * - mục không khớp từ nào chỉ được thống kê, KHÔNG tự tạo từ mới
 */
export function planCategories(rows: CatRow[], cm: CategoryMap, words: PlanWord[]): Plan {
  const byHanzi = new Map<string, PlanWord[]>();
  words.forEach((w) => (byHanzi.get(w.hanzi) ?? byHanzi.set(w.hanzi, []).get(w.hanzi)!).push(w));
  const skip = new Set(cm.skip);
  const usedSlugs = new Set<string>();
  const slugOf = new Map<string, string>();
  const childDefs: CategoryDef[] = [];
  const names = Array.from(new Set(rows.map((r) => r.viName))).filter((n) => cm.map[n]);
  names.sort((a, b) => a.localeCompare(b, 'vi'));
  names.forEach((n, i) => {
    let s = slugify(n); let k = 2;
    while (usedSlugs.has(s)) s = `${slugify(n)}-${k++}`;
    usedSlugs.add(s); slugOf.set(n, s);
    childDefs.push({ slug: s, name: n, parent: cm.map[n], sortOrder: i + 1, description: null });
  });

  const seen = new Set<string>();
  const links: Plan['links'] = [];
  const unmapped = new Set<string>(); const unmatchedSample: string[] = [];
  let skippedRows = 0, matched = 0, unmatched = 0, dup = 0, ambiguous = 0;
  for (const r of rows) {
    if (skip.has(r.viName)) { skippedRows++; continue; }
    const slug = slugOf.get(r.viName);
    if (!slug) { unmapped.add(r.viName); skippedRows++; continue; }
    const cands = byHanzi.get(r.hanzi);
    if (!cands) { unmatched++; if (unmatchedSample.length < 15) unmatchedSample.push(`${r.hanzi} (${r.viName})`); continue; }
    let pick = cands.filter((c) => pyKey(c.pinyin) === pyKey(r.pinyin));
    if (!pick.length) pick = cands;
    if (cands.length > 1) ambiguous++;
    matched++;
    for (const w of pick) {
      const key = `${w.id}|${slug}`;
      if (seen.has(key)) { dup++; continue; }
      seen.add(key); links.push({ wordId: w.id, slug });
    }
  }
  return { childDefs, links, unmatchedSample, stats: { rows: rows.length, skippedRows, unmappedNames: Array.from(unmapped), childCount: childDefs.length, matchedRows: matched, unmatchedRows: unmatched, duplicateLinks: dup, ambiguousHanzi: ambiguous } };
}
