import Link from 'next/link';
import Logo from '../Logo';

export default function LandingFooter() {
  return (
    <footer className="border-t border-ink/15 bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo />
        <nav aria-label="Liên kết cuối trang" className="flex flex-wrap gap-x-6 gap-y-1">
          {[['/words', 'Từ vựng'], ['/grammar', 'Ngữ pháp'], ['/credits', 'Nguồn dữ liệu'], ['/privacy', 'Quyền riêng tư']].map(([h, l]) => (
            <Link key={h} href={h} className="inline-flex min-h-[44px] items-center hover:text-ink hover:underline">{l}</Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
