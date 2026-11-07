'use client';

export type CatLoadingState = 'initial' | 'auth' | 'data' | 'page' | 'success' | 'error';

export default function ChineseCatLoading({
  state = 'initial',
  message,
}: {
  state?: CatLoadingState;
  message?: string;
}) {
  const busy = state !== 'success' && state !== 'error';
  return (
    <div className={`cat-loading cat-loading--${state}`} role={state === 'error' ? 'alert' : 'status'} aria-live="polite" aria-busy={busy} aria-label={message ?? 'Đang tải'}>
      <svg className="cat-loading__illustration" viewBox="0 0 320 250" role="img" aria-label="Đầu mèo Chaina">
        <path d="M77 151c-2-19 4-38 17-54l2-39c1-16 13-22 24-11l23 23c13-5 27-7 41-5 11 1 21 4 30 9l20-22c12-13 24-7 23 10l-2 36c13 15 20 32 20 51 0 43-42 73-99 73-56 0-94-29-99-71Z" fill="#fff" stroke="#292833" strokeWidth="6" strokeLinejoin="round" />
        <path d="M102 65q4-6 10-2l18 19q-9 6-13 17-10-14-15-34Z" fill="#f0c5ca" />
        <path d="M218 64q5-7 9-6 1 18-4 36-5-12-14-18 6-5 9-12Z" fill="#f0c5ca" />
        <path d="M101 142c5-7 13-11 23-11 11 0 19 5 24 13m24-1c5-9 14-13 25-12 9 1 16 5 20 12" fill="none" stroke="#292833" strokeWidth="5" strokeLinecap="round" />
        <path d="M111 157c0-11 7-18 17-18 11 0 18 8 18 20 0 13-7 20-17 20-11 0-18-8-18-22Z" fill="#fff" stroke="#292833" strokeWidth="3.5" />
        <path d="M174 158c1-12 8-19 18-19 11 0 17 8 16 20-1 13-8 20-18 19-11 0-17-8-16-20Z" fill="#fff" stroke="#292833" strokeWidth="3.5" />
        <ellipse cx="131" cy="159" rx="5" ry="9" fill="#292833" />
        <ellipse cx="189" cy="158" rx="5" ry="9" fill="#292833" />
        <circle cx="133" cy="155" r="2" fill="#fff" />
        <circle cx="191" cy="154" r="2" fill="#fff" />
        <path d="M151 185q9-7 18 0l-9 8Z" fill="#292833" />
        <path d="M160 193v10m0 0c-6 8-14 8-20 2m20-2c6 8 14 8 20 2" fill="none" stroke="#292833" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M103 190l30 4m-31 8 29 1m56-9 29-4m-28 12 29-2" stroke="#9a99a3" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
