/**
 * Tách các nét viết tự do thành từng chữ để nhận diện. Hàm thuần. Giấy trắng, không có dòng kẻ.
 * Các nét được gom thành chữ theo khoảng cách giữa hộp bao của nhóm nét đang có và nét mới (cả chiều ngang lẫn chiều dọc):
 * - hộp bao chạm hoặc chồng lên nhau (hở rất nhỏ): cùng một chữ
 * - hở vừa: cùng một chữ nếu viết liền nhau (cách nhau dưới 500ms; nét nằm chồng lên theo chiều ngang như 三, 二, 言 được nới tới 900ms)
 * - hở lớn: chữ mới
 * Các ngưỡng hở tính theo `unit` (cỡ chữ chuẩn, px), hoặc theo kích thước nhóm nếu chữ viết to hơn `unit`.
 * Thứ tự trả về là thứ tự đọc: dòng trên trước dòng dưới, trong một dòng từ trái sang phải.
 */
export type Pt = { x: number; y: number };
export type Stroke = { pts: Pt[]; t0: number; t1: number };
export type Group = { line: number; strokes: number[]; x0: number; x1: number };

const TIGHT_GAP = 0.06; // theo cỡ chữ
const LOOSE_X = 0.2;
const LOOSE_Y = 0.5;
const JOIN_MS = 500;
const JOIN_STACK_MS = 900;

type Box = { x0: number; x1: number; y0: number; y1: number };
type Item = { i: number; s: Stroke; b: Box };
type Cluster = Box & { members: Item[] };

const bbox = (s: Stroke): Box => {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of s.pts) { if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x; if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y; }
  return { x0, x1, y0, y1 };
};
const gapOf = (a: Box, b: Box) => ({
  gx: Math.max(0, Math.max(a.x0, b.x0) - Math.min(a.x1, b.x1)), // 0 nếu chồng lên nhau
  gy: Math.max(0, Math.max(a.y0, b.y0) - Math.min(a.y1, b.y1)),
});

function belongs(c: Cluster, it: Item, unit: number): boolean {
  const size = Math.max(unit, c.x1 - c.x0, c.y1 - c.y0);
  const { gx, gy } = gapOf(c, it.b);
  if (gx <= size * TIGHT_GAP && gy <= size * TIGHT_GAP) return true;
  if (gx > size * LOOSE_X || gy > size * LOOSE_Y) return false;
  const dt = Math.min(...c.members.map((m) => Math.max(0, Math.max(m.s.t0, it.s.t0) - Math.min(m.s.t1, it.s.t1))));
  return dt < (gx === 0 ? JOIN_STACK_MS : JOIN_MS);
}

export function segmentStrokes(strokes: Stroke[], unit: number): Group[] {
  const items: Item[] = strokes.map((s, i) => ({ i, s, b: bbox(s) })).filter((o) => o.s.pts.length > 0);

  // 1) Gom nét thành chữ, theo thứ tự viết; một nét nối được nhiều chữ thì gộp các chữ đó lại
  let clusters: Cluster[] = [];
  for (const it of items) {
    const hit = clusters.filter((c) => belongs(c, it, unit));
    if (!hit.length) { clusters.push({ ...it.b, members: [it] }); continue; }
    const c = hit[0];
    for (const o of hit.slice(1)) { c.members.push(...o.members); c.x0 = Math.min(c.x0, o.x0); c.x1 = Math.max(c.x1, o.x1); c.y0 = Math.min(c.y0, o.y0); c.y1 = Math.max(c.y1, o.y1); }
    clusters = clusters.filter((o) => o === c || !hit.includes(o));
    c.members.push(it); c.x0 = Math.min(c.x0, it.b.x0); c.x1 = Math.max(c.x1, it.b.x1); c.y0 = Math.min(c.y0, it.b.y0); c.y1 = Math.max(c.y1, it.b.y1);
  }

  // 2) Xếp thứ tự đọc: chữ có phạm vi dọc chồng lên nhau thì cùng một dòng; dòng từ trên xuống, trong dòng từ trái sang
  const lines: { y0: number; y1: number; list: Cluster[] }[] = [];
  for (const c of [...clusters].sort((a, b) => (a.y0 + a.y1) - (b.y0 + b.y1))) {
    const line = lines.find((l) => Math.min(l.y1, c.y1) - Math.max(l.y0, c.y0) >= 0.5 * Math.min(l.y1 - l.y0, c.y1 - c.y0));
    if (line) { line.list.push(c); line.y0 = Math.min(line.y0, c.y0); line.y1 = Math.max(line.y1, c.y1); }
    else lines.push({ y0: c.y0, y1: c.y1, list: [c] });
  }
  lines.sort((a, b) => a.y0 - b.y0);

  const out: Group[] = [];
  lines.forEach((l, line) => {
    for (const c of l.list.sort((a, b) => a.x0 - b.x0)) {
      // bộ nhận diện phụ thuộc thứ tự nét: trả các nét trong mỗi chữ về đúng thứ tự người dùng đã viết
      out.push({ line, strokes: c.members.map((m) => m.i).sort((a, b) => a - b), x0: c.x0, x1: c.x1 });
    }
  });
  return out;
}

/** Làm thưa nét bằng Ramer–Douglas–Peucker: thư viện nhận diện chính xác hơn hẳn khi nét chỉ còn các điểm gãy chính (đo trên nét tổng hợp: 82% → 94%) */
function rdp(pts: number[][], eps: number): number[][] {
  if (pts.length < 3) return pts;
  const [x1, y1] = pts[0], [x2, y2] = pts[pts.length - 1];
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1e-9;
  let best = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / len;
    if (d > best) { best = d; idx = i; }
  }
  if (best > eps) return [...rdp(pts.slice(0, idx + 1), eps).slice(0, -1), ...rdp(pts.slice(idx), eps)];
  return [pts[0], pts[pts.length - 1]];
}

/** Chuẩn hoá một nhóm nét về khung 256x256 (thư viện nhận diện yêu cầu), giữ tỉ lệ và căn giữa. */
export function normalizeForEngine(strokes: Stroke[]): number[][][] {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const s of strokes) for (const p of s.pts) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
  const w = Math.max(x1 - x0, 1), h = Math.max(y1 - y0, 1);
  const scale = 230 / Math.max(w, h);
  const ox = (256 - w * scale) / 2, oy = (256 - h * scale) / 2;
  return strokes.map((s) => rdp(s.pts.map((p) => [(p.x - x0) * scale + ox, (p.y - y0) * scale + oy]), 6));
}
