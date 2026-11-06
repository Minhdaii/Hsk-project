'use client';
import { usePathname } from 'next/navigation';
import AppShell from './AppShell';
import LandingNav from './landing/LandingNav';
import LandingFooter from './landing/LandingFooter';

// Trang giới thiệu dùng thanh trên + chân trang; trang đăng nhập không có khung; còn lại là khu vực học (thanh bên)
const LANDING = ['/', '/credits', '/privacy'];

export default function ChromeSwitch({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  if (pathname === '/login') return <>{children}</>;
  // Trang chủ tự sở hữu chrome của mình để Navbar/Footer chỉ render một lần.
  if (pathname === '/') return <>{children}</>;
  if (LANDING.includes(pathname)) {
    return (
      <div className="flex min-h-screen flex-col bg-white text-[#111]">
        <LandingNav />
        <div className="flex-1">{children}</div>
        <LandingFooter />
      </div>
    );
  }
  return <AppShell>{children}</AppShell>;
}
