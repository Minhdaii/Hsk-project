'use client';
import Link from 'next/link';
import { useUser } from '@/lib/useUser';

const LINKS = [
  { href: '#tinh-nang', label: 'Tính năng' },
  { href: '#cach-hoc', label: 'Cách học' },
  { href: '#cap-do', label: 'Cấp độ' },
];

/**
 * Landing Nav — Modern Ink Editorial style.
 * Black/White/Vermilion only. Logo là dấu triện đỏ + tên sản phẩm.
 */
export default function LandingNav() {
  const { user } = useUser();
  return (
    <header className="sticky top-0 z-30 border-b border-[#111]/10 bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-5 sm:px-8" aria-label="Điều hướng chính">
        {/* Logo — seal + text */}
        <Link href="/" className="inline-flex min-h-[44px] items-center gap-2.5 font-bold" aria-label="学汉语, trang chủ">
          <span aria-hidden className="inline-flex h-9 w-9 items-center justify-center bg-[#C62828] font-hanzi text-xl font-black text-white" style={{ borderRadius: '3px' }}>
            汉
          </span>
          <span className="leading-tight">
            <span className="hanzi block text-lg font-bold text-[#111]" lang="zh-Hans">学汉语</span>
            <span className="block text-[11px] font-medium text-[#777]">Học tiếng Trung HSK 1–3</span>
          </span>
        </Link>

        <div className="ml-6 hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="inline-flex min-h-[44px] items-center px-3 text-sm font-semibold text-[#555] transition-colors hover:text-[#111]"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex min-h-[40px] items-center justify-center bg-[#111] px-5 py-2 text-sm font-bold text-white transition-all hover:bg-[#333]"
            >
              Vào học
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden min-h-[40px] items-center justify-center border-2 border-[#111] px-4 py-2 text-sm font-bold text-[#111] transition-all hover:bg-[#111] hover:text-white sm:inline-flex"
              >
                Đăng nhập
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex min-h-[40px] items-center justify-center bg-[#111] px-5 py-2 text-sm font-bold text-white transition-all hover:bg-[#333]"
              >
                Học ngay
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
