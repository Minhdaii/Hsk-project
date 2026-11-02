import Link from 'next/link';

/**
 * LandingFooter — Modern Ink Editorial
 * Black / White / Vermilion · Clean contemporary editorial layout
 */
export default function LandingFooter() {
  return (
    <footer className="border-t border-[#111]/15 bg-white text-[#111]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-sm text-[#777] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2.5 font-bold" aria-label="学汉语, trang chủ">
          <span
            aria-hidden
            className="inline-flex h-8 w-8 items-center justify-center bg-[#C62828] font-hanzi text-lg font-black text-white"
            style={{ borderRadius: '3px' }}
          >
            汉
          </span>
          <span className="leading-tight">
            <span className="hanzi block text-base font-bold text-[#111]" lang="zh-Hans">
              学汉语
            </span>
            <span className="block text-[11px] font-medium text-[#777]">Học tiếng Trung HSK 1–3</span>
          </span>
        </Link>

        <nav aria-label="Liên kết cuối trang" className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-[#555]">
          {[
            ['/words', 'Kho từ vựng'],
            ['/grammar', 'Cẩm nang ngữ pháp'],
            ['/path', 'Lộ trình học'],
            ['/credits', 'Nguồn dữ liệu'],
            ['/privacy', 'Quyền riêng tư'],
          ].map(([h, l]) => (
            <Link
              key={h}
              href={h}
              className="inline-flex min-h-[36px] items-center transition-colors hover:text-[#111] hover:underline"
            >
              {l}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
