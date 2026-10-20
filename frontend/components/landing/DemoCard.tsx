'use client';
import { useEffect, useState } from 'react';
import Flame from '../Flame';

const face = { gridArea: '1 / 1', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' } as const;

/** Thẻ flashcard minh họa trên trang giới thiệu: tự lật qua lại, kèm các bong bóng nổi */
export default function DemoCard() {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setFlipped((f) => !f), 3800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -left-3 -top-5 z-10 flex animate-float items-center gap-1 rounded-2xl border border-orange-200 bg-white px-3 py-1.5 shadow-soft sm:-left-8">
        <Flame size={28} state="lit" />
        <span className="text-xl font-extrabold text-orange-500">12</span>
        <span className="text-xs font-medium text-stone-500">ngày liên tiếp</span>
      </div>
      <div className="absolute -bottom-4 -right-2 z-10 rounded-2xl bg-emerald-500 px-3.5 py-2 text-sm font-bold text-white shadow-soft sm:-right-6" style={{ animation: 'float 6s ease-in-out 1s infinite' }}>
        ✓ Chính xác! +10 XP
      </div>

      <div className="[perspective:1400px]" onClick={() => setFlipped((f) => !f)}>
        <div className="grid cursor-pointer transition-transform duration-[900ms] ease-[cubic-bezier(.35,.1,.2,1)] [transform-style:preserve-3d]" style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
          <div style={face} className="relative flex min-h-[25rem] flex-col items-center justify-center overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-[0_30px_60px_-25px_rgba(120,53,15,0.45)]">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(253,241,239,0.95),rgba(255,255,255,0)_62%)]" />
            <div className="absolute inset-x-4 top-4 flex items-center justify-between">
              <span className="pill bg-sky-50 text-sky-700">Từ mới</span>
              <span className="pill bg-emerald-50 text-emerald-700">HSK 1</span>
            </div>
            <div className="relative flex items-center justify-center rounded-2xl border border-brand/25 px-8 py-8">
              <span className="hanzi text-[5.5rem] leading-none">你好</span>
            </div>
            <div className="relative mt-5 flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium shadow-sm">🔊 Nghe</div>
            <p className="relative mt-5 text-sm text-stone-400">Chọn nghĩa tiếng Việt đúng bên dưới</p>
          </div>
          <div style={{ ...face, transform: 'rotateY(180deg)' }} className="relative flex min-h-[25rem] flex-col gap-4 overflow-hidden rounded-3xl border border-brand/15 bg-gradient-to-br from-brand-soft via-white to-white p-6 shadow-[0_30px_60px_-25px_rgba(120,53,15,0.45)]">
            <div>
              <div className="hanzi text-4xl">你好</div>
              <div className="mt-1 text-2xl font-medium text-brand">nǐ hǎo</div>
            </div>
            <ul className="space-y-1.5">
              <li className="flex gap-2 text-lg font-semibold"><span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />xin chào</li>
              <li className="flex gap-2 text-stone-700"><span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />chào bạn</li>
            </ul>
            <div className="flex flex-wrap gap-1.5"><span className="pill bg-amber-100 text-amber-800">Hán Việt: nhĩ hảo</span><span className="pill">cụm từ</span></div>
            <div className="mt-auto rounded-2xl border border-stone-200 bg-white/80 p-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">Ví dụ</div>
              <div className="hanzi mt-1 text-lg leading-snug"><b className="rounded bg-brand/10 px-0.5 text-brand">你好</b>！很高兴认识你。</div>
              <div className="text-sm text-brand">nǐ hǎo! hěn gāoxìng rènshi nǐ.</div>
              <div className="text-sm text-stone-600">Xin chào! Rất vui được biết bạn.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
