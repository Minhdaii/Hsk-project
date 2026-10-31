'use client';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import { useStats } from '@/lib/useStats';
import { sectionOf } from './nav/config';
import TopBar from './nav/TopBar';
import { MobileDock, SideDock } from './nav/Docks';
import PageEnter from './motion/PageEnter';

// Chiều cao thanh trên (px) dùng để khóa chiều cao các trang vừa khít một màn hình
const FIT_ROUTES = ['/pinyin-boss'];

/**
 * Khung khu vực học: thanh trên (4 khu vực + tìm kiếm/thông báo/tài khoản), thanh bên dọc theo khu vực đang chọn (máy tính),
 * thanh dưới đáy cùng nội dung đó (điện thoại). Toàn bộ điều hướng chỉ hiển thị icon, tên mục nằm trong tooltip.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { stats } = useStats(!!user);
  const router = useRouter();
  const pathname = usePathname() || '/';
  const section = sectionOf(pathname);
  const fit = FIT_ROUTES.includes(pathname); // trang game: vừa khít một khung nhìn, không cuộn
  const logout = () => { clearToken(); router.push('/'); };

  return (
    <div className="min-h-screen bg-paper text-ink [--top-h:4.75rem]">
      <TopBar section={section} user={user} stats={stats} onLogout={logout} />
      <div className="mx-auto flex w-full max-w-[1440px] gap-6 px-3 sm:px-6 lg:px-8">
        <aside className="relative z-20 hidden w-14 shrink-0 lg:block">
          <div className="sticky top-24"><SideDock section={section} pathname={pathname} /></div>
        </aside>
        <main className={fit
          ? 'flex h-[calc(100dvh-var(--top-h))] min-w-0 flex-1 flex-col overflow-hidden pb-[calc(var(--nav-h)+var(--safe-bottom)+0.5rem)] pt-1 lg:pb-5'
          : `min-w-0 flex-1 pb-[calc(var(--nav-h)+var(--safe-bottom)+1.5rem)] pt-2 lg:pb-12 ${pathname === '/dashboard' ? '' : 'mx-auto max-w-6xl'}`}>
          {pathname === '/dashboard'
            ? <div>{children}</div> // Dashboard tự có chuyển động riêng (các thẻ hiện lần lượt)
            : <PageEnter key={pathname} className={fit ? 'mx-auto min-h-0 w-full max-w-5xl flex-1' : undefined}>{children}</PageEnter>}
        </main>
      </div>
      <MobileDock section={section} pathname={pathname} />
    </div>
  );
}
