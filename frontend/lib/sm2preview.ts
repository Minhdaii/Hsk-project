import type { ProgressRow } from './types';

export type Rating = 0 | 1 | 2 | 3; // Quên | Khó | Tốt | Dễ
const QUALITY = [1, 3, 4, 5];

/** Ước tính số ngày đến lần ôn kế tiếp (khớp với thuật toán SM-2 ở backend). null = học lại ngay trong phiên */
export function nextIntervalDays(p: Pick<ProgressRow, 'easeFactor' | 'interval' | 'repetitions'> | null, rating: Rating): number | null {
  if (QUALITY[rating] < 3) return null;
  const ease = p?.easeFactor ?? 2.5;
  const interval = p?.interval ?? 0;
  const reps = (p?.repetitions ?? 0) + 1;
  let d = reps === 1 ? 1 : reps === 2 ? 6 : Math.max(1, Math.round(interval * ease));
  if (rating === 3) d = Math.round(d * 1.3);
  return d;
}

export function intervalLabel(days: number | null): string {
  if (days === null) return 'Học lại';
  if (days < 30) return `${days} ngày`;
  if (days < 365) return `${Math.round(days / 30)} tháng`;
  return `${Math.round(days / 365)} năm`;
}
