'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Flame, { type FlameState } from './Flame';
import type { Stats } from '@/lib/types';

/** Ngọn lửa + số ngày trên thanh trên: phong cách Modern Pill rực rỡ và tinh tế */
export default function StreakBadge({ stats }: { stats: Stats | null }) {
  const [igniting, setIgniting] = useState(false);
  const prevOn = useRef<boolean | null>(null);
  const on = !!stats?.studiedToday;
  const ready = stats !== null;

  useEffect(() => {
    if (!ready) return;
    const was = prevOn.current;
    prevOn.current = on;
    if (was === false && on) {
      setIgniting(true);
      const t = setTimeout(() => setIgniting(false), 1500);
      return () => clearTimeout(t);
    }
  }, [on, ready]);

  if (!stats) return null;
  const streak = stats.streak ?? 0;
  const flameState: FlameState = igniting ? 'ignite' : on ? 'lit' : streak > 0 ? 'warm' : 'off';
  const tip = on
    ? `Chuỗi ${streak} ngày, hôm nay bạn đã hoàn thành bài học!`
    : stats.atRisk
    ? `Chuỗi ${streak} ngày sắp hết hạn, học một bài hôm nay để giữ lửa!`
    : streak > 0
    ? `Chuỗi ${streak} ngày, học ngay để thắp sáng ngọn lửa hôm nay`
    : 'Bắt đầu bài học đầu tiên để thắp chuỗi ngày học';

  return (
    <Link
      href="/study"
      title={tip}
      aria-label={`${tip}. Bấm để vào ôn tập`}
      className={`relative inline-flex min-h-[38px] items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all duration-200 active:scale-95 ${
        streak > 0
          ? on
            ? 'border-orange-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 text-orange-950 shadow-sm hover:border-orange-400 hover:shadow'
            : 'border-orange-200/80 bg-orange-50/70 text-orange-900 shadow-sm hover:border-orange-300 hover:bg-orange-50'
          : 'border-line bg-white text-stone-600 hover:border-stone-400'
      }`}
    >
      <Flame size={20} state={flameState} />
      <span key={streak} className="animate-pop tabular-nums font-extrabold text-sm text-ink">
        {streak} <span className="text-xs font-semibold text-stone-500">ngày</span>
      </span>
      {on && (
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Hôm nay đã giữ lửa" />
      )}
    </Link>
  );
}
