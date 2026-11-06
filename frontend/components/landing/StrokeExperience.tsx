'use client';

import { useEffect, useRef, useState } from 'react';

export default function StrokeExperience() {
  const host = useRef<HTMLDivElement>(null);
  const writer = useRef<{ animateCharacter: (options?: { onComplete?: () => void }) => void; quiz: (options?: { onCorrectStroke?: () => void; onMistake?: () => void; onComplete?: () => void }) => void } | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'unsupported' | 'done'>('loading');

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const HanziWriter = (await import('hanzi-writer')).default;
        if (!live || !host.current) return;
        const instance = HanziWriter.create(host.current, '永', {
          width: 256, height: 256, padding: 16, showOutline: true,
          strokeAnimationSpeed: 0.8, delayBetweenStrokes: 180,
          onLoadCharDataSuccess: () => { if (live) setState('ready'); },
          onLoadCharDataError: () => { if (live) setState('unsupported'); },
        });
        writer.current = instance;
        instance.animateCharacter({ onComplete: () => { if (live) setState('done'); } });
      } catch { if (live) setState('unsupported'); }
    })();
    return () => { live = false; writer.current = null; };
  }, []);

  return <div className="stroke-experience">
    <div className="stroke-experience__grid" aria-label="Chữ Vĩnh đang được viết từng nét"><div ref={host}/>{state === 'loading' && <span className="stroke-experience__loading">Đang tải dữ liệu nét…</span>}</div>
    <div className="stroke-experience__info"><span className="interactive-label">TRACE / 01</span><h3 lang="zh-Hans">永 <small>yǒng</small></h3><p>vĩnh cửu · lâu dài</p><p className="stroke-experience__note">{state === 'unsupported' ? 'Chưa có dữ liệu thứ tự nét cho chữ này. Không hiển thị animation giả lập.' : state === 'done' ? 'Hoàn thành — đủ tám nét.' : 'Thứ tự nét chuẩn từ Hanzi Writer. Quan sát chiều đi của từng nét.'}</p><div className="stroke-experience__controls"><button type="button" onClick={() => writer.current?.quiz({ onComplete: () => setState('done') })} disabled={state !== 'ready' && state !== 'done'}>Thử viết</button></div><span className="stroke-experience__count">{state === 'done' ? '✓ HOÀN THÀNH' : '8 NÉT · HSK 1'}</span></div>
  </div>;
}
