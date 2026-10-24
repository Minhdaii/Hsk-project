'use client';
import { useEffect, useRef, useState } from 'react';

// Hiển thị thứ tự nét và cho tập viết từng chữ Hán (thư viện Hanzi Writer)
export default function HanziWriterBox({ char }: { char: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const writerRef = useRef<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const HanziWriter = (await import('hanzi-writer')).default;
      if (cancelled || !ref.current) return;
      ref.current.innerHTML = '';
      writerRef.current = HanziWriter.create(ref.current, char, {
        width: 160, height: 160, padding: 8, showOutline: true,
        strokeAnimationSpeed: 1, delayBetweenStrokes: 200,
        onLoadCharDataError: () => setError(true),
      });
    })();
    return () => { cancelled = true; };
  }, [char]);

  if (error) return <div className="flex h-[160px] w-[160px] items-center justify-center rounded-lg border border-line text-5xl hanzi">{char}</div>;

  return (
    <div className="text-center">
      <div ref={ref} className="mi-grid rounded-lg border border-line bg-white" />
      <div className="mt-2 flex justify-center gap-2">
        <button className="btn-ghost !px-3" onClick={() => writerRef.current?.animateCharacter()}>Xem nét</button>
        <button className="btn-ghost !px-3" onClick={() => writerRef.current?.quiz()}>Tập viết</button>
      </div>
    </div>
  );
}
