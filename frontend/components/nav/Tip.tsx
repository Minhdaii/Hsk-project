import type { ReactNode } from 'react';

const SIDE = {
  bottom: 'top-full mt-2',
  top: 'bottom-full mb-2',
  right: 'left-full top-1/2 ml-3 -translate-y-1/2',
} as const;
const ALIGN = { center: 'left-1/2 -translate-x-1/2', end: 'right-0' } as const;

/**
 * Tooltip chỉ bằng CSS: hiện khi rê chuột (thiết bị có hover) hoặc khi phần tử bên trong nhận focus bằng bàn phím
 * (:focus-visible). Bấm chuột làm phần tử giữ focus nhưng KHÔNG làm tooltip ở lại.
 * Tên chức năng luôn có thêm ở aria-label của phần tử bên trong, nên không phụ thuộc vào tooltip.
 */
export default function Tip({ label, side = 'bottom', align = 'center', children }: { label: string; side?: keyof typeof SIDE; align?: keyof typeof ALIGN; children: ReactNode }) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-has-[:focus-visible]/tip:opacity-100 [@media(hover:hover)]:group-hover/tip:opacity-100 ${SIDE[side]} ${side === 'right' ? '' : ALIGN[align]}`}
      >
        {label}
      </span>
    </span>
  );
}
