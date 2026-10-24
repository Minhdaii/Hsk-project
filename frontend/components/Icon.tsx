import type { ReactNode } from 'react';

export type IconName = 'home' | 'book' | 'cards' | 'grammar' | 'pencil' | 'star' | 'trophy' | 'menu' | 'speaker' | 'chart' | 'arrow' | 'check' | 'logout' | 'user';

const PATHS: Record<IconName, ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v10h13V10" /><path d="M10 20v-6h4v6" /></>,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /></>,
  cards: <><rect x="3.5" y="8" width="13" height="12" rx="2.5" /><path d="M7.5 4.5h11A2.5 2.5 0 0 1 21 7v9" /></>,
  grammar: <><path d="M12 6.5C10 5 7 4.5 4 4.5v13c3 0 6 .5 8 2 2-1.5 5-2 8-2v-13c-3 0-6 .5-8 2Z" /><path d="M12 6.5v13" /></>,
  pencil: <><path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 0l0 0a2 2 0 0 1 0 3L8 19l-4 1Z" /><path d="m14.5 6.5 3 3" /></>,
  star: <path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.6l6.1-.8L12 3.2Z" />,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" /><path d="M8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3" /><path d="M12 13v4M8.5 20h7M10 17h4" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  speaker: <><path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></>,
  chart: <path d="M5 20V11M12 20V4M19 20v-6M3 20h18" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  logout: <><path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9" /><path d="m16 8 4 4-4 4M20 12H9" /></>,
  user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
};

/** Biểu tượng nét mảnh, đổi màu theo chữ (currentColor) */
export default function Icon({ name, className = 'h-6 w-6' }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {PATHS[name]}
    </svg>
  );
}
