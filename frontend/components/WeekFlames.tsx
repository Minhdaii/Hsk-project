'use client';
import Flame from './Flame';

const LABEL = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/** 7 ngày gần nhất: ngày nào có học thì có ngọn lửa */
export default function WeekFlames({ days }: { days: { date: string; reviews: number }[] }) {
  return (
    <div className="flex items-end justify-between gap-1">
      {days.map((d, i) => {
        const isToday = i === days.length - 1;
        const lit = d.reviews > 0;
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <div className={`flex h-10 w-10 items-end justify-center rounded-full pb-1 ${isToday ? 'ring-2 ring-brand/40' : ''} ${lit ? 'bg-orange-50' : 'bg-stone-100'}`}>
              {lit ? <Flame size={26} state={isToday ? 'lit' : 'lit'} /> : <span className="mb-2 h-2 w-2 rounded-full bg-stone-300" />}
            </div>
            <span className={`text-[11px] ${isToday ? 'font-bold text-brand' : 'text-stone-500'}`}>{LABEL[new Date(d.date + 'T00:00:00').getDay()]}</span>
          </div>
        );
      })}
    </div>
  );
}
