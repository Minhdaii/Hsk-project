// Mỗi cấp HSK chỉ khác nhau về độ đậm của một màu lavender (không dùng cầu vồng nhiều màu),
// để màu nhấn còn giữ nghĩa "đang chọn / tiến độ" thay vì phân loại.
export const LEVEL_STYLE: Record<number, { pill: string; grad: string; text: string; accent: string }> = {
  1: { pill: 'bg-brand-soft text-brand-ink', grad: 'bg-brand/30', text: 'text-brand-ink', accent: 'border-l-brand/50' },
  2: { pill: 'bg-brand-soft text-brand-ink', grad: 'bg-brand/60', text: 'text-brand-ink', accent: 'border-l-brand' },
  3: { pill: 'bg-brand-soft text-brand-ink', grad: 'bg-brand', text: 'text-brand-ink', accent: 'border-l-brand-ink' },
};
export const levelPill = (l: number | null) => (l && LEVEL_STYLE[l] ? LEVEL_STYLE[l].pill : 'bg-stone-100 text-stone-600');
export const levelAccent = (l: number | null) => (l && LEVEL_STYLE[l] ? LEVEL_STYLE[l].accent : 'border-l-stone-300');
