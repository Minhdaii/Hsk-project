'use client';
import { useState } from 'react';

type Day = { date: string; reviews: number };
const WEEKDAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const W = 700, H = 220;

/** Trục dọc chia 4 khoảng đều, bước là số "tròn" để nhãn dễ đọc */
function scale(v: number) {
  const step = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000].find((s) => s * 4 >= v) ?? Math.ceil(v / 4);
  return { step, max: step * 4 };
}
/** Đường cong mượt: mỗi đoạn là Bezier có tiếp tuyến ngang nên không bao giờ vọt qua điểm dữ liệu */
const smooth = (p: { x: number; y: number }[]) => p.reduce((d, b, i) => (i === 0 ? `M${b.x},${b.y}` : `${d} C${(p[i - 1].x + b.x) / 2},${p[i - 1].y} ${(p[i - 1].x + b.x) / 2},${b.y} ${b.x},${b.y}`), '');

/** Biểu đồ vùng 7 ngày gần nhất (số lượt ôn mỗi ngày) kèm đường mục tiêu. Dữ liệu thật từ /study/activity. */
export default function WeeklyChart({ days, goal }: { days: Day[]; goal: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = days.length;
  const top = Math.max(0, ...days.map((d) => d.reviews));
  const { step, max } = scale(Math.max(goal, top, 1));
  const best = top > 0 ? days.findIndex((d) => d.reviews === top) : -1;
  const shown = hover ?? (best >= 0 ? best : null);
  const pts = days.map((d, i) => ({ x: ((i + 0.5) / n) * W, y: H - (d.reviews / max) * H }));
  const line = n ? smooth(pts) : '';
  const area = n ? `${line} L${pts[n - 1].x},${H} L${pts[0].x},${H} Z` : '';
  const dayName = (d: string) => WEEKDAY[new Date(d + 'T00:00:00').getDay()];
  const dateText = (d: string) => { const t = new Date(d + 'T00:00:00'); return `${t.getDate()}/${t.getMonth() + 1}`; };

  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3">
        <div className="relative h-[190px] sm:h-[230px]" onMouseLeave={() => setHover(null)}>
          <svg role="img" aria-label={`Số lượt ôn 7 ngày gần nhất: ${days.map((d) => `${dayName(d.date)} ${d.reviews}`).join(', ')}. Mục tiêu mỗi ngày ${goal}.`} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <linearGradient id="wk-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="rgb(184 162 248)" stopOpacity=".55" />
                <stop offset="1" stopColor="rgb(184 162 248)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3, 4].map((k) => <line key={k} x1="0" x2={W} y1={(H * k) / 4} y2={(H * k) / 4} stroke="rgb(229 226 236)" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
            {goal > 0 && <line x1="0" x2={W} y1={H - (goal / max) * H} y2={H - (goal / max) * H} stroke="rgb(91 63 209)" strokeOpacity=".5" strokeWidth="1.2" strokeDasharray="5 5" vectorEffect="non-scaling-stroke" />}
            {n > 0 && <path d={area} fill="url(#wk-fill)" />}
            {n > 0 && <path d={line} fill="none" stroke="rgb(91 63 209)" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
          </svg>

          {shown !== null && (
            <>
              <span aria-hidden className="pointer-events-none absolute bottom-0 w-0 border-l border-dashed border-brand-ink/60" style={{ left: `${((shown + 0.5) / n) * 100}%`, top: `${(1 - days[shown].reviews / max) * 100}%` }} />
              <span aria-hidden className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-ink shadow" style={{ left: `${((shown + 0.5) / n) * 100}%`, top: `${(1 - days[shown].reviews / max) * 100}%` }} />
              <div
                role="status"
                className={`pointer-events-none absolute z-10 w-max max-w-[11rem] rounded-xl bg-ink px-3 py-2 text-white ${shown === 0 ? '' : shown === n - 1 ? '-translate-x-full' : '-translate-x-1/2'}`}
                style={{ left: `${((shown + 0.5) / n) * 100}%`, top: `calc(${(1 - days[shown].reviews / max) * 100}% - 14px)`, transform: `${shown === 0 ? '' : shown === n - 1 ? 'translateX(-100%)' : 'translateX(-50%)'} translateY(-100%)` }}
              >
                <span className="block text-sm font-bold leading-tight tabular-nums">{days[shown].reviews} lượt ôn</span>
                <span className="block text-[11px] leading-tight text-white/75">{shown === best ? 'Ngày học nhiều nhất' : `${dayName(days[shown].date)}, ${dateText(days[shown].date)}`}</span>
              </div>
            </>
          )}

          <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {days.map((d, i) => (
              <button key={d.date} type="button" aria-label={`${dayName(d.date)}, ${dateText(d.date)}: ${d.reviews} lượt ôn`} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} onClick={() => setHover(i)} className="h-full cursor-default rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-ink" />
            ))}
          </div>

          {top === 0 && n > 0 && <p className="pointer-events-none absolute inset-x-0 top-1/3 text-center text-sm text-stone-600">Chưa có lượt ôn nào trong 7 ngày qua. Học một lượt để bắt đầu.</p>}
        </div>

        <ol aria-hidden className="relative h-[190px] w-7 text-right text-xs tabular-nums text-stone-500 sm:h-[230px]">
          {[4, 3, 2, 1, 0].map((k) => <li key={k} className="absolute right-0 -translate-y-1/2" style={{ top: `${((4 - k) / 4) * 100}%` }}>{k * step}</li>)}
        </ol>
      </div>

      <ol className="mt-3 grid grid-cols-[minmax(0,1fr)_1.75rem] gap-x-3" aria-hidden>
        <li className="grid list-none" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          {days.map((d, i) => <span key={d.date} className={`text-center text-xs ${i === shown ? 'font-semibold text-ink' : 'text-stone-500'}`}>{dayName(d.date)}</span>)}
        </li>
      </ol>
    </div>
  );
}
