'use client';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const COLORS = ['#B8A1FF', '#5B3FD1', '#C94B3C', '#202124', '#A38AEF', '#F0EBFF'];

/** Pháo giấy rơi toàn màn hình (chỉ dùng CSS, tự biến mất) */
export default function Confetti({ count = 36 }: { count?: number }) {
  const pieces = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      dur: 2.4 + Math.random() * 1.6,
      size: 6 + Math.random() * 7,
      color: COLORS[i % COLORS.length],
      round: i % 3 === 0,
    })),
    [count],
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 animate-confetti"
          style={{
            left: `${p.left}%`, width: p.size, height: p.round ? p.size : p.size * 0.5, background: p.color,
            borderRadius: p.round ? '9999px' : '2px', animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>,
    document.body,
  );
}
