'use client';
import { useFavorites } from './FavoritesProvider';

export default function FavoriteButton({ wordId, label = false, className = '' }: { wordId: number; label?: boolean; className?: string }) {
  const { has, toggle } = useFavorites();
  const on = has(wordId);
  return (
    <button
      type="button"
      aria-label={on ? 'Bỏ khỏi sổ tay' : 'Lưu vào sổ tay'}
      title={on ? 'Bỏ khỏi sổ tay' : 'Lưu vào sổ tay'}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(wordId); }}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border bg-white shadow-sm transition active:scale-95 ${on ? 'border-amber-300 text-amber-500' : 'border-stone-200 text-stone-400 hover:border-amber-300 hover:text-amber-500'} ${label ? 'px-4 py-2 text-sm font-medium' : 'h-10 w-10 text-lg'} ${className}`}
    >
      <span aria-hidden>{on ? '★' : '☆'}</span>{label && <span>{on ? 'Đã lưu' : 'Lưu từ'}</span>}
    </button>
  );
}
