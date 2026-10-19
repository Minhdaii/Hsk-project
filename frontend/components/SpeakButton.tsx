'use client';
import { speak } from '@/lib/speak';

export default function SpeakButton({ text, audioUrl, className = '', label = false }: { text: string; audioUrl?: string | null; className?: string; label?: boolean }) {
  return (
    <button
      type="button"
      aria-label="Nghe phát âm"
      title="Nghe phát âm"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); speak(text, audioUrl); }}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition hover:border-brand hover:text-brand active:scale-95 ${label ? 'px-4 py-2 text-sm font-medium' : 'h-10 w-10'} ${className}`}
    >
      <span aria-hidden>🔊</span>{label && <span>Nghe</span>}
    </button>
  );
}
