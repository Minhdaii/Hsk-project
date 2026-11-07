'use client';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import SpeakButton from './SpeakButton';
import FavoriteButton from './FavoriteButton';
import { posLabels, splitMeaning } from '@/lib/pos';
import type { Card } from '@/lib/types';
import HanziWriterBox from './HanziWriterBox';

/** Làm nổi bật từ cần học trong câu ví dụ với phong cách Lavender thanh nhã */
function Highlight({ text, word }: { text: string; word: string }) {
  const parts = text.split(word);
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && (
            <b className="rounded bg-brand-soft px-1 font-semibold text-brand-ink">{word}</b>
          )}
        </span>
      ))}
    </>
  );
}

const face = { gridArea: '1 / 1', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' } as const;
const inert = (on: boolean): Record<string, string> => (on ? { inert: '' } : {});

/**
 * Thẻ từ vựng Flashcard phong cách Lavender White × Lavender:
 * Mặt trước: Chữ Hán đại tự trong khung mễ tự cách cân đối.
 * Mặt sau: Tầng bậc biên tập Hán tự → Pinyin Lavender → Nghĩa tiếng Việt → Câu ví dụ ngữ cảnh.
 */
export default function FlipCard({
  card,
  flipped,
  canFlip,
  onToggle,
}: {
  card: Card;
  flipped: boolean;
  canFlip: boolean;
  onToggle: () => void;
}) {
  const w = card.word;
  const ex = w.examples?.[0];
  const isNew = !card.progress;
  const single = Array.from(w.hanzi).length === 1;
  const meanings = splitMeaning(w.meaningVi || w.meaningEn).slice(0, 4);
  const [showStrokeModal, setShowStrokeModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!showStrokeModal) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setShowStrokeModal(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [showStrokeModal]);
  const hanziChars = Array.from(w.hanzi).filter((c) => /[\u3400-\u9fff]/.test(c));

  return (
    <div
      className={`h-full [perspective:1400px] ${canFlip ? 'cursor-pointer' : ''}`}
      onClick={() => {
        if (canFlip) onToggle();
      }}
    >
      <div
        className="grid h-full transition-transform duration-[550ms] ease-[cubic-bezier(.35,.1,.2,1)] [transform-style:preserve-3d]"
        style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* ---------- Mặt trước: Chữ / Câu hỏi ---------- */}
        <div
          style={face}
          aria-hidden={flipped}
          {...inert(flipped)}
          className="relative flex h-full min-h-[300px] sm:min-h-[350px] lg:min-h-[420px] flex-col items-center justify-between rounded-2xl border-2 border-line bg-white p-5 sm:p-6 text-center shadow-sm"
        >
          {/* Top meta */}
          <div className="flex w-full items-center justify-between">
            <span className={isNew ? 'editorial-badge' : 'editorial-badge-stone'}>
              {isNew ? 'Từ mới' : 'Ôn tập'}
            </span>
            <div className="flex items-center gap-2">
              <span className="editorial-badge">HSK {w.hskLevel}</span>
              <FavoriteButton wordId={w.id} className="!text-base" />
            </div>
          </div>

          {/* Center Glyph Box */}
          <div className="my-auto flex flex-col items-center py-2">
            <div
              className={`flex items-center justify-center rounded-xl border border-line bg-stone-50 ${
                single ? 'mi-grid-ink aspect-square w-28 sm:w-36 lg:w-40' : 'min-w-[10rem] max-w-full px-5 py-4 sm:py-6'
              }`}
            >
              <span
                lang="zh-Hans"
                className="hanzi break-words leading-none text-ink"
                style={{ fontSize: single ? 'clamp(3.5rem, 9vw, 5.25rem)' : 'clamp(2.5rem, 6.5vw, 3.75rem)' }}
              >
                {w.hanzi}
              </span>
            </div>

            <div className="mt-4">
              <SpeakButton text={w.hanzi} audioUrl={w.audioUrl} label />
            </div>
          </div>

          {/* Bottom helper */}
          <p className="text-[11px] sm:text-xs font-medium text-stone-600">
            {canFlip ? 'Chạm vào thẻ hoặc nhấn Space để lật thẻ' : 'Lựa chọn đáp án chính xác ở cột bên phải (phím 1–4)'}
          </p>
        </div>

        {/* ---------- Mặt sau: Đáp án & Thông tin chi tiết ---------- */}
        <div
          style={{ ...face, transform: 'rotateY(180deg)' }}
          aria-hidden={!flipped}
          {...inert(!flipped)}
          className="relative flex h-full min-h-[300px] sm:min-h-[350px] lg:min-h-[420px] flex-col justify-between rounded-2xl border-2 border-line bg-stone-50 p-5 sm:p-6 text-left shadow-sm"
        >
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
              <div className="min-w-0">
                <div lang="zh-Hans" className="hanzi break-words text-3xl sm:text-4xl font-bold leading-tight text-ink">
                  {w.hanzi}
                </div>
                <div className="pinyin mt-0.5 break-words text-lg sm:text-xl font-bold text-brand-ink">
                  {w.pinyin}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <FavoriteButton wordId={w.id} className="!text-base" />
                <SpeakButton text={w.hanzi} audioUrl={w.audioUrl} />
              </div>
            </div>

            {/* Meanings */}
            <div className="mt-3 space-y-2">
              <ul className="space-y-1">
                {meanings.map((m, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2 break-words leading-snug ${
                      i === 0 ? 'text-base font-bold text-ink' : 'text-xs sm:text-sm text-stone-700'
                    }`}
                  >
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span className="min-w-0 flex-1">{m}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {w.hanviet && (
                  <span className="editorial-badge-stone">Âm Hán Việt: {w.hanviet}</span>
                )}
                {posLabels(w.pos).map((p) => (
                  <span key={p} className="editorial-badge-stone">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Context Example */}
          {ex && (
            <div className="my-2 rounded-xl border border-line bg-white p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-600">
                Ví dụ ngữ cảnh
              </div>
              <div lang="zh-Hans" className="hanzi mt-1 break-words text-sm sm:text-base leading-snug text-ink">
                <Highlight text={ex.hanzi} word={w.hanzi} />
              </div>
              {ex.pinyin && (
                <div className="pinyin mt-0.5 break-words text-[11px] text-brand-ink">{ex.pinyin}</div>
              )}
              {ex.meaningVi && (
                <div className="mt-0.5 break-words text-[11px] text-stone-600">{ex.meaningVi}</div>
              )}
            </div>
          )}

          {/* Footer Link */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2">
            <button type="button" onClick={(e) => { e.stopPropagation(); setShowStrokeModal(true); }} className="inline-flex min-h-[38px] items-center gap-1 text-xs font-semibold text-brand-ink underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">
              <span>Xem nét bút</span><ArrowRight className="h-3 w-3" />
            </button>
            <Link href={`/word/${w.id}`} onClick={(e) => e.stopPropagation()} className="text-xs font-medium text-stone-500 underline-offset-4 hover:text-ink hover:underline">Chi tiết từ điển</Link>
          </div>
        </div>
      </div>
      {mounted && showStrokeModal && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => { if (e.target === e.currentTarget) setShowStrokeModal(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="stroke-modal-title" className="my-auto w-full max-w-3xl rounded-3xl border border-line bg-white p-5 shadow-2xl sm:p-7">
            <header className="mb-5 flex items-start justify-between gap-4 border-b border-line pb-4">
              <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-brand-ink">THỨ TỰ NÉT CHUẨN</p><h2 id="stroke-modal-title" className="hanzi mt-1 text-3xl font-bold">{w.hanzi}<span className="pinyin ml-3 align-middle text-base font-semibold text-brand-ink">{w.pinyin}</span></h2><p className="mt-1 text-sm text-stone-600">{w.meaningVi}</p></div>
              <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-stone-600 hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand" onClick={() => setShowStrokeModal(false)} aria-label="Đóng cửa sổ nét bút"><X className="h-4 w-4" /></button>
            </header>
            {hanziChars.length ? <div className="flex max-h-[65vh] flex-wrap justify-center gap-4 overflow-y-auto py-2">{hanziChars.map((char, index) => <HanziWriterBox key={`${char}-${index}`} char={char} />)}</div> : <p className="rounded-xl bg-paper p-4 text-sm text-stone-600">Từ này chưa có ký tự Hán để mô phỏng nét viết.</p>}
          </section>
        </div>, document.body
      )}
    </div>
  );
}
