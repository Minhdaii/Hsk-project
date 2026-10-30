'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SETTINGS, type NavItem, type Section } from './config';
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

/** Thanh bên dọc (máy tính): mục của khu vực đang chọn + Cài đặt, chỉ icon */
export function SideDock({ section, pathname }: { section: Section; pathname: string }) {
  return (
    <nav aria-label={`Mục của ${section.label}`} className="flex w-14 flex-col items-center gap-1 rounded-full bg-white px-1.5 py-3 shadow-card">
      {section.items.map((i) => <DockItem key={i.href} item={i} pathname={pathname} tip="right" />)}
      <span aria-hidden className="my-1 h-px w-6 bg-line" />
      <DockItem item={SETTINGS} pathname={pathname} tip="right" />
    </nav>
  );
}

/**
 * Thanh dưới đáy (điện thoại): cùng các mục, cuộn ngang được. Không có hover trên màn hình cảm ứng nên tên mục
 * hiện thành chú thích ngắn phía trên thanh khi chạm vào (hoặc khi focus bằng bàn phím).
 */
export function MobileDock({ section, pathname }: { section: Section; pathname: string }) {
  const [hint, setHint] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const strip = useRef<HTMLDivElement>(null);
  const show = (l: string) => { setHint(l); clearTimeout(timer.current); timer.current = setTimeout(() => setHint(null), 1600); };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const el = strip.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (el && strip.current) strip.current.scrollTo({ left: el.offsetLeft - strip.current.clientWidth / 2 + el.clientWidth / 2, behavior: 'auto' });
  }, [pathname, section.id]);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      {hint && <div role="status" className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 animate-fade-in whitespace-nowrap rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-white">{hint}</div>}
      <nav aria-label={`Mục của ${section.label}`} className="border-t border-line bg-white pb-[var(--safe-bottom)]">
        <div ref={strip} className="mx-auto flex max-w-xl items-center gap-1 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ height: 'var(--nav-h)' }}>
          {[...section.items, SETTINGS].map((i) => <DockItem key={i.href} item={i} pathname={pathname} tip={false} onHint={show} />)}
        </div>
      </nav>
    </div>
  );
}
