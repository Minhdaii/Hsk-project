'use client';
import { useEffect, useRef, type ElementType, type ReactNode } from 'react';
import { enter, whenVisible } from '@/lib/motion';

type Props = {
  as?: ElementType; className?: string; children: ReactNode;
  delay?: number; y?: number; duration?: number;
  /** > 0: bỏ qua chính phần tử này, cho từng phần tử con hiện lần lượt cách nhau `each` ms */
  each?: number;
  /** true: chỉ chạy khi cuộn tới (phần dưới màn hình); mặc định chạy ngay khi hiện ra */
  view?: boolean;
};

/**
 * Khối hiện dần bằng Anime.js. Ẩn sẵn bằng CSS ([data-anim], chỉ khi trình duyệt chạy JS) để không bị nháy
 * "hiện rồi ẩn rồi hiện"; có chốt an toàn để nội dung không bao giờ bị ẩn mãi nếu animation gặp lỗi.
 */
export default function Anim({ as: Tag = 'div', className, children, delay = 0, y, duration, each = 0, view = false }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = each ? (Array.from(el.children) as HTMLElement[]) : [el];
    const reveal = () => targets.forEach((n) => { n.style.opacity = '1'; });
    const safety = setTimeout(reveal, 5000);
    let anim: ReturnType<typeof enter> | undefined;
    const play = () => { anim = enter(targets, { delay, y, duration, each }); };
    const stop = view ? whenVisible(el, play) : (play(), () => {});
    return () => { clearTimeout(safety); stop(); anim?.revert(); };
  }, [delay, y, duration, each, view]);
  return <Tag ref={ref} data-anim={each ? 'kids' : 'self'} className={className}>{children}</Tag>;
}
