'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { Word } from '@/lib/types';
import { Candidate, ensureEngine, recognizeChar } from '@/lib/writing/recognizer';
import { Group, Pt, Stroke, segmentStrokes } from '@/lib/writing/segment';
import styles from './WritingPad.module.css';

const INK = '#292833';
const ERASE_R = 16; // bán kính tẩy (px)
const DEBOUNCE_MS = 900;

type Status = 'idle' | 'loading' | 'recognizing' | 'done' | 'error';
type Recognized = { key: string; cands: Candidate[]; group: Group };
type Info = { q: string; word: Word | null };

/**
 * Giấy luyện viết: viết tự do bằng chuột, bút hoặc ngón tay; hệ thống tách chữ, nhận diện rồi tra kho từ HSK.
 * Nhận diện chạy hoàn toàn trên trình duyệt (xem lib/writing/recognizer.ts), nét viết không gửi lên máy chủ.
 */
export default function WritingPad() {
  const paperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const drawing = useRef<Stroke | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runId = useRef(0);
  const [count, setCount] = useState(0);
  const [eraser, setEraser] = useState(false);
  const [auto, setAuto] = useState(true);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [chars, setChars] = useState<Recognized[]>([]);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<string | null>(null);
  const [info, setInfo] = useState<Info[]>([]);
  const [copied, setCopied] = useState(false);

  const text = chars.map((c) => picks[c.key] ?? c.cands[0]?.char ?? '?').join('');
  const rowPx = () => parseFloat(getComputedStyle(paperRef.current!).getPropertyValue('--row')) || 72;

  /* ---------- vẽ ---------- */
  const redraw = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    const dpr = cv.width / cv.clientWidth; ctx.scale(dpr, dpr);
    ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const s of strokes.current) {
      if (s.pts.length === 1) { ctx.beginPath(); ctx.arc(s.pts[0].x, s.pts[0].y, 1.7, 0, Math.PI * 2); ctx.fill(); continue; }
      ctx.beginPath(); ctx.moveTo(s.pts[0].x, s.pts[0].y);
      for (let i = 1; i < s.pts.length; i++) ctx.lineTo(s.pts[i].x, s.pts[i].y);
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    const cv = canvasRef.current!;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      cv.width = Math.round(cv.clientWidth * dpr); cv.height = Math.round(cv.clientHeight * dpr);
      redraw();
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(cv);
    return () => ro.disconnect();
  }, [redraw]);

  const at = (e: React.PointerEvent): Pt => { const r = canvasRef.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

  /* ---------- nhận diện ---------- */
  const run = useCallback(async () => {
    const id = ++runId.current;
    if (!strokes.current.length) { setChars([]); setStatus('idle'); setInfo([]); return; }
    try {
      setStatus('loading'); setError('');
      await ensureEngine();
      if (id !== runId.current) return;
      setStatus('recognizing');
      const groups = segmentStrokes(strokes.current, rowPx());
      const out: Recognized[] = [];
      for (const g of groups) {
        const cands = await recognizeChar(g.strokes.map((i) => strokes.current[i]));
        out.push({ key: g.strokes.join('-'), cands, group: g });
      }
      if (id !== runId.current) return; // đã có nét mới hoặc lần chạy mới hơn: bỏ kết quả cũ
      setChars(out); setStatus('done'); setOpen(null);
    } catch (e) {
      if (id !== runId.current) return;
      setStatus('error'); setError(e instanceof Error ? e.message : 'Không nhận diện được');
    }
  }, []);

  const schedule = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (auto) timer.current = setTimeout(run, DEBOUNCE_MS);
  }, [auto, run]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  /* ---------- thao tác con trỏ ---------- */
  const eraseAt = (p: Pt) => {
    const before = strokes.current.length;
    strokes.current = strokes.current.filter((s) => !s.pts.some((q) => Math.hypot(q.x - p.x, q.y - p.y) <= ERASE_R));
    if (strokes.current.length !== before) { redraw(); setCount(strokes.current.length); }
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (timer.current) clearTimeout(timer.current);
    runId.current++; // huỷ kết quả đang chờ: người dùng đang viết tiếp
    const p = at(e);
    if (eraser) { drawing.current = { pts: [], t0: 0, t1: 0 }; eraseAt(p); return; }
    drawing.current = { pts: [p], t0: performance.now(), t1: performance.now() };
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = drawing.current; if (!s) return;
    if (eraser) { eraseAt(at(e)); return; }
    const evs = (e.nativeEvent as PointerEvent).getCoalescedEvents?.() ?? [];
    const list = evs.length ? evs : [e.nativeEvent as PointerEvent];
    const cv = canvasRef.current!; const r = cv.getBoundingClientRect(); const ctx = cv.getContext('2d')!;
    const dpr = cv.width / cv.clientWidth;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.strokeStyle = INK; ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const ev of list) {
      const p = { x: ev.clientX - r.left, y: ev.clientY - r.top };
      const last = s.pts[s.pts.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) < 1.2) continue;
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      s.pts.push(p);
    }
    s.t1 = performance.now();
  };
  const up = () => {
    const s = drawing.current; drawing.current = null;
    if (!s) return;
    if (eraser) { schedule(); return; }
    if (s.pts.length === 1) { const p = s.pts[0]; s.pts.push({ x: p.x + 0.1, y: p.y + 0.1 }); }
    s.t1 = performance.now();
    strokes.current.push(s); setCount(strokes.current.length); redraw();
    schedule();
  };

  const undo = () => { if (timer.current) clearTimeout(timer.current); strokes.current.pop(); setCount(strokes.current.length); redraw(); if (strokes.current.length) schedule(); else run(); };
  const clearAll = () => { if (timer.current) clearTimeout(timer.current); strokes.current = []; setCount(0); setPicks({}); redraw(); run(); };

  /* ---------- sao chép ---------- */
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
    }
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  /* ---------- tra kho từ HSK (chỉ dữ liệu của hệ thống) ---------- */
  useEffect(() => {
    const t = text;
    if (!t || t.includes('?')) { setInfo([]); return; }
    let alive = true;
    const queries = Array.from(new Set([...(t.length > 1 && t.length <= 6 ? [t] : []), ...Array.from(t)])).slice(0, 10);
    const timer2 = setTimeout(async () => {
      const found: Info[] = [];
      for (const q of queries) {
        try {
          const r = await api<{ items: Word[] }>(`/words?q=${encodeURIComponent(q)}&limit=30`);
          found.push({ q, word: r.items.find((w) => w.hanzi === q) ?? null });
        } catch { found.push({ q, word: null }); }
      }
      if (alive) setInfo(found);
    }, 350);
    return () => { alive = false; clearTimeout(timer2); };
  }, [text]);

  const busy = status === 'loading' || status === 'recognizing';
  const btn = 'btn-ghost !min-h-[44px]';

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <section aria-label="Tờ giấy viết" className="space-y-3 lg:col-span-8">
        <div className="flex flex-wrap items-center gap-2">
          <button className={btn} onClick={undo} disabled={count === 0}>↶ Hoàn tác nét</button>
          <button className={btn} onClick={() => setEraser((v) => !v)} aria-pressed={eraser}
            style={eraser ? { borderColor: 'rgb(91 63 209 / .5)', background: 'rgb(240 235 255)' } : undefined}>{eraser ? '✎ Đang xoá: chạm vào nét' : '⌫ Xoá một phần'}</button>
          <button className={btn} onClick={clearAll} disabled={count === 0}>Xoá toàn bộ</button>
          <label className="ml-auto flex min-h-[44px] items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="h-5 w-5 accent-[rgb(91,63,209)]" />Tự nhận diện
          </label>
          <button className="btn-primary !min-h-[44px]" onClick={run} disabled={count === 0 || busy}>Nhận diện</button>
        </div>

        <div ref={paperRef} className={styles.paper}>
          <canvas ref={canvasRef} className={`${styles.canvas} ${eraser ? styles.eraser : ''}`} aria-label="Vùng viết chữ Hán bằng chuột hoặc ngón tay"
            onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onContextMenu={(e) => e.preventDefault()} />
          {count === 0 && <p className={styles.hint}>Viết chữ Hán lên tờ giấy này bằng chuột hoặc ngón tay. Có thể viết liền nhiều chữ trên một dòng.</p>}
        </div>
        <p className="text-sm text-stone-600">Trên điện thoại, chạm vào tờ giấy để viết (trang sẽ không cuộn ở vùng này); chạm ra ngoài tờ giấy để cuộn trang.</p>
      </section>

      <aside aria-label="Kết quả nhận diện" className="space-y-4 lg:col-span-4">
        <div className="lab-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold">Kết quả nhận diện</h2>
            <span role="status" aria-live="polite" className="text-sm text-stone-600">
              {status === 'idle' && 'Chưa có nét viết'}
              {status === 'loading' && 'Đang tải bộ nhận diện…'}
              {status === 'recognizing' && 'Đang nhận diện…'}
              {status === 'done' && `Đã nhận diện ${chars.length} chữ`}
              {status === 'error' && 'Lỗi'}
            </span>
          </div>

          {status === 'error' && (
            <div role="alert" className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
              {error}. <button className="font-semibold underline" onClick={run}>Thử lại</button>
            </div>
          )}

          <p lang="zh-Hans" data-testid="recognized-text" className="hanzi mt-3 min-h-[4rem] break-all text-4xl leading-tight sm:text-5xl">{text || <span className="text-stone-300">…</span>}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn-ghost !min-h-[44px]" onClick={copy} disabled={!text}>{copied ? '✓ Đã sao chép' : 'Sao chép'}</button>
          </div>

          {chars.length > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 text-sm text-stone-600">Chưa đúng chữ? Chạm vào chữ để chọn ứng viên khác.</p>
              <ul className="flex flex-wrap gap-1.5">
                {chars.map((c) => (
                  <li key={c.key}>
                    <button onClick={() => setOpen(open === c.key ? null : c.key)} aria-expanded={open === c.key} lang="zh-Hans"
                      className="hanzi min-h-[44px] min-w-[44px] rounded-lg border border-line bg-white px-2 text-2xl hover:border-stone-400">{picks[c.key] ?? c.cands[0]?.char ?? '?'}</button>
                  </li>
                ))}
              </ul>
              {open && (
                <ul className="mt-2 flex flex-wrap gap-1.5 rounded-lg border border-line bg-stone-50 p-2" aria-label="Ứng viên khác">
                  {(chars.find((c) => c.key === open)?.cands ?? []).map((cd) => (
                    <li key={cd.char}>
                      <button lang="zh-Hans" onClick={() => { setPicks({ ...picks, [open]: cd.char }); setOpen(null); }}
                        className="hanzi min-h-[44px] min-w-[44px] rounded-lg border border-line bg-white px-2 text-2xl hover:border-brand-ink">{cd.char}</button>
                    </li>
                  ))}
                  {(chars.find((c) => c.key === open)?.cands.length ?? 0) === 0 && <li className="p-1 text-sm text-stone-600">Không có ứng viên nào.</li>}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="lab-surface p-4 sm:p-5" aria-live="polite">
          <h2 className="font-bold">Tra trong kho từ HSK</h2>
          {info.length === 0 && <p className="mt-2 text-sm text-stone-600">Viết xong, kết quả tra cứu sẽ hiện ở đây. Chỉ hiển thị dữ liệu có trong kho từ của hệ thống.</p>}
          <ul className="mt-2 space-y-2">
            {info.map(({ q, word }) => (
              <li key={q} className="rounded-lg border border-line p-3">
                {word ? (
                  <>
                    <div className="flex items-baseline gap-2"><span lang="zh-Hans" className="hanzi text-3xl">{word.hanzi}</span><span className="pinyin text-lg font-medium text-brand-ink">{word.pinyin}</span>{word.hskLevel && <span className="pill">HSK {word.hskLevel}</span>}</div>
                    <p className="text-stone-700">{word.meaningVi || word.meaningEn}</p>
                    <Link href={`/word/${word.id}`} className="inline-flex min-h-[44px] items-center text-sm font-semibold text-brand-ink hover:underline">Xem chi tiết và ví dụ →</Link>
                  </>
                ) : (
                  <p className="text-sm text-stone-600"><span lang="zh-Hans" className="hanzi text-lg text-ink">{q}</span>: chưa có trong kho từ HSK của hệ thống. Kết quả nhận diện vẫn được giữ nguyên.</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
