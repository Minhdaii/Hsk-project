'use client';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import { useStats } from '@/lib/useStats';
import { sectionOf } from './nav/config';
import TopBar from './nav/TopBar';
import { MobileDock, SideDock } from './nav/Docks';

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
  const logout = () => { clearToken(); router.push('/'); };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <TopBar section={section} user={user} stats={stats} onLogout={logout} />
      <div className="mx-auto flex w-full max-w-[1440px] gap-6 px-3 sm:px-6 lg:px-8">
        <aside className="hidden w-14 shrink-0 lg:block">
          <div className="sticky top-24"><SideDock section={section} pathname={pathname} /></div>
        </aside>
        <main className={`min-w-0 flex-1 pb-[calc(var(--nav-h)+var(--safe-bottom)+1.5rem)] pt-2 lg:pb-12 ${pathname === '/dashboard' ? '' : 'mx-auto max-w-6xl'}`}>
          <div key={pathname} className="animate-fade-in">{children}</div>
        </main>
      </div>
      <MobileDock section={section} pathname={pathname} />
    </div>
  );
}
