import { animate, stagger, type JSAnimation } from 'animejs';

/**
 * Lớp chuyển động dùng chung, viết trên Anime.js (v4). Quy tắc áp dụng cho mọi chỗ dùng:
 * - Chỉ animate opacity và transform (không animate kích thước hay vị trí bố cục).
 * - Người dùng bật "giảm chuyển động" trong hệ điều hành thì chỉ hiện dần, không di chuyển.
 * - Xong là gỡ transform inline: transform còn sót trên phần tử cha sẽ làm lệch mọi phần tử `fixed` bên trong.
 */
export const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export type EnterOpts = { delay?: number; y?: number; duration?: number; each?: number };

/** Hiện dần và trượt nhẹ lên. `each` > 0: so le giữa các phần tử (ms). */
export function enter(targets: HTMLElement | HTMLElement[], { delay = 0, y = 14, duration = 560, each = 0 }: EnterOpts = {}): JSAnimation {
  const list = Array.isArray(targets) ? targets : [targets];
  const r = reduced();
  return animate(list, {
    opacity: [0, 1],
    translateY: r ? [0, 0] : [y, 0],
    duration: r ? 160 : duration,
    delay: each && !r ? stagger(each, { start: delay }) : delay,
    ease: r ? 'linear' : 'outCubic',
    onComplete: () => list.forEach((n) => { n.style.transform = ''; }),
  });
}

/** Chạy `run` một lần khi phần tử cuộn vào khung nhìn. Trả về hàm hủy. Trình duyệt cũ không có IntersectionObserver thì chạy ngay. */
export function whenVisible(el: Element, run: () => void, rootMargin = '0px 0px -8% 0px'): () => void {
  if (typeof IntersectionObserver === 'undefined') { run(); return () => {}; }
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.12, rootMargin });
  io.observe(el);
  return () => io.disconnect();
}

export { animate, stagger };
