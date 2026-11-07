'use client';
import { useId } from 'react';
import type { ReactNode } from 'react';

export type FlameState = 'off' | 'warm' | 'lit' | 'ignite';

// Nét vẽ ngọn lửa mềm mại, tự nhiên nhiều lớp
const OUTER = 'M32 2 C35 15 52 24 52 46 C52 64 43 76 32 76 C21 76 12 64 12 46 C12 36 18 30 22 22 C24 28 27 32 29 33 C28 22 28 11 32 2 Z';
const INNER = 'M32 32 C35 41 43 47 43 57 C43 66 38 72 32 72 C26 72 21 66 21 57 C21 50 27 45 32 32 Z';
const CORE = 'M32 48 C34 53 38 56 38 62 C38 67 35 69 32 69 C29 69 26 67 26 62 C26 57 30 53 32 48 Z';

export default function Flame({
  size = 22,
  state = 'lit',
  className = '',
  children,
}: {
  size?: number;
  state?: FlameState;
  className?: string;
  children?: ReactNode;
}) {
  const uid = useId().replace(/:/g, '');
  const isOff = state === 'off';
  const isIgnite = state === 'ignite';
  const isLit = state === 'lit' || state === 'ignite';

  const anim = isIgnite ? 'animate-ignite' : isLit ? 'animate-flicker' : '';
  const w = Math.round(size * 0.82);

  return (
    <span
      className={`relative inline-flex shrink-0 items-end justify-center ${className}`}
      style={{ width: w, height: size }}
      aria-hidden
    >
      {!isOff && (
        <span
          className="absolute inset-x-0 bottom-0 h-3/4 rounded-full bg-orange-500/35 blur-md"
          aria-hidden
        />
      )}
      <svg
        viewBox="0 0 64 80"
        width={w}
        height={size}
        className={`relative ${anim}`}
        style={{
          transformOrigin: '50% 92%',
          filter: !isOff ? 'drop-shadow(0 1px 4px rgba(234, 88, 12, 0.45))' : undefined,
          transition: 'all .3s ease',
        }}
      >
        <defs>
          {/* Lớp vỏ ngọn lửa: chuyển màu từ vàng cam rực sang đỏ lửa */}
          <linearGradient id={`o${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isOff ? '#D6D3D1' : '#FFA726'} />
            <stop offset="65%" stopColor={isOff ? '#A8A29E' : '#FF5722'} />
            <stop offset="100%" stopColor={isOff ? '#78716C' : '#E63946'} />
          </linearGradient>

          {/* Lớp ngọn lửa giữa: vàng sáng rực */}
          <linearGradient id={`i${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isOff ? '#E7E5E4' : '#FFF176'} />
            <stop offset="100%" stopColor={isOff ? '#D6D3D1' : '#FF9800'} />
          </linearGradient>

          {/* Lõi lửa trắng vàng ấm áp */}
          <linearGradient id={`c${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFF9C4" />
          </linearGradient>
        </defs>

        <path d={OUTER} fill={`url(#o${uid})`} />
        <path d={INNER} fill={`url(#i${uid})`} />
        {!isOff && <path d={CORE} fill={`url(#c${uid})`} />}
      </svg>
      {children && <span className="absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2 text-[9px] font-black leading-none tabular-nums text-[#34251f]">{children}</span>}
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
