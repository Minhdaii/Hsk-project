'use client';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MOBILE_TABS, SETTINGS, type NavItem, type Section } from './config';
import { IconLink } from './IconLink';

type DockProps = { item: NavItem; pathname: string; tip: 'right' | false; onHint?: (l: string) => void };

function ModeAware({ item, pathname, tip, onHint }: DockProps) {
  const mode = useSearchParams().get('mode');
  return <IconLink href={item.href} label={item.label} icon={item.icon} active={item.match(pathname, mode)} tip={tip} onHint={onHint} />;
}

/** Mục có phụ thuộc ?mode= được bọc Suspense để trang vẫn dựng sẵn được khi build */
function DockItem(p: DockProps) {
  if (!p.item.usesMode) return <IconLink href={p.item.href} label={p.item.label} icon={p.item.icon} active={p.item.match(p.pathname, null)} tip={p.tip} onHint={p.onHint} />;
  return (
    <Suspense fallback={<IconLink href={p.item.href} label={p.item.label} icon={p.item.icon} active={false} tip={p.tip} onHint={p.onHint} />}>
      <ModeAware {...p} />
    </Suspense>
  );
}

/** Thanh bên dọc (máy tính): 4 mục thuộc nhóm chức năng đang chọn + Cài đặt */
export function SideDock({ section, pathname }: { section: Section; pathname: string }) {
  return (
    <nav aria-label={`Mục của ${section.label}`} className="flex w-14 flex-col items-center gap-1.5 rounded-full bg-white px-1.5 py-3 shadow-card">
      {section.items.map((i) => <DockItem key={i.href} item={i} pathname={pathname} tip="right" />)}
      <span aria-hidden className="my-1 h-px w-6 bg-line" />
      <DockItem item={SETTINGS} pathname={pathname} tip="right" />
    </nav>
  );
}

/**
 * Thanh điều hướng dưới đáy (Điện thoại & Tablet < 1024px):
 * 5 Tab chức năng cốt lõi cố định, có Icon trực quan và Nhãn chữ tiếng Việt sắc nét.
 * Không bị tràn dòng, không cần cuộn ngang, dễ bấm ngón tay cái.
 */
export function MobileDock({ pathname }: { section?: Section; pathname: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <nav aria-label="Điều hướng di động" className="border-t border-line/80 bg-white/95 pb-[var(--safe-bottom)] shadow-[0_-4px_20px_rgba(41,40,51,0.06)] backdrop-blur-md">
        <div className="mx-auto grid max-w-lg grid-cols-5 items-center px-1" style={{ height: 'var(--nav-h)' }}>
          {MOBILE_TABS.map((tab) => {
            const active = tab.match(pathname);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={`group flex flex-col items-center justify-center py-1 outline-none transition-all duration-150 active:scale-95 ${
                  active ? 'text-brand-ink' : 'text-stone-500 hover:text-ink'
                }`}
              >
                <div
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition-all duration-200 ${
                    active ? 'bg-brand-soft text-brand-ink shadow-sm' : 'text-stone-500 group-hover:bg-stone-100 group-hover:text-ink'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 1.8} aria-hidden />
                </div>
                <span className={`mt-0.5 text-[11px] font-semibold tracking-tight transition-colors ${
                  active ? 'font-bold text-brand-ink' : 'text-stone-600'
                }`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
