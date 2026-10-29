import Link from 'next/link';

/** Logo dùng chung: con dấu đỏ son 汉 + tên sản phẩm. Con dấu là chi tiết thương hiệu duy nhất dùng màu son trong khu vực học. */
export default function Logo({ href = '/', className = '' }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={`inline-flex min-h-[44px] items-center gap-2.5 font-bold ${className}`} aria-label="学汉语, trang chủ">
      <span aria-hidden className="seal h-9 w-9 text-xl shadow-sm">汉</span>
      <span className="leading-tight">
        <span className="hanzi block text-lg font-bold text-[#302B3D]" lang="zh-Hans">学汉语</span>
        <span className="block text-[11px] font-medium text-[#777184]">Học tiếng Trung HSK 1–3</span>
      </span>
    </Link>
  );
}
