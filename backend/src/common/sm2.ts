import { addDays, today } from './dates';

// Thuật toán lặp lại ngắt quãng SM-2. rating: 0 Quên, 1 Khó, 2 Tốt, 3 Dễ
const QUALITY = [1, 3, 4, 5];

export function sm2(
  p: { easeFactor: number; interval: number; repetitions: number },
  rating: number,
) {
  const q = QUALITY[rating];
  let { easeFactor, interval, repetitions } = p;
  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.max(1, Math.round(interval * easeFactor));
    if (rating === 3) interval = Math.round(interval * 1.3);
  }
  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  return { easeFactor, interval, repetitions, dueDate: addDays(today(), interval) };
}
