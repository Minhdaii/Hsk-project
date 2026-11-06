'use client';
import { useEffect, useRef } from 'react';

export function ScrollJourney() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    const path = svg?.querySelector('path');
    if (!svg || !path) return;
    let length = 0;
    let raf = 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const measure = () => {
      length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      update();
    };
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = reduced.matches ? 1 : max > 0 ? window.scrollY / max : 0;
        path.style.strokeDashoffset = `${length * (1 - Math.max(0, Math.min(1, progress)))}`;
      });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', measure);
    reduced.addEventListener('change', update);
    measure();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('scroll', update); window.removeEventListener('resize', measure); reduced.removeEventListener('change', update); };
  }, []);
  return <svg ref={ref} className="journey-path" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true"><path d="M54 0 C52 38 28 58 40 100 C52 145 72 158 61 206 C50 251 25 275 37 322 C49 367 73 382 61 426 C49 472 28 493 40 539 C52 584 73 603 60 647 C47 694 28 713 40 758 C52 803 73 822 61 865 C50 910 43 943 52 1000"/></svg>;
}

export function RevealGroup({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const kids = Array.from(el.children) as HTMLElement[];
    if (reduce) return;
    kids.forEach((kid, index) => { kid.style.setProperty('--reveal-delay', `${delay + index * 90}ms`); });
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      el.classList.add('is-revealed');
      io.disconnect();
    }, { threshold: .12 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return <div ref={ref} className={`reveal-group ${className}`}>{children}</div>;
}
