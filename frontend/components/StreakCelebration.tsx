'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Flame, { Sparks } from './Flame';
import Confetti from './Confetti';
import WeekFlames from './WeekFlames';
import type { StreakStatus } from '@/lib/types';

const MILESTONES = [3, 7, 14, 30, 50, 100, 365];

type Props = {
  status: StreakStatus; streak: number; previousStreak: number;
  days: { date: string; reviews: number }[]; onClose: () => void;
};

/** Hiện sau khi hoàn thành một bài học: lửa tắt → được thắp lại, số ngày nhảy lên, pháo giấy */
export default function StreakCelebration({ status, streak, previousStreak, days, onClose }: Props) {
  const celebrating = status !== 'same';
  const [lit, setLit] = useState(!celebrating);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!celebrating) return;
    const t = setTimeout(() => setLit(true), 650);
    return () => clearTimeout(t);
  }, [celebrating]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Enter') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const shown = lit ? streak : Math.max(0, streak - 1);
  const milestone = celebrating && MILESTONES.includes(streak);
  const copy: Record<StreakStatus, [string, string]> = {
    started: ['Bắt đầu chuỗi mới!', 'Ngày đầu tiên đã xong. Quay lại vào ngày mai để giữ lửa nhé.'],
    continued: [`Chuỗi ${streak} ngày!`, 'Ngọn lửa hôm nay đã được thắp lên. Ngày mai gặp lại nhé!'],
    relit: [
      'Lửa đã được thắp lại!',
      previousStreak > 0
        ? `Chuỗi ${previousStreak} ngày trước đã tắt, nhưng bạn đã quay lại. Chuỗi mới bắt đầu từ hôm nay.`
        : 'Bạn đã quay lại, chuỗi mới bắt đầu từ hôm nay.',
    ],
    same: ['Bạn đã giữ lửa hôm nay!', `Chuỗi hiện tại: ${streak} ngày.`],
  };

  if (!mounted) return null;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Chuỗi ngày học"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/55 p-4 backdrop-blur-sm" onClick={onClose}>
      {lit && celebrating && <Confetti />}
      <div className="card relative w-full max-w-sm animate-pop space-y-4 text-center shadow-soft" onClick={(e) => e.stopPropagation()}>
        <div className="relative mx-auto flex h-36 items-end justify-center">
          <Flame size={128} state={lit ? (celebrating ? 'ignite' : 'lit') : 'off'} />
          {lit && celebrating && <Sparks />}
        </div>
        <div>
          <div key={shown} className="animate-pop text-6xl font-extrabold leading-none text-orange-500">{shown}</div>
          <div className="mt-1 text-sm font-medium text-stone-500">ngày liên tiếp</div>
        </div>
        {milestone && <span className="pill animate-pop bg-amber-100 !px-3 !py-1 text-sm text-amber-700">🏅 Mốc {streak} ngày!</span>}
        <div>
          <h2 className="text-xl font-bold">{copy[status][0]}</h2>
          <p className="mt-1 text-sm text-stone-600">{copy[status][1]}</p>
        </div>
        <WeekFlames days={days} />
        <button className="btn-primary w-full !py-3" onClick={onClose} autoFocus>Tiếp tục</button>
      </div>
    </div>,
    document.body,
  );
}
