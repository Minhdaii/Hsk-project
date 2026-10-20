'use client';
import { useEffect, useState } from 'react';

const PRESETS = [5, 10, 15, 20, 30];
export const MIN_Q = 3;
export const MAX_Q = 50;

/** Chọn số câu hỏi: các mức có sẵn hoặc tự nhập (3-50) */
export default function CountPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} aria-pressed={n === value}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 active:scale-95 ${n === value ? 'bg-brand text-white shadow-[0_6px_14px_-6px_rgba(192,57,43,0.8)]' : 'border border-stone-200 bg-white text-stone-600 hover:border-brand/40 hover:text-brand'}`}>
          {n}
        </button>
      ))}
      <label className="ml-1 flex items-center gap-2 text-sm text-stone-500">
        <span>hoặc nhập</span>
        <input
          type="number" inputMode="numeric" min={MIN_Q} max={MAX_Q} value={text}
          onChange={(e) => {
            setText(e.target.value);
            const n = Math.round(Number(e.target.value));
            if (!Number.isNaN(n) && n >= MIN_Q && n <= MAX_Q) onChange(n);
          }}
          onBlur={() => setText(String(value))}
          className="w-[4.5rem] rounded-xl border border-stone-300 bg-white px-2 py-2 text-center font-bold outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </label>
    </div>
  );
}
