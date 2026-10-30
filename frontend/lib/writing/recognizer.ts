import { ApiError, api } from '@/lib/api';
import { normalizeForEngine, Stroke } from './segment';

/**
 * Lớp nhận diện chữ Hán viết tay. Mỗi chữ được nhận diện bằng hai nguồn:
 * - Groq AI qua backend (POST /recognize, ảnh PNG của riêng chữ đó): ứng viên của AI đứng trước.
 * - HanziLookupJS chạy trên trình duyệt: luôn chạy song song, bổ sung ứng viên và là phương án dự phòng
 *   khi Groq lỗi, chưa cấu hình, quá tải hoặc không đọc được (khi đó kết quả y hệt trước đây).
 * Thư viện và dữ liệu HanziLookupJS nằm ở /public/vendor/hanzilookup và chỉ được nạp khi người dùng mở trang viết.
 * Chỉ ảnh của từng chữ được gửi lên máy chủ khi nhận diện bằng Groq; khoá API chỉ nằm ở backend.
 */
export type Candidate = { char: string; score: number };

type Engine = {
  init: (name: string, url: string, ready: (ok: boolean) => void) => void;
  AnalyzedCharacter: new (strokes: number[][][]) => unknown;
  Matcher: new (name: string) => { match: (c: unknown, limit: number, cb: (m: { character: string; score: number }[]) => void) => void };
};
declare global { interface Window { HanziLookup?: Engine } }

const BASE = '/vendor/hanzilookup';
let loading: Promise<void> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.HanziLookup) return resolve();
    const el = document.createElement('script');
    el.src = src; el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error('Không tải được thư viện nhận diện'));
    document.head.appendChild(el);
  });
}

/** Nạp thư viện và dữ liệu một lần; lỗi thì cho phép thử lại. */
export function ensureEngine(): Promise<void> {
  if (loading) return loading;
  loading = (async () => {
    await loadScript(`${BASE}/hanzilookup.min.js`);
    await new Promise<void>((resolve, reject) => window.HanziLookup!.init('mmah', `${BASE}/mmah.json`, (ok) => (ok ? resolve() : reject(new Error('Không tải được dữ liệu nét chữ')))));
  })().catch((e) => { loading = null; throw e; });
  return loading;
}

let matcher: InstanceType<Engine['Matcher']> | null = null;

/** Nhận diện MỘT chữ bằng HanziLookupJS (trên trình duyệt). */
async function recognizeLocal(strokes: Stroke[], limit: number): Promise<Candidate[]> {
  await ensureEngine();
  const H = window.HanziLookup!;
  matcher = matcher ?? new H.Matcher('mmah');
  const analyzed = new H.AnalyzedCharacter(normalizeForEngine(strokes));
  return new Promise((resolve) => matcher!.match(analyzed, limit, (m) => resolve(m.map((x) => ({ char: x.character, score: x.score })))));
}

/* ---------- Groq AI qua backend ---------- */
type AiReply = { status: 'ok' | 'uncertain' | 'unreadable'; candidates: Candidate[] };

const AI_PAUSE_MS = 30_000; // sau khi Groq lỗi/quá tải: tạm dùng bộ nhận diện trên trình duyệt, khỏi chờ từng chữ
const AI_CACHE_MAX = 200;
let aiPausedUntil = 0;
const aiCache = new Map<string, AiReply>(); // tự nhận diện chạy lại cả dòng mỗi lần dừng bút; chữ không đổi thì không gọi lại

const strokesKey = (strokes: Stroke[]) => strokes.map((s) => s.pts.map((p) => `${Math.round(p.x)},${Math.round(p.y)}`).join(' ')).join('|');

/** Vẽ các nét của một chữ thành ảnh PNG 256x256 nét đen trên nền trắng, căn giữa và giữ tỉ lệ. */
function renderStrokes(strokes: Stroke[]): string | null {
  if (typeof document === 'undefined') return null;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const s of strokes) for (const p of s.pts) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
  if (!Number.isFinite(x0)) return null;
  const SIZE = 256, BOX = 208;
  const w = Math.max(x1 - x0, 1), h = Math.max(y1 - y0, 1);
  const k = BOX / Math.max(w, h);
  const ox = (SIZE - w * k) / 2 - x0 * k, oy = (SIZE - h * k) / 2 - y0 * k;
  const cv = document.createElement('canvas'); cv.width = SIZE; cv.height = SIZE;
  const ctx = cv.getContext('2d'); if (!ctx) return null;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = '#000'; ctx.fillStyle = '#000'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const s of strokes) {
    if (!s.pts.length) continue;
    ctx.beginPath(); ctx.moveTo(s.pts[0].x * k + ox, s.pts[0].y * k + oy);
    for (let i = 1; i < s.pts.length; i++) ctx.lineTo(s.pts[i].x * k + ox, s.pts[i].y * k + oy);
    ctx.stroke();
  }
  return cv.toDataURL('image/png');
}

/** Hỏi Groq qua backend. Mọi lỗi đều trả null để luồng nhận diện cũ chạy bình thường. */
async function recognizeAi(strokes: Stroke[]): Promise<AiReply | null> {
  if (Date.now() < aiPausedUntil) return null;
  const key = strokesKey(strokes);
  const hit = aiCache.get(key);
  if (hit) return hit;
  const image = renderStrokes(strokes);
  if (!image) return null;
  try {
    const r = await api<AiReply>('/recognize', { body: { image } });
    if (!r || !Array.isArray(r.candidates)) return null;
    if (aiCache.size >= AI_CACHE_MAX) aiCache.delete(aiCache.keys().next().value as string);
    aiCache.set(key, r);
    return r;
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 0;
    if (status === 0 || status === 429 || status >= 500) aiPausedUntil = Date.now() + AI_PAUSE_MS;
    return null;
  }
}

/** Nhận diện MỘT chữ từ các nét của nó; trả về tối đa `limit` ứng viên, tốt nhất đứng đầu (thứ tự mới là thứ được dùng, `score` của hai nguồn không cùng thang). */
export async function recognizeChar(strokes: Stroke[], limit = 8): Promise<Candidate[]> {
  const [local, ai] = await Promise.all([recognizeLocal(strokes, limit), recognizeAi(strokes)]);
  if (!ai || ai.candidates.length === 0) return local;
  const seen = new Set(ai.candidates.map((c) => c.char));
  return [...ai.candidates, ...local.filter((c) => !seen.has(c.char))].slice(0, limit);
}
