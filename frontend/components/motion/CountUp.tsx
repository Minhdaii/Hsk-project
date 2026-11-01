'use client';
import { useEffect, useRef } from 'react';
import { animateNumber, reduced, whenVisible } from '@/lib/motion';

/**
 * Số đếm lên tới giá trị đích khi cuộn tới (Anime.js).
 * Giữ nguyên giá trị tĩnh trong SSR và fallback khi người dùng bật reduced motion.
 */
export default function CountUp({
  to,
  from = 0,
  suffix = '',
  locale = 'vi-VN',
  className,
  duration = 850,
}: {
  to: number;
  from?: number;
  suffix?: string;
  locale?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) => `${n.toLocaleString(locale)}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced()) {
      el.textContent = fmt(to);
      return;
    }

    let anim: ReturnType<typeof animateNumber> = null;

    const stop = whenVisible(el, () => {
      anim = animateNumber(el, to, {
        from,
        duration,
        format: fmt,
      });
    });

    return () => {
      stop();
      if (anim) {
        try {
          anim.revert();
        } catch {
          // safe fallback
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, from, suffix, duration]);

  return (
    <span ref={ref} className={className}>
      {fmt(to)}
    </span>
  );
}
