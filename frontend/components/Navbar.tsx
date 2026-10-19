'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import { useStats } from '@/lib/useStats';
import StreakBadge from './StreakBadge';
import Icon, { type IconName } from './Icon';

type Item = { href: string; label: string; icon: IconName; match: (p: string) => boolean };
const ITEMS: Item[] = [
  { href: '/', label: 'Trang chủ', icon: 'home', match: (p) => p === '/' },
  { href: '/words', label: 'Từ vựng', icon: 'book', match: (p) => p.startsWith('/words') || p.startsWith('/word/') },
  { href: '/study?level=1', label: 'Ôn tập', icon: 'cards', match: (p) => p.startsWith('/study') },
  { href: '/grammar', label: 'Ngữ pháp', icon: 'grammar', match: (p) => p.startsWith('/grammar') },
  { href: '/exercises', label: 'Luyện tập', icon: 'pencil', match: (p) => p.startsWith('/exercises') || p.startsWith('/quiz') },
  { href: '/favorites', label: 'Sổ tay', icon: 'star', match: (p) => p.startsWith('/favorites') },
  { href: '/leaderboard', label: 'Xếp hạng', icon: 'trophy', match: (p) => p.startsWith('/leaderboard') },
];
const MAIN_MOBILE = ITEMS.slice(0, 3).concat(ITEMS[4]); // 4 mục chính trên điện thoại
const MORE_MOBILE = [ITEMS[3], ITEMS[5], ITEMS[6]]; // còn lại nằm trong "Thêm"

export default function Navbar() {
  const { user } = useUser();
  const { stats } = useStats(!!user);
  const router = useRouter();
  const pathname = usePathname() || '/';
  const [more, setMore] = useState(false);
  const moreActive = MORE_MOBILE.some((i) => i.match(pathname));

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/85 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-2.5 text-sm">
          <Link href="/" className="mr-3 flex shrink-0 items-center gap-2 font-bold">
            <span className="hanzi flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-[#7a1f16] text-xl text-white shadow-sm">汉</span>
            <span className="hidden leading-tight md:block">学汉语<span className="block text-[10px] font-medium uppercase tracking-wider text-stone-500">HSK 1-3</span></span>
          </Link>
          <div className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] sm:flex [&::-webkit-scrollbar]:hidden">
            {ITEMS.map((l) => (
              <Link key={l.href} href={l.href}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition ${l.match(pathname) ? 'bg-brand-soft text-brand' : 'text-stone-600 hover:bg-stone-100'}`}>
                {l.label}
              </Link>
            ))}
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {user && <StreakBadge stats={stats} />}
            {user ? (
              <button className="btn-ghost !px-3 !py-1.5" onClick={() => { clearToken(); router.push('/'); }} title="Đăng xuất">
                <span className="hidden max-w-[8rem] truncate lg:inline">{user.username}</span><span aria-hidden>↩</span><span className="sr-only">Đăng xuất</span>
              </button>
            ) : (
              <Link href="/login" className="btn-primary !px-3 !py-1.5">Đăng nhập</Link>
            )}
          </div>
        </nav>
      </header>

      {/* Thanh điều hướng dưới đáy cho điện thoại */}
      {more && <button aria-label="Đóng" className="fixed inset-0 z-30 bg-black/20 sm:hidden" onClick={() => setMore(false)} />}
      {more && (
        <div className="fixed inset-x-3 bottom-[4.5rem] z-40 animate-pop rounded-2xl border border-stone-200 bg-white p-2 shadow-soft sm:hidden">
          {MORE_MOBILE.map((i) => (
            <Link key={i.href} href={i.href} onClick={() => setMore(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium ${i.match(pathname) ? 'bg-brand-soft text-brand' : 'text-stone-700'}`}>
              <Icon name={i.icon} className="h-5 w-5" />{i.label}
            </Link>
          ))}
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
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
            <button onClick={() => setMore(!more)}
              className={`flex w-full flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${moreActive || more ? 'text-brand' : 'text-stone-500'}`}>
              <Icon name="menu" className="h-6 w-6" />Thêm
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
