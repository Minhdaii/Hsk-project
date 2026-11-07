'use client';

import type { ReactNode } from 'react';

export type CatLoadingState = 'initial' | 'auth' | 'data' | 'page' | 'success' | 'error';

const COPY: Record<CatLoadingState, string> = {
  initial: 'Mèo đang chuẩn bị bài học…',
  auth: 'Mèo đang tìm tài khoản…',
  data: 'Mèo đang xếp chữ vào bài học…',
  page: 'Mèo đang chạy đến trang tiếp theo…',
  success: 'Sẵn sàng học rồi!',
  error: 'Mèo đang bối rối một chút.',
};

export default function ChineseCatLoading({
  state = 'initial',
  message,
  retry,
  children,
}: {
  state?: CatLoadingState;
  message?: string;
  retry?: () => void;
  children?: ReactNode;
}) {
  const busy = state !== 'success' && state !== 'error';
  return (
    <div className={`cat-loading cat-loading--${state}`} role={state === 'error' ? 'alert' : 'status'} aria-live="polite" aria-busy={busy}>
      <div className="cat-loading__scene">
        <span className="cat-loading__hanzi cat-loading__hanzi--one" lang="zh-Hans">学</span>
        <span className="cat-loading__hanzi cat-loading__hanzi--two" lang="zh-Hans">习</span>
        <span className="cat-loading__hanzi cat-loading__hanzi--three" lang="zh-Hans">字</span>
        <svg className="cat-loading__cat" viewBox="0 0 240 190" role="img" aria-label="Mèo con đang chơi với chữ Hán">
          <ellipse cx="124" cy="166" rx="70" ry="10" className="cat-loading__shadow"/>
          <g className="cat-loading__tail"><path d="M169 137c31 3 42-16 38-34-3-10-12-13-17-7-4 5 2 10 6 7"/></g>
          <g className="cat-loading__body"><path d="M62 145c0-37 21-61 61-61s62 24 62 61c0 14-12 21-61 21s-62-7-62-21Z"/><path d="M82 92 74 49l37 22m26 0 37-22-8 44" className="cat-loading__head"/><path d="M87 105c8-8 20-8 28 0m18 0c8-8 20-8 28 0" className="cat-loading__face"/><path d="M119 117q6 6 12 0m-6 1v5m-12 5q12 10 24 0" className="cat-loading__face"/><path d="M92 158v8m49-8v8" className="cat-loading__paws"/><path d="M113 73q7-13 14 0" className="cat-loading__mark"/></g>
          <g className="cat-loading__paw"><path d="M177 93q-14-12-25-4-5 5 2 11 12 8 24 2"/></g>
          <g className="cat-loading__sparkles"><path d="m190 56 3 8 8 3-8 3-3 8-3-8-8-3 8-3zm-130 5 2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></g>
        </svg>
      </div>
      <p className="cat-loading__message">{message ?? COPY[state]}</p>
      {busy && <div className="cat-loading__progress" aria-hidden="true"><span/></div>}
      {state === 'error' && retry && <button type="button" className="cat-loading__retry" onClick={retry}>Thử lại</button>}
      {children}
    </div>
  );
}
