'use client';
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Search, User as UserIcon } from 'lucide-react';
import type { AuthUser, Stats } from '@/lib/types';
import StreakBadge from '@/components/StreakBadge';
import { SECTIONS, type Section } from './config';
import { IconButton, IconLink, iconBtn } from './IconLink';

/** Đóng khi bấm ra ngoài hoặc nhấn Esc */
function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent | TouchEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', down);
    document.addEventListener('touchstart', down);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('touchstart', down); document.removeEventListener('keydown', key); };
  }, [open]);
  return { open, setOpen, ref };
}

// Điện thoại: bảng bật lên căng theo chiều ngang màn hình; máy tính: neo dưới nút
const PANEL = 'fixed inset-x-3 top-[4.75rem] z-50 rounded-2xl border border-line bg-white p-2 shadow-pop sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80';

function SearchControl() {
  const { open, setOpen, ref } = usePopover();
  const [q, setQ] = useState('');
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = q.trim();
    if (!t) return;
    setOpen(false);
    router.push(`/words?q=${encodeURIComponent(t)}`);
  };
  return (
    <div ref={ref} className="relative">
      <IconButton label="Tìm từ vựng" icon={Search} active={open} expanded={open} onClick={() => setOpen(!open)} />
      {open && (
        <form role="search" onSubmit={submit} className={PANEL}>
          <label htmlFor="global-search" className="sr-only">Tìm chữ Hán, pinyin hoặc nghĩa tiếng Việt</label>
          <input id="global-search" ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm chữ Hán, pinyin, nghĩa…" className="input !rounded-xl" autoComplete="off" />
        </form>
      )}
    </div>
  );
}

function Notices({ stats }: { stats: Stats | null }) {
  const { open, setOpen, ref } = usePopover();
  const list: { href: string; title: string; text: string }[] = [];
  if (stats && stats.due > 0) list.push({ href: '/study', title: `${stats.due} từ đến hạn ôn tập`, text: 'Ôn đúng lúc sắp quên giúp nhớ lâu hơn.' });
  if (stats && stats.atRisk && !stats.studiedToday) list.push({ href: '/study', title: `Chuỗi ${stats.streak} ngày sắp bị ngắt`, text: 'Học một lượt hôm nay để giữ chuỗi.' });
  return (
    <div ref={ref} className="relative max-[359px]:hidden">
      <IconButton label={list.length ? `Thông báo, ${list.length} mục mới` : 'Thông báo'} icon={Bell} active={open} expanded={open} onClick={() => setOpen(!open)}>
        {list.length > 0 && !open && <span aria-hidden className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-vermilion ring-2 ring-paper" />}
      </IconButton>
      {open && (
        <div role="dialog" aria-label="Thông báo" className={PANEL}>
          {list.length === 0 && <p className="px-3 py-3 text-sm text-stone-600">Không có thông báo mới.</p>}
          {list.map((n) => (
            <Link key={n.title} href={n.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-stone-100">
              <span className="block text-sm font-semibold">{n.title}</span>
              <span className="block text-sm text-stone-600">{n.text}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Account({ user, onLogout }: { user: AuthUser | null; onLogout: () => void }) {
  const { open, setOpen, ref } = usePopover();
  if (!user) return <Link href="/login" className="btn-ink !min-h-[44px] !rounded-full !px-5">Đăng nhập</Link>;
  return (
    <div ref={ref} className="relative">
      <IconButton label={`Tài khoản ${user.username}`} icon={UserIcon} active={false} expanded={open} tipAlign="end" onClick={() => setOpen(!open)}>
        <span aria-hidden className="absolute inset-1 flex items-center justify-center rounded-full bg-brand text-sm font-bold uppercase text-ink">{user.username.slice(0, 1)}</span>
      </IconButton>
      {open && (
        <div role="menu" aria-label="Tài khoản" className={PANEL}>
          <p className="truncate px-3 py-2 text-sm font-semibold">{user.username}<span className="block truncate text-xs font-normal text-stone-500">{user.email}</span></p>
          <Link role="menuitem" href="/profile" onClick={() => setOpen(false)} className="flex min-h-[44px] items-center gap-2.5 rounded-xl px-3 text-sm font-medium hover:bg-stone-100"><UserIcon className="h-[18px] w-[18px]" aria-hidden />Hồ sơ và mục tiêu</Link>
          <button role="menuitem" onClick={() => { setOpen(false); onLogout(); }} className="flex min-h-[44px] w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-medium hover:bg-stone-100"><LogOut className="h-[18px] w-[18px]" aria-hidden />Đăng xuất</button>
        </div>
      )}
    </div>
  );
}

/** Thanh trên: logo, bốn khu vực (chỉ icon) ở giữa, tìm kiếm / thông báo / tài khoản bên phải */
export default function TopBar({ section, user, stats, onLogout }: { section: Section; user: AuthUser | null; stats: Stats | null; onLogout: () => void }): ReactNode {
  return (
    <header className="sticky top-0 z-30 bg-paper/90 px-3 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-2 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/dashboard" aria-label="学汉语, về Dashboard" className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white outline-none transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-brand-ink focus-visible:ring-offset-2 sm:flex">
          <span aria-hidden lang="zh-Hans" className="hanzi text-2xl leading-none">汉</span>
        </Link>
        <nav aria-label="Khu vực chính" className="flex items-center rounded-full bg-white p-1 shadow-card lg:justify-self-center">
          {SECTIONS.map((s) => <IconLink key={s.id} href={s.href} label={s.label} icon={s.icon} active={s.id === section.id} size="pill" />)}
        </nav>
        <div className="flex items-center gap-1.5 lg:justify-self-end">
          {user && <div className="mr-1 hidden md:block"><StreakBadge stats={stats} /></div>}
          <SearchControl />
          {user && <Notices stats={stats} />}
          <Account user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}
