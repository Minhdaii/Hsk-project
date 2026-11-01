'use client';
import { useEffect, useRef } from 'react';
import { enter, reduced } from '@/lib/motion';

/**
 * Hiệu ứng chuyển trang mượt mà kết hợp Anime.js:
 * - Fade in từ 0 -> 1 kèm dịch chuyển nhẹ (y: 6px).
 * - Không gây giật layout (zero Layout Shift), không nháy trắng.
 * - Cleanup hoàn chỉnh khi unmount, gỡ sạch transform inline khi xong.
 */
export default function PageEnter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced()) {
      el.style.opacity = '1';
      return;
    }

    const safety = setTimeout(() => {
      if (el) {
        el.style.opacity = '1';
        el.style.transform = '';
      }
    }, 2000);

    const anim = enter(el, { y: 6, duration: 260, ease: 'outCubic' });

    return () => {
      clearTimeout(safety);
      try {
        anim.revert();
      } catch {
        // safe fallback
      }
    };
  }, []);

  return (
    <div ref={ref} data-anim="self" className={className}>
      {children}
    </div>
  );
}
