'use client';
import Anim from './motion/Anim';

/**
 * Scroll Reveal: Phần tử hiện dần và trượt lên nhẹ khi đi vào khung nhìn (Anime.js).
 * Thông số chuẩn: duration 420ms (350–550ms), y: 14px, easeOutCubic.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <Anim view delay={delay} y={14} duration={420} className={className}>
      {children}
    </Anim>
  );
}
