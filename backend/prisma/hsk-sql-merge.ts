import { Cell } from './sql-dump';

// ---------- hsk_master_ultimate.sql: bảng hsk_vocabulary (16 cột) ----------
// id, level, hanzi, traditional, radical, frequency, classifiers, pinyin, pinyin_tone, pinyin_num, pos, pos_vn, han_viet, vietnamese, english, tts_url
// ---------- hanzilevelup_vocab.sql: bảng hsk_vocab (16 cột) ----------
// id, simplified, traditional, pinyin, pinyin_html, han_viet, pos_vn, meaning_vi, meaning_en, meaning_html, counter, homophones, hsk_level, hanzi_level, all_hanzi_level, tts_url

export type Master = { id: number; level: number; hanzi: string; traditional: string | null; radical: string | null; frequency: number | null; pinyinTone: string | null; pos: string | null; posVn: string | null; hanViet: string | null; vietnamese: string | null; english: string | null; tts: string | null };
export type Hlu = { id: number; hanzi: string; pinyin: string | null; hanViet: string | null; posVn: string | null; meaningVi: string | null; meaningEn: string | null; level: number | null };

const s = (c: Cell) => (typeof c === 'string' && c.trim() !== '' ? c.trim() : null);
const n = (c: Cell) => (typeof c === 'number' ? c : null);

export const toMaster = (r: Cell[]): Master => ({ id: n(r[0]) ?? 0, level: n(r[1]) ?? 0, hanzi: s(r[2]) ?? '', traditional: s(r[3]), radical: s(r[4]), frequency: n(r[5]), pinyinTone: s(r[8]), pos: s(r[10]), posVn: s(r[11]), hanViet: s(r[12]), vietnamese: s(r[13]), english: s(r[14]), tts: s(r[15]) });
export const toHlu = (r: Cell[]): Hlu => ({ id: n(r[0]) ?? 0, hanzi: s(r[1]) ?? '', pinyin: s(r[3]), hanViet: s(r[5]), posVn: s(r[6]), meaningVi: s(r[7]), meaningEn: s(r[8]), level: n(r[12]) });

/** Bỏ dấu thanh và khoảng trắng để so khớp pinyin giữa hai file */
export const pyKey = (p: string | null) => (p ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');

// Mã loại từ của file (chữ Hán) -> mã mà frontend đang có nhãn tiếng Việt (lib/pos.ts)
const POS: Record<string, string> = { 动: 'v', 名: 'n', 形: 'a', 副: 'd', 量: 'q', 连: 'c', 代: 'r', 介: 'p', 数: 'm', 助: 'u', 叹: 'e', 区别: 'b', 关联: 'c', 数量: 'mq' };
export function mapPos(pos: string | null, posVn: string | null): string | null {
  if (pos) {
    const codes = pos.split('/').map((x) => POS[x.trim()]).filter(Boolean);
    if (codes.length) return Array.from(new Set(codes)).join(',');
  }
  if (posVn && /thành ngữ|cụm/i.test(posVn)) return 'l';
  return null;
}

// Các mục "nghĩa" chỉ gồm từ chức năng (của, tại, ở, trên, chúng tôi...) là dấu hiệu bản dịch từng-từ bị sai
const FUNC = new Set(['của', 'tại', 'ở', 'trên', 'trong', 'bên trong', 'chúng tôi', 'tôi', 'mình', 'và', 'không', 'nó', 'anh ấy', 'cô ấy', 'bây giờ', 'một', 'người', 'con trai', 'mưa', 'công việc', 'làm việc', 'năm', 'đều', 'tất cả']);
export function looksBroken(vi: string | null): boolean {
  const items = (vi ?? '').split(/[,;]/).map((x) => x.trim().toLowerCase()).filter(Boolean);
  if (!items.length) return true;
  return items.filter((x) => FUNC.has(x)).length >= Math.max(1, Math.floor(items.length / 2));
}
/** Nghĩa tiếng Việt trùng nguyên văn với tiếng Anh nghĩa là chưa được dịch */
export const untranslated = (vi: string | null, en: string | null) => !!vi && !!en && vi.trim().toLowerCase() === en.trim().toLowerCase();

export type Merged = {
  masterId: number; hanzi: string; traditional: string | null; radical: string | null; pinyin: string | null; pos: string | null;
  hanviet: string | null; meaningVi: string | null; meaningEn: string | null; hskLevel: number; frequency: number; audioUrl: string | null;
  viSource: 'override' | 'hanzilevelup' | 'master' | 'none'; needsReview: boolean; reason: string; viMaster: string | null; viHlu: string | null;
};

const radicalOk = (r: string | null) => (r && r.length <= 8 ? r : null);

const validUrl = (u: string | null) =>
  u && /^https?:\/\//i.test(u.trim()) && u.trim().length <= 500
    ? u.trim()
    : null;


export function merge(master: Master[], hlu: Hlu[], overrides: Map<number, string>): Merged[] {
  const byExact = new Map<string, Hlu>();
  const byLevel = new Map<string, Hlu[]>();
  const byHanzi = new Map<string, Hlu[]>();
  for (const h of hlu) {
    byExact.set(`${h.hanzi}|${h.level}|${pyKey(h.pinyin)}`, h);
    (byLevel.get(`${h.hanzi}|${h.level}`) ?? byLevel.set(`${h.hanzi}|${h.level}`, []).get(`${h.hanzi}|${h.level}`)!).push(h);
    (byHanzi.get(h.hanzi) ?? byHanzi.set(h.hanzi, []).get(h.hanzi)!).push(h);
  }
  return master.map((m) => {
    const exact = byExact.get(`${m.hanzi}|${m.level}|${pyKey(m.pinyinTone)}`);
    const lv = byLevel.get(`${m.hanzi}|${m.level}`);
    const any = byHanzi.get(m.hanzi);
    const h = exact ?? (lv && lv.length === 1 ? lv[0] : undefined) ?? (any && any.length === 1 ? any[0] : undefined);

    let vi: string | null = null; let src: Merged['viSource'] = 'none'; let reason = '';
    const ov = overrides.get(m.id);
    if (ov) { vi = ov; src = 'override'; }
    else if (h?.meaningVi && !looksBroken(h.meaningVi) && !untranslated(h.meaningVi, h.meaningEn)) { vi = h.meaningVi; src = 'hanzilevelup'; }
    else if (m.vietnamese && !looksBroken(m.vietnamese) && !untranslated(m.vietnamese, m.english)) { vi = m.vietnamese; src = 'master'; }
    else {
      // cả hai nguồn đều đáng ngờ: vẫn giữ bản của hanzilevelup (ít sai hơn) nhưng đánh dấu cần duyệt
      vi = h?.meaningVi ?? m.vietnamese ?? null; src = h?.meaningVi ? 'hanzilevelup' : m.vietnamese ? 'master' : 'none';
      reason = !vi ? 'không có nghĩa' : looksBroken(vi) ? 'nghĩa toàn từ chức năng (dịch từng từ bị sai)' : 'nghĩa trùng tiếng Anh (chưa dịch)';
    }
    if (!reason && m.posVn && /thành ngữ/i.test(m.posVn)) reason = 'thành ngữ, nên đọc lại nghĩa';
    const f = m.frequency;
    return {
      masterId: m.id, hanzi: m.hanzi, traditional: m.traditional, radical: radicalOk(m.radical), pinyin: m.pinyinTone ?? h?.pinyin ?? null,
      pos: mapPos(m.pos, m.posVn ?? h?.posVn ?? null), hanviet: m.hanViet ?? h?.hanViet ?? null, meaningVi: vi,
      meaningEn: m.english ?? h?.meaningEn ?? null, hskLevel: m.level,
      frequency: f !== null && f > 0 && f < 1_000_000 ? f : 999999999, // 0 và 1.000.000 là "chưa có dữ liệu", xếp cuối như seed hiện tại
      audioUrl: validUrl(m.tts), viSource: src, needsReview: !!reason, reason, viMaster: m.vietnamese, viHlu: h?.meaningVi ?? null,
    };
  });
}
