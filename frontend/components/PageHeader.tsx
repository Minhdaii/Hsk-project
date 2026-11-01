import type { ReactNode } from 'react';

/**
 * Tiêu đề trang phong cách Lavender White × Lavender:
 * Phân cấp thanh lịch, ký tự chữ Hán đại diện mềm mại, phụ đề tự nhiên tiếng Việt
 */
export default function PageHeader({
  title,
  subtitle,
  actions,
  glyph,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  glyph?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 pb-2">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          {glyph && (
            <span
              lang="zh-Hans"
              aria-hidden
              className="hanzi flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-lg font-bold text-brand-ink "
            >
              {glyph}
            </span>
          )}
          <h1 className="text-xl font-bold leading-tight tracking-tight text-ink sm:text-3xl lg:text-4xl">{title}</h1>
        </div>
        {subtitle && <div className="mt-1 text-xs text-stone-600 sm:text-sm text-balance">{subtitle}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
