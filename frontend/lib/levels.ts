// Màu nhận diện cho từng cấp HSK, dùng thống nhất ở mọi trang
export const LEVEL_STYLE: Record<number, { pill: string; grad: string; text: string; accent: string }> = {
  1: { pill: 'bg-emerald-50 text-emerald-700', grad: 'from-emerald-500 to-emerald-700', text: 'text-emerald-700', accent: 'border-l-emerald-500' },
  2: { pill: 'bg-sky-50 text-sky-700', grad: 'from-sky-500 to-sky-700', text: 'text-sky-700', accent: 'border-l-sky-500' },
  3: { pill: 'bg-rose-50 text-rose-700', grad: 'from-rose-500 to-rose-700', text: 'text-rose-700', accent: 'border-l-rose-500' },
};
export const levelPill = (l: number | null) => (l && LEVEL_STYLE[l] ? LEVEL_STYLE[l].pill : 'bg-stone-100 text-stone-600');
export const levelAccent = (l: number | null) => (l && LEVEL_STYLE[l] ? LEVEL_STYLE[l].accent : 'border-l-stone-300');
