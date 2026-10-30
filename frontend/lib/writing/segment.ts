/**
 * Tách các nét viết tự do thành từng chữ để nhận diện. Hàm thuần.
 * Quy tắc: nét thuộc cùng một dòng (các nét chồng lấn nhau theo chiều dọc, nên chữ viết cao hơn một dòng kẻ vẫn là một dòng),
 * rồi gộp theo chiều ngang:
 * - bao ngang chồng lên nhau, hoặc khoảng hở rất nhỏ: cùng một chữ
 * - khoảng hở vừa: cùng một chữ nếu viết liền nhau (cách nhau dưới 500ms), ngược lại là chữ mới
 * - khoảng hở lớn: chữ mới
 * Các ngưỡng khoảng hở tính theo chiều cao dòng kẻ, hoặc theo chiều cao chữ nếu chữ viết to hơn một dòng.
 */
export type Pt = { x: number; y: number };
export type Stroke = { pts: Pt[]; t0: number; t1: number };
export type Group = { line: number; strokes: number[]; x0: number; x1: number };

const TIGHT_GAP = 0.06; // theo chiều cao dòng
const LOOSE_GAP = 0.2;
const JOIN_MS = 500;
const MERGE_Y = 0.15; // theo chiều cao dòng

const bbox = (s: Stroke) => {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of s.pts) { if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x; if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y; }
  return { x0, x1, y0, y1 };
};

export function segmentStrokes(strokes: Stroke[], lineHeight: number): Group[] {
  const items = strokes.map((s, i) => ({ i, s, b: bbox(s) })).filter((o) => o.s.pts.length > 0);
  // Chia dòng như cũ (theo dải dòng kẻ chứa tâm nét), rồi gộp các dòng có phạm vi dọc chồng lấn đáng kể:
  // một chữ viết cao hơn một dòng kẻ (vd. to qua 3 dòng) trước đây bị chẻ thành nhiều "chữ" vì các nét rơi vào những dải khác nhau.
  // Chồng lấn phải đạt MERGE_Y dòng (hoặc cả chiều cao của dòng thấp hơn, nếu nó dẹt hơn mức đó), nên vài px
  // chân chữ dòng trên chạm đầu chữ dòng dưới không làm hai dòng dính nhau.
  type Row = { line: number; y0: number; y1: number; list: typeof items };
  const byBand = new Map<number, Row>();
  for (const it of items) {
    const band = Math.max(0, Math.floor(((it.b.y0 + it.b.y1) / 2) / lineHeight));
    const r = byBand.get(band);
    if (r) { r.list.push(it); r.y0 = Math.min(r.y0, it.b.y0); r.y1 = Math.max(r.y1, it.b.y1); }
    else byBand.set(band, { line: band, y0: it.b.y0, y1: it.b.y1, list: [it] });
  }
  const rows = Array.from(byBand.values()).sort((a, b) => a.line - b.line);
  const overlapY = (a: Row, b: Row) => Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
  for (let again = true; again; ) {
    again = false;
    for (let i = 0; i < rows.length && !again; i++) {
      for (let j = i + 1; j < rows.length && !again; j++) {
        const need = Math.min(MERGE_Y * lineHeight, rows[i].y1 - rows[i].y0, rows[j].y1 - rows[j].y0);
        if (overlapY(rows[i], rows[j]) < need) continue;
        rows[i] = { line: rows[i].line, y0: Math.min(rows[i].y0, rows[j].y0), y1: Math.max(rows[i].y1, rows[j].y1), list: [...rows[i].list, ...rows[j].list] };
        rows.splice(j, 1); again = true;
      }
    }
  }
  const out: Group[] = [];
  rows.forEach((row) => {
    const line = row.line;
    const list = row.list.sort((a, b) => a.b.x0 - b.b.x0 || a.s.t0 - b.s.t0);
    let cur: { g: Group; members: typeof items; y0: number; y1: number } | null = null;
    for (const it of list) {
      if (cur) {
        const ref = Math.max(lineHeight, cur.y1 - cur.y0); // chữ to hơn một dòng thì ngưỡng khoảng hở to theo
        const gap = it.b.x0 - cur.g.x1;
        let join = gap <= ref * TIGHT_GAP; // gồm cả trường hợp chồng lên nhau (gap âm)
        if (!join && gap <= ref * LOOSE_GAP) {
          const dt = Math.min(...cur.members.map((m) => Math.max(0, Math.max(m.s.t0, it.s.t0) - Math.min(m.s.t1, it.s.t1))));
          join = dt < JOIN_MS;
        }
        if (join) {
          cur.g.strokes.push(it.i); cur.members.push(it); cur.g.x1 = Math.max(cur.g.x1, it.b.x1);
          cur.y0 = Math.min(cur.y0, it.b.y0); cur.y1 = Math.max(cur.y1, it.b.y1);
          continue;
        }
      }
      cur = { g: { line, strokes: [it.i], x0: it.b.x0, x1: it.b.x1 }, members: [it], y0: it.b.y0, y1: it.b.y1 };
      out.push(cur.g);
    }
  });
  // bộ nhận diện phụ thuộc thứ tự nét: trả các nét trong mỗi chữ về đúng thứ tự người dùng đã viết
  out.forEach((g) => g.strokes.sort((a, b) => a - b));
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
