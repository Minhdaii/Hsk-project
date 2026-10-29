// Ánh xạ một dòng của hsk_master_ultimate.csv sang các cột của bảng words (hàm thuần, không đụng database)
//
// CSV                 -> words
// level               -> hsk_level        (1-6)
// hanzi               -> hanzi
// traditional         -> traditional
// radical             -> radical          (tối đa 8 ký tự)
// frequency           -> frequency        (xem --freq-mode)
// pinyin_tone         -> pinyin           (có dấu thanh; nếu trống mới dùng cột pinyin)
// pos                 -> pos
// han_viet            -> hanviet
// vietnamese          -> meaning_vi
// english             -> meaning_en
// tts_url             -> audio_url        (chỉ nhận http(s):// hoặc đường dẫn bắt đầu bằng /)
// id, classifiers, pinyin_num, pos_vn: chưa có cột tương ứng nên bỏ qua (pos_vn đã có bảng nhãn ở frontend theo mã pos)
export type WordData = {
  hanzi: string; traditional: string | null; pinyin: string | null; meaningVi: string | null; meaningEn: string | null;
  pos: string | null; hanviet: string | null; hskLevel: number; frequency: number | null; radical: string | null; audioUrl: string | null;
};
export type MapOpts = { freqMode: 'rank' | 'count'; maxCount: number };

const clean = (v: string | undefined) => { const t = (v ?? '').trim(); return t === '' ? null : t; };
const cut = (v: string | null, n: number) => (v && v.length > n ? v.slice(0, n) : v);

export function mapRow(r: Record<string, string>, o: MapOpts): { data: WordData | null; warn: string[] } {
  const warn: string[] = [];
  const hanzi = clean(r.hanzi);
  const level = Number.parseInt((r.level ?? '').trim(), 10);
  if (!hanzi) return { data: null, warn: ['thiếu hanzi'] };
  if (!Number.isInteger(level) || level < 1 || level > 6) return { data: null, warn: [`level không hợp lệ: "${r.level}"`] };
  if (Array.from(hanzi).length > 64) return { data: null, warn: ['hanzi quá dài'] };

  let frequency: number | null = null;
  const f = Number.parseFloat((r.frequency ?? '').trim());
  if (Number.isFinite(f)) frequency = o.freqMode === 'count' ? Math.max(1, Math.round(o.maxCount - f + 1)) : Math.round(f);

  let radical = clean(r.radical);
  if (radical && radical.length > 8) { warn.push('radical dài hơn 8 ký tự, bỏ qua'); radical = null; }

  const tts = clean(r.tts_url);
  const audioUrl = tts && /^(https?:\/\/|\/)/.test(tts) && tts.length <= 500 ? tts : null;
  if (tts && !audioUrl) warn.push('tts_url không hợp lệ, bỏ qua');

  return {
    warn,
    data: {
      hanzi, hskLevel: level, frequency, radical, audioUrl,
      traditional: cut(clean(r.traditional), 64),
      pinyin: cut(clean(r.pinyin_tone) ?? clean(r.pinyin), 128),
      meaningVi: clean(r.vietnamese), meaningEn: clean(r.english),
      pos: cut(clean(r.pos), 64), hanviet: cut(clean(r.han_viet), 128),
    },
  };
}
