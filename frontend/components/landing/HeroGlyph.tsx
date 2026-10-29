'use client';
import { useEffect, useRef, useState } from 'react';

// Cỡ chữ theo chiều rộng khung (cqw), để từ 1-4 chữ Hán đều nằm gọn trong ô tập viết
const SIZE_CQW = [0, 62, 38, 27, 21];

/**
 * Chữ Hán cỡ lớn trong ô tập viết 米字格, là chi tiết nhận diện của trang giới thiệu.
 * Chữ tĩnh luôn có sẵn (SSR, mạng chậm, tắt chuyển động). Với chữ đơn, nếu tải được dữ liệu nét thì chữ
 * được viết ra từng nét đúng một lần (Hanzi Writer, thư viện đã có sẵn trong dự án). Từ nhiều chữ chỉ hiện chữ tĩnh.
 */
export default function HeroGlyph({ char }: { char: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const len = Math.min(4, Math.max(1, Array.from(char).length));

  useEffect(() => {
    setLive(false);
    if (len !== 1) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;
    const host = ref.current;
    (async () => {
      try {
        const HanziWriter = (await import('hanzi-writer')).default;
        if (cancelled || !host) return;
        const size = host.clientWidth || 280;
        const writer = HanziWriter.create(host, char, {
          width: size, height: size, padding: Math.round(size * 0.1),
          showCharacter: false, showOutline: false,
          strokeColor: '#292833', strokeAnimationSpeed: 1.1, delayBetweenStrokes: 160,
          onLoadCharDataSuccess: () => { if (!cancelled) setLive(true); },
          onLoadCharDataError: () => { /* giữ chữ tĩnh */ },
        });
        writer.animateCharacter();
      } catch { /* giữ chữ tĩnh */ }
    })();
    return () => { cancelled = true; if (host) host.innerHTML = ''; };
  }, [char, len]);

  return (
    <div className="relative aspect-square w-full [container-type:inline-size]">
      <span lang="zh-Hans" aria-hidden={live} style={{ fontSize: `${SIZE_CQW[len]}cqw` }}
        className={`hanzi absolute inset-0 flex select-none items-center justify-center whitespace-nowrap font-black leading-none text-ink transition-opacity duration-200 ${live ? 'opacity-0' : 'opacity-100'}`}>{char}</span>
      <div ref={ref} aria-hidden className="absolute inset-0" />
    </div>
  );
}
