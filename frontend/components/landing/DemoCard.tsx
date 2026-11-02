'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, reduced } from '@/lib/motion';

const face = { gridArea: '1 / 1', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' } as const;

const INK_GRID = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='M50 0V100M0 50H100M0 0L100 100M100 0L0 100' fill='none' stroke='%23111111' stroke-opacity='.18' stroke-width='1' stroke-dasharray='5 5' vector-effect='non-scaling-stroke'/%3E%3C/svg%3E";

/**
 * Thẻ flashcard tương tác trên Landing Page — Modern Ink Editorial.
 * Màu sắc: Black (#111111) / White (#FFFFFF) / Vermilion (#C62828).
 * Tự động lật và cho phép người dùng click để tương tác.
 */
export default function DemoCard() {
  const [flipped, setFlipped] = useState(false);
  const streak = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLDivElement>(null);

  // Hiệu ứng floating nhẹ nhàng cho 2 nhãn phụ
  useEffect(() => {
    if (reduced() || !streak.current || !badge.current) return;
    const a = animate(streak.current, {
      translateY: [0, -8],
      rotate: [0, 1.5],
      duration: 3500,
      loop: true,
      alternate: true,
      ease: 'inOutSine',
    });
    const b = animate(badge.current, {
      translateY: [0, -6],
      rotate: [0, -1.2],
      duration: 3000,
      delay: 600,
      loop: true,
      alternate: true,
      ease: 'inOutSine',
    });
    return () => {
      a.revert();
      b.revert();
    };
  }, []);

  // Tự lật định kỳ để giới thiệu tính năng
  useEffect(() => {
    const t = setInterval(() => setFlipped((f) => !f), 4200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-sm select-none">
      {/* Floating streak indicator — Ink Editorial */}
      <div
        ref={streak}
        className="absolute -left-3 -top-5 z-10 flex items-center gap-2 border-2 border-[#111] bg-white px-3.5 py-1.5 shadow-[4px_4px_0px_#111] sm:-left-6"
      >
        <span
          lang="zh-Hans"
          className="inline-flex h-6 w-6 items-center justify-center bg-[#C62828] font-hanzi text-xs font-bold text-white"
          style={{ borderRadius: '2px' }}
        >
          連
        </span>
        <span className="text-lg font-black text-[#111]">12</span>
        <span className="text-xs font-semibold text-[#777]">ngày liên tiếp</span>
      </div>

      {/* Floating reward badge — Vermilion Red Seal style */}
      <div
        ref={badge}
        className="absolute -bottom-4 -right-2 z-10 flex items-center gap-1.5 bg-[#C62828] px-4 py-2 text-xs font-bold text-white shadow-[4px_4px_0px_#111] sm:-right-6"
        style={{ borderRadius: '2px' }}
      >
        <span>✓ Chính xác!</span>
        <span className="opacity-90">+10 XP</span>
      </div>

      {/* 3D Perspective Flip Container */}
      <div className="[perspective:1400px]" onClick={() => setFlipped((f) => !f)}>
        <div
          className="grid cursor-pointer transition-transform duration-[850ms] ease-[cubic-bezier(.35,.1,.2,1)] [transform-style:preserve-3d]"
          style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* MẶT TRƯỚC: Chữ Hán lớn trong khung 米字格 */}
          <div
            style={face}
            className="relative flex min-h-[26rem] flex-col items-center justify-center overflow-hidden border-2 border-[#111] bg-white p-6 text-center shadow-[8px_8px_0px_#111]"
          >
            {/* Header tags */}
            <div className="absolute inset-x-5 top-5 flex items-center justify-between">
              <span className="border border-[#111] px-2.5 py-0.5 text-[11px] font-bold text-[#111]">
                TỪ MỚI
              </span>
              <span className="bg-[#C62828] px-2.5 py-0.5 text-[11px] font-bold text-white">
                HSK 1
              </span>
            </div>

            {/* Khung chữ Hán 米字格 */}
            <div
              className="relative my-4 flex h-40 w-40 items-center justify-center border border-[#111]/30 bg-white"
              style={{ backgroundImage: `url("${INK_GRID}")`, backgroundSize: '100% 100%' }}
            >
              <span lang="zh-Hans" className="hanzi text-[5.5rem] font-black leading-none text-[#111]">
                你好
              </span>
            </div>

            {/* Nút nghe phát âm mô phỏng */}
            <div className="relative mt-2 inline-flex items-center gap-2 border border-[#111] bg-white px-4 py-1.5 text-xs font-bold text-[#111] transition-all hover:bg-[#111] hover:text-white">
              <span>🔊</span>
              <span>Nghe phát âm</span>
            </div>

            <p className="mt-4 text-xs text-[#777]">
              Chạm để lật thẻ xem pinyin và giải nghĩa
            </p>
          </div>

          {/* MẶT SAU: Pinyin, Giải nghĩa & Ví dụ thực tế */}
          <div
            style={{ ...face, transform: 'rotateY(180deg)' }}
            className="relative flex min-h-[26rem] flex-col gap-4 overflow-hidden border-2 border-[#111] bg-white p-6 shadow-[8px_8px_0px_#111]"
          >
            <div className="border-b border-[#111]/15 pb-3">
              <div className="flex items-baseline justify-between">
                <span lang="zh-Hans" className="hanzi text-3xl font-black text-[#111]">
                  你好
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#C62828]">
                  Hán Việt: nhĩ hảo
                </span>
              </div>
              <div className="pinyin mt-1 text-2xl font-bold text-[#C62828]">
                nǐ hǎo
              </div>
            </div>

            <ul className="space-y-2">
              <li className="flex items-center gap-2.5 text-base font-bold text-[#111]">
                <span className="h-1.5 w-1.5 bg-[#C62828]" />
                <span>xin chào</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-[#555]">
                <span className="h-1.5 w-1.5 bg-[#777]" />
                <span>chào bạn (lời chào thân mật phổ biến)</span>
              </li>
            </ul>

            <div className="mt-auto border-t border-[#111]/15 pt-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#777]">
                Câu ví dụ
              </div>
              <div lang="zh-Hans" className="hanzi mt-1 text-base font-bold text-[#111]">
                <b className="border-b-2 border-[#C62828] text-[#C62828]">你好</b>！很高兴认识你。
              </div>
              <div className="pinyin text-xs text-[#777]">
                nǐ hǎo! hěn gāoxìng rènshi nǐ.
              </div>
              <div className="mt-0.5 text-xs text-[#555]">
                Xin chào! Rất vui được biết bạn.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
