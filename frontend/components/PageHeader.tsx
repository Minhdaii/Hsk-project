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
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E7E2F0] pb-5">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          {glyph && (
            <span
              lang="zh-Hans"
              aria-hidden
              className="hanzi flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DDD5F2] bg-[#EEE9FC] text-lg font-bold text-[#55449E] shadow-xs"
            >
              {glyph}
            </span>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-[#302B3D] sm:text-3xl">{title}</h1>
        </div>
        {subtitle && <div className="mt-1 text-xs text-[#777184] sm:text-sm">{subtitle}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
