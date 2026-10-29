'use client';
import { useEffect, useState } from 'react';

const PRESETS = [5, 10, 15, 20, 30];
export const MIN_Q = 3;
export const MAX_Q = 50;

/** Chọn số câu hỏi: phong cách ấn phẩm biên tập */
export default function CountPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {PRESETS.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-pressed={n === value}
          className={`min-h-[44px] min-w-[44px] rounded-lg border px-3 text-sm font-bold transition-colors active:translate-y-px ${
            n === value
              ? 'border-brand-ink/50 bg-brand text-ink'
              : 'border-line bg-white text-stone-600 hover:border-stone-400 hover:text-ink'
          }`}
        >
          {n}
        </button>
      ))}
      <label className="ml-2 flex items-center gap-2 text-sm text-stone-600">
        <span>hoặc nhập:</span>
        <input
          type="number"
          inputMode="numeric"
          min={MIN_Q}
          max={MAX_Q}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const n = Math.round(Number(e.target.value));
            if (!Number.isNaN(n) && n >= MIN_Q && n <= MAX_Q) onChange(n);
          }}
          onBlur={() => setText(String(value))}
          className="min-h-[44px] w-16 rounded-lg border border-stone-300 bg-white px-2 text-center text-sm font-bold text-ink outline-none transition focus:border-brand-ink focus:ring-2 focus:ring-brand/40"
        />
        <span>câu</span>
      </label>
    </div>
  );
}
