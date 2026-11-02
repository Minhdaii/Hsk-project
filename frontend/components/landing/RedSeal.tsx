'use client';
import { useEffect, useRef } from 'react';
import { animate, reduced } from '@/lib/motion';

/**
 * Dấu triện đỏ son (紅印) — chi tiết nhận diện thương hiệu.
 * Hiển thị như dấu triện vuông truyền thống với chữ Hán bên trong.
 * Có hiệu ứng "stamp" khi xuất hiện: scale bounce nhẹ.
 */
export default function RedSeal({
  char = '學',
  size = 'md',
  className = '',
  animate: shouldAnimate = true,
}: {
  char?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!shouldAnimate || !ref.current || reduced()) return;
    const el = ref.current;
    const anim = animate(el, {
      scale: [0.6, 1.08, 0.96, 1],
      opacity: [0, 1],
      rotate: ['-4deg', '1deg', '0deg'],
      duration: 600,
      delay: 300,
      ease: 'outCubic',
    });
    return () => {
      anim.revert();
    };
  }, [shouldAnimate]);

  const sizeClass = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-11 w-11 text-xl',
    lg: 'h-16 w-16 text-3xl',
    xl: 'h-24 w-24 text-5xl',
  }[size];

  return (
    <span
      ref={ref}
      lang="zh-Hans"
      aria-hidden
      className={`inline-flex items-center justify-center bg-[#C62828] font-hanzi font-black text-white shadow-sm ${sizeClass} ${className}`}
      style={{ borderRadius: '3px' }}
    >
      {char}
    </span>
  );
}
