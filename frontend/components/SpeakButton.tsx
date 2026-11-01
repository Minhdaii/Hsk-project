'use client';
import { useState } from 'react';
import { speak } from '@/lib/speak';
import Icon from './Icon';

export default function SpeakButton({
  text,
  audioUrl,
  className = '',
  label = false,
}: {
  text: string;
  audioUrl?: string | null;
  className?: string;
  label?: boolean;
}) {
  const [playing, setPlaying] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPlaying(true);
    speak(text, audioUrl);
    setTimeout(() => setPlaying(false), 850);
  };

  return (
    <button
      type="button"
      aria-label="Nghe phát âm"
      title="Nghe phát âm"
      onClick={handleSpeak}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-line bg-white text-stone-700 transition-[transform,border-color,color] duration-150 hover:border-brand-ink hover:text-brand-ink active:scale-95 ${
        playing ? 'border-brand-ink text-brand-ink animate-pulse-subtle' : ''
      } ${label ? 'min-h-[44px] px-4 text-sm font-medium' : 'h-11 w-11'} ${className}`}
    >
      <Icon
        name="speaker"
        className={`h-5 w-5 transition-transform duration-150 ${playing ? 'scale-110' : ''}`}
      />
      {label && <span>Nghe</span>}
    </button>
  );
}
