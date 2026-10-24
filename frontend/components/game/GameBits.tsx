'use client';
import { useState } from 'react';
import Flame from '../Flame';
import Confetti from '../Confetti';
import SpeakButton from '../SpeakButton';
import { splitMeaning } from '@/lib/pos';

/** Đếm số câu đúng liên tiếp (combo) và chuỗi dài nhất */
export function useCombo() {
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const record = (ok: boolean) => {
    const n = ok ? combo + 1 : 0;
    setCombo(n);
    setBest((b) => Math.max(b, n));
  };
  return { combo, best, record };
}

/** Tiêu đề bài tập: số câu, combo, điểm và thanh tiến độ */
export function GameHeader({ i, total, score, combo }: { i: number; total: number; score: number; combo: number }) {
  const segmented = total <= 20;
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[#302B3D]">
          Câu {i + 1} <span className="font-normal text-[#777184]">/ {total}</span>
        </span>
        <div className="flex items-center gap-2">
          {combo >= 2 && (
            <span key={combo} className="editorial-badge flex animate-pop items-center gap-1 font-bold">
              <Flame size={14} state="lit" /> ×{combo} liên tiếp
            </span>
          )}
          <span className="editorial-badge-stone font-semibold">
            Đúng {score} câu
          </span>
        </div>
      </div>
      {segmented ? (
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, k) => (
            <span
              key={k}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                k < i ? 'bg-[#A99AE8]' : k === i ? 'bg-[#A99AE8] ring-2 ring-[#A99AE8]/30' : 'bg-[#EEE9FC]'
              }`}
            />
          ))}
        </div>
      ) : (
        <div className="h-1.5 overflow-hidden rounded-full bg-[#EEE9FC]">
          <div
            className="bar-fill h-full rounded-full bg-[#A99AE8] transition-[width] duration-500"
            style={{ width: `${(i / total) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

/** Màn hình kết quả luyện tập */
export function GameResult({
  score,
  total,
  best,
  onAgain,
  onExit,
}: {
  score: number;
  total: number;
  best: number;
  onAgain: () => void;
  onExit: () => void;
}) {
  const ratio = total ? score / total : 0;
  const pct = Math.round(ratio * 100);
  const msg =
    ratio >= 0.9
      ? 'Xuất sắc! Phản xạ từ vựng của bạn rất vững.'
      : ratio >= 0.7
      ? 'Rất tốt! Bạn nắm khá chắc kiến thức này.'
      : ratio >= 0.5
      ? 'Khá ổn! Hãy luyện thêm một lượt để củng cố phản xạ.'
      : 'Đừng nản lòng! Luyện tập đều đặn mỗi ngày sẽ giúp phản xạ nhanh hơn.';

  return (
    <div className="editorial-card animate-pop space-y-6 p-8 text-center sm:p-10">
      {ratio >= 0.8 && <Confetti />}
      <div
        className="mx-auto flex h-36 w-36 items-center justify-center rounded-full p-2.5"
        style={{
          background: `conic-gradient(#A99AE8 ${pct * 3.6}deg, #EEE9FC 0deg)`,
        }}
      >
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white shadow-2xs">
          <span className="text-3xl font-extrabold leading-none text-[#302B3D]">
            {pct}<span className="text-lg font-bold">%</span>
          </span>
          <span className="mt-1 text-xs font-semibold text-[#777184]">
            {score} / {total} câu
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-[#302B3D]">{msg}</h3>
        <p className="mt-1 text-xs text-[#777184]">
          Chuỗi trả lời đúng liên tiếp dài nhất: <strong className="font-bold text-[#55449E]">{best} câu</strong>
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <button className="btn-editorial-ghost text-xs" onClick={onExit}>
          Chọn dạng bài khác
        </button>
        <button className="btn-editorial-primary text-xs" onClick={onAgain}>
          Luyện lại lượt này
        </button>
      </div>
    </div>
  );
}

/** Bảng hiển thị đáp án sau khi người dùng lựa chọn */
export function AnswerPanel({
  ok,
  hanzi,
  pinyin,
  meaning,
  audioUrl,
}: {
  ok: boolean;
  hanzi: string;
  pinyin: string | null;
  meaning: string | null;
  audioUrl?: string | null;
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        ok ? 'border-emerald-500/40 bg-emerald-50/70' : 'border-rose-300 bg-rose-50/70'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className={`text-xs font-bold ${ok ? 'text-emerald-800' : 'text-rose-800'}`}>
            {ok ? '✓ Chính xác!' : '✕ Chưa đúng. Đáp án chuẩn là:'}
          </div>
          <div lang="zh-Hans" className="hanzi mt-1 break-words text-3xl font-bold leading-tight text-[#302B3D]">
            {hanzi}
          </div>
          {pinyin && (
            <div className="pinyin mt-0.5 text-sm font-semibold text-[#55449E]">
              {pinyin}
            </div>
          )}
          <ul className="mt-2 space-y-1 text-xs text-[#504A5D]">
            {splitMeaning(meaning)
              .slice(0, 3)
              .map((m, idx) => (
                <li key={idx} className="flex items-start gap-1.5 break-words">
                  <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#A99AE8]" />
                  <span>{m}</span>
                </li>
              ))}
          </ul>
        </div>
        <div className="shrink-0 pt-1">
          <SpeakButton text={hanzi} audioUrl={audioUrl} />
        </div>
      </div>
    </div>
  );
}
