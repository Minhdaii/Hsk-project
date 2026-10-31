'use client';
import { useEffect, useRef } from 'react';
import { animate, reduced, stagger } from '@/lib/motion';

/** Tiêu đề hiện lần lượt từng từ (Anime.js). Đọc màn hình đọc nguyên câu qua aria-label, các từ tách rời được ẩn khỏi trình đọc. */
export default function SplitWords({ text, as: Tag = 'h1', className, delay = 0 }: { text: string; as?: 'h1' | 'h2'; className?: string; delay?: number }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = Array.from(el.children) as HTMLElement[];
    const r = reduced();
    const safety = setTimeout(() => words.forEach((w) => { w.style.opacity = '1'; }), 5000);
    const anim = animate(words, {
      opacity: [0, 1],
      translateY: r ? [0, 0] : ['0.4em', 0],
      duration: r ? 160 : 640,
      delay: r ? 0 : stagger(70, { start: delay }),
      ease: r ? 'linear' : 'outCubic',
      onComplete: () => words.forEach((w) => { w.style.transform = ''; }),
    });
    return () => { clearTimeout(safety); anim.revert(); };
  }, [text, delay]);
  const parts = text.split(' ');
  return (
    <Tag ref={ref} data-anim="kids" aria-label={text} className={className}>
      {parts.flatMap((w, i) => [<span key={`w${i}`} aria-hidden className="inline-block">{w}</span>, i < parts.length - 1 ? ' ' : null])}
    </Tag>
  );
}
