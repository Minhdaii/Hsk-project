const TZ = process.env.TZ_NAME || 'Asia/Ho_Chi_Minh';

/** Ngày hiện tại (YYYY-MM-DD) theo múi giờ cấu hình, mặc định giờ Việt Nam */
export function today(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ });
}

export function addDays(date: string, n: number): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
