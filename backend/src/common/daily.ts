/**
 * Chọn "chữ của ngày" một cách xác định: cùng ngày thì cùng chỉ số, không phụ thuộc thứ tự trả về ngẫu nhiên.
 * Dùng bước nhảy nguyên tố cùng nhau với n nên đi qua đủ n từ rồi mới lặp lại (không trùng chữ trong n ngày liên tiếp).
 * Lưu ý: nếu số từ đủ điều kiện (n) thay đổi, chuỗi chữ theo ngày sẽ được xếp lại.
 */
export function dayNumber(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

export function dailyIndex(day: number, n: number): number {
  if (n <= 0) return -1;
  if (n === 1) return 0;
  let step = Math.round(n * 0.6180339887);
  if (step < 1) step = 1;
  while (gcd(step, n) !== 1) step++;
  step %= n;
  if (step === 0) step = 1;
  return ((((day % n) + n) % n) * step) % n;
}
