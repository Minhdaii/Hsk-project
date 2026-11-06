'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useCallback } from 'react';

const items = [
  { title: 'Từ vựng HSK', link: '/words' }, { title: 'Ngữ pháp', link: '/grammar' },
  { title: 'Phòng luyện tập', link: '/exercises' }, { title: 'Luyện viết', link: '/writing' },
  { title: 'Pinyin Boss', link: '/pinyin-boss' }, { title: 'Giao tiếp', link: '/categories' },
];

function WritingDemo() {
  const host = useRef<HTMLDivElement>(null);
  const writer = useRef<{ animateCharacter: (options?: { onComplete?: () => void }) => void } | null>(null);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const HanziWriter = (await import('hanzi-writer')).default;
        if (!live || !host.current) return;
        writer.current = HanziWriter.create(host.current, '好', {
          width: 176, height: 176, padding: 10, showOutline: true,
          strokeAnimationSpeed: .85, delayBetweenStrokes: 150,
          onLoadCharDataSuccess: () => { if (live) setReady(true); },
          onLoadCharDataError: () => { if (live) setReady(false); },
        });
        writer.current.animateCharacter({ onComplete: () => { if (live) setDone(true); } });
      } catch { if (live) setReady(false); }
    })();
    return () => { live = false; writer.current = null; };
  }, []);
  const replay = useCallback(() => { setDone(false); writer.current?.animateCharacter({ onComplete: () => setDone(true) }); }, []);
  return <div className="milestone-writing"><div className="milestone-writing__grid"><div ref={host}/></div><div className="milestone-writing__details"><span>HANZI / MINI TRACE</span><h3 lang="zh-Hans">好 <small>hǎo</small></h3><p>tốt · khỏe</p><div><button type="button" onClick={replay} disabled={!ready}>↻ Viết lại từ đầu</button></div><small>{done ? '✓ HOÀN THÀNH · 6 NÉT' : 'THEO DÕI THỨ TỰ NÉT CHUẨN'}</small></div></div>;
}

function Scene({ index }: { index: number }) {
  const [answer, setAnswer] = useState<number | null>(null);
  if (index === 3) return <WritingDemo key="writing-demo" />;
  if (index === 0) return <div className="milestone-flash"><div className="milestone-flash__card"><div className="milestone-flash__face milestone-flash__front"><small>HSK 1 · TỪ MỚI</small><b lang="zh-Hans">朋友</b><span>Chạm thẻ để lật</span></div><div className="milestone-flash__face milestone-flash__back"><b>péngyou</b><span>bạn bè · người bạn</span><small>朋友是我的好朋友。</small></div></div></div>;
  if (index === 1) return <div className="milestone-grammar"><small>STRUCTURE / 01</small><div className="milestone-grammar__formula"><b>因为</b><i/><b>所以</b><i/><b>…</b></div><p><span>因为</span> 今天下雨，<strong>所以</strong> 我坐公共汽车。</p><small>yīnwèi · bởi vì　　suǒyǐ · cho nên</small></div>;
  if (index === 2) return <div className="milestone-quiz"><small>CHỌN NGHĨA ĐÚNG · 你好</small><h3>你好 có nghĩa là gì?</h3><div>{['Tạm biệt', 'Xin chào', 'Cảm ơn'].map((v, i) => <button key={v} type="button" className={answer === i ? (i === 1 ? 'is-correct' : 'is-wrong') : ''} onClick={() => setAnswer(i)}>{String.fromCharCode(65 + i)} <span>{v}</span>{answer === i && <b>{i === 1 ? '✓ Chính xác' : 'Thử lại nhé'}</b>}</button>)}</div></div>;
  if (index === 4) return <div className="milestone-boss"><div className="milestone-boss__creature"><span>● ●</span><b>⌣</b></div><div><small>PINYIN BOSS · PRACTICE</small><h3>nǐ hǎo</h3><p>Nghe âm — chọn pinyin chính xác</p><div className="milestone-boss__hp"><i/></div><button type="button" onClick={e => { const el = e.currentTarget; el.classList.remove('attack'); void el.offsetWidth; el.classList.add('attack'); }}>⚔ Thử đòn</button></div></div>;
  return <div className="milestone-chat"><div className="milestone-chat__bubble"><small>小林</small><b>你今天忙吗？</b><span>Nǐ jīntiān máng ma?</span></div><div className="milestone-chat__bubble milestone-chat__bubble--reply"><small>你</small><b>不太忙。</b><span>Bú tài máng.</span></div></div>;
}

export default function MilestoneTimeline() {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [pathWidth, setPathWidth] = useState(1000);
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const rail = railRef.current;
    const svg = svgRef.current;
    const path = svg?.querySelector<SVGPathElement>('.milestone-path__base');
    if (!rail || !svg || !path) return;
    const measure = () => {
      const width = Math.max(600, rail.scrollWidth);
      setPathWidth(width);
      svg.setAttribute('viewBox', `0 0 ${width} 60`);
    };
    const updateScroll = () => {
      const rect = rail.getBoundingClientRect();
      const range = window.innerHeight + rect.height;
      setScrollProgress(Math.max(0, Math.min(1, (window.innerHeight - rect.top) / range)));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(rail);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', updateScroll, { passive: true });
    measure(); updateScroll();
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); window.removeEventListener('scroll', updateScroll); };
  }, []);
  const points = Array.from({ length: 6 }, (_, i) => {
    const x = pathWidth * ((i + .5) / 6);
    const y = i % 2 === 0 ? 26 : 34;
    return `${i ? 'L' : 'M'} ${x} ${y}`;
  }).join(' ');
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return <section className="milestone-section" aria-labelledby="milestone-heading"><header><span className="lab-overline">LEARN THROUGH PLAY</span><h2 id="milestone-heading">Một hành trình.<br/><em>Sáu cách trải nghiệm.</em></h2><p>Chọn một điểm để xem thử cách học tương ứng.</p></header><div className="milestone-rail" ref={railRef} role="tablist" aria-label="Chọn trải nghiệm học" style={{ '--milestone-active': active, '--milestone-scroll': scrollProgress } as React.CSSProperties}><svg ref={svgRef} className="milestone-path" viewBox={`0 0 ${pathWidth} 60`} preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="milestone-gradient"><stop stopColor="rgb(91,63,209)"/><stop offset="1" stopColor="rgb(184,162,248)"/></linearGradient><filter id="milestone-glow" x="-30%" y="-200%" width="160%" height="500%"><feGaussianBlur stdDeviation="4"/></filter></defs><path className="milestone-path__halo" d={points}/><path className="milestone-path__base" d={points}/><path className="milestone-path__active" d={points} pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 - active / 5 }}/>{!reduced && <circle r="3.5" className="milestone-path__particle"><animateMotion key={active} dur=".65s" fill="freeze" path={points} keyPoints={`0;${active / 5}`} keyTimes="0;1" calcMode="linear"/></circle>}</svg>{items.map((item,i)=><button key={item.title} type="button" role="tab" aria-selected={active===i} aria-controls="milestone-stage" onClick={()=>setActive(i)}><span>{String(i+1).padStart(2,'0')}</span><small>{item.title}</small></button>)}</div><div id="milestone-stage" className="milestone-stage" role="tabpanel" key={active}><div className="milestone-stage__scene"><Scene index={active}/></div><aside><small>TRẢI NGHIỆM / {String(active+1).padStart(2,'0')}</small><h3>{items[active].title}</h3><p>{['Lật thẻ khám phá chữ, pinyin và nghĩa tiếng Việt.','Nhìn cấu trúc câu được kết nối qua ví dụ thực tế.','Chọn đáp án để xem phản hồi tức thì.','Quan sát nét chữ thật và thử viết theo thứ tự chuẩn.','Thử minh họa cơ chế chiến đấu bằng pinyin.','Theo dõi nhịp hội thoại với pinyin và nghĩa.'][active]}</p><Link href={items[active].link}>Mở chức năng <span>↗</span></Link></aside></div></section>;
}
