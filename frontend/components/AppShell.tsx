'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import { useStats } from '@/lib/useStats';
import Icon, { type IconName } from './Icon';
import StreakBadge from './StreakBadge';

type Item = { href: string; label: string; icon: IconName; match: (p: string) => boolean };
const ITEMS: Item[] = [
  { href: '/dashboard', label: 'Trang chủ', icon: 'home', match: (p) => p.startsWith('/dashboard') },
  { href: '/study?level=1', label: 'Ôn tập', icon: 'cards', match: (p) => p.startsWith('/study') },
  { href: '/words', label: 'Từ vựng', icon: 'book', match: (p) => p.startsWith('/words') || p.startsWith('/word/') },
  { href: '/grammar', label: 'Ngữ pháp', icon: 'grammar', match: (p) => p.startsWith('/grammar') },
  { href: '/exercises', label: 'Luyện tập', icon: 'pencil', match: (p) => p.startsWith('/exercises') || p.startsWith('/quiz') },
  { href: '/favorites', label: 'Sổ tay', icon: 'star', match: (p) => p.startsWith('/favorites') },
  { href: '/leaderboard', label: 'Xếp hạng', icon: 'trophy', match: (p) => p.startsWith('/leaderboard') },
];
const MAIN_MOBILE = [ITEMS[0], ITEMS[1], ITEMS[2], ITEMS[4]];
const MORE_MOBILE = [ITEMS[3], ITEMS[5], ITEMS[6]];

function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/dashboard" className={`flex items-center gap-2.5 font-bold ${className}`}>
      <span className="hanzi flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-[#7a1f16] text-2xl text-white shadow-sm">汉</span>
      <span className="leading-tight">学汉语<span className="block text-[10px] font-medium uppercase tracking-wider text-stone-500">HSK 1-3</span></span>
    </Link>
  );
}

/** Khung ứng dụng: thanh bên trái (máy tính), thanh trên cùng, thanh điều hướng dưới đáy (điện thoại) */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { stats } = useStats(!!user);
  const router = useRouter();
  const pathname = usePathname() || '/';
  const [more, setMore] = useState(false);
  const current = ITEMS.find((i) => i.match(pathname));
  const moreActive = MORE_MOBILE.some((i) => i.match(pathname));
  const logout = () => { clearToken(); router.push('/'); };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      {/* Thanh bên (máy tính) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-stone-200/80 bg-white/70 p-4 backdrop-blur lg:flex">
        <Logo className="px-2 py-2" />
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {ITEMS.map((i) => {
            const active = i.match(pathname);
            return (
              <Link key={i.href} href={i.href}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-semibold transition-all duration-200 ${active ? 'bg-gradient-to-r from-brand to-[#a8301f] text-white shadow-[0_10px_20px_-10px_rgba(192,57,43,0.9)]' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}`}>
                <Icon name={i.icon} className={`h-5 w-5 transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`} />
                {i.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3">
          {user ? (
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft font-bold uppercase text-brand">{user.username.slice(0, 1)}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{user.username}</span>
              <button onClick={logout} title="Đăng xuất" aria-label="Đăng xuất" className="rounded-lg p-2 text-stone-500 transition hover:bg-stone-100 hover:text-brand"><Icon name="logout" className="h-5 w-5" /></button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary w-full">Đăng nhập</Link>
          )}
        </div>
      </aside>

      <div className="min-w-0">
        {/* Thanh trên cùng */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-stone-200/80 bg-white/80 px-4 py-2.5 backdrop-blur lg:px-8">
          <Logo className="lg:hidden" />
          <h2 className="hidden text-lg font-bold lg:block">{current?.label ?? ''}</h2>
          <div className="ml-auto flex items-center gap-2">
            {user && <StreakBadge stats={stats} />}
            {!user && <Link href="/login" className="btn-primary !px-3 !py-1.5 lg:hidden">Đăng nhập</Link>}
            {user && <button onClick={logout} className="btn-ghost !px-3 !py-1.5 lg:hidden" aria-label="Đăng xuất"><Icon name="logout" className="h-4 w-4" /></button>}
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6 pb-28 lg:px-8 lg:py-8 lg:pb-12">
          <div key={pathname} className="animate-fade-up">{children}</div>
        </main>
      </div>

      {/* Thanh dưới đáy (điện thoại) */}
      {more && <button aria-label="Đóng" className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setMore(false)} />}
      {more && (
        <div className="fixed inset-x-3 bottom-[4.5rem] z-40 animate-pop rounded-2xl border border-stone-200 bg-white p-2 shadow-soft lg:hidden">
          {MORE_MOBILE.map((i) => (
            <Link key={i.href} href={i.href} onClick={() => setMore(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium ${i.match(pathname) ? 'bg-brand-soft text-brand' : 'text-stone-700'}`}>
              <Icon name={i.icon} className="h-5 w-5" />{i.label}
            </Link>
          ))}
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {MAIN_MOBILE.map((i) => (
            <li key={i.href}>
              <Link href={i.href} onClick={() => setMore(false)}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${i.match(pathname) ? 'text-brand' : 'text-stone-500'}`}>
                <Icon name={i.icon} className={`h-6 w-6 transition ${i.match(pathname) ? 'scale-110' : ''}`} />{i.label}
              </Link>
            </li>
          ))}
          <li>
            <button onClick={() => setMore(!more)} className={`flex w-full flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${moreActive || more ? 'text-brand' : 'text-stone-500'}`}>
              <Icon name="menu" className="h-6 w-6" />Thêm
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
