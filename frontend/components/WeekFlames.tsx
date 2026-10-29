'use client';
import Flame from './Flame';

const LABEL = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/**
 * 7 ngày gần nhất:
 * Tối ưu responsive hoàn toàn, loại bỏ triệt để lỗi tràn ngang (overflow) trên màn hình hẹp (320px - 390px).
 * Sử dụng flex-1, min-w-0, và kích thước ngọn lửa thích ứng.
 */
export default function WeekFlames({ days }: { days: { date: string; reviews: number }[] }) {
  return (
    <div className="w-full min-w-0 border-t border-line pt-3">
      <div className="flex w-full items-end justify-between gap-1 sm:gap-1.5">
        {days.map((d, i) => {
          const isToday = i === days.length - 1;
          const lit = d.reviews > 0;
          return (
            <div key={d.date} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div
                className={`flex aspect-square w-full max-w-[2.25rem] min-w-[1.75rem] items-center justify-center rounded-lg transition-all ${
                  isToday
                    ? 'border-2 border-brand bg-brand-soft '
                    : 'border border-line'
                } ${lit ? 'bg-brand-soft' : 'bg-stone-50'}`}
              >
                {lit ? (
                  <Flame size={20} state="lit" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-300" />
                )}
              </div>
              <span
                className={`text-[10px] sm:text-[11px] truncate ${
                  isToday ? 'font-bold text-brand-ink' : 'font-medium text-stone-600'
                }`}
              >
                {LABEL[new Date(d.date + 'T00:00:00').getDay()]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
