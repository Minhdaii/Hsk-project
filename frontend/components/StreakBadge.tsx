'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Flame, { type FlameState } from './Flame';
import type { Stats } from '@/lib/types';

/** Ngọn lửa + số ngày trên thanh trên: phong cách Modern Pill rực rỡ, rõ ràng và tinh tế */
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
      className={`group relative inline-flex h-11 items-center gap-1.5 rounded-full border px-3 transition-all duration-200 active:scale-95 ${
        streak > 0
          ? on
            ? 'border-orange-300 bg-orange-50/90 text-orange-950 shadow-xs hover:border-orange-400 hover:bg-orange-100/80'
            : 'border-amber-200/90 bg-amber-50/80 text-amber-950 shadow-xs hover:border-amber-300 hover:bg-amber-100/70'
          : 'border-line bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700 shadow-xs'
      }`}
    >
      <Flame size={20} state={flameState} />
      <span
        key={streak}
        className={`text-xs font-black tabular-nums transition-colors ${
          streak > 0
            ? on
              ? 'text-orange-600'
              : 'text-amber-600'
            : 'text-stone-500 group-hover:text-stone-700'
        }`}
      >
        {streak}
      </span>
      {on && (
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-xs"
          title="Hôm nay đã giữ lửa"
        />
      )}
    </Link>
  );
}
