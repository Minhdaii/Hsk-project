'use client';
import { useState } from 'react';
import { useFavorites } from './FavoritesProvider';

export default function FavoriteButton({
  wordId,
  label = false,
  className = '',
}: {
  wordId: number;
  label?: boolean;
  className?: string;
}) {
  const { has, toggle } = useFavorites();
  const on = has(wordId);
  const [popping, setPopping] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPopping(true);
    toggle(wordId);
    setTimeout(() => setPopping(false), 240);
  };

  return (
    <button
      type="button"
      aria-label={on ? 'Bỏ khỏi sổ tay' : 'Lưu vào sổ tay'}
      title={on ? 'Bỏ khỏi sổ tay' : 'Lưu vào sổ tay'}
      onClick={handleClick}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border transition-all duration-150 active:scale-95 ${
        on
          ? 'border-brand-ink/40 bg-brand-soft text-brand-ink'
          : 'border-line bg-white text-stone-500 hover:border-brand-ink hover:text-brand-ink'
      } ${label ? 'min-h-[44px] px-4 text-sm font-medium' : 'h-11 w-11 text-lg'} ${className}`}
    >
      <span
        aria-hidden
        className={`inline-block transition-transform duration-150 ${
          popping ? 'scale-125' : 'scale-100'
        }`}
      >
        {on ? '★' : '☆'}
      </span>
      {label && <span>{on ? 'Đã lưu' : 'Lưu từ'}</span>}
    </button>
  );
}
