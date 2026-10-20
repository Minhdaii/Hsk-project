'use client';
import { useState } from 'react';
import Flame from '../Flame';
import Confetti from '../Confetti';
import SpeakButton from '../SpeakButton';
import { splitMeaning } from '@/lib/pos';

/** Đếm số câu đúng liên tiếp (combo) và combo dài nhất */
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

/** Tiêu đề trò chơi: số câu, combo, điểm và thanh tiến độ */
export function GameHeader({ i, total, score, combo }: { i: number; total: number; score: number; combo: number }) {
  const segmented = total <= 20;
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-stone-700">Câu {i + 1}<span className="text-stone-400">/{total}</span></span>
        <div className="flex items-center gap-2">
          {combo >= 2 && (
            <span key={combo} className="flex animate-pop items-center gap-0.5 rounded-full bg-orange-50 py-0.5 pl-1 pr-2.5 font-bold text-orange-600">
              <Flame size={18} state="lit" />×{combo}
            </span>
          )}
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-700">Đúng {score}</span>
        </div>
      </div>
      {segmented ? (
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, k) => (
            <span key={k} className={`h-2 flex-1 rounded-full transition-all duration-500 ${k < i ? 'bg-brand' : k === i ? 'bg-brand/40' : 'bg-stone-200'}`} />
          ))}
        </div>
      ) : (
        <div className="h-2 overflow-hidden rounded-full bg-stone-200">
          <div className="bar-fill h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${(i / total) * 100}%` }} />
        </div>
      )}
    </div>
  );
}

/** Màn hình kết quả với vòng phần trăm */
export function GameResult({ score, total, best, onAgain, onExit }: { score: number; total: number; best: number; onAgain: () => void; onExit: () => void }) {
  const ratio = total ? score / total : 0;
  const pct = Math.round(ratio * 100);
  const msg = ratio >= 0.9 ? 'Xuất sắc!' : ratio >= 0.7 ? 'Rất tốt!' : ratio >= 0.5 ? 'Khá ổn, cố thêm chút nữa!' : 'Đừng nản, luyện thêm là tiến bộ ngay!';
  return (
    <div className="card animate-pop space-y-5 py-9 text-center shadow-soft">
      {ratio >= 0.8 && <Confetti />}
      <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full p-2.5" style={{ background: `conic-gradient(#c0392b ${pct * 3.6}deg, #ece8e2 0)` }}>
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white">
          <span className="text-4xl font-extrabold leading-none">{pct}<span className="text-xl">%</span></span>
          <span className="mt-1 text-xs text-stone-500">{score}/{total} câu</span>
        </div>
      </div>
      <div>
        <p className="text-xl font-bold">{msg}</p>
        <p className="mt-1 text-sm text-stone-500">Chuỗi đúng dài nhất: <b className="text-orange-600">{best}</b></p>
      </div>
      <div className="flex justify-center gap-2 pt-1">
        <button className="btn-ghost" onClick={onExit}>Chọn bài khác</button>
        <button className="btn-primary" onClick={onAgain}>Làm lại</button>
      </div>
    </div>
  );
}

/** Bảng đáp án sau khi trả lời: chữ Hán, pinyin và nghĩa đầy đủ */
export function AnswerPanel({ ok, hanzi, pinyin, meaning, audioUrl }: { ok: boolean; hanzi: string; pinyin: string | null; meaning: string | null; audioUrl?: string | null }) {
  return (
    <div className={`card flex animate-pop items-center gap-4 ${ok ? 'border-emerald-300 bg-emerald-50/70' : 'border-red-300 bg-red-50/70'}`}>
      <div className="min-w-0 flex-1">
        <div className={`text-sm font-bold ${ok ? 'text-emerald-700' : 'text-red-700'}`}>{ok ? 'Chính xác!' : 'Chưa đúng, đáp án là:'}</div>
        <div className="hanzi mt-0.5 break-words text-3xl leading-tight">{hanzi}</div>
        {pinyin && <div className="font-medium text-brand">{pinyin}</div>}
        <ul className="mt-1.5 space-y-0.5 text-sm text-stone-700">
          {splitMeaning(meaning).slice(0, 3).map((m, i) => <li key={i} className="break-words">• {m}</li>)}
        </ul>
      </div>
      <SpeakButton text={hanzi} audioUrl={audioUrl} />
    </div>
  );
}
