'use client';
import { useEffect, useRef } from 'react';
import { animate, reduced } from '@/lib/motion';

/**
 * Nét cọ thủy mặc SVG, dùng làm đường phân cách section hoặc trang trí.
 * Có hiệu ứng vẽ nét khi cuộn vào khung nhìn.
 */
export default function BrushDivider({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg || reduced()) return;

    const paths = svg.querySelectorAll<SVGPathElement>('path');
    const anims = Array.from(paths).map((p, i) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
      return animate(p, {
        strokeDashoffset: [len, 0],
        duration: 1200 + i * 400,
        ease: 'outCubic',
      });
    });
    return () => {
      anims.forEach((a) => a.revert());
    };
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 1200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full ${flip ? 'scale-x-[-1]' : ''} ${className}`}
      aria-hidden
      preserveAspectRatio="none"
    >
      <path
        d="M0 30 Q60 10,150 28 T350 22 Q480 15,600 26 T800 18 Q920 12,1050 24 T1200 20"
        stroke="#111"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M10 35 Q80 50,200 32 T450 38 Q580 45,720 30 T950 36 Q1060 42,1190 28"
        stroke="#111"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.2"
      />
    </svg>
  );
}
