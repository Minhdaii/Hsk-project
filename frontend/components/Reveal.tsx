'use client';
import Anim from './motion/Anim';

/** Phần tử hiện dần và trượt lên khi cuộn tới (Anime.js, xem components/motion/Anim.tsx) */
export default function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return <Anim view delay={delay} y={22} duration={650} className={className}>{children}</Anim>;
}
