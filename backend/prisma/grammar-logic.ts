// Gộp và kiểm tra dữ liệu ngữ pháp (hàm thuần, không đụng database)
export type BaseExample = { hanzi: string; tokens?: string; pinyin?: string; meaningVi?: string };
export type BasePoint = { level: number; order: number; title: string; pattern: string; explanation: string; notes?: string; examples: BaseExample[] };
export type Mistake = { wrong: string; right: string; rightTokens: string; rightPinyin: string; rightVi: string; why: string };
export type Enrich = { slug: string; titleZh: string; category: string; keywords: string[]; related: string[]; mistakes: Mistake[] };
export type NewPoint = { slug: string; level: number; title: string; titleZh: string; category: string; pattern: string; explanation: string; notes: string; keywords: string[]; related: string[]; examples: { hanzi: string; tokens: string; pinyin: string; meaningVi: string; explanationVi: string | null }[]; mistakes: Mistake[] };
export type Extra = { enrich: Record<string, Enrich>; newPoints: NewPoint[] };

export type OutExample = { legacyHanzi?: string; hanzi: string; tokens: string | null; pinyin: string | null; meaningVi: string | null; explanationVi: string | null; isCorrect: boolean; correctedHanzi: string | null; errorExplanation: string | null; sortOrder: number };
export type OutPoint = {
  slug: string; level: number; sortOrder: number; title: string; titleZh: string | null; category: string | null; keywords: string; pattern: string; explanation: string;
  notes: string | null; commonMistakes: string | null; source: 'imported' | 'authored'; examples: OutExample[]; related: string[];
};
export type Issue = { slug: string; level: 'error' | 'warn'; message: string };

const CJK = /[\u3400-\u9fff]/;
const FULL: Record<string, string> = { ',': '，', '?': '？', '!': '！', ';': '；', ':': '：' };
/** Chuẩn hoá dấu câu ASCII lẫn trong câu tiếng Trung sang dấu toàn chiều rộng (dữ liệu gốc có vài câu bị lẫn) */
/** Bỏ khoảng trắng thừa trước dấu câu trong pinyin sinh tự động: "méi qù 。" → "méi qù。" */
export const normPinyin = (s: string | null | undefined) => (s ? s.replace(/\s+([，。？！、；：,.?!;:])/g, '$1').replace(/([,.?!;:])(?=\S)/g, '$1 ').replace(/\s+$/, '') : null);
export const normZh = (s: string) => (CJK.test(s) ? s.replace(/[,?!;:]/g, (c) => FULL[c]).replace(/\.$/, '。') : s);

export function buildPoints(base: BasePoint[], extra: Extra): { points: OutPoint[]; issues: Issue[] } {
  const issues: Issue[] = [];
  const points: OutPoint[] = [];
  const mistakeText = (ms: Mistake[]) => (ms.length ? ms.map((m) => `Sai: ${m.wrong} | Đúng: ${m.right} | ${m.why}`).join('\n') : null);
  const addMistakes = (out: OutPoint, ms: Mistake[], idx: number) => {
    let n = idx;
    for (const m of ms) {
      if (!out.examples.some((e) => e.isCorrect && e.hanzi === m.right)) {
        out.examples.push({ hanzi: m.right, tokens: m.rightTokens, pinyin: normPinyin(m.rightPinyin), meaningVi: m.rightVi, explanationVi: null, isCorrect: true, correctedHanzi: null, errorExplanation: null, sortOrder: n++ });
      }
      out.examples.push({ hanzi: m.wrong, tokens: null, pinyin: null, meaningVi: m.rightVi, explanationVi: null, isCorrect: false, correctedHanzi: m.right, errorExplanation: m.why, sortOrder: 900 + n++ });
    }
  };

  const legacy = new Map<string, string>();
  // chuẩn hoá trước khi gộp; mỗi câu bị đổi sẽ được ghi vào báo cáo
  for (const b of base) b.examples.forEach((e) => {
    const h = normZh(e.hanzi);
    if (h !== e.hanzi) { legacy.set(`${b.order}|${h}`, e.hanzi); issues.push({ slug: `order-${b.order}`, level: 'warn', message: `đã chuẩn hoá dấu câu: ${e.hanzi} → ${h}` }); e.hanzi = h; if (e.tokens) e.tokens = normZh(e.tokens); }
  });
  for (const b of base) {
    const en = extra.enrich[String(b.order)];
    if (!en) { issues.push({ slug: `order-${b.order}`, level: 'error', message: `Thiếu dữ liệu bổ sung (slug, loại) cho "${b.title}"` }); continue; }
    const out: OutPoint = {
      slug: en.slug, level: b.level, sortOrder: b.order, title: b.title, titleZh: en.titleZh, category: en.category, keywords: en.keywords.join(' '),
      pattern: b.pattern, explanation: b.explanation, notes: b.notes ?? null, commonMistakes: mistakeText(en.mistakes), source: 'imported', related: en.related,
      examples: b.examples.map((e, i) => ({ legacyHanzi: legacy.get(`${b.order}|${e.hanzi}`), hanzi: e.hanzi, tokens: e.tokens ?? null, pinyin: normPinyin(e.pinyin), meaningVi: e.meaningVi ?? null, explanationVi: null, isCorrect: true, correctedHanzi: null, errorExplanation: null, sortOrder: i + 1 })),
    };
    addMistakes(out, en.mistakes, b.examples.length + 1);
    points.push(out);
  }
  extra.newPoints.forEach((n, i) => {
    const out: OutPoint = {
      slug: n.slug, level: n.level, sortOrder: 100 + i, title: n.title, titleZh: n.titleZh, category: n.category, keywords: n.keywords.join(' '), pattern: n.pattern,
      explanation: n.explanation, notes: n.notes, commonMistakes: mistakeText(n.mistakes), source: 'authored', related: n.related,
      examples: n.examples.map((e, k) => ({ hanzi: e.hanzi, tokens: e.tokens, pinyin: normPinyin(e.pinyin), meaningVi: e.meaningVi, explanationVi: e.explanationVi, isCorrect: true, correctedHanzi: null, errorExplanation: null, sortOrder: k + 1 })),
    };
    addMistakes(out, n.mistakes, n.examples.length + 1);
    points.push(out);
  });

  // ---------- kiểm tra ----------
  const slugs = new Map<string, number>();
  const seenSentence = new Map<string, string>();
  for (const p of points) {
    slugs.set(p.slug, (slugs.get(p.slug) ?? 0) + 1);
    const err = (m: string) => issues.push({ slug: p.slug, level: 'error', message: m });
    const warn = (m: string) => issues.push({ slug: p.slug, level: 'warn', message: m });
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) err('slug không hợp lệ');
    if (p.level < 0 || p.level > 3) err(`level ${p.level} ngoài phạm vi 0-3`);
    if (!p.title.trim() || !p.pattern.trim() || !p.explanation.trim()) err('thiếu tiêu đề, công thức hoặc giải thích');
    const good = p.examples.filter((e) => e.isCorrect);
    if (good.length < 2) warn(`chỉ có ${good.length} ví dụ đúng`);
    const own = new Set<string>();
    for (const e of p.examples) {
      if (own.has(e.hanzi)) err(`câu trùng trong cùng cấu trúc: ${e.hanzi}`); own.add(e.hanzi);
      if (!CJK.test(e.hanzi)) err(`câu không có chữ Hán: ${e.hanzi}`);
      if (e.isCorrect) {
        if (!e.meaningVi) err(`thiếu bản dịch: ${e.hanzi}`);
        if (!e.pinyin) warn(`thiếu pinyin: ${e.hanzi}`);
        if (!e.tokens) warn(`thiếu tách từ (không dùng được cho bài sắp xếp): ${e.hanzi}`);
        else if (e.tokens.replace(/\s+/g, '') !== e.hanzi) err(`tách từ không khớp câu: ${e.hanzi}`);
        const other = seenSentence.get(e.hanzi);
        if (other && other !== p.slug) warn(`câu cũng xuất hiện ở "${other}": ${e.hanzi}`); else seenSentence.set(e.hanzi, p.slug);
      } else if (!e.correctedHanzi || !e.errorExplanation) err(`câu sai thiếu câu sửa hoặc giải thích: ${e.hanzi}`);
    }
    const kws = p.keywords.split(' ').filter(Boolean);
    if (!kws.length) warn('chưa có từ khoá (không tạo được bài điền từ)');
    else if (!good.some((e) => e.tokens && e.tokens.split(' ').some((t) => kws.includes(t)))) warn('không ví dụ nào chứa từ khoá (không tạo được bài điền từ)');
  }
  for (const [s, c] of slugs) if (c > 1) issues.push({ slug: s, level: 'error', message: `slug trùng ${c} lần` });
  const known = new Set(slugs.keys());
  for (const p of points) for (const r of p.related) if (!known.has(r)) issues.push({ slug: p.slug, level: 'error', message: `cấu trúc liên quan không tồn tại: ${r}` });
  return { points, issues };
}
