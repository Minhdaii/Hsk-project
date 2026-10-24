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

type NavItem = {
  href: string;
  label: string;
  glyph: string;
  icon: IconName;
  tag?: string;
  match: (p: string) => boolean;
};

// Cấp 1: Trục học tập chính theo lộ trình tiến bộ
const CORE_TRACKS: NavItem[] = [
  { href: '/dashboard', label: 'Tổng quan', glyph: '览', icon: 'home', match: (p) => p === '/dashboard' },
  { href: '/path', label: 'Lộ trình học', glyph: '程', icon: 'book', match: (p) => p.startsWith('/path') },
  { href: '/study', label: 'Học từ vựng', glyph: '词', icon: 'cards', match: (p) => p.startsWith('/study') },
  { href: '/exercises', label: 'Phòng luyện tập', glyph: '练', icon: 'pencil', tag: '5 games', match: (p) => p.startsWith('/exercises') },
  { href: '/review', label: 'Ôn tập ngắt quãng', glyph: '复', icon: 'star', match: (p) => p.startsWith('/review') },
];

// Cấp 2: Kho kiến thức chuẩn hóa & Luyện thi HSK 1–3
const HSK_TRACKS: NavItem[] = [
  { href: '/words', label: 'Kho từ vựng HSK', glyph: '库', icon: 'book', tag: 'HSK 1–3', match: (p) => p.startsWith('/words') || p.startsWith('/word/') },
  { href: '/grammar', label: 'Cẩm nang ngữ pháp', glyph: '法', icon: 'grammar', tag: '39 điểm', match: (p) => p.startsWith('/grammar') },
  { href: '/quiz', label: 'Quiz chuẩn hóa', glyph: '测', icon: 'cards', match: (p) => p.startsWith('/quiz') },
];

// Cấp 3: Tiến độ & Không gian cá nhân
const PERSONAL_TRACKS: NavItem[] = [
  { href: '/favorites', label: 'Sổ tay từ vựng', glyph: '藏', icon: 'star', match: (p) => p.startsWith('/favorites') },
  { href: '/stats', label: 'Thống kê tiến độ', glyph: '数', icon: 'chart', match: (p) => p.startsWith('/stats') },
  { href: '/leaderboard', label: 'Bảng xếp hạng', glyph: '榜', icon: 'trophy', match: (p) => p.startsWith('/leaderboard') },
  { href: '/profile', label: 'Hồ sơ cá nhân', glyph: '我', icon: 'user', match: (p) => p.startsWith('/profile') },
];

const ALL_ITEMS = [...CORE_TRACKS, ...HSK_TRACKS, ...PERSONAL_TRACKS];

const MAIN_MOBILE = [
  CORE_TRACKS[0], // Tổng quan
  CORE_TRACKS[1], // Lộ trình học
  CORE_TRACKS[2], // Học từ vựng
  CORE_TRACKS[3], // Phòng luyện tập
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { stats } = useStats(!!user);
  const router = useRouter();
  const pathname = usePathname() || '/';
  const [drawerOpen, setDrawerOpen] = useState(false);

  const current = ALL_ITEMS.find((i) => i.match(pathname));
  const isDrawerActive = [...CORE_TRACKS.slice(4), ...HSK_TRACKS, ...PERSONAL_TRACKS].some((i) => i.match(pathname));
  const logout = () => { clearToken(); router.push('/'); };

  useEffect(() => { setDrawerOpen(false); }, [pathname]);
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <div className="editorial-workspace min-h-screen lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      {/* Thanh bên trái (Desktop Sidebar) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-[#E7E2F0] bg-white px-4 py-5 lg:flex">
        {/* Logo & Định danh thương hiệu */}
        <div className="border-b border-[#E7E2F0] pb-4">
          <Logo href="/dashboard" className="px-1" />
          <div className="mt-1 flex items-center justify-between pl-1 text-[11px] font-semibold tracking-wider uppercase text-[#777184]">
            <span>Learning Workspace</span>
            <span className="editorial-badge !text-[10px] !px-1.5 !py-0">HSK 3.0</span>
          </div>
        </div>

        {/* Danh sách điều hướng phân cấp ngữ nghĩa */}
        <div className="mt-4 flex flex-1 flex-col justify-between overflow-y-auto [scrollbar-width:none]">
          <div className="space-y-5">
            {/* Nhóm 1: Trục học tập chính */}
            <div>
              <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#9892A6]">
                <span>Học tập theo lộ trình</span>
                <span className="text-[10px] text-[#A99AE8] font-semibold">01</span>
              </div>
              <nav aria-label="Điều hướng học tập" className="flex flex-col gap-0.5">
                {CORE_TRACKS.map((i) => {
                  const active = i.match(pathname);
                  return (
                    <Link
                      key={i.href}
                      href={i.href}
                      aria-current={active ? 'page' : undefined}
                      className={`group flex min-h-[38px] items-center gap-2.5 rounded-lg px-2.5 text-xs font-semibold transition-all ${
                        active
                          ? 'border border-[#D8CFF2] bg-[#EEE9FC] text-[#3B2D78] shadow-xs'
                          : 'text-[#484256] hover:bg-[#F8F7FC] hover:text-[#18181B]'
                      }`}
                    >
                      <span
                        lang="zh-Hans"
                        aria-hidden
                        className={`hanzi flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold transition-colors ${
                          active ? 'bg-[#A99AE8] text-[#241D45]' : 'bg-[#F2EDFB] text-[#7A6FA6] group-hover:bg-[#EAE4F7]'
                        }`}
                      >
                        {i.glyph}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{i.label}</span>
                      {i.tag && (
                        <span className="rounded bg-[#F0ECF6] px-1.5 py-0.2 text-[10px] text-[#777184]">
                          {i.tag}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Nhóm 2: Kho kiến thức chuẩn hóa & Luyện thi HSK */}
            <div className="border-t border-[#F0ECF6] pt-3.5">
              <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#9892A6]">
                <span>Kho kiến thức HSK</span>
                <span className="text-[10px] text-[#A99AE8] font-semibold">02</span>
              </div>
              <nav aria-label="Kho kiến thức HSK" className="flex flex-col gap-0.5">
                {HSK_TRACKS.map((i) => {
                  const active = i.match(pathname);
                  return (
                    <Link
                      key={i.href}
                      href={i.href}
                      aria-current={active ? 'page' : undefined}
                      className={`group flex min-h-[38px] items-center gap-2.5 rounded-lg px-2.5 text-xs font-semibold transition-all ${
                        active
                          ? 'border border-[#D8CFF2] bg-[#EEE9FC] text-[#3B2D78] shadow-xs'
                          : 'text-[#5C566A] hover:bg-[#F8F7FC] hover:text-[#18181B]'
                      }`}
                    >
                      <span
                        lang="zh-Hans"
                        aria-hidden
                        className={`hanzi flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold transition-colors ${
                          active ? 'bg-[#A99AE8] text-[#241D45]' : 'bg-[#FAF9FD] text-[#868095] group-hover:bg-[#F2EDFB]'
                        }`}
                      >
                        {i.glyph}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{i.label}</span>
                      {i.tag && (
                        <span className="rounded bg-[#F0ECF6] px-1.5 py-0.2 text-[10px] text-[#777184]">
                          {i.tag}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Nhóm 3: Tiến độ & Cá nhân */}
            <div className="border-t border-[#F0ECF6] pt-3.5">
              <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#9892A6]">
                <span>Tiến độ & Cá nhân</span>
                <span className="text-[10px] text-[#A99AE8] font-semibold">03</span>
              </div>
              <nav aria-label="Tiến độ và cá nhân" className="flex flex-col gap-0.5">
                {PERSONAL_TRACKS.map((i) => {
                  const active = i.match(pathname);
                  return (
                    <Link
                      key={i.href}
                      href={i.href}
                      aria-current={active ? 'page' : undefined}
                      className={`group flex min-h-[38px] items-center gap-2.5 rounded-lg px-2.5 text-xs font-semibold transition-all ${
                        active
                          ? 'border border-[#D8CFF2] bg-[#EEE9FC] text-[#3B2D78] shadow-xs'
                          : 'text-[#5C566A] hover:bg-[#F8F7FC] hover:text-[#18181B]'
                      }`}
                    >
                      <span
                        lang="zh-Hans"
                        aria-hidden
                        className={`hanzi flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold transition-colors ${
                          active ? 'bg-[#A99AE8] text-[#241D45]' : 'bg-[#FAF9FD] text-[#868095] group-hover:bg-[#F2EDFB]'
                        }`}
                      >
                        {i.glyph}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{i.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Khu vực tài khoản học viên */}
          <div className="border-t border-[#E7E2F0] pt-3">
            {user ? (
              <div className="flex items-center gap-2.5 rounded-xl border border-[#E7E2F0] bg-[#FAF9FD] p-2.5 shadow-2xs">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#A99AE8] text-xs font-bold uppercase text-[#241D45]"
                >
                  {user.username.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#302B3D]">{user.username}</p>
                  <p className="truncate text-[11px] text-[#777184]">
                    {stats ? `${stats.streak} ngày liên tiếp` : 'Đang học'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  title="Đăng xuất"
                  aria-label="Đăng xuất"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#777184] transition-colors hover:bg-stone-200/70 hover:text-stone-900"
                >
                  <Icon name="logout" className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-editorial-primary w-full text-center text-xs">
                Đăng nhập để lưu tiến độ
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Nội dung trang */}
      <div className="min-w-0">
        {/* Thanh trên cùng (Top Header) */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#E7E2F0] bg-white/95 px-4 backdrop-blur-md pt-[env(safe-area-inset-top)] sm:px-6 lg:px-8">
          <Logo href="/dashboard" className="lg:hidden" />
          <div className="hidden py-3.5 lg:flex lg:items-center lg:gap-2">
            {current && (
              <>
                <span lang="zh-Hans" className="hanzi text-sm font-bold text-[#55449E]">
                  {current.glyph}
                </span>
                <span className="text-stone-300">/</span>
              </>
            )}
            <h2 className="text-sm font-bold text-[#302B3D]">{current?.label ?? 'Không gian học'}</h2>
          </div>
          <div className="ml-auto flex items-center gap-2 py-2">
            {user && <StreakBadge stats={stats} />}
            {!user && (
              <Link href="/login" className="btn-editorial-primary !min-h-[38px] !px-3.5 text-xs lg:hidden">
                Đăng nhập
              </Link>
            )}
            {user && (
              <button
                onClick={logout}
                className="btn-editorial-ghost !min-h-[38px] !min-w-[38px] !px-2.5 lg:hidden"
                aria-label="Đăng xuất"
                title="Đăng xuất"
              >
                <Icon name="logout" className="h-4 w-4" />
              </button>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6 pb-[calc(var(--nav-h)+var(--safe-bottom)+1.5rem)] sm:px-6 lg:px-8 lg:py-8 lg:pb-12">
          <div key={pathname} className="animate-fade-in">{children}</div>
        </main>
      </div>

      {/* Bảng danh mục mở rộng cho Mobile (Category Drawer) */}
      {drawerOpen && (
        <button
          aria-label="Đóng bảng danh mục"
          tabIndex={-1}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      {drawerOpen && (
        <div
          id="category-drawer"
          className="fixed inset-x-3 z-50 animate-fade-up rounded-2xl border border-[#DED7F0] bg-white p-4 shadow-xl lg:hidden max-h-[80vh] overflow-y-auto"
          style={{ bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 0.5rem)' }}
        >
          <div className="flex items-center justify-between border-b border-[#E7E2F0] pb-2.5 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#302B3D]">
              Danh mục học tập & Chức năng
            </span>
            <button
              onClick={() => setDrawerOpen(false)}
              className="text-xs text-[#777184] hover:text-[#302B3D] font-bold px-2 py-1"
            >
              Đóng ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Nhóm HSK */}
            <div>
              <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-[#9892A6] mb-1.5">
                Kho kiến thức HSK 1–3
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {HSK_TRACKS.map((i) => (
                  <Link
                    key={i.href}
                    href={i.href}
                    aria-current={i.match(pathname) ? 'page' : undefined}
                    className={`flex min-h-[44px] items-center gap-2 rounded-xl px-2.5 text-xs font-semibold ${
                      i.match(pathname)
                        ? 'border border-[#D8CFF2] bg-[#EEE9FC] text-[#3B2D78]'
                        : 'border border-[#E7E2F0] bg-[#FAF9FD] text-[#484256]'
                    }`}
                  >
                    <span lang="zh-Hans" className="hanzi flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-[#55449E] shadow-2xs">
                      {i.glyph}
                    </span>
                    <span className="truncate">{i.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Nhóm Kỹ năng & Ôn tập */}
            <div>
              <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-[#9892A6] mb-1.5">
                Kỹ năng & Ôn tập
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  href="/review"
                  className={`flex min-h-[44px] items-center gap-2 rounded-xl px-2.5 text-xs font-semibold ${
                    pathname.startsWith('/review')
                      ? 'border border-[#D8CFF2] bg-[#EEE9FC] text-[#3B2D78]'
                      : 'border border-[#E7E2F0] bg-[#FAF9FD] text-[#484256]'
                  }`}
                >
                  <span lang="zh-Hans" className="hanzi flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-[#55449E] shadow-2xs">
                    复
                  </span>
                  <span className="truncate">Ôn tập SM-2</span>
                </Link>
                <Link
                  href="/favorites"
                  className={`flex min-h-[44px] items-center gap-2 rounded-xl px-2.5 text-xs font-semibold ${
                    pathname.startsWith('/favorites')
                      ? 'border border-[#D8CFF2] bg-[#EEE9FC] text-[#3B2D78]'
                      : 'border border-[#E7E2F0] bg-[#FAF9FD] text-[#484256]'
                  }`}
                >
                  <span lang="zh-Hans" className="hanzi flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-[#55449E] shadow-2xs">
                    藏
                  </span>
                  <span className="truncate">Sổ tay từ</span>
                </Link>
              </div>
            </div>

            {/* Nhóm Cá nhân & Thành tích */}
            <div>
              <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-[#9892A6] mb-1.5">
                Tiến độ & Cá nhân
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  href="/stats"
                  className={`flex min-h-[44px] items-center gap-2 rounded-xl px-2.5 text-xs font-semibold ${
                    pathname.startsWith('/stats')
                      ? 'border border-[#D8CFF2] bg-[#EEE9FC] text-[#3B2D78]'
                      : 'border border-[#E7E2F0] bg-[#FAF9FD] text-[#484256]'
                  }`}
                >
                  <span lang="zh-Hans" className="hanzi flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-[#55449E] shadow-2xs">
                    数
                  </span>
                  <span className="truncate">Thống kê</span>
                </Link>
                <Link
                  href="/leaderboard"
                  className={`flex min-h-[44px] items-center gap-2 rounded-xl px-2.5 text-xs font-semibold ${
                    pathname.startsWith('/leaderboard')
                      ? 'border border-[#D8CFF2] bg-[#EEE9FC] text-[#3B2D78]'
                      : 'border border-[#E7E2F0] bg-[#FAF9FD] text-[#484256]'
                  }`}
                >
                  <span lang="zh-Hans" className="hanzi flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-[#55449E] shadow-2xs">
                    榜
                  </span>
                  <span className="truncate">Bảng xếp hạng</span>
                </Link>
                <Link
                  href="/profile"
                  className={`flex min-h-[44px] items-center gap-2 rounded-xl px-2.5 text-xs font-semibold ${
                    pathname.startsWith('/profile')
                      ? 'border border-[#D8CFF2] bg-[#EEE9FC] text-[#3B2D78]'
                      : 'border border-[#E7E2F0] bg-[#FAF9FD] text-[#484256]'
                  }`}
                >
                  <span lang="zh-Hans" className="hanzi flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-[#55449E] shadow-2xs">
                    我
                  </span>
                  <span className="truncate">Hồ sơ cá nhân</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thanh điều hướng dưới đáy (Mobile Navigation Bar) */}
      <nav
        aria-label="Điều hướng di động"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E7E2F0] bg-white pb-[var(--safe-bottom)] lg:hidden shadow-xs"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5" style={{ height: 'var(--nav-h)' }}>
          {MAIN_MOBILE.map((i) => {
            const active = i.match(pathname);
            return (
              <li key={i.href}>
                <Link
                  href={i.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                    active ? 'font-bold text-[#55449E]' : 'text-[#777184]'
                  }`}
                >
                  {active && (
                    <span aria-hidden className="absolute inset-x-3 top-0 h-[2.5px] rounded-b bg-[#A99AE8]" />
                  )}
                  <span
                    lang="zh-Hans"
                    aria-hidden
                    className={`hanzi text-sm leading-none ${active ? 'font-bold text-[#55449E]' : 'text-[#9691A4]'}`}
                  >
                    {i.glyph}
                  </span>
                  <span className="truncate">{i.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-expanded={drawerOpen}
              aria-controls="category-drawer"
              className={`relative flex h-full w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                isDrawerActive || drawerOpen ? 'font-bold text-[#55449E]' : 'text-[#777184]'
              }`}
            >
              {(isDrawerActive || drawerOpen) && (
                <span aria-hidden className="absolute inset-x-3 top-0 h-[2.5px] rounded-b bg-[#A99AE8]" />
              )}
              <Icon
                name="menu"
                className={`h-4 w-4 ${isDrawerActive || drawerOpen ? 'text-[#55449E]' : 'text-[#9691A4]'}`}
              />
              <span>Danh mục</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
