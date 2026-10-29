'use client';
import { useId } from 'react';

/** off: lửa tắt (xám) · lit: lửa đang cháy · ignite: lửa vừa được thắp (phóng to rồi cháy tiếp) */
export type FlameState = 'off' | 'lit' | 'ignite';

const OUTER = 'M32 2 C34 16 52 26 52 48 C52 64 43 76 32 76 C21 76 12 64 12 48 C12 38 18 32 22 24 C24 30 27 33 29 34 C28 24 28 12 32 2 Z';
const INNER = 'M32 36 C34 44 42 50 42 59 C42 67 37 72 32 72 C27 72 22 67 22 59 C22 52 28 48 32 36 Z';
const CORE = 'M32 52 C33 56 37 59 37 64 C37 68 35 70 32 70 C29 70 27 68 27 64 C27 59 31 56 32 52 Z';

export default function Flame({ size = 48, state = 'lit', className = '' }: { size?: number; state?: FlameState; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const lit = state !== 'off';
  const anim = state === 'ignite' ? 'animate-ignite' : state === 'lit' ? 'animate-flicker' : '';
  const w = Math.round(size * 0.8);
  return (
    <span className={`relative inline-flex shrink-0 items-end justify-center ${className}`} style={{ width: w, height: size }} aria-hidden>
      {lit && <span className="absolute inset-x-0 bottom-0 h-3/4 animate-glow rounded-full bg-orange-400/50 blur-xl" />}
      <svg
        viewBox="0 0 64 80" width={w} height={size} className={`relative ${anim}`}
        style={{ transformOrigin: '50% 92%', filter: lit ? 'drop-shadow(0 0 6px rgba(255,140,0,.55))' : undefined, transition: 'filter .4s' }}
      >
        <defs>
          <linearGradient id={`o${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={lit ? '#ffb02e' : '#d6d3d1'} />
            <stop offset="1" stopColor={lit ? '#e63946' : '#a8a29e'} />
          </linearGradient>
          <linearGradient id={`i${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={lit ? '#ffe45c' : '#e7e5e4'} />
            <stop offset="1" stopColor={lit ? '#ff8a00' : '#d6d3d1'} />
          </linearGradient>
        </defs>
        <path d={OUTER} fill={`url(#o${uid})`} />
        <path d={INNER} fill={`url(#i${uid})`} />
        {lit && <path d={CORE} fill="#fff6b8" />}
      </svg>
    </span>
  );
}

/** Tia lửa bắn lên khi thắp lửa */
export function Sparks() {
  const sparks = [-34, -20, -8, 6, 18, 30, -26, 24];
  return (
    <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center">
      {sparks.map((x, i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 animate-spark rounded-full bg-amber-300"
          style={{ ['--x' as string]: `${x}px`, animationDelay: `${i * 70}ms`, boxShadow: '0 0 6px 2px rgba(251,191,36,.8)' }}
        />
      ))}
    </span>
  );
}
