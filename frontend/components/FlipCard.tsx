'use client';
import Link from 'next/link';
import SpeakButton from './SpeakButton';
import FavoriteButton from './FavoriteButton';
import { posLabels, splitMeaning } from '@/lib/pos';
import type { Card } from '@/lib/types';

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
          <div className="border-t border-line pt-2">
            <Link
              href={`/word/${w.id}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex min-h-[44px] items-center text-xs font-semibold text-brand-ink underline-offset-4 hover:underline"
            >
              Xem nét bút thuận & chi tiết từ điển →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
