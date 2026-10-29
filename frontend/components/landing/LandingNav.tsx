'use client';
import Link from 'next/link';
import { useUser } from '@/lib/useUser';
import Logo from '../Logo';

const LINKS = [
  { href: '#tinh-nang', label: 'Tính năng' },
  { href: '#cach-hoc', label: 'Cách học' },
  { href: '#cap-do', label: 'Cấp độ' },
];

export default function LandingNav() {
  const { user } = useUser();
  return (
    <header className="sticky top-0 z-30 border-b border-ink/15 bg-paper/95">
      <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 sm:px-6" aria-label="Điều hướng chính">
        <Logo />
        <div className="ml-6 hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-semibold text-stone-600 transition-colors hover:text-ink">{l.label}</a>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <Link href="/dashboard" className="btn-primary">Vào học</Link>
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
