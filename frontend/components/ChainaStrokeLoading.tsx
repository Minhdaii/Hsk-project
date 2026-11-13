'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

export type ChainaLoadingMode = 'FULL_SCREEN' | 'INLINE' | 'COMPACT' | 'PAGE' | 'OVERLAY';
export type ChainaLoadingState = 'loading' | 'success' | 'error';
export type ChainaLoadingBackground = 'paper' | 'light' | 'dark' | 'transparent';
export type ChainaLoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export interface ChainaStrokeLoadingProps {
  mode?: ChainaLoadingMode;
  size?: ChainaLoadingSize;
  duration?: number;
  autoPlay?: boolean;
  loop?: boolean;
  showGlow?: boolean;
  background?: ChainaLoadingBackground;
  loadingState?: ChainaLoadingState;
  message?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onComplete?: () => void;
  delayMs?: number;
  showHanziWatermark?: boolean;
  showSignature?: boolean;
  className?: string;
}

type StrokeSpec = {
  id: string;
  d: string;
  width: number;
  startPct: number;
  endPct: number;
  isRedDot?: boolean;
  isHsk?: boolean;
  isSignature?: boolean;
};

type HanziStrokeSpec = {
  d: string;
  width: number;
  dx?: number;
};

type CompiledBrandMetric = {
  spec: StrokeSpec;
  el: SVGPathElement;
  length: number;
  startPt: DOMPoint;
};

type CompiledHanziMetric = {
  el: SVGPathElement;
  length: number;
  startPct: number;
  endPct: number;
};

/**
 * Calligraphic 汉语 (Hán Ngữ) watermark strokes in authentic stroke order,
 * verbatim from the Chaina HSK reference HTML/SVG studio.
 */
const HANZI_WATERMARK_STROKES: HanziStrokeSpec[] = [
  // Character 汉 (Hán - 5 strokes)
  { d: 'M 28 36 C 35 41 42 47 46 53', width: 5.5 },
  { d: 'M 20 68 C 28 73 35 79 39 85', width: 5.5 },
  { d: 'M 22 128 C 29 116 38 100 46 86', width: 5.5 },
  { d: 'M 58 46 L 108 42 C 102 78 84 108 52 130', width: 6 },
  { d: 'M 62 60 C 78 82 98 110 124 130', width: 6 },
  // Character 语 (Ngữ - 9 strokes, translate(115, 0))
  { d: 'M 24 32 C 30 37 35 43 38 49', width: 5, dx: 115 },
  { d: 'M 12 64 L 34 60 L 34 116 L 46 102', width: 5, dx: 115 },
  { d: 'M 56 38 L 106 35', width: 5, dx: 115 },
  { d: 'M 78 38 L 68 82', width: 5, dx: 115 },
  { d: 'M 56 60 L 98 57 L 94 80', width: 5, dx: 115 },
  { d: 'M 48 83 L 114 80', width: 5, dx: 115 },
  { d: 'M 60 98 L 62 128', width: 5, dx: 115 },
  { d: 'M 60 98 L 102 95 L 98 125', width: 5, dx: 115 },
  { d: 'M 62 126 L 100 125', width: 5, dx: 115 },
];

/**
 * Exact 19 strokes of the Chaina HSK brand monoline script + "by Minh Dai"
 * signature from the HTML/SVG studio (viewBox="0 0 920 340").
 */
const BRAND_STROKES: StrokeSpec[] = [
  { id: 'c', d: 'M 142 125 C 122 95, 62 96, 56 164 C 50 226, 114 236, 138 197', width: 12.5, startPct: 0.0, endPct: 0.13 },
  { id: 'h-stem', d: 'M 177 104 C 175 142, 173 184, 172 224', width: 12.5, startPct: 0.11, endPct: 0.2 },
  { id: 'h-arch', d: 'M 174 172 C 184 146, 232 146, 234 182 C 235 198, 234 212, 234 224', width: 12.5, startPct: 0.18, endPct: 0.29 },
  { id: 'a1-bowl', d: 'M 318 175 C 312 148, 262 148, 260 189 C 258 228, 312 228, 319 194', width: 12.5, startPct: 0.27, endPct: 0.38 },
  { id: 'a1-stem', d: 'M 320 162 C 318 188, 319 216, 336 223', width: 12.5, startPct: 0.36, endPct: 0.43 },
  { id: 'i-stem', d: 'M 369 160 C 367 182, 365 204, 364 224', width: 12.5, startPct: 0.41, endPct: 0.48 },
  { id: 'i-dot', d: 'M 368 128 C 374 126, 381 131, 377 136 C 373 140, 365 136, 368 128', width: 13.5, startPct: 0.46, endPct: 0.51, isRedDot: true },
  { id: 'n-stem', d: 'M 408 159 C 407 180, 406 202, 405 224', width: 12.5, startPct: 0.49, endPct: 0.55 },
  { id: 'n-arch', d: 'M 407 175 C 417 147, 469 147, 471 182 C 472 198, 471 212, 471 224', width: 12.5, startPct: 0.53, endPct: 0.63 },
  { id: 'a2-bowl', d: 'M 556 175 C 550 148, 500 148, 498 189 C 496 228, 550 228, 557 194', width: 12.5, startPct: 0.61, endPct: 0.71 },
  { id: 'a2-stem', d: 'M 558 162 C 556 188, 557 216, 574 223', width: 12.5, startPct: 0.69, endPct: 0.76 },
  { id: 'accent', d: 'M 571 153 C 579 155, 584 160, 586 167', width: 8.5, startPct: 0.74, endPct: 0.78 },
  { id: 'H', d: 'M 632 134 L 632 222 M 632 178 L 680 178 M 680 134 L 680 222', width: 10, startPct: 0.77, endPct: 0.85, isHsk: true },
  { id: 'S', d: 'M 754 148 C 742 130, 706 132, 706 155 C 706 182, 758 174, 758 202 C 758 224, 718 228, 704 209', width: 10, startPct: 0.8, endPct: 0.88, isHsk: true },
  { id: 'K', d: 'M 784 134 L 784 222 M 834 136 L 786 180 L 838 222', width: 10, startPct: 0.86, endPct: 0.93, isHsk: true },
  {
    id: 'sig-by',
    d: 'M 702 246 L 701 263 C 704 256, 711 256, 711 261 C 711 265, 704 265, 701 262 M 716 256 L 720 263 M 724 256 L 717 270',
    width: 2.1,
    startPct: 0.91,
    endPct: 0.95,
    isSignature: true,
  },
  {
    id: 'sig-minh',
    d: 'M 735 264 L 736 248 L 743 261 L 750 248 L 751 264 M 757 256 L 757 264 M 757 251 L 757.5 251.5 M 763 264 L 763 256 C 765 254, 771 254, 771 258 L 771 264 M 777 247 L 777 264 C 779 255, 786 255, 786 260 L 786 264',
    width: 2.1,
    startPct: 0.94,
    endPct: 0.98,
    isSignature: true,
  },
  {
    id: 'sig-dai',
    d: 'M 798 248 L 798 264 M 797 248 C 809 247, 811 264, 797 264 M 823 257 C 821 254, 814 254, 814 260 C 814 265, 821 265, 823 260 L 824 264 M 830 256 L 830 264',
    width: 2.1,
    startPct: 0.97,
    endPct: 1.0,
    isSignature: true,
  },
  { id: 'sig-dot', d: 'M 830 251 L 830.6 251.4', width: 3.2, startPct: 0.99, endPct: 1.0, isRedDot: true, isSignature: true },
];

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function resolveWidthPx(mode: ChainaLoadingMode, size?: ChainaLoadingSize): number {
  if (typeof size === 'number') return size;
  const presetMap: Record<Exclude<ChainaLoadingSize, number>, number> = {
    xs: 76,
    sm: 190,
    md: 270,
    lg: 340,
    xl: 420,
  };
  if (size && presetMap[size]) return presetMap[size];
  switch (mode) {
    case 'FULL_SCREEN':
      return 380;
    case 'PAGE':
      return 340;
    case 'OVERLAY':
      return 280;
    case 'COMPACT':
      return 74;
    case 'INLINE':
    default:
      return 240;
  }
}

function resolveDefaultBackground(mode: ChainaLoadingMode): ChainaLoadingBackground {
  if (mode === 'FULL_SCREEN' || mode === 'PAGE') return 'paper';
  if (mode === 'OVERLAY') return 'light';
  return 'transparent';
}

export default function ChainaStrokeLoading({
  mode = 'INLINE',
  size,
  duration,
  autoPlay = true,
  loop = false,
  showGlow = true,
  background,
  loadingState = 'loading',
  message,
  errorMessage,
  onRetry,
  onComplete,
  delayMs = 0,
  showHanziWatermark,
  showSignature,
  className = '',
}: ChainaStrokeLoadingProps) {
  const uid = useId().replace(/:/g, '');
  const glowFilterId = `chaina-pen-glow-${uid}`;
  const hskGradId = `chaina-hsk-grad-${uid}`;

  const effectiveBg = background ?? resolveDefaultBackground(mode);
  const isDark = effectiveBg === 'dark';
  const widthPx = resolveWidthPx(mode, size);
  const isCompact = mode === 'COMPACT' || widthPx < 110;
  const durationMs = duration ?? (isCompact ? 1500 : 2000);
  const renderHanzi = showHanziWatermark ?? !isCompact;
  const renderSignature = showSignature ?? !isCompact;

  const [visible, setVisible] = useState(delayMs <= 0);
  const [holdingGlow, setHoldingGlow] = useState(false);

  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const hanziRefs = useRef<(SVGPathElement | null)[]>([]);
  const penCoreRef = useRef<SVGCircleElement | null>(null);
  const penHaloRef = useRef<SVGCircleElement | null>(null);
  const penTrailRef = useRef<SVGPathElement | null>(null);
  const polishGroupRef = useRef<SVGGElement | null>(null);

  const metricsRef = useRef<CompiledBrandMetric[]>([]);
  const hanziMetricsRef = useRef<CompiledHanziMetric[]>([]);
  const progressRef = useRef(0);
  const completedFiredRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Fast-loading anti-flicker gate
  useEffect(() => {
    if (delayMs <= 0) {
      setVisible(true);
      return;
    }
    setVisible(false);
    const t = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(t);
  }, [delayMs]);

  // Compile path lengths once SVG nodes exist
  useLayoutEffect(() => {
    if (!visible) return;
    const brandMetrics: CompiledBrandMetric[] = [];
    BRAND_STROKES.forEach((spec, idx) => {
      if (!renderSignature && spec.isSignature) return;
      const el = pathRefs.current[idx];
      if (!el) return;
      let length = 0;
      let startPt = new DOMPoint(0, 0);
      try {
        length = el.getTotalLength();
        startPt = el.getPointAtLength(0);
      } catch {
        length = 1;
      }
      el.style.strokeDasharray = `${length}`;
      el.style.strokeDashoffset = `${length}`;
      brandMetrics.push({ spec, el, length, startPt });
    });
    metricsRef.current = brandMetrics;

    if (renderHanzi) {
      const hanziTotal = HANZI_WATERMARK_STROKES.length;
      const hanziMetrics: CompiledHanziMetric[] = [];
      HANZI_WATERMARK_STROKES.forEach((_, idx) => {
        const el = hanziRefs.current[idx];
        if (!el) return;
        let length = 0;
        try {
          length = el.getTotalLength();
        } catch {
          length = 1;
        }
        el.style.strokeDasharray = `${length}`;
        el.style.strokeDashoffset = `${length}`;
        const span = 0.8 / hanziTotal;
        const startPct = 0.15 + idx * span * 0.85;
        const endPct = Math.min(0.98, startPct + span * 1.35);
        hanziMetrics.push({ el, length, startPct, endPct });
      });
      hanziMetricsRef.current = hanziMetrics;
    } else {
      hanziMetricsRef.current = [];
    }
  }, [visible, renderHanzi, renderSignature]);

  // Core progressive stroke renderer (mutates SVG refs directly — 0 React re-renders per frame)
  useEffect(() => {
    if (!visible) return;

    const renderAtProgress = (p: number, hidePen = false) => {
      const clampedP = Math.max(0, Math.min(1, p));
      let activeMetric: CompiledBrandMetric | null = null;
      let activeLocalEased = 0;

      for (const m of metricsRef.current) {
        const rawLocal = (clampedP - m.spec.startPct) / (m.spec.endPct - m.spec.startPct);
        if (rawLocal <= 0) {
          m.el.style.strokeDashoffset = `${m.length}`;
          m.el.style.opacity = '0';
        } else if (rawLocal >= 1) {
          m.el.style.strokeDashoffset = '0';
          m.el.style.opacity = '1';
        } else {
          const eased = easeInOutCubic(rawLocal);
          m.el.style.strokeDashoffset = `${m.length * (1 - eased)}`;
          m.el.style.opacity = '1';
          activeMetric = m;
          activeLocalEased = eased;
        }
      }

      for (const hm of hanziMetricsRef.current) {
        const rawLocal = (clampedP - hm.startPct) / (hm.endPct - hm.startPct);
        if (rawLocal <= 0) {
          hm.el.style.strokeDashoffset = `${hm.length}`;
          hm.el.style.opacity = '0';
        } else if (rawLocal >= 1) {
          hm.el.style.strokeDashoffset = '0';
          hm.el.style.opacity = '1';
        } else {
          const eased = easeInOutCubic(rawLocal);
          hm.el.style.strokeDashoffset = `${hm.length * (1 - eased)}`;
          hm.el.style.opacity = '1';
        }
      }

      const penCore = penCoreRef.current;
      const penHalo = penHaloRef.current;
      const penTrail = penTrailRef.current;
      if (penCore && penHalo && penTrail) {
        if (!showGlow || hidePen || loadingState === 'error') {
          penCore.style.opacity = '0';
          penHalo.style.opacity = '0';
          penTrail.style.opacity = '0';
        } else if (activeMetric && clampedP > 0.002 && clampedP < 0.992) {
          try {
            const curLen = activeMetric.length * activeLocalEased;
            const tipPt = activeMetric.el.getPointAtLength(curLen);
            const cx = tipPt.x.toFixed(1);
            const cy = tipPt.y.toFixed(1);
            penCore.setAttribute('cx', cx);
            penCore.setAttribute('cy', cy);
            penHalo.setAttribute('cx', cx);
            penHalo.setAttribute('cy', cy);

            const haloColor = activeMetric.spec.isRedDot
              ? '#FB7185'
              : isDark
              ? '#C4B5FD'
              : '#7C3AED';
            const trailColor = activeMetric.spec.isRedDot
              ? '#FDA4AF'
              : isDark
              ? '#E9D5FF'
              : '#A78BFA';

            penHalo.setAttribute('fill', haloColor);
            penTrail.setAttribute('stroke', trailColor);
            penCore.style.opacity = '1';
            penHalo.style.opacity = isDark ? '0.68' : '0.45';

            // 10-segment micro light trail, lifting cleanly across multi-contour M gaps
            const trailSpan = Math.min(curLen, Math.max(18, activeMetric.length * 0.22));
            const steps = 10;
            let dTrail = '';
            let prevPt: DOMPoint | null = null;
            for (let i = 0; i <= steps; i++) {
              const sampleLen = Math.max(0, curLen - (trailSpan * i) / steps);
              const pt = activeMetric.el.getPointAtLength(sampleLen);
              const jump = prevPt ? Math.hypot(pt.x - prevPt.x, pt.y - prevPt.y) : 0;
              dTrail += i === 0 || jump > 22 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
              prevPt = pt;
            }
            penTrail.setAttribute('d', dTrail);
            penTrail.style.opacity = isDark ? '0.9' : '0.82';
          } catch {
            penCore.style.opacity = '0';
            penHalo.style.opacity = '0';
            penTrail.style.opacity = '0';
          }
        } else if (clampedP <= 0.002 && metricsRef.current.length > 0) {
          const firstPt = metricsRef.current[0].startPt;
          const cx = firstPt.x.toFixed(1);
          const cy = firstPt.y.toFixed(1);
          penCore.setAttribute('cx', cx);
          penCore.setAttribute('cy', cy);
          penHalo.setAttribute('cx', cx);
          penHalo.setAttribute('cy', cy);
          penHalo.setAttribute('fill', isDark ? '#C4B5FD' : '#7C3AED');
          penCore.style.opacity = '0.85';
          penHalo.style.opacity = isDark ? '0.45' : '0.32';
          penTrail.setAttribute('d', '');
          penTrail.style.opacity = '0';
        } else {
          penCore.style.opacity = '0';
          penHalo.style.opacity = '0';
          penTrail.style.opacity = '0';
        }
      }

      if (polishGroupRef.current) {
        if (clampedP >= 0.92) {
          const polishAlpha = Math.min(1, (clampedP - 0.92) / 0.08);
          polishGroupRef.current.style.opacity = polishAlpha.toFixed(2);
        } else {
          polishGroupRef.current.style.opacity = '0';
        }
      }
    };

    const reducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || (!autoPlay && loadingState !== 'success')) {
      const target = reducedMotion ? 1 : progressRef.current;
      progressRef.current = target;
      renderAtProgress(target, true);
      if (reducedMotion && loadingState === 'loading') {
        setHoldingGlow(true);
      }
      if (reducedMotion && !completedFiredRef.current) {
        completedFiredRef.current = true;
        onCompleteRef.current?.();
      }
      return;
    }

    if (loadingState === 'error') {
      setHoldingGlow(false);
      renderAtProgress(progressRef.current, true);
      return;
    }

    if (loadingState === 'success') {
      setHoldingGlow(false);
      const startP = progressRef.current;
      if (startP >= 0.999) {
        progressRef.current = 1;
        renderAtProgress(1, true);
        if (!completedFiredRef.current) {
          completedFiredRef.current = true;
          onCompleteRef.current?.();
        }
        return;
      }
      let raf = 0;
      const startTime = performance.now();
      const finishMs = 240;
      const tickFinish = (now: number) => {
        const t = Math.min(1, (now - startTime) / finishMs);
        const eased = easeInOutCubic(t);
        const nextP = startP + (1 - startP) * eased;
        progressRef.current = nextP;
        renderAtProgress(nextP, t >= 0.95);
        if (t < 1) {
          raf = window.requestAnimationFrame(tickFinish);
        } else if (!completedFiredRef.current) {
          completedFiredRef.current = true;
          onCompleteRef.current?.();
        }
      };
      raf = window.requestAnimationFrame(tickFinish);
      return () => window.cancelAnimationFrame(raf);
    }

    // Active loading state: draw strokes sequentially
    let raf = 0;
    let pauseTimer = 0;
    let lastTime: number | null = null;
    completedFiredRef.current = false;
    setHoldingGlow(false);

    const tick = (timestamp: number) => {
      if (lastTime === null) lastTime = timestamp;
      const deltaMs = Math.min(64, timestamp - lastTime);
      lastTime = timestamp;

      progressRef.current += deltaMs / Math.max(300, durationMs);
      if (progressRef.current >= 1) {
        progressRef.current = 1;
        renderAtProgress(1, true);
        if (!completedFiredRef.current) {
          completedFiredRef.current = true;
          onCompleteRef.current?.();
        }
        if (loop) {
          pauseTimer = window.setTimeout(() => {
            progressRef.current = 0;
            lastTime = null;
            completedFiredRef.current = false;
            renderAtProgress(0, false);
            raf = window.requestAnimationFrame(tick);
          }, 550);
        } else {
          // Slow loading: keep complete crisp logo with gentle subtle hold sheen
          setHoldingGlow(true);
        }
        return;
      }

      renderAtProgress(progressRef.current, false);
      raf = window.requestAnimationFrame(tick);
    };

    renderAtProgress(progressRef.current, false);
    raf = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(raf);
      if (pauseTimer) window.clearTimeout(pauseTimer);
    };
  }, [visible, durationMs, autoPlay, loop, showGlow, loadingState, isDark]);

  if (!visible) return null;

  const primaryStroke = isDark ? '#EAE3F8' : '#26252D';
  const hskStart = isDark ? '#DDD6FE' : '#2B2638';
  const hskEnd = isDark ? '#A78BFA' : '#5B4688';
  const strokeBoost = isCompact ? 1.28 : 1;

  const containerBgClass =
    effectiveBg === 'dark'
      ? 'bg-[#0E0A18] text-[#EAE3F8]'
      : effectiveBg === 'paper'
      ? 'bg-paper text-ink'
      : effectiveBg === 'light'
      ? 'bg-white/90 text-ink'
      : 'bg-transparent';

  const modeContainerClass =
    mode === 'FULL_SCREEN'
      ? 'grid min-h-[62svh] w-full place-items-center px-4 py-10'
      : mode === 'PAGE'
      ? 'grid min-h-[50svh] w-full place-items-center px-4 py-8'
      : mode === 'OVERLAY'
      ? 'absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-sm px-4'
      : mode === 'COMPACT'
      ? 'inline-flex items-center justify-center gap-2 align-middle'
      : 'flex w-full flex-col items-center justify-center px-4 py-6';

  const displayError = loadingState === 'error';
  const isInlineEl = mode === 'COMPACT';

  const innerContent = (
    <>
      <span
        className={`relative flex flex-col items-center justify-center ${
          isCompact ? 'shrink-0' : 'max-w-full'
        }`}
      >
        {/* Subtle holding radial aura only when slow loading holds completed logo */}
        {!isCompact && showGlow && (
          <span
            aria-hidden
            className={`chaina-stroke-aura pointer-events-none absolute -inset-x-6 -inset-y-3 rounded-full transition-opacity duration-500 ${
              holdingGlow ? 'chaina-stroke-aura--active opacity-100' : 'opacity-0'
            }`}
            style={{
              background: isDark
                ? 'radial-gradient(ellipse at center, rgba(167,139,250,0.16) 0%, rgba(216,74,52,0.04) 48%, transparent 74%)'
                : 'radial-gradient(ellipse at center, rgba(124,58,237,0.12) 0%, rgba(216,74,52,0.03) 48%, transparent 74%)',
            }}
          />
        )}

        <svg
          viewBox="0 0 920 340"
          style={{ width: isCompact ? `${widthPx}px` : `min(84vw, ${widthPx}px)` }}
          className={`relative block h-auto overflow-visible transition-opacity duration-300 ${
            displayError ? 'opacity-60' : 'opacity-100'
          }`}
          role="img"
          aria-label="Logo Chaina HSK"
        >
          <defs>
            <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation={isCompact ? '1.6' : '2.2'} result="blur1" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id={hskGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={hskStart} />
              <stop offset="100%" stopColor={hskEnd} />
            </linearGradient>
          </defs>

          {/* LAYER 1: Calligraphic Hanzi Watermark (汉语) */}
          {renderHanzi && (
            <g opacity={isDark ? 0.16 : 0.12} transform="translate(655, 22) scale(0.95)">
              {HANZI_WATERMARK_STROKES.map((hs, idx) => (
                <path
                  key={idx}
                  ref={(el) => {
                    hanziRefs.current[idx] = el;
                  }}
                  transform={hs.dx ? `translate(${hs.dx}, 0)` : undefined}
                  d={hs.d}
                  fill="none"
                  stroke="#A78BFA"
                  strokeWidth={hs.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0 }}
                />
              ))}
            </g>
          )}

          {/* LAYER 2: Chaina HSK Brand Monoline Script */}
          <g>
            {BRAND_STROKES.map((spec, idx) => {
              if (!renderSignature && spec.isSignature) return null;
              const strokePaint = spec.isRedDot
                ? '#D84A34'
                : spec.isHsk
                ? `url(#${hskGradId})`
                : primaryStroke;
              const baseOpacity = spec.isSignature ? 0.72 : 1;
              return (
                <path
                  key={spec.id}
                  ref={(el) => {
                    pathRefs.current[idx] = el;
                  }}
                  d={spec.d}
                  fill="none"
                  stroke={strokePaint}
                  strokeOpacity={baseOpacity}
                  strokeWidth={spec.width * strokeBoost}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0 }}
                />
              );
            })}
          </g>

          {/* LAYER 3: Final Polish Accent Line, Seal Stamp & Signature Lock-in */}
          <g ref={polishGroupRef} style={{ opacity: 0 }}>
            {renderSignature && (
              <>
                <path
                  d="M 168 258 L 678 258"
                  fill="none"
                  stroke={`url(#${hskGradId})`}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.4"
                />
                <text
                  x="836"
                  y="282"
                  textAnchor="end"
                  fill={primaryStroke}
                  opacity="0.58"
                  fontFamily="var(--font-be-vietnam-pro), 'Be Vietnam Pro', sans-serif"
                  fontSize="11.5"
                  fontWeight="400"
                  letterSpacing="0.14em"
                >
                  by Minh Dai
                </text>
              </>
            )}
            <g transform="translate(852, 192)">
              <rect x="0" y="0" width="28" height="28" rx="5" fill="#D84A34" opacity="0.92" />
              <text x="14" y="19" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="600">
                漢
              </text>
            </g>
          </g>

          {/* LAYER 4: Luminous Pen Tip & 10-Segment Light Trail */}
          <g filter={`url(#${glowFilterId})`} style={{ pointerEvents: 'none' }}>
            <path
              ref={penTrailRef}
              d=""
              fill="none"
              stroke={isDark ? '#E9D5FF' : '#A78BFA'}
              strokeWidth={isCompact ? '6' : '4.5'}
              strokeLinecap="round"
              style={{ opacity: 0 }}
            />
            <circle
              ref={penHaloRef}
              cx="142"
              cy="125"
              r={isCompact ? 13 : 10}
              fill={isDark ? '#C4B5FD' : '#7C3AED'}
              style={{ opacity: 0 }}
            />
            <circle
              ref={penCoreRef}
              cx="142"
              cy="125"
              r={isCompact ? 5.5 : 4.2}
              fill="#FFFFFF"
              style={{ opacity: 0 }}
            />
          </g>
        </svg>

        {!isCompact && message && !displayError && (
          <p
            className={`mt-2 text-center text-xs font-medium tracking-wide ${
              isDark ? 'text-violet-200/80' : 'text-stone-500'
            }`}
          >
            {message}
          </p>
        )}

        {displayError && (
          <div className="mt-3 flex flex-col items-center gap-2 text-center">
            <p className={`text-xs font-semibold ${isDark ? 'text-rose-300' : 'text-red-700'}`}>
              {errorMessage || message || 'Đã xảy ra lỗi khi tải dữ liệu.'}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="btn-editorial-ghost !min-h-[36px] !px-4 text-xs"
              >
                Thử lại
              </button>
            )}
          </div>
        )}
      </span>
    </>
  );

  const rootClassName = `chaina-stroke-loading chaina-stroke-loading--${mode.toLowerCase()} ${modeContainerClass} ${containerBgClass} ${className}`;
  const ariaProps = {
    role: displayError ? ('alert' as const) : ('status' as const),
    'aria-live': 'polite' as const,
    'aria-busy': loadingState === 'loading',
    'aria-label': message ?? (displayError ? 'Không thể tải dữ liệu' : 'Đang tải'),
  };

  if (isInlineEl) {
    return (
      <span className={rootClassName} {...ariaProps}>
        {innerContent}
      </span>
    );
  }

  return (
    <div className={rootClassName} {...ariaProps}>
      {innerContent}
    </div>
  );
}
