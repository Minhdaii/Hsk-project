'use client';
import Link from 'next/link';
import Flame from './Flame';
import WeekFlames from './WeekFlames';
import { useCountUp } from '@/lib/useCountUp';
import type { Stats } from '@/lib/types';

/**
 * Thẻ chuỗi ngày học StreakCard:
 * Thiết kế Lavender White × Lavender, khắc phục triệt để lỗi tràn ngang (overflow) trên mobile.
 */
export default function StreakCard({ stats, days }: { stats: Stats; days: { date: string; reviews: number }[] }) {
  const n = useCountUp(stats.streak, 900);
  const [title, text] = stats.studiedToday
    ? ['Bạn đã giữ lửa hôm nay!', 'Ngày mai tiếp tục để nối dài chuỗi học tập.']
    : stats.atRisk
      ? ['Chuỗi sắp đứt!', 'Hoàn thành ít nhất một lượt ôn hôm nay để giữ chuỗi.']
      : stats.brokenStreak > 0
        ? ['Ngọn lửa đã tắt', `Chuỗi ${stats.brokenStreak} ngày đã dừng lại. Học hôm nay để thắp lại!`]
        : ['Thắp ngọn lửa đầu tiên', 'Hoàn thành một bài học để bắt đầu chuỗi ngày học.'];

  return (
    <section aria-label="Chuỗi ngày học" className="editorial-card rounded-2xl border-2 border-[#D8D1EE] bg-white flex min-w-0 w-full flex-col justify-between gap-4 p-5 shadow-sm">
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#DED7F0] bg-[#EEE9FC]">
          <Flame size={40} state={stats.studiedToday ? 'lit' : 'off'} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span
              className={`text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl ${
                stats.studiedToday ? 'text-[#55449E]' : 'text-[#777184]'
              }`}
            >
              {n}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#777184]">
              ngày liên tiếp
            </span>
          </div>
          <h3 className="mt-0.5 truncate text-sm font-bold text-[#302B3D]">{title}</h3>
          <p className="line-clamp-2 text-xs text-[#777184]">{text}</p>
        </div>
      </div>

      <WeekFlames days={days} />

      {!stats.studiedToday && (
        <Link href="/study" className="btn-editorial-primary w-full text-center text-xs font-bold !min-h-[44px] shadow-sm">
          Ôn tập ngay để giữ lửa
        </Link>
      )}
    </section>
  );
}
