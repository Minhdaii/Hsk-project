'use client';
import { useEffect, useRef, type ElementType, type ReactNode } from 'react';
import { enter, reduced, whenVisible } from '@/lib/motion';

type Props = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  /** > 0: áp dụng stagger cho từng phần tử con lần lượt cách nhau `each` ms (chuẩn 40–80ms) */
  each?: number;
  /** true: chỉ chạy khi cuộn tới viewport (Scroll Reveal); false: chạy ngay khi mount */
  view?: boolean;
};

/**
 * Khối hiện dần và stagger với Anime.js:
 * - Tối ưu GPU: chỉ animate opacity và translateY.
 * - An toàn: Có safety timeout để không bao giờ bị ẩn nếu có lỗi; gỡ transform inline khi xong.
 * - Không gây layout shift.
 */
export default function Anim({
  as: Tag = 'div',
  className,
  children,
  delay = 0,
  y,
  duration,
  each = 0,
  view = false,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = each ? (Array.from(el.children) as HTMLElement[]) : [el];

    if (reduced()) {
      targets.forEach((n) => {
        n.style.opacity = '1';
        n.style.transform = '';
      });
      return;
    }

    const reveal = () => {
      targets.forEach((n) => {
        n.style.opacity = '1';
        n.style.transform = '';
      });
    };

    const safety = setTimeout(reveal, 3500);

    let anim: ReturnType<typeof enter> | undefined;

    const defaultDuration = duration ?? (view ? 420 : 280);
    const defaultY = y ?? (view ? 14 : 8);

    const play = () => {
      anim = enter(targets, {
        delay,
        y: defaultY,
        duration: defaultDuration,
        each,
        ease: 'outCubic',
      });
    };

    const stop = view ? whenVisible(el, play) : (play(), () => {});

    return () => {
      clearTimeout(safety);
      stop();
      try {
        anim?.revert();
      } catch {
        // safe fallback
      }
    };
  }, [delay, y, duration, each, view]);

  return (
    <Tag ref={ref} data-anim={each ? 'kids' : 'self'} className={className}>
      {children}
    </Tag>
  );
}
