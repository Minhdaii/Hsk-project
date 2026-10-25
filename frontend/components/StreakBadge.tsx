'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Flame from './Flame';
import type { Stats } from '@/lib/types';

/** Ngọn lửa + số ngày trên thanh trên: phong cách Lavender White × Lavender */
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
  const tip = on ? `Chuỗi ${stats.streak} ngày, hôm nay đã giữ lửa` : stats.atRisk ? 'Học hôm nay để giữ chuỗi!' : 'Học hôm nay để thắp lửa';
  return (
    <Link
      href="/study"
      title={tip}
      aria-label={`${tip}. Bấm để vào ôn tập`}
      className={`relative flex min-h-[44px] items-center gap-1.5 rounded-lg border px-3 text-sm font-bold transition-colors duration-300 ${
        on ? 'border-brand/60 bg-brand-soft text-ink' : 'border-line bg-white text-stone-600 hover:border-stone-400'
      }`}
    >
      <Flame size={18} state={igniting ? 'ignite' : on ? 'lit' : 'off'} />
      <span key={stats.streak} className="animate-pop tabular-nums">
        {stats.streak} <span className="font-medium text-stone-600">ngày</span>
      </span>
    </Link>
  );
}
