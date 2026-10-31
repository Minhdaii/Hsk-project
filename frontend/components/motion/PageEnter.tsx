'use client';
import { useEffect, useRef } from 'react';
import { enter } from '@/lib/motion';

/** Chuyển trang: nội dung mới hiện dần và trượt lên nhẹ (Anime.js). Dùng với key={pathname} để chạy lại mỗi lần đổi trang. */
export default function PageEnter({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const safety = setTimeout(() => { el.style.opacity = '1'; }, 3000);
    const anim = enter(el, { y: 8, duration: 300 });
    return () => { clearTimeout(safety); anim.revert(); };
  }, []);
  return <div ref={ref} data-anim="self" className={className}>{children}</div>;
}
