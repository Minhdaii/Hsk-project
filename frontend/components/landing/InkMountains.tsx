'use client';
import { useEffect, useRef } from 'react';
import { animate, reduced, stagger } from '@/lib/motion';

/**
 * SVG minh họa núi non thủy mặc (ink wash landscape) cho Hero section.
 * Có 4 lớp núi với độ đậm mực giảm dần, kiến trúc Trung Hoa giữa cảnh,
 * và mây/sương mù tự nhiên. Được animate bằng Anime.js khi xuất hiện lần đầu.
 */
export default function InkMountains({ className = '' }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || reduced()) return;

    const layers = svg.querySelectorAll<SVGElement>('[data-layer]');
    const paths = svg.querySelectorAll<SVGPathElement>('[data-draw]');

    // Fade in layers staggered
    const layerAnim = animate(Array.from(layers), {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 900,
      delay: stagger(250, { start: 200 }),
      ease: 'outCubic',
    });

    // Draw SVG strokes
    const drawAnims = Array.from(paths).map((path, i) => {
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
      return animate(path, {
        strokeDashoffset: [len, 0],
        duration: 1400,
        delay: 600 + i * 300,
        ease: 'outCubic',
      });
    });

    return () => {
      layerAnim.revert();
      drawAnims.forEach((a) => a.revert());
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1200 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Lớp 4 — Núi xa nhất, mực loãng */}
      <g data-layer="4" opacity="0.15">
        <path d="M0 380 Q100 280,200 320 T400 260 Q500 230,600 270 T800 220 Q900 200,1000 250 T1200 200 L1200 500 L0 500 Z" fill="#111" />
      </g>

      {/* Lớp 3 — Núi xa, sương mù nhẹ */}
      <g data-layer="3" opacity="0.25">
        <path d="M0 420 Q80 320,180 360 T380 300 Q480 260,580 310 T780 250 Q880 230,980 280 T1200 240 L1200 500 L0 500 Z" fill="#111" />
      </g>

      {/* Sương mù giữa các lớp núi */}
      <g data-layer="mist" opacity="0.08">
        <ellipse cx="400" cy="340" rx="350" ry="40" fill="#111" />
        <ellipse cx="900" cy="300" rx="280" ry="35" fill="#111" />
      </g>

      {/* Lớp 2 — Núi gần, mực đậm hơn */}
      <g data-layer="2" opacity="0.5">
        <path d="M-50 450 Q50 350,150 400 T350 340 Q450 300,550 350 T750 290 Q850 260,950 310 T1200 280 L1200 500 L-50 500 Z" fill="#111" />
      </g>

      {/* Kiến trúc — Tháp cổ giữa cảnh */}
      <g data-layer="arch" opacity="0.65" transform="translate(720, 220)">
        {/* Thân tháp */}
        <rect x="25" y="30" width="30" height="60" fill="#111" opacity="0.7" />
        {/* Mái tầng 1 */}
        <path d="M10 30 L40 8 L70 30 Z" fill="#111" opacity="0.8" />
        {/* Mái tầng 2 */}
        <path d="M15 55 L40 38 L65 55 Z" fill="#111" opacity="0.6" />
        {/* Nền tháp */}
        <rect x="15" y="88" width="50" height="6" fill="#111" opacity="0.5" rx="1" />
      </g>

      {/* Lớp 1 — Núi gần nhất, nét cọ đậm */}
      <g data-layer="1" opacity="0.85">
        <path d="M-100 480 Q0 400,100 440 T300 380 Q400 340,500 390 T700 350 Q800 330,900 370 T1100 340 Q1150 330,1250 360 L1250 500 L-100 500 Z" fill="#111" />
      </g>

      {/* Nét cọ trang trí — thông trên đá */}
      <g data-layer="pine" opacity="0.6" transform="translate(180, 310)">
        <line x1="15" y1="70" x2="15" y2="20" stroke="#111" strokeWidth="2.5" strokeLinecap="round" data-draw />
        <path d="M5 35 Q15 20, 25 35" stroke="#111" strokeWidth="1.8" fill="none" strokeLinecap="round" data-draw />
        <path d="M3 48 Q15 30, 27 48" stroke="#111" strokeWidth="1.5" fill="none" strokeLinecap="round" data-draw />
        <path d="M6 58 Q15 42, 24 58" stroke="#111" strokeWidth="1.2" fill="none" strokeLinecap="round" data-draw />
      </g>

      {/* Cây thông thứ hai */}
      <g data-layer="pine2" opacity="0.4" transform="translate(950, 280)">
        <line x1="10" y1="55" x2="10" y2="15" stroke="#111" strokeWidth="2" strokeLinecap="round" data-draw />
        <path d="M2 28 Q10 15, 18 28" stroke="#111" strokeWidth="1.5" fill="none" strokeLinecap="round" data-draw />
        <path d="M4 40 Q10 28, 16 40" stroke="#111" strokeWidth="1.2" fill="none" strokeLinecap="round" data-draw />
      </g>

      {/* Chim bay xa — chi tiết nhỏ */}
      <g opacity="0.3">
        <path d="M350 180 Q355 175, 360 178 Q365 175, 370 180" stroke="#111" strokeWidth="1" fill="none" data-draw />
        <path d="M380 170 Q384 166, 388 168 Q392 166, 396 170" stroke="#111" strokeWidth="0.8" fill="none" data-draw />
      </g>
    </svg>
  );
}
