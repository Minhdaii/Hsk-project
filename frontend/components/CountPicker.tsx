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
          className={`min-h-[38px] min-w-[38px] rounded border px-3 text-xs font-bold transition-all active:translate-y-px ${
            n === value
              ? 'border-[#C94B3C] bg-[#C94B3C] text-white shadow-xs'
              : 'border-[#DFD8CC] bg-white text-[#4A4754] hover:border-stone-400 hover:text-[#18181B]'
          }`}
        >
          {n}
        </button>
      ))}
      <label className="ml-2 flex items-center gap-2 text-xs text-stone-500">
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
          className="min-h-[38px] w-16 rounded border border-[#DFD8CC] bg-white px-2 text-center text-xs font-bold text-[#18181B] outline-none transition focus:border-[#C94B3C] focus:ring-1 focus:ring-[#C94B3C]"
        />
        <span>câu</span>
      </label>
    </div>
  );
}
