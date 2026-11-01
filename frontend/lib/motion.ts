'use client';
import { animate, createTimeline, stagger, type JSAnimation } from 'animejs';

/**
 * HỆ THỐNG CHUYỂN ĐỘNG CHUẨN: ANIME.JS (v4) × ANIMATE UI
 *
 * Nguyên tắc bất di bất dịch:
 * - 100% UI & Layout Preservation: Chỉ animate opacity, transform, strokeDashoffset, filter.
 *   Tuyệt đối không animate width/height làm nhảy layout (Layout Shift), trừ khi component
 *   chuyên biệt có overflow-hidden (như thanh tiến độ, accordion).
 * - Tôn trọng prefers-reduced-motion: Giảm chuyển động chuyển về fade tức thì, không translateY.
 * - Cleanup hoàn chỉnh: Hủy animation khi unmount, gỡ transform inline khi hoàn tất để không
 *   ảnh hưởng position: fixed / sticky của các phần tử con.
 */

/** Kiểm tra chế độ giảm chuyển động trong hệ điều hành */
export const reduced = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export type EnterOpts = {
  delay?: number;
  y?: number;
  duration?: number;
  each?: number;
  ease?: string;
  onComplete?: () => void;
};

/**
 * Hiện dần và trượt nhẹ (Fade + TranslateY).
 * Thông số chuẩn theo Motion Design System:
 * - Duration: 260–320ms cho component thông thường, 400–480ms cho scroll reveal.
 * - Easing: outCubic (mượt, tự nhiên, không giật nảy).
 */
export function enter(
  targets: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>,
  { delay = 0, y = 10, duration = 300, each = 0, ease = 'outCubic', onComplete }: EnterOpts = {}
): JSAnimation {
  const list = Array.isArray(targets)
    ? targets
    : 'length' in targets
    ? Array.from(targets as NodeListOf<HTMLElement>)
    : [targets];

  const r = reduced();

  return animate(list, {
    opacity: [0, 1],
    translateY: r ? [0, 0] : [y, 0],
    duration: r ? 140 : duration,
    delay: each && !r ? stagger(each, { start: delay }) : delay,
    ease: r ? 'linear' : ease,
    onComplete: () => {
      list.forEach((n) => {
        if (n && n.style) {
          n.style.transform = '';
          n.style.opacity = '1';
        }
      });
      onComplete?.();
    },
  });
}

/**
 * Kích hoạt hiệu ứng một lần khi phần tử cuộn vào khung nhìn (Scroll Reveal).
 * Tự động hủy observer sau khi đã kích hoạt để tối ưu hiệu năng và tránh memory leak.
 */
export function whenVisible(
  el: Element,
  run: () => void,
  rootMargin = '0px 0px -6% 0px'
): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    run();
    return () => {};
  }
  let executed = false;
  const io = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting && !executed) {
        executed = true;
        io.disconnect();
        run();
      }
    },
    { threshold: 0.1, rootMargin }
  );
  io.observe(el);
  return () => io.disconnect();
}

/**
 * Đếm số từ 0 (hoặc `from`) tới `to` bằng Anime.js với ease outExpo/outCubic.
 */
export function animateNumber(
  el: HTMLElement,
  to: number,
  {
    from = 0,
    duration = 850,
    format = (n: number) => n.toLocaleString('vi-VN'),
  }: { from?: number; duration?: number; format?: (n: number) => string } = {}
): JSAnimation | null {
  if (!el) return null;
  if (reduced()) {
    el.textContent = format(to);
    return null;
  }
  const obj = { val: from };
  return animate(obj, {
    val: to,
    duration,
    ease: 'outExpo',
    onUpdate: () => {
      if (el) el.textContent = format(Math.round(obj.val));
    },
    onComplete: () => {
      if (el) el.textContent = format(to);
    },
  });
}

/**
 * Chuyển động thanh tiến độ (Progress bar fill) mượt mà với Anime.js.
 */
export function animateProgress(
  barEl: HTMLElement,
  toPct: number,
  duration = 450
): JSAnimation | null {
  if (!barEl) return null;
  const clamped = Math.min(100, Math.max(0, toPct));
  if (reduced()) {
    barEl.style.width = `${clamped}%`;
    return null;
  }
  return animate(barEl, {
    width: `${clamped}%`,
    duration,
    ease: 'outCubic',
  });
}

/**
 * Hiệu ứng Micro-pop (Thành công / Chọn đúng / Thích / Mốc đạt được)
 */
export function popElement(el: HTMLElement): JSAnimation | null {
  if (!el || reduced()) return null;
  return animate(el, {
    scale: [1, 1.14, 1],
    duration: 260,
    ease: 'outCubic',
    onComplete: () => {
      if (el && el.style) el.style.transform = '';
    },
  });
}

/**
 * Hiệu ứng Micro-shake (Nhập sai / Chưa đúng)
 */
export function shakeElement(el: HTMLElement): JSAnimation | null {
  if (!el || reduced()) return null;
  return animate(el, {
    translateX: [0, -6, 6, -4, 4, -2, 2, 0],
    duration: 320,
    ease: 'inOutCubic',
    onComplete: () => {
      if (el && el.style) el.style.transform = '';
    },
  });
}

/**
 * Hiệu ứng Soundwave pulse cho nút nghe phát âm
 */
export function pulseAudio(el: HTMLElement): JSAnimation | null {
  if (!el || reduced()) return null;
  return animate(el, {
    scale: [1, 1.08, 0.98, 1.05, 1],
    duration: 480,
    ease: 'inOutCubic',
    onComplete: () => {
      if (el && el.style) el.style.transform = '';
    },
  });
}

/**
 * Hiệu ứng vẽ đường SVG (SVG path draw) cho biểu đồ học tập
 */
export function drawSvgPath(pathEl: SVGPathElement, duration = 800): JSAnimation | null {
  if (!pathEl || reduced()) return null;
  try {
    const len = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = `${len}`;
    pathEl.style.strokeDashoffset = `${len}`;
    return animate(pathEl, {
      strokeDashoffset: [len, 0],
      duration,
      ease: 'outCubic',
    });
  } catch {
    return null;
  }
}

export { animate, createTimeline, stagger };
