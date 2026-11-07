import Link from 'next/link';

type Size = 'sm' | 'md' | 'lg';

/** The letters themselves are drawn as a loose, childlike hand-scribble. */
export function BrandWordmark({ size = 'md', className = '' }: { size?: Size; className?: string }) {
  return (
    <svg
      role="img"
      aria-label="Chaina"
      viewBox="0 0 184 60"
      fill="none"
      className={`brand-wordmark brand-wordmark--${size} ${className}`}
    >
      <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <g transform="rotate(-4 21 30)">
          <path d="M33 13C27 8 16 8 10 15C3 23 5 37 11 44C17 50 28 47 33 40" />
          <path d="M30 12c2 1 4 2 5 4" strokeWidth="2.3" />
        </g>
        <g transform="rotate(2 53 30)">
          <path d="M43 11C41 22 43 35 42 47" />
          <path d="M43 32C49 25 58 27 60 34C61 39 60 44 61 48" />
        </g>
        <g transform="rotate(-2 77 36)">
          <path d="M84 32C81 27 74 27 70 31C66 36 68 44 74 45C80 46 84 40 84 33C83 40 85 46 90 47" />
        </g>
        <g transform="rotate(3 101 34)">
          <path d="M101 30C100 35 101 41 100 47" />
          <path d="M101 20c.8-.5 1.7-.2 2 .5" stroke="#C94B3C" strokeWidth="4.2" />
        </g>
        <g transform="rotate(-2 124 36)">
          <path d="M115 30C114 35 115 41 114 47" />
          <path d="M116 33C122 26 131 27 133 34C134 39 133 43 134 48" />
        </g>
        <g transform="rotate(2 153 36)">
          <path d="M159 32C157 27 150 27 145 31C140 36 142 44 148 45C154 47 159 40 159 33C158 40 160 46 166 47" />
          <path d="M164 27c2 0 3 1 4 3" strokeWidth="2.2" />
        </g>
      </g>
    </svg>
  );
}

export default function BrandLogo({ href = '/', size = 'md', className = '', light = false }: { href?: string; size?: Size; className?: string; light?: boolean }) {
  return (
    <Link href={href} aria-label={`Chaina${href === '/' ? ', trang chủ' : ''}`} className={`brand-logo brand-logo--${size}${light ? ' brand-logo--light' : ''} ${className}`}>
      <BrandWordmark size={size} />
    </Link>
  );
}
