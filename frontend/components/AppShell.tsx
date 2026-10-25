'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import { useStats } from '@/lib/useStats';
import Icon, { type IconName } from './Icon';
import StreakBadge from './StreakBadge';
import Logo from './Logo';

type NavItem = { href: string; label: string; short?: string; icon: IconName; match: (p: string) => boolean };

// Ba nhóm theo việc người học đang làm: học, tra cứu, theo dõi bản thân
const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Học',
    items: [
      { href: '/dashboard', label: 'Tổng quan', icon: 'home', match: (p) => p === '/dashboard' },
      { href: '/path', label: 'Lộ trình học', short: 'Lộ trình', icon: 'book', match: (p) => p.startsWith('/path') },
      { href: '/study', label: 'Học từ vựng', short: 'Từ vựng', icon: 'cards', match: (p) => p.startsWith('/study') },
      { href: '/exercises', label: 'Phòng luyện tập', short: 'Luyện tập', icon: 'pencil', match: (p) => p.startsWith('/exercises') },
      { href: '/review', label: 'Ôn tập ngắt quãng', icon: 'star', match: (p) => p.startsWith('/review') },
    ],
  },
  {
    title: 'Tra cứu',
    items: [
      { href: '/words', label: 'Kho từ vựng', icon: 'book', match: (p) => p.startsWith('/words') || p.startsWith('/word/') },
      { href: '/grammar', label: 'Ngữ pháp', icon: 'grammar', match: (p) => p.startsWith('/grammar') },
      { href: '/quiz', label: 'Quiz', icon: 'cards', match: (p) => p.startsWith('/quiz') },
    ],
  },
  {
    title: 'Của tôi',
    items: [
      { href: '/favorites', label: 'Sổ tay từ vựng', icon: 'star', match: (p) => p.startsWith('/favorites') },
      { href: '/stats', label: 'Thống kê', icon: 'chart', match: (p) => p.startsWith('/stats') },
      { href: '/leaderboard', label: 'Bảng xếp hạng', icon: 'trophy', match: (p) => p.startsWith('/leaderboard') },
      { href: '/profile', label: 'Hồ sơ', icon: 'user', match: (p) => p.startsWith('/profile') },
    ],
  },
];
const ALL = GROUPS.flatMap((g) => g.items);
const MAIN_MOBILE = [ALL[0], ALL[1], ALL[2], ALL[3]];
const MORE_MOBILE = GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !MAIN_MOBILE.includes(i)) })).filter((g) => g.items.length);

/**
 * Khung khu vực học. Máy tính: thanh bên phẳng chia ba nhóm. Điện thoại: thanh dưới đáy 4 mục + bảng "Thêm"
 * (có vùng an toàn, đóng bằng Esc hoặc chạm nền); nội dung luôn chừa chỗ để không bị thanh dưới che.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { stats } = useStats(!!user);
  const router = useRouter();
  const pathname = usePathname() || '/';
  const [more, setMore] = useState(false);
  const current = ALL.find((i) => i.match(pathname));
  const moreActive = MORE_MOBILE.some((g) => g.items.some((i) => i.match(pathname)));
  const logout = () => { clearToken(); router.push('/'); };

  useEffect(() => { setMore(false); }, [pathname]);
  useEffect(() => {
    if (!more) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMore(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [more]);

  return (
    <div className="min-h-screen bg-paper text-ink lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-white px-3 py-4 lg:flex">
        <Logo href="/dashboard" className="px-1" />
        <nav aria-label="Điều hướng khu vực học" className="mt-4 flex-1 space-y-4 overflow-y-auto pr-0.5 [scrollbar-width:none]">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="px-3 pb-1 text-xs font-semibold text-stone-500">{g.title}</p>
              <ul className="space-y-px">
                {g.items.map((i) => {
                  const active = i.match(pathname);
                  return (
                    <li key={i.href}>
                      <Link href={i.href} aria-current={active ? 'page' : undefined}
                        className={`relative flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150 ${active ? 'bg-brand-soft font-semibold text-ink' : 'font-medium text-stone-600 hover:bg-stone-100 hover:text-ink'}`}>
                        {active && <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-brand-ink" />}
                        <Icon name={i.icon} className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-brand-ink' : ''}`} />
                        <span className="truncate">{i.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-line pt-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/profile" className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 rounded-lg px-2 hover:bg-stone-100">
                <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand text-sm font-bold uppercase text-ink">{user.username.slice(0, 1)}</span>
                <span className="min-w-0 truncate text-sm font-semibold">{user.username}</span>
              </Link>
              <button onClick={logout} title="Đăng xuất" aria-label="Đăng xuất" className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-ink">
                <Icon name="logout" className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary w-full">Đăng nhập</Link>
          )}
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex min-h-[56px] items-center gap-3 border-b border-line bg-paper px-4 pt-[env(safe-area-inset-top)] lg:px-8">
          <Logo href="/dashboard" className="lg:hidden" />
          <h2 className="hidden text-base font-bold lg:block">{current?.label ?? ''}</h2>
          <div className="ml-auto flex items-center gap-2 py-1.5">
            {user && <StreakBadge stats={stats} />}
            {!user && <Link href="/login" className="btn-primary lg:hidden">Đăng nhập</Link>}
            {user && (
              <Link href="/profile" aria-label="Hồ sơ" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg lg:hidden">
                <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-sm font-bold uppercase text-ink">{user.username.slice(0, 1)}</span>
              </Link>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6 pb-[calc(var(--nav-h)+var(--safe-bottom)+1.5rem)] lg:px-8 lg:py-9 lg:pb-12">
          <div key={pathname} className="animate-fade-in">{children}</div>
        </main>
      </div>

      {more && <button aria-label="Đóng menu" tabIndex={-1} className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={() => setMore(false)} />}
      {more && (
        <div id="more-menu" role="dialog" aria-label="Thêm mục" className="fixed inset-x-3 z-40 max-h-[70vh] animate-fade-in overflow-y-auto rounded-xl border border-line bg-white p-2 lg:hidden" style={{ bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 0.5rem)' }}>
          {MORE_MOBILE.map((g) => (
            <div key={g.title} className="pb-1">
              <p className="px-3 pb-0.5 pt-2 text-xs font-semibold text-stone-500">{g.title}</p>
              {g.items.map((i) => (
                <Link key={i.href} href={i.href} aria-current={i.match(pathname) ? 'page' : undefined}
                  className={`flex min-h-[48px] items-center gap-3 rounded-lg px-3 text-[15px] font-medium ${i.match(pathname) ? 'bg-brand-soft text-ink' : 'text-stone-700'}`}>
                  <Icon name={i.icon} className="h-5 w-5" />{i.label}
                </Link>
              ))}
            </div>
          ))}
          {user && <button onClick={logout} className="flex min-h-[48px] w-full items-center gap-3 rounded-lg px-3 text-[15px] font-medium text-stone-700"><Icon name="logout" className="h-5 w-5" />Đăng xuất</button>}
        </div>
      )}
      <nav aria-label="Điều hướng chính" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[var(--safe-bottom)] lg:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-5" style={{ height: 'var(--nav-h)' }}>
          {MAIN_MOBILE.map((i) => {
            const active = i.match(pathname);
            return (
              <li key={i.href}>
                <Link href={i.href} aria-current={active ? 'page' : undefined}
                  className={`relative flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${active ? 'text-ink' : 'text-stone-500'}`}>
                  {active && <span aria-hidden className="absolute inset-x-4 top-0 h-[3px] rounded-b-full bg-brand-ink" />}
                  <Icon name={i.icon} className={`h-6 w-6 ${active ? 'text-brand-ink' : ''}`} />{i.short ?? i.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button onClick={() => setMore(!more)} aria-expanded={more} aria-controls="more-menu"
              className={`relative flex h-full w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${moreActive || more ? 'text-ink' : 'text-stone-500'}`}>
              {moreActive && <span aria-hidden className="absolute inset-x-4 top-0 h-[3px] rounded-b-full bg-brand-ink" />}
              <Icon name="menu" className={`h-6 w-6 ${moreActive || more ? 'text-brand-ink' : ''}`} />Thêm
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
