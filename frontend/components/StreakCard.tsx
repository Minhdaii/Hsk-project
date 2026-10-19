'use client';
import Link from 'next/link';
import Flame from './Flame';
import WeekFlames from './WeekFlames';
import { useCountUp } from '@/lib/useCountUp';
import type { Stats } from '@/lib/types';

/** Thẻ chuỗi ngày học trên trang chủ: lửa sáng khi hôm nay đã học, tắt khi chưa */
export default function StreakCard({ stats, days }: { stats: Stats; days: { date: string; reviews: number }[] }) {
  const n = useCountUp(stats.streak, 900);
  const [title, text] = stats.studiedToday
    ? ['Bạn đã giữ lửa hôm nay!', 'Ngày mai quay lại để nối dài chuỗi.']
    : stats.atRisk
      ? ['Lửa sắp tắt!', 'Học ít nhất một bài hôm nay để giữ chuỗi.']
      : stats.brokenStreak > 0
        ? ['Lửa đã tắt', `Chuỗi ${stats.brokenStreak} ngày đã đứt. Học hôm nay để thắp lại!`]
        : ['Thắp ngọn lửa đầu tiên', 'Hoàn thành một bài học để bắt đầu chuỗi.'];

  return (
    <section className={`card flex flex-col gap-4 ${stats.studiedToday ? 'border-orange-200 bg-gradient-to-br from-orange-50/70 to-white' : ''}`}>
      <div className="flex items-center gap-4">
        <Flame size={72} state={stats.studiedToday ? 'lit' : 'off'} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-5xl font-extrabold leading-none ${stats.studiedToday ? 'text-orange-500' : 'text-stone-400'}`}>{n}</span>
            <span className="text-sm font-medium text-stone-500">ngày</span>
          </div>
          <div className="mt-1 font-semibold">{title}</div>
          <p className="text-sm text-stone-600">{text}</p>
        </div>
      </div>
      <WeekFlames days={days} />
      {!stats.studiedToday && <Link href="/study?level=1" className="btn-primary">🔥 Học ngay để thắp lửa</Link>}
    </section>
  );
}
