import { normalizeForEngine, Stroke } from './segment';

/**
 * Lớp bọc thư viện nhận diện chữ Hán viết tay HanziLookupJS (chạy hoàn toàn trên trình duyệt, nét viết KHÔNG gửi đi đâu).
 * Thư viện và dữ liệu nằm ở /public/vendor/hanzilookup và chỉ được nạp khi người dùng mở trang viết.
 * Muốn đổi sang dịch vụ nhận diện khác, chỉ cần thay hai hàm export bên dưới.
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

/** Nhận diện MỘT chữ từ các nét của nó; trả về tối đa `limit` ứng viên, tốt nhất đứng đầu. */
export async function recognizeChar(strokes: Stroke[], limit = 8): Promise<Candidate[]> {
  await ensureEngine();
  const H = window.HanziLookup!;
  matcher = matcher ?? new H.Matcher('mmah');
  const analyzed = new H.AnalyzedCharacter(normalizeForEngine(strokes));
  return new Promise((resolve) => matcher!.match(analyzed, limit, (m) => resolve(m.map((x) => ({ char: x.character, score: x.score })))));
}
