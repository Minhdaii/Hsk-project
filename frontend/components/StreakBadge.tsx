'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Flame from './Flame';
import type { Stats } from '@/lib/types';

/** Ngọn lửa + số ngày trên thanh điều hướng. Xám khi hôm nay chưa học; vừa học xong thì được thắp sáng ngay (có hiệu ứng) */
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
    <Link href="/study?level=1" title={tip}
      className={`relative flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm font-bold transition-all duration-500 hover:-translate-y-px ${on ? 'border-orange-200 bg-orange-50 text-orange-600' : 'border-stone-200 bg-white text-stone-400'} ${igniting ? 'scale-110 shadow-[0_0_0_4px_rgba(251,146,60,0.25)]' : ''}`}>
      <Flame size={22} state={igniting ? 'ignite' : on ? 'lit' : 'off'} />
      <span key={stats.streak} className="animate-pop">{stats.streak}</span>
    </Link>
  );
}
