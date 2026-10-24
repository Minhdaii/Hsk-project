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
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border transition-colors active:translate-y-px ${on ? 'border-brand-ink/40 bg-brand-soft text-brand-ink' : 'border-line bg-white text-stone-500 hover:border-brand-ink hover:text-brand-ink'} ${label ? 'min-h-[44px] px-4 text-sm font-medium' : 'h-11 w-11 text-lg'} ${className}`}
    >
      <span aria-hidden>{on ? '★' : '☆'}</span>{label && <span>{on ? 'Đã lưu' : 'Lưu từ'}</span>}
    </button>
  );
}
