'use client';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import Tip from './Tip';

const SIZE = { md: 'h-11 w-11', pill: 'h-11 w-10 sm:w-14' } as const;

/** Lớp dùng chung cho nút icon tròn: hover (nền nhạt + icon phóng 1,08), focus (viền), đang chọn (nền đen, icon trắng). */
export const iconBtn = (active: boolean, size: keyof typeof SIZE = 'md') =>
  `group/ico relative inline-flex shrink-0 items-center justify-center rounded-full outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${SIZE[size]} ${
    active ? 'bg-ink text-white' : 'text-stone-500 hover:bg-brand-soft hover:text-ink focus-visible:bg-brand-soft focus-visible:text-ink'
  }`;
export const iconGlyph = 'h-5 w-5 transition-transform duration-200 ease-out group-hover/ico:scale-[1.08] group-focus-visible/ico:scale-[1.08] motion-reduce:transition-none';

type Common = { label: string; icon: LucideIcon; active?: boolean; size?: keyof typeof SIZE; tip?: 'bottom' | 'top' | 'right' | false; tipAlign?: 'center' | 'end'; onHint?: (label: string) => void };

export function IconLink({ href, label, icon: Icon, active = false, size = 'md', tip = 'bottom', tipAlign = 'center', onHint }: Common & { href: string }) {
  const link = (
    <Link href={href} aria-label={label} aria-current={active ? 'page' : undefined} onFocus={() => onHint?.(label)} onPointerDown={(e) => { if (e.pointerType !== 'mouse') onHint?.(label); }} className={iconBtn(active, size)}>
      <Icon strokeWidth={1.8} className={iconGlyph} aria-hidden />
    </Link>
  );
  return tip ? <Tip label={label} side={tip} align={tipAlign}>{link}</Tip> : link;
}

export function IconButton({ label, icon: Icon, active = false, size = 'md', tip = 'bottom', tipAlign = 'center', onClick, expanded, children }: Common & { onClick: () => void; expanded?: boolean; children?: React.ReactNode }) {
  const btn = (
    <button type="button" onClick={onClick} aria-label={label} aria-expanded={expanded} aria-haspopup={expanded === undefined ? undefined : 'true'} className={iconBtn(active, size)}>
      <Icon strokeWidth={1.8} className={iconGlyph} aria-hidden />
      {children}
    </button>
  );
  return tip && !expanded ? <Tip label={label} side={tip} align={tipAlign}>{btn}</Tip> : btn;
}
