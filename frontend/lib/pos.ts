const MAP: Record<string, string> = {
  n: 'danh từ', v: 'động từ', vn: 'danh động từ', a: 'tính từ', ad: 'phó tính từ', an: 'danh tính từ',
  d: 'phó từ', g: 'hình vị', q: 'lượng từ', t: 'danh từ thời gian', b: 'từ khu biệt', r: 'đại từ',
  f: 'phương vị từ', m: 'số từ', c: 'liên từ', cc: 'liên từ', p: 'giới từ', s: 'từ chỉ nơi chốn',
  nr: 'tên người', ns: 'địa danh', nt: 'tổ chức', nz: 'danh từ riêng', u: 'trợ từ', qv: 'lượng từ động',
  qt: 'lượng từ thời gian', y: 'ngữ khí từ', e: 'thán từ', o: 'từ tượng thanh', z: 'trạng thái từ',
  mq: 'số lượng từ', l: 'cụm cố định', k: 'hậu tố', h: 'tiền tố', tg: 'hình vị thời gian',
};

/** Đổi mã loại từ (vd "n,v") thành nhãn tiếng Việt, tối đa 3 nhãn khác nhau */
export function posLabels(pos: string | null): string[] {
  const labels = (pos || '').split(',').map((s) => s.trim()).filter(Boolean).map((c) => MAP[c] || c);
  return Array.from(new Set(labels)).slice(0, 3);
}

/** Tách chuỗi nghĩa "a; b; c" thành danh sách */
export function splitMeaning(m: string | null): string[] {
  return (m || '').split(/;\s*/).map((s) => s.trim()).filter(Boolean);
}
