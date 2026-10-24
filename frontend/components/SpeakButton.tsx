'use client';
import { speak } from '@/lib/speak';
import Icon from './Icon';

export default function SpeakButton({ text, audioUrl, className = '', label = false }: { text: string; audioUrl?: string | null; className?: string; label?: boolean }) {
  return (
    <button
      type="button"
      aria-label="Nghe phát âm"
      title="Nghe phát âm"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); speak(text, audioUrl); }}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-line bg-white text-stone-700 transition-colors hover:border-brand-ink hover:text-brand-ink active:translate-y-px ${label ? "min-h-[44px] px-4 text-sm font-medium" : "h-11 w-11"} ${className}`}
    >
      <Icon name="speaker" className="h-5 w-5" />{label && <span>Nghe</span>}
    </button>
  );
}
