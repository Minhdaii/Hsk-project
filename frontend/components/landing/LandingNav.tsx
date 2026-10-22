'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUser } from '@/lib/useUser';

const LINKS = [
  { href: '#tinh-nang', label: 'Tính năng' },
  { href: '#cach-hoc', label: 'Cách học' },
  { href: '#cap-do', label: 'Cấp độ' },
];

export default function LandingNav() {
  const { user } = useUser();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header className={`sticky top-0 z-30 transition-all duration-300 ${scrolled ? 'border-b border-stone-200/80 bg-white/80 shadow-sm backdrop-blur' : 'bg-transparent'}`}>
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-bold">
          <span className="hanzi flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-[#7a1f16] text-2xl text-white shadow-sm">汉</span>
          <span className="leading-tight">学汉语<span className="block text-[10px] font-medium uppercase tracking-wider text-stone-500">HSK 1-3</span></span>
        </Link>
        <div className="ml-6 hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-stone-900">{l.label}</a>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <Link href="/dashboard" className="btn-primary">Vào học →</Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost hidden sm:inline-flex">Đăng nhập</Link>
              <Link href="/dashboard" className="btn-primary">Học ngay</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
