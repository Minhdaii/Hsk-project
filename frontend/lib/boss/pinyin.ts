/** So khớp pinyin cho game gõ pinyin. Hàm thuần, có kiểm thử độc lập. */

/** Bỏ dấu thanh, khoảng trắng, dấu nháy; ü, v và u đều quy về u (cùng quy ước với trò "Gõ pinyin" hiện có). */
export const normToneless = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '').replace(/v/g, 'u');

/** Chế độ yêu cầu dấu thanh: giữ nguyên dấu thanh, chỉ bỏ khoảng trắng, dấu nháy và phân biệt hoa thường. */
export const normStrict = (s: string) => s.normalize('NFC').toLowerCase().replace(/[\s'’\-]/g, '');

/** Đúng khi chuỗi nhập khớp ĐÚNG đáp án sau khi chuẩn hoá (không chấp nhận chuỗi chỉ "gần giống"). */
export function isPinyinMatch(input: string, answer: string, strictTones: boolean): boolean {
  if (strictTones) { const a = normStrict(answer); return a !== '' && normStrict(input) === a; }
  const a = normToneless(answer);
  return a !== '' && normToneless(input) === a;
}

/** Từ dùng được cho game: chỉ chữ Hán, pinyin là chữ Latinh (có thể có dấu thanh), độ dài vừa phải. */
export function isPlayableWord(w: { hanzi: string; pinyin: string | null }): boolean {
  if (!w.pinyin) return false;
  if (!/^[\u3400-\u9fff]{1,4}$/.test(w.hanzi)) return false;
  return /^[A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüÜ'’ ]+$/.test(w.pinyin) && normToneless(w.pinyin).length >= 1 && normToneless(w.pinyin).length <= 14;
}

export const BOSS_HP: Record<number, number> = { 1: 120, 2: 160, 3: 200 };
/** Sát thương: 10 cơ bản, mỗi lần trả lời đúng liên tiếp cộng thêm 2, tối đa +10 (từ combo 6 trở lên). */
export const damageFor = (combo: number) => 10 + Math.min(Math.max(combo - 1, 0), 5) * 2;
