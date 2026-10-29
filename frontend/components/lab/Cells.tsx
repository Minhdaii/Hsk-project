/**
 * Ô tập viết làm đơn vị tiến độ: mỗi ô là một phần của tổng, ô đặc là phần đã đạt.
 * `strong` ô đầu là phần đạt cao hơn (ví dụ: đã thuộc), `filled` là tổng phần đã đạt (ví dụ: đã học).
 */
export default function Cells({ total, filled, strong = 0, cols, label, className = '' }: {
  total: number; filled: number; strong?: number; cols: number; label: string; className?: string;
}) {
  const n = Math.max(1, Math.min(120, total));
  return (
    <div role="img" aria-label={label} className={`grid gap-[3px] ${className}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className={`aspect-square rounded-[3px] transition-colors duration-500 ${i < strong ? 'bg-brand-ink' : i < filled ? 'bg-brand' : 'bg-stone-100 ring-1 ring-inset ring-line'}`} />
      ))}
    </div>
  );
}
