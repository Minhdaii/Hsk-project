import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="hanzi flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-[#7a1f16] text-lg text-white">汉</span>
          <span>学汉语 · Học tiếng Trung HSK 1-3</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link href="/words" className="hover:text-brand">Từ vựng</Link>
          <Link href="/grammar" className="hover:text-brand">Ngữ pháp</Link>
          <Link href="/credits" className="hover:text-brand">Nguồn dữ liệu</Link>
          <Link href="/privacy" className="hover:text-brand">Quyền riêng tư</Link>
        </div>
      </div>
    </footer>
  );
}
