'use client';
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import { speak } from '@/lib/speak';
import { intervalLabel, nextIntervalDays, type Rating } from '@/lib/sm2preview';
import type { Activity, Card, ReviewResult, StreakStatus } from '@/lib/types';
import FlipCard from '@/components/FlipCard';
import Skeleton from '@/components/Skeleton';
import StreakCelebration from '@/components/StreakCelebration';

const BUTTONS: { r: Rating; label: string; cls: string }[] = [
  { r: 0, label: 'Quên', cls: 'border-red-200 bg-gradient-to-b from-red-50 to-red-100/70 text-red-700' },
  { r: 1, label: 'Khó', cls: 'border-orange-200 bg-gradient-to-b from-orange-50 to-orange-100/70 text-orange-700' },
  { r: 2, label: 'Tốt', cls: 'border-emerald-200 bg-gradient-to-b from-emerald-50 to-emerald-100/70 text-emerald-700' },
  { r: 3, label: 'Dễ', cls: 'border-sky-200 bg-gradient-to-b from-sky-50 to-sky-100/70 text-sky-700' },
];

type StreakInfo = { status: StreakStatus; streak: number; previousStreak: number };

function StudyInner() {
  const sp = useSearchParams();
  const level = Math.min(3, Math.max(1, Number(sp.get('level') || '1')));
  const { user, loading } = useUser();
  const [queue, setQueue] = useState<Card[]>([]);
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [cardKey, setCardKey] = useState(0);
  const [xpPop, setXpPop] = useState(0);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [celebrate, setCelebrate] = useState<{ info: StreakInfo; days: Activity['days'] } | null>(null);

  useEffect(() => { setAutoSpeak(localStorage.getItem('hsk_autospeak') === '1'); }, []);
  const toggleAuto = () => setAutoSpeak((v) => { localStorage.setItem('hsk_autospeak', v ? '0' : '1'); return !v; });

  useEffect(() => {
    if (!user) return;
    setReady(false); setError(''); setStreakInfo(null); setCelebrate(null);
    api<{ cards: Card[] }>(`/study/session?level=${level}`)
      .then((res) => { setQueue(res.cards); setTotal(res.cards.length); setDone(0); setShown(false); setReady(true); })
      .catch((e) => { setError(e instanceof Error ? e.message : 'Có lỗi xảy ra'); setReady(true); });
  }, [user, level]);

  const card = queue[0];

  // Tự đọc từ mỗi khi sang thẻ mới
  useEffect(() => {
    if (!autoSpeak || !card) return;
    const t = setTimeout(() => speak(card.word.hanzi, card.word.audioUrl), 450);
    return () => clearTimeout(t);
  }, [cardKey, autoSpeak, card?.word.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = useCallback(async (info: StreakInfo) => {
    let days: Activity['days'] = [];
    try { days = (await api<Activity>('/study/activity')).days; } catch { /* vẫn hiện hiệu ứng */ }
    setCelebrate({ info, days });
  }, []);

  async function rate(r: Rating) {
    if (busy || queue.length === 0) return;
    const current = queue[0];
    setBusy(true);
    try {
      const res = await api<ReviewResult>('/study/review', { body: { wordId: current.word.id, rating: r } });
      const info: StreakInfo = streakInfo && streakInfo.status !== 'same'
        ? { ...streakInfo, streak: res.streak }
        : { status: res.streakStatus, streak: res.streak, previousStreak: res.previousStreak };
      setStreakInfo(info);
      setXpPop((n) => n + 1);
      // Cập nhật ngọn lửa trên thanh điều hướng ngay lập tức
      window.dispatchEvent(new CustomEvent('stats-changed', { detail: { streak: res.streak, xp: res.xp, studiedToday: true, atRisk: false, brokenStreak: 0 } }));
      const rest = queue.slice(1);
      if (r === 0) rest.push({ word: current.word, progress: res.progress }); // thẻ quên: học lại cuối lượt
      else setDone((d) => d + 1);
      setQueue(rest); setShown(false); setError(''); setCardKey((k) => k + 1);
      if (rest.length === 0) finish(info);
    } catch (e) { setError(e instanceof Error ? e.message : 'Không lưu được kết quả'); }
    setBusy(false);
  }

  useEffect(() => {
    if (celebrate) return;
    const onKey = (e: KeyboardEvent) => {
      if (queue.length === 0) return;
      if (!shown && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); setShown(true); return; }
      if (shown && ['1', '2', '3', '4'].includes(e.key)) rate((Number(e.key) - 1) as Rating);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (loading) return <Skeleton className="mx-auto h-[27rem] max-w-xl !rounded-3xl" />;
  if (!user) {
    return (
      <div className="card mx-auto max-w-md space-y-3 text-center">
        <div className="text-4xl">🔐</div>
        <p>Bạn cần đăng nhập để lưu tiến độ học và lịch ôn tập.</p>
        <Link href="/login" className="btn-primary">Đăng nhập</Link>
      </div>
    );
  }

  const pct = total ? Math.round((done / total) * 100) : 0;
  const newLeft = queue.filter((c) => !c.progress).length;
  const reviewLeft = queue.length - newLeft;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      {celebrate && (
        <StreakCelebration status={celebrate.info.status} streak={celebrate.info.streak}
          previousStreak={celebrate.info.previousStreak} days={celebrate.days}
          onClose={() => { setCelebrate(null); window.dispatchEvent(new Event('stats-changed')); }} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-xl bg-stone-100 p-1">
          {[1, 2, 3].map((l) => (
            <Link key={l} href={`/study?level=${l}`}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-300 ${l === level ? 'bg-white text-brand shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}>HSK {l}</Link>
          ))}
        </div>
        <button onClick={toggleAuto} aria-pressed={autoSpeak}
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${autoSpeak ? 'border-brand/30 bg-brand-soft text-brand' : 'border-stone-200 bg-white text-stone-500'}`}>
          <span className={`relative h-4 w-7 rounded-full transition ${autoSpeak ? 'bg-brand' : 'bg-stone-300'}`}>
            <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${autoSpeak ? 'left-3.5' : 'left-0.5'}`} />
          </span>
          Tự đọc
        </button>
      </div>

      <div>
        <div className="h-2.5 overflow-hidden rounded-full bg-stone-200">
          <div className="bar-fill h-full rounded-full bg-brand transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
          <span>{done}/{total} thẻ</span>
          {card && <span className="flex gap-1.5"><span className="pill bg-sky-50 text-sky-700">{newLeft} từ mới</span><span className="pill bg-amber-50 text-amber-700">{reviewLeft} ôn lại</span></span>}
        </div>
      </div>
      {error && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{error}</p>}

      {!ready ? <Skeleton className="h-[27rem] !rounded-3xl" /> : !card ? (
        <div className="card animate-pop space-y-3 py-10 text-center">
          <div className="text-5xl">🎉</div>
          <p className="text-lg font-semibold">{total ? 'Hoàn thành lượt ôn hôm nay!' : 'Hôm nay không còn thẻ nào cần học ở cấp này.'}</p>
          <div className="flex justify-center gap-2 pt-2">
            <Link href="/" className="btn-ghost">Về trang chủ</Link>
            <Link href="/exercises" className="btn-primary">Luyện tập</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="relative pb-5">
            {xpPop > 0 && <span key={xpPop} className="pointer-events-none absolute right-6 top-14 z-10 animate-float-up rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-bold text-amber-700 shadow-sm">+10 XP</span>}
            {queue.length > 2 && <div aria-hidden className="absolute inset-x-8 bottom-0 top-8 rounded-3xl border border-stone-200 bg-white/50" />}
            {queue.length > 1 && <div aria-hidden className="absolute inset-x-4 bottom-2.5 top-4 rounded-3xl border border-stone-200 bg-white/80 shadow-sm" />}
            <div key={cardKey} className="relative animate-slide-in">
              <FlipCard card={card} flipped={shown} onFlip={() => setShown(true)} />
            </div>
          </div>

          <div className={`grid grid-cols-4 gap-2 transition-all duration-500 ${shown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}>
            {BUTTONS.map((b) => (
              <button key={b.r} disabled={busy || !shown} onClick={() => rate(b.r)}
                className={`flex flex-col items-center rounded-2xl border py-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:scale-95 disabled:opacity-60 ${b.cls}`}>
                <span className="text-base font-bold">{b.label}</span>
                <span className="mt-0.5 text-[11px] font-medium opacity-80">{intervalLabel(nextIntervalDays(card.progress, b.r))}</span>
                <span className="mt-1 hidden rounded bg-white/70 px-1.5 text-[10px] font-semibold opacity-70 sm:block">phím {b.r + 1}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function StudyPage() {
  return <Suspense fallback={<Skeleton className="mx-auto h-[27rem] max-w-xl !rounded-3xl" />}><StudyInner /></Suspense>;
}
