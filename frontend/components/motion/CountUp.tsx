'use client';
import { useEffect, useRef } from 'react';
import { animate, reduced, whenVisible } from '@/lib/motion';

/** Số đếm lên tới giá trị cuối khi cuộn tới. HTML gốc đã chứa giá trị cuối nên không JS vẫn đúng. */
export default function CountUp({ to, suffix = '', locale = 'vi-VN', className }: { to: number; suffix?: string; locale?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) => `${n.toLocaleString(locale)}${suffix}`;
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    let anim: ReturnType<typeof animate> | undefined;
    const stop = whenVisible(el, () => {
      const s = { n: 0 };
      anim = animate(s, { n: to, duration: 1100, ease: 'outExpo', onUpdate: () => { el.textContent = fmt(Math.round(s.n)); } });
    });
    return () => { stop(); anim?.revert(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, suffix]);
  return <span ref={ref} className={className}>{fmt(to)}</span>;
}
