'use client';
import Link from 'next/link';
import SpeakButton from './SpeakButton';
import FavoriteButton from './FavoriteButton';
import { levelPill } from '@/lib/levels';
import { posLabels, splitMeaning } from '@/lib/pos';
import type { Card } from '@/lib/types';

const GUIDE = 'rgba(192,57,43,0.22)';
const line = (dir: string) => `linear-gradient(${dir}, transparent calc(50% - 0.5px), ${GUIDE} calc(50% - 0.5px) calc(50% + 0.5px), transparent calc(50% + 0.5px))`;

/** Làm nổi bật từ cần học trong câu ví dụ */
function Highlight({ text, word }: { text: string; word: string }) {
  const parts = text.split(word);
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>{p}{i < parts.length - 1 && <b className="rounded bg-brand/10 px-0.5 text-brand">{word}</b>}</span>
      ))}
    </>
  );
}

const face = { gridArea: '1 / 1', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' } as const;

/** Thẻ từ vựng lật 3D: mặt trước (chữ Hán trong ô tập viết), mặt sau (pinyin, nghĩa, ví dụ) */
export default function FlipCard({ card, flipped, canFlip, onToggle }: { card: Card; flipped: boolean; canFlip: boolean; onToggle: () => void }) {
  const w = card.word;
  const ex = w.examples?.[0];
  const isNew = !card.progress;
  const single = Array.from(w.hanzi).length === 1;
  const meanings = splitMeaning(w.meaningVi || w.meaningEn).slice(0, 4);

  return (
    <div className={`[perspective:1400px] ${canFlip ? 'cursor-pointer' : ''}`} onClick={() => { if (canFlip) onToggle(); }}>
      <div
        className="grid transition-transform duration-[650ms] ease-[cubic-bezier(.35,.1,.2,1)] [transform-style:preserve-3d]"
        style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* ---------- Mặt trước ---------- */}
        <div style={face} className={`relative flex min-h-[27rem] flex-col items-center justify-center overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-soft ${flipped ? 'pointer-events-none' : ''}`}>
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(253,241,239,0.95),rgba(255,255,255,0)_62%)]" />
          <div className="absolute inset-x-4 top-4 flex items-center justify-between">
            <span className={`pill ${isNew ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'}`}>{isNew ? 'Từ mới' : 'Ôn lại'}</span>
            <div className="flex items-center gap-2">
              <span className={`pill ${levelPill(w.hskLevel)}`}>HSK {w.hskLevel}</span>
              <FavoriteButton wordId={w.id} className="!h-8 !w-8 !text-base" />
            </div>
          </div>
          <div
            className={`relative flex items-center justify-center rounded-2xl border border-brand/25 ${single ? 'aspect-square w-52' : 'min-w-[13rem] px-8 py-10'}`}
            style={single ? { backgroundImage: `${line('90deg')}, ${line('0deg')}` } : undefined}
          >
            <span className="hanzi break-words text-[6.5rem] leading-none sm:text-[7.5rem]" style={{ fontSize: single ? undefined : 'clamp(3rem, 14vw, 5.5rem)' }}>{w.hanzi}</span>
          </div>
          <div className="relative mt-5"><SpeakButton text={w.hanzi} audioUrl={w.audioUrl} label /></div>
          <p className="relative mt-5 text-sm text-stone-400">{canFlip ? 'Chạm vào thẻ để lật xem nghĩa' : 'Chọn nghĩa tiếng Việt đúng bên dưới'}</p>
        </div>

        {/* ---------- Mặt sau ---------- */}
        <div style={{ ...face, transform: 'rotateY(180deg)' }} className={`relative flex min-h-[27rem] flex-col gap-4 overflow-hidden rounded-3xl border border-brand/15 bg-gradient-to-br from-brand-soft via-white to-white p-6 shadow-soft ${flipped ? '' : 'pointer-events-none'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="hanzi break-words text-4xl leading-tight">{w.hanzi}</div>
              <div className="mt-1 break-words text-2xl font-medium text-brand">{w.pinyin}</div>
            </div>
            <SpeakButton text={w.hanzi} audioUrl={w.audioUrl} />
          </div>

          <ul className="space-y-1.5">
            {meanings.map((m, i) => (
              <li key={i} className={`flex gap-2 break-words ${i === 0 ? 'text-lg font-semibold' : 'text-base text-stone-700'}`}>
                <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />{m}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-1.5">
            {w.hanviet && <span className="pill bg-amber-100 text-amber-800">Hán Việt: {w.hanviet}</span>}
            {posLabels(w.pos).map((p) => <span key={p} className="pill">{p}</span>)}
          </div>

          {ex && (
            <div className="mt-auto rounded-2xl border border-stone-200 bg-white/80 p-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">Ví dụ</div>
              <div className="hanzi mt-1 break-words text-lg leading-snug"><Highlight text={ex.hanzi} word={w.hanzi} /></div>
              {ex.pinyin && <div className="break-words text-sm text-brand">{ex.pinyin}</div>}
              {ex.meaningVi && <div className="break-words text-sm text-stone-600">{ex.meaningVi}</div>}
            </div>
          )}
          <div className={`flex items-center justify-between text-xs text-stone-500 ${ex ? '' : 'mt-auto'}`}>
            <Link href={`/word/${w.id}`} onClick={(e) => e.stopPropagation()} className="underline">Xem thứ tự nét & chi tiết</Link>
            <span>Chạm để lật lại</span>
          </div>
        </div>
      </div>
    </div>
  );
}
