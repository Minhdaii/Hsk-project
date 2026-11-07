'use client';
import { useEffect, useState } from 'react';

const PRESETS = [5, 10, 15, 20, 30];
export const MIN_Q = 3;
export const MAX_Q = 50;

/** Chọn số câu bằng các thẻ chạm rõ trạng thái, dùng chung cho phòng luyện tập và trắc nghiệm. */
export default function CountPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  return (
    <div className="max-w-full">
      <div role="group" aria-label="Chọn số câu hỏi" className="flex flex-wrap items-center gap-1.5">
        {PRESETS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={n === value}
            className={`flex min-h-[42px] min-w-[54px] items-center justify-center gap-1 rounded-lg border px-2.5 text-sm transition-[transform,border-color,background-color,box-shadow,color] duration-200 active:scale-[.97] ${
              n === value
                ? 'border-brand-ink/45 bg-brand-soft text-ink shadow-[0_5px_16px_rgba(91,63,209,.12)] ring-2 ring-brand/25'
                : 'border-line bg-white text-stone-600 shadow-sm hover:-translate-y-0.5 hover:border-brand/60 hover:bg-white hover:text-ink hover:shadow-md'
            }`}
          >
            <span className="font-extrabold leading-none tabular-nums">{n}</span>
            <span className={`text-[9px] font-bold uppercase tracking-[.08em] ${n === value ? 'text-brand-ink' : 'text-stone-500'}`}>câu</span>
          </button>
        ))}
        <label className={`flex min-h-[42px] items-center gap-2 rounded-lg border px-2.5 ${PRESETS.includes(value) ? 'border-line bg-white' : 'border-brand-ink/45 bg-brand-soft ring-2 ring-brand/25'}`}>
          <span className="text-xs font-semibold text-stone-600">Khác</span>
        <input
          type="number"
          inputMode="numeric"
          step="1"
          min={MIN_Q}
          max={MAX_Q}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const n = Math.round(Number(e.target.value));
            if (!Number.isNaN(n) && n >= MIN_Q && n <= MAX_Q) onChange(n);
          }}
          onBlur={() => setText(String(value))}
          aria-label={`Số câu tùy chỉnh, từ ${MIN_Q} đến ${MAX_Q}`}
          className="min-h-[34px] w-[3.25rem] rounded-md border border-line bg-white px-1.5 text-center text-sm font-bold text-ink outline-none transition focus:border-brand-ink focus:ring-2 focus:ring-brand/40"
        />
        </label>
      </div>
    </div>
  );
}
